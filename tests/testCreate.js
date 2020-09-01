const CreateContract = artifacts.require("CreateContract");
const SubContract = artifacts.require("SubContract");

contract("CreateContract test", async (accounts) => {
  it("should spawn subcontract", async () => {
    let c = await CreateContract.deployed();

    // create without value
    // await c.spawn({ from: accounts[0] });
    // let subAddress = await c.getSub();
    // let sub = await SubContract.at(subAddress);
    // let balance = await sub.getValue();
    // assert.equal(balance, "0");

    // create with value
    const value = web3.utils.toWei('10', 'ether');
    await c.spawnWithValue({ value, from: accounts[0] });
    let subAddress = await c.getSub();
    let sub = await SubContract.at(subAddress);
    let balance = await sub.getValue();
    console.log(balance, value);
    assert.equal(balance, value);
  });
});
