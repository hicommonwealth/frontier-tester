const { assert } = require('chai');
const { account, initWeb3 } = require('../utils');
const contract = require("@truffle/contract");
const FallbackContract = require('../build/contracts/FallbackContract.json');

describe('Fallback test', async () => {
  it('should return funds sent to invalid function', async () => {
    const web3 = initWeb3();

    // deploy contract
    const FB = contract({
      abi: FallbackContract.abi,
      unlinked_binary: FallbackContract.bytecode,
    });
    FB.setProvider(web3.currentProvider);
    const c = await FB.new({ from: account });

    // prepare a transaction call
    // TODO??
  });
})