import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import Web3 from 'web3';
import { assert } from 'chai';
const { convertToEvmAddress, convertToSubstrateAddress } = require('../utils.js');
const EdgewarePrivateKeyProvider = require('../private-provider')
import BN from 'bn.js';

describe('Substrate <> EVM balances test', async () => {
  let web3: Web3;
  let web3Url: string;
  let api: ApiPromise;
  let id: number;
  let keyring: KeyringPair;
  let address: string;
  let evmAddress: string;
  let substrateEvmAddress: string;
  let sendSubstrateBalance: (value: BN, addr?: string) => Promise<BN>;

  before(async () => {
    // init web3
    web3Url = 'http://localhost:9933';
    web3 = new Web3(web3Url);
    id = await web3.eth.net.getId();
    assert.equal(id, 42);

    // init polkadot
    const polkadotUrl = 'ws://localhost:9944';
    api = await new ApiPromise({
      provider: new WsProvider(polkadotUrl)
    }).isReady;
    const { ss58Format } = await api.rpc.system.properties();
    const substrateId = +ss58Format.unwrap();
    assert.equal(substrateId, id);

    // init addresses
    keyring = new Keyring({ ss58Format: id, type: 'sr25519' }).addFromUri('//Alice');
    address = keyring.address;
    evmAddress = convertToEvmAddress(address);
    substrateEvmAddress = convertToSubstrateAddress(evmAddress);

    // returns the tx fees
    sendSubstrateBalance = async (value: BN, addr = substrateEvmAddress): Promise<BN> => {
      return new Promise(async (resolve) => {
        const tx = api.tx.balances.transfer(addr, value);
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
  })

  it('should fund account via transfer', async () => {
    const value = new BN('10000000000000000000');
  
    // query start balances
    const web3StartBalance = await web3.eth.getBalance(evmAddress);
    const polkadotStartBalance = await api.query.system.account(address);
    const evmSubstrateStartBalance = await api.query.system.account(substrateEvmAddress);
  
    assert.isTrue(polkadotStartBalance.data.free.gt(value), 'sender account must have sufficient balance');
    assert.equal(web3StartBalance, evmSubstrateStartBalance.data.free.toString(), 'substrate balance does not match web3 balance');

    const fees = await sendSubstrateBalance(value);

    // query final balances
    const polkadotEndBalance = await api.query.system.account(address);
    const evmSubstrateEndBalance = await api.query.system.account(substrateEvmAddress);
    const web3EndBalance = await web3.eth.getBalance(evmAddress);

    assert.equal(polkadotEndBalance.data.free.toString(), polkadotStartBalance.data.free.sub(value).sub(fees).toString(), 'incorrect sender account balance');
    assert.equal(web3EndBalance, evmSubstrateEndBalance.data.free.toString(), 'substrate balance does not match web3 balance');
    assert.equal(evmSubstrateEndBalance.data.free.toString(), evmSubstrateStartBalance.data.free.add(value).toString(), 'incorrect web3 account balance');
  });

  it('should withdraw via evm pallet', async () => {
    // ensure the evm account has balance
    const value = new BN('10000000000000000000');
    await sendSubstrateBalance(value.muln(2));

    // query start balances
    const web3StartBalance = await web3.eth.getBalance(evmAddress);
    const polkadotStartBalance = await api.query.system.account(address);
    const evmSubstrateStartBalance = await api.query.system.account(substrateEvmAddress);
    assert.isTrue(evmSubstrateStartBalance.data.free.gt(value), 'evm account must have sufficient balance');
    assert.equal(web3StartBalance, evmSubstrateStartBalance.data.free.toString(), 'substrate balance does not match web3 balance');

    // execute withdraw
    const fees: BN = await new Promise(async (resolve) => {
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
    const polkadotEndBalance = await api.query.system.account(address);
    const evmSubstrateEndBalance = await api.query.system.account(substrateEvmAddress);
    const web3EndBalance = await web3.eth.getBalance(evmAddress);

    assert.equal(polkadotEndBalance.data.free.toString(), polkadotStartBalance.data.free.add(value).sub(fees).toString(), 'incorrect sender account balance');
    assert.equal(web3EndBalance, evmSubstrateEndBalance.data.free.toString(), 'substrate balance does not match web3 balance');
    assert.equal(evmSubstrateEndBalance.data.free.toString(), evmSubstrateStartBalance.data.free.sub(value).toString(), 'incorrect web3 account balance');

  });

  it('should update substrate balances from web3 tx', async () => {
    // start with an EVM account with a known private key
    const value = new BN('10000000000000000000');
    const privKey = '99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E343';
    const provider = new EdgewarePrivateKeyProvider(privKey, web3Url, id);
    const web3 = new Web3(provider);
    const senderAddress = provider.address;
    const senderSubstrateAddress: string = convertToSubstrateAddress(senderAddress, id);

    // give the EVM account some balance to send back via web3
    await sendSubstrateBalance(value.muln(2), senderSubstrateAddress);

    // query start balances
    const web3StartBalance = await web3.eth.getBalance(evmAddress);
    const senderWeb3StartBalance = await web3.eth.getBalance(senderAddress);
    const senderEvmSubstrateStartBalance = await api.query.system.account(senderSubstrateAddress);
    assert.isTrue(web3.utils.toBN(senderWeb3StartBalance).gt(value), 'evm account must have sufficient balance');
    assert.equal(senderWeb3StartBalance, senderEvmSubstrateStartBalance.data.free.toString(), 'substrate balance does not match web3 balance');

    // perform web3 call, send value back to the original substrate/alice account
    const gasPrice = web3.utils.toWei("1", 'gwei');
    const receipt = await web3.eth.sendTransaction({
      from: senderAddress, to: evmAddress, value: value.toString(), gasPrice
    });
    const gasUsed = web3.utils.toBN(web3.utils.toWei(`${receipt.gasUsed}`, 'gwei'));

    // verify end balances
    const web3EndBalance = await web3.eth.getBalance(evmAddress);
    const evmSubstrateEndBalance = await api.query.system.account(substrateEvmAddress);
    const senderWeb3EndBalance = await web3.eth.getBalance(senderAddress);
    const senderEvmSubstrateEndBalance = await api.query.system.account(senderSubstrateAddress);
    assert.equal(senderWeb3EndBalance, senderEvmSubstrateEndBalance.data.free.toString(), 'sender substrate balance does not match web3 balance');
    assert.equal(senderWeb3EndBalance, web3.utils.toBN(senderWeb3StartBalance).sub(value).sub(gasUsed).toString(), 'incorrect web3 sender balance');
    assert.equal(web3EndBalance, web3.utils.toBN(web3StartBalance).add(value).toString(), 'incorrect web3 recipient balance');
    assert.equal(web3EndBalance, evmSubstrateEndBalance.data.free.toString(), 'recipient substrate balance does not match web3 balance')
  });
});
