const CreateContract = artifacts.require("CreateContract");

contract("CreateContract test", async (accounts) => {
  it("should spawn subcontract", async () => {
    let c = await CreateContract.deployed();
    // TODO
  });
});
