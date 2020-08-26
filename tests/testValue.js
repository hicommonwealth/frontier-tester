const ValueContract = artifacts.require("ValueContract");

contract("ValueContract test", async (accounts) => {
  it("should have value", async () => {
    let c = await ValueContract.deployed();
    let valueStored = await c.getValue();
    assert.equal(valueStored.toString(), "0");

    valueToSend = "10000000000";
    await c.sendValue({ value: valueToSend, from: accounts[0] });
    valueStored = await c.getValue();
    assert.equal(valueStored.toString(), valueToSend);
  });
});
