const CreateContract = artifacts.require("CreateContract");
const SubContract = artifacts.require("SubContract");

contract("CreateContract test", async (accounts) => {
  it("should spawn subcontract", async () => {
    let c = await CreateContract.deployed();
    await c.spawn();
    const subAddress = await c.getSub();
    const sub = await SubContract.at(subAddress);
    const balance = await sub.getValue();
    assert.equal(balance, "0");
  });
});
