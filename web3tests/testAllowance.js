const UniswapV2ERC20 = require('../node_modules/@uniswap/v2-core/build/UniswapV2ERC20.json');
const { deployContract, account, initWeb3 } = require('../utils');

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("Allowance test", async () => {
  it("should compute allowance", async () => {
    const web3 = initWeb3();
    let c = await deployContract('UniswapV2ERC20', UniswapV2ERC20);
    await timeout(500);

    // create with value
    const approvalAccount = '0xc0ffee254729296a45a3885639AC7E10F9d54979';
    await c.methods.approve(approvalAccount, web3.utils.toWei('10', 'ether')).send({ from: account, gasPrice: 1000000000 });
    await timeout(500);

    const allowance = await c.methods.allowance(account, approvalAccount).call({ from: account, gasPrice: 1000000000 });
    console.log(allowance.toString());
  });
});
