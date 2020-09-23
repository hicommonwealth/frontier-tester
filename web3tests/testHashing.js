const { assert } = require('chai');
const contract = require("@truffle/contract");
const { account, initWeb3, privKey } = require('../utils');
const HashingContract = require('../build/contracts/Hashing.json');
const RIPEMD160 = require('ripemd160');
const { sha256 } = require('js-sha256');

describe('Hashing test', async () => {
  let web3;
  let c;
  const message = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tubulum fuisse, qua illum, cuius is condemnatus est rogatione, P. Eaedem res maneant alio modo.'
  const messageHex = '0x' + Buffer.from(message).toString('hex');

  before(async () => {
    // setup web3 and contract instance
    web3 = initWeb3();
    const Hashing = contract({
      abi: HashingContract.abi,
      unlinked_binary: HashingContract.bytecode,
    });
    Hashing.setProvider(web3.currentProvider);
    c = await Hashing.new({ from: account });
  });

  it('should perform keccak256 in contract', async () => {
    const contractResult = await c.callKeccak256.call(messageHex, { from: account });
    const localResult = web3.utils.keccak256(messageHex);
    assert.equal(contractResult, localResult);
  });

  // NOTE: Keccak256 does not have a precompile, so we cannot access it directly

  it('should perform ripemd160 in contract', async () => {
    const contractResult = await c.callRipemd160.call(messageHex, { from: account });
    const localResult = new RIPEMD160().update(messageHex).digest('hex');
    assert.equal(contractResult, localResult);
  });

  it('should perform ripemd160 directly', async () => {
    const RIPEMD160_PRECOMPILE_ADDRESS = '0000000000000000000000000000000000000003';
  
    const RAW_TX = {
      from: account,
      gasPrice: "0x01",
      gas: "0x10000000",
      to: RIPEMD160_PRECOMPILE_ADDRESS,
      value: "0x0",
      data: messageHex,
    };

    const SIGNED_TX = await web3.eth.accounts.signTransaction(
      RAW_TX,
      privKey
    );

    const tx = await web3.eth.sendTransaction({
      from: account,
      to: RIPEMD160_PRECOMPILE_ADDRESS,
      value: '0x0',
      gas: '0x10000000',
      data: messageHex,
    });

    assert.equal(tx.transactionHash, SIGNED_TX.transactionHash);
  });

  it('should perform sha256 in contract', async () => {
    const contractResult = await c.callSha256.call(messageHex, { from: account });
    const localResult = sha256.hex(messageHex);
    assert.equal(contractResult, localResult);
  });

  it('should perform sha256 directly', async () => {
    const SHA256_PRECOMPILE_ADDRESS = '0000000000000000000000000000000000000002';
   
    const RAW_TX = {
      from: account,
      gasPrice: "0x01",
      gas: "0x10000000",
      to: SHA256_PRECOMPILE_ADDRESS,
      value: "0x0",
      data: messageHex,
    };

    const SIGNED_TX = await web3.eth.accounts.signTransaction(
      RAW_TX,
      privKey
    );

    const tx = await web3.eth.sendTransaction({
      from: account,
      to: SHA256_PRECOMPILE_ADDRESS,
      value: '0x0',
      gas: '0x10000000',
      data: messageHex,
    });

    assert.equal(tx.transactionHash, SIGNED_TX.transactionHash);
  });
});
