const { assert } = require("chai");
const UniswapV2ERC20 = require('../node_modules/@uniswap/v2-core/build/UniswapV2ERC20.json');
const { account, initWeb3 } = require('../utils');
const contract = require("@truffle/contract");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Allowance test", async () => {
  it("should compute allowance", async () => {
    const web3 = initWeb3();

    let ERC20 = contract({
      abi: UniswapV2ERC20.abi,
      unlinked_binary: UniswapV2ERC20.bytecode,
    });
    ERC20.setProvider(web3.currentProvider);


    let c = await ERC20.new({ from: account });
    // create with value
    const approvalAccount = '0xc0ffee254729296a45a3885639AC7E10F9d54979';
    await c.approve(approvalAccount, web3.utils.toWei('10', 'ether'), { from: account, gasPrice: 1000000000 });

    const allowance = await c.allowance.call(account, approvalAccount, { from: account, gasPrice: 1000000000 });
    assert.equal(allowance, web3.utils.toWei('10', 'ether'));
  });
});
