const OwnerContract = artifacts.require("OwnerContract");
const truffleAssert = require('truffle-assertions');

contract("OwnerContract test", async (accounts) => {
  it("should have owner", async () => {
    let c = await OwnerContract.deployed();
    let result = await c.makeCall.call({ from: accounts[0] });
    assert.isTrue(result);
  });

  it("should fail with wrong owner", async () => {
    let c = await OwnerContract.deployed();
    await truffleAssert.reverts(c.makeCall.call({ from: accounts[1] }), "only owner");
  });
});
