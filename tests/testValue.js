const ValueContract = artifacts.require("ValueContract");
const BN = web3.utils.BN;

contract("ValueContract test", async (accounts) => {
  it("should have value", async () => {
    let c = await ValueContract.deployed();
    let valueStored = await c.getValue();

    const balance = await web3.eth.getBalance(accounts[0]);
    valueToSend = new BN("10000000000");
    const tx = await c.sendValue({ value: valueToSend.toString(), from: accounts[0] });
    const updatedValue = await c.getValue();
    const updatedBalance = await web3.eth.getBalance(accounts[0]);
    assert.equal(updatedValue.toString(), valueStored.add(valueToSend).toString(), "contract value wrong");
    assert.equal(updatedBalance, (new BN(balance)).sub(valueToSend).toString(), "account balance wrong");
  });
});
