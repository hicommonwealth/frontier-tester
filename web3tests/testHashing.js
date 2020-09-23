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

  it('should perform keccak256', async () => {
    const contractResult = await c.callKeccak256.call(messageHex, { from: account });
    const localResult = web3.utils.keccak256(messageHex);
    assert.equal(contractResult, localResult);
  });

  it('should perform ripemd160', async () => {
    const contractResult = await c.callRipemd160.call(messageHex, { from: account });
    const localResult = new RIPEMD160().update(messageHex).digest('hex');
    assert.equal(contractResult, localResult);
  });

  it('should perform sha256', async () => {
    const contractResult = await c.callSha256.call(messageHex, { from: account });
    const localResult = sha256.hex(messageHex);
    assert.equal(contractResult, localResult);
  });
});
