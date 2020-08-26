const ValueContract = artifacts.require("ValueContract");

contract("ValueContract test", async (accounts) => {
  it("should have value", async () => {
    let c = await ValueContract.deployed();
    // TODO
  });
});
