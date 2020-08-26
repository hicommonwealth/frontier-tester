const Create2Factory = artifacts.require("Create2Factory");

contract("Create2Factory test", async (accounts) => {
  it("should spawn with create2", async () => {
    let c = await Create2Factory.deployed();
    // TODO
  });
});
