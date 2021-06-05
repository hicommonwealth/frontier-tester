const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { KeyringPair } = require('@polkadot/keyring/types');
const Web3 = require('web3');
const { assert } = require('chai');
const { convertToEvmAddress, convertToSubstrateAddress, GAS_PRICE, GAS_LIMIT } = require('../utils.js');
const EdgewarePrivateKeyProvider = require('../private-provider')
const BN = require('bn.js');
const { spec } = require('@edgeware/node-types');
const { TypeRegistry } = require('@polkadot/types');

describe('Substrate <> EVM balances test', async () => {
  let web3;
  let web3Url;
  let api;
  let id;
  let keyring;
  let address;
  let evmAddress;
  let substrateEvmAddress;

  const value = new BN('10000000000000000000');

  // returns the fee
  let sendSubstrateBalance = async (v, addr = substrateEvmAddress) => {
    return new Promise(async (resolve) => {
      const tx = api.tx.balances.transfer(addr, v);
      const { partialFee } = await tx.paymentInfo(keyring);
      tx.signAndSend(keyring, (result) => {
        if (result.isError) {
          assert.fail('tx failure');
        }
        if (result.isCompleted) {
          resolve(partialFee);
        }
      });
    })
  }

  const fetchBalance = async (acct) => {
    const res = await api.query.system.account(acct);
    return res.data.free;
  }

  before(async () => {
    // init web3
    web3Url = 'http://localhost:9933';
    web3 = new Web3(web3Url);
    id = await web3.eth.net.getId();
    assert.equal(id, 2021);

    // init polkadot
    const polkadotUrl = 'ws://localhost:9944';
    const registry = new TypeRegistry();
    api = await (new ApiPromise({
      provider: new WsProvider(polkadotUrl),
      registry,
      ...spec,
    })).isReady;
    const { ss58Format } = await api.rpc.system.properties();
    const substrateId = +ss58Format.unwrap();
    // NOTE: in dev mode, the eth id will still be 7 but the substrate id will be 42
    // assert.equal(substrateId, id);

    // init addresses
    keyring = new Keyring({ ss58Format: id, type: 'sr25519' }).addFromUri('//Alice');
    address = keyring.address;
    evmAddress = convertToEvmAddress(address);
    substrateEvmAddress = convertToSubstrateAddress(evmAddress);
  });

  it('should fund account via transfer', async () => {
    // query start balances
    const web3StartBalance = await web3.eth.getBalance(evmAddress);
    const polkadotStartBalance = await fetchBalance(address);
    const evmSubstrateStartBalance = await fetchBalance(substrateEvmAddress);

    assert.isTrue(polkadotStartBalance.gt(value), 'sender account must have sufficient balance');
    assert.equal(web3StartBalance, evmSubstrateStartBalance.toString(), 'substrate balance does not match web3 balance');

    const fees = await sendSubstrateBalance(value);

    // query final balances
    const polkadotEndBalance = await fetchBalance(address);
    const evmSubstrateEndBalance = await fetchBalance(substrateEvmAddress);
    const web3EndBalance = await web3.eth.getBalance(evmAddress);

    assert.equal(polkadotEndBalance.toString(), polkadotStartBalance.sub(value).sub(fees).toString(), 'incorrect sender account balance');
    assert.equal(web3EndBalance, evmSubstrateEndBalance.toString(), 'substrate balance does not match web3 balance');
    assert.equal(evmSubstrateEndBalance.toString(), evmSubstrateStartBalance.add(value).toString(), 'incorrect web3 account balance');
  });

  it('should withdraw via evm pallet', async () => {
    // ensure the evm account has balance
    await sendSubstrateBalance(value.clone().muln(2));

    // query start balances
    const web3StartBalance = await web3.eth.getBalance(evmAddress);
    const polkadotStartBalance = await fetchBalance(address);
    const evmSubstrateStartBalance = await fetchBalance(substrateEvmAddress);
    assert.isTrue(evmSubstrateStartBalance.gt(value), 'evm account must have sufficient balance');
    assert.equal(web3StartBalance, evmSubstrateStartBalance.toString(), 'substrate balance does not match web3 balance');

    // execute withdraw
    const fees = await new Promise(async (resolve) => {
      const tx = api.tx.evm.withdraw(evmAddress, value);
      const { partialFee } = await tx.paymentInfo(keyring);
      return tx.signAndSend(keyring, (result) => {
        if (result.isError) {
          assert.fail('tx failure');
        }
        if (result.isCompleted) {
          resolve(partialFee);
        }
      });
    });

    // query end balances
    const polkadotEndBalance = await fetchBalance(address);
    const evmSubstrateEndBalance = await fetchBalance(substrateEvmAddress);
    const web3EndBalance = await web3.eth.getBalance(evmAddress);

    assert.equal(polkadotEndBalance.toString(), polkadotStartBalance.add(value).sub(fees).toString(), 'incorrect sender account balance');
    assert.equal(web3EndBalance, evmSubstrateEndBalance.toString(), 'substrate balance does not match web3 balance');
    assert.equal(evmSubstrateEndBalance.toString(), evmSubstrateStartBalance.sub(value).toString(), 'incorrect web3 account balance');

  });

  it('should update substrate balances from web3 tx', async () => {
    // start with an EVM account with a known private key
    const privKey = '99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E343';
    const provider = new EdgewarePrivateKeyProvider(privKey, web3Url, id);
    const web3 = new Web3(provider);
    const senderAddress = provider.address;
    const senderSubstrateAddress = convertToSubstrateAddress(senderAddress, id);

    // give the EVM account some balance to send back via web3
    await sendSubstrateBalance(value.clone().muln(2), senderSubstrateAddress);

    // query start balances
    const web3StartBalance = await web3.eth.getBalance(evmAddress);
    const senderWeb3StartBalance = await web3.eth.getBalance(senderAddress);
    const senderEvmSubstrateStartBalance = await fetchBalance(senderSubstrateAddress);
    assert.isTrue(web3.utils.toBN(senderWeb3StartBalance).gt(value), 'evm account must have sufficient balance');
    assert.equal(senderWeb3StartBalance, senderEvmSubstrateStartBalance.toString(), 'substrate balance does not match web3 balance');

    // perform web3 call, send value back to the original substrate/alice account
    const gasPrice = web3.utils.toWei("1", 'gwei');
    const receipt = await web3.eth.sendTransaction({
      from: senderAddress, to: evmAddress, value: value.toString(), gasPrice
    });
    const gasUsed = web3.utils.toBN(web3.utils.toWei(`${receipt.gasUsed}`, 'gwei'));

    // verify end balances
    const web3EndBalance = await web3.eth.getBalance(evmAddress);
    const evmSubstrateEndBalance = await fetchBalance(substrateEvmAddress);
    const senderWeb3EndBalance = await web3.eth.getBalance(senderAddress);
    const senderEvmSubstrateEndBalance = await fetchBalance(senderSubstrateAddress);
    assert.equal(senderWeb3EndBalance, senderEvmSubstrateEndBalance.toString(), 'sender substrate balance does not match web3 balance');
    assert.equal(senderWeb3EndBalance, web3.utils.toBN(senderWeb3StartBalance).sub(value).sub(gasUsed).toString(), 'incorrect web3 sender balance');
    assert.equal(web3EndBalance, web3.utils.toBN(web3StartBalance).add(value).toString(), 'incorrect web3 recipient balance');
    assert.equal(web3EndBalance, evmSubstrateEndBalance.toString(), 'recipient substrate balance does not match web3 balance')
  });
});
