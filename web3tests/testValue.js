const ValueContract = require('../build/contracts/ValueContract.json');
const { deployContract, account, initWeb3 } = require('../utils');

describe("ValueContract test", async () => {
  it("should have value", async () => {
    const web3 = initWeb3();
    const BN = web3.utils.BN;
    let c = await deployContract('ValueContract', ValueContract);
    let valueStored = await c.methods.getValue().call({ from: account });

    const balance = await web3.eth.getBalance(account);
    valueToSend = web3.utils.toWei('1');
    const tx = await c.methods.sendValue().call({ value: valueToSend, from: account });
    const updatedValue = await c.methods.getValue().call({ from: account });
    const updatedBalance = await web3.eth.getBalance(account);
    assert.equal(updatedValue.toString(), valueStored.add(valueToSend).toString(), "contract value wrong");
    assert.equal(updatedBalance.toString(), (new BN(balance)).sub(new BN(valueToSend)).toString(), "account balance wrong");
  });
});
