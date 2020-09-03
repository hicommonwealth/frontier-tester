const UniswapV2ERC20 = artifacts.require("UniswapV2ERC20");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

contract("Allowance test", async (accounts) => {
  it("should compute allowance", async () => {
    let c = await UniswapV2ERC20.deployed();
    await timeout(500);

    // create with value
    const approvalAccount = '0xc0ffee254729296a45a3885639AC7E10F9d54979';
    await c.approve(approvalAccount, web3.utils.toWei('10', 'ether'), { from: accounts[0] });
    await timeout(500);

    const allowance = await c.allowance(accounts[0], approvalAccount);
    console.log(allowance.toString());
  });
});
