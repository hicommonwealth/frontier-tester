const { assert } = require('chai');
const ValueContract = require('../build/contracts/ValueContract.json');
const { deployContract, account, initWeb3 } = require('../utils');
const contract = require("@truffle/contract");

describe("ValueContract test", async () => {
  it("should have value", async () => {
    const web3 = initWeb3();
    const BN = web3.utils.BN;

    const Value = contract({
      abi: ValueContract.abi,
      unlinked_binary: ValueContract.bytecode,
    });
    Value.setProvider(web3.currentProvider);
    const c = await Value.new({ from: account });
    const valueStored = await c.getValue.call({ from: account, gasPrice: 1000000000 });

    const balance = await web3.eth.getBalance(account);
    const valueToSend = web3.utils.toWei('1');
    const tx = await c.sendValue({ value: valueToSend, from: account, gasPrice: 1000000000 });
    const updatedValue = await c.getValue.call({ from: account, gasPrice: 1000000000 });
    const updatedBalance = await web3.eth.getBalance(account);
    console.log(`Value sent: ${valueToSend}, Updated value: ${updatedValue}`);
    assert.isTrue((new BN(updatedValue)).eq((new BN(valueStored)).add(new BN(valueToSend))), "contract value wrong");
    // TODO: compute exact value once the receipt emits gas values
    assert.isTrue((new BN(updatedBalance)).lte((new BN(balance)).sub(new BN(valueToSend))), "account balance wrong");
  });
});
