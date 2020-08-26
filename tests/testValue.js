const ValueContract = artifacts.require("ValueContract");
const BN = require('bn.js');

contract("ValueContract test", async (accounts) => {
  it("should have value", async () => {
    let c = await ValueContract.deployed();
    let valueStored = await c.getValue();

    valueToSend = "10000000000";
    const tx = await c.sendValue({ value: valueToSend, from: accounts[0] });
    const updatedValue = await c.getValue();
    assert.equal(updatedValue.toString(), valueStored.add(new BN(valueToSend)));
  });
});
