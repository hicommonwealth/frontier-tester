const OwnerContract = artifacts.require("OwnerContract");
const truffleAssert = require('truffle-assertions');

contract("OwnerContract test", async (accounts) => {
  it("should have owner", async () => {
    let c = await OwnerContract.deployed();
    let result = await c.makeCall({ from: accounts[0] });
    assert.isTrue(result);
  });

  it("should fail with wrong owner", async () => {
    // NOTE: this will fail, because the error will be:
    //     { code: -32603, message: 'inner executing call failed' }
    // rather than a revert!
    let c = await OwnerContract.deployed();
    await truffleAssert.fails(c.makeCall({ from: accounts[1] }));
  });
});
