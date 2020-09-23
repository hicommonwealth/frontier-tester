const { assert } = require('chai');
const contract = require("@truffle/contract");
const { account, initWeb3, customRequest } = require('../utils');
const ECRecovery = require('../build/contracts/ECRecovery.json');

describe('ECRecovery test', async () => {
  const GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
  const GENESIS_ACCOUNT_PRIVATE_KEY = "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";

  it('should recover account from signature and hash', async () => {
    const web3 = initWeb3();

    // deploy contract
    const ECR = contract({
      abi: ECRecovery.abi,
      unlinked_binary: ECRecovery.bytecode,
    });
    ECR.setProvider(web3.currentProvider);

    const c = await ECR.new({ from: account });

    // prepare a signed message
    const message = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tubulum fuisse, qua illum, cuius is condemnatus est rogatione, P. Eaedem res maneant alio modo.'
    const messageHex = '0x' + Buffer.from(message).toString('hex');
    const signature = await web3.eth.sign(messageHex, account);
    const hash = web3.utils.sha3('\x19Ethereum Signed Message:\n' + message.length + message);
    
    // recover the signer
    const address = await c.recover.call(hash, signature, { from: account });
    assert.equal(address, account);
  });

  it('should interact with precompile directly', async () => {
    const web3 = initWeb3();
    const ECRECOVER_PRECOMPILE_ADDRESS = '0000000000000000000000000000000000000001';

    const message = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tubulum fuisse, qua illum, cuius is condemnatus est rogatione, P. Eaedem res maneant alio modo.'
    const messageHex = '0x' + Buffer.from(message).toString('hex');
    const sig = (await web3.eth.sign(messageHex, account)).slice(2);
    const r = `${sig.slice(0, 64)}`
    const s = `${sig.slice(64, 128)}`
    const v = `${sig.slice(128, 130)}`
    const sigPart = `${Buffer.alloc(31).toString('hex')}${v}${r}${s}`;
    const hash = web3.utils.sha3('\x19Ethereum Signed Message:\n' + message.length + message).slice(2);

    const RAW_TX = {
      from: account,
      gasPrice: "0x01",
      gas: "0x10000000",
      to: ECRECOVER_PRECOMPILE_ADDRESS,
      value: "0x0",
      data: `0x${hash.toString('hex')}${sigPart}`,
    };

    const raw_TX = await web3.eth.accounts.signTransaction(
      RAW_TX,
      GENESIS_ACCOUNT_PRIVATE_KEY
    );

    const tx = await web3.eth.sendTransaction({
      from: account,
      to: ECRECOVER_PRECOMPILE_ADDRESS,
      value: '0x0',
      gas: '0x10000000',
      data: `0x${hash.toString('hex')}${sigPart}`,
    });

    assert.equal(tx.transactionHash, raw_TX.transactionHash);
  });
});
