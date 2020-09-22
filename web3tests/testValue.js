const { assert } = require('chai');
const ValueContract = require('../build/contracts/ValueContract.json');
const { deployContract, account, initWeb3 } = require('../utils');
const contract = require("@truffle/contract");

describe("ValueContract test", async () => {
  it("should have value", async () => {
    const web3 = initWeb3();
    let Value = contract({
      abi: ValueContract.abi,
      unlinked_binary: ValueContract.bytecode,
    });
    Value.setProvider(web3.currentProvider);

    const BN = web3.utils.BN;
    let balance = await web3.eth.getBalance(account);

    let c = await Value.new({ from: account });
    let createReceipt = await web3.eth.getTransactionReceipt(c.transactionHash);
    let createGasUsed = web3.utils.toWei(`${createReceipt.gasUsed}`, 'gwei');
    let valueStored = await c.getValue.call({ from: account });

    assert.equal(valueStored, '0');
    const valueToSend = web3.utils.toWei('1', 'ether');
    const tx = await c.sendValue({ value: valueToSend, from: account, gasPrice: 1000000000 });
    const txGasUsed = web3.utils.toWei(`${tx.receipt.gasUsed}`, 'gwei');
    const updatedValue = await c.getValue.call({ from: account });
    const updatedBalance = await web3.eth.getBalance(account);
    const totalSpent = (new BN(createGasUsed)).add(new BN(txGasUsed)).add(new BN(valueToSend));
    assert.equal(updatedValue.toString(), (new BN(valueStored)).add(new BN(valueToSend)).toString(), "contract value wrong");
    assert.equal(updatedBalance.toString(), (new BN(balance)).sub(totalSpent).toString(), "account balance wrong");
  });

  it("should setup ValueContract with non-zero value", async () => {
    const web3 = initWeb3();
    let Value = contract({
      abi: ValueContract.abi,
      unlinked_binary: ValueContract.bytecode,
    });
    Value.setProvider(web3.currentProvider);

    const BN = web3.utils.BN;
    let balance = await web3.eth.getBalance(account);

    const initialSendValue = web3.utils.toWei('1', 'ether');
    let c = await Value.new({ from: account, value: initialSendValue });
    let createReceipt = await web3.eth.getTransactionReceipt(c.transactionHash);
    let createGasUsed = web3.utils.toWei(`${createReceipt.gasUsed}`, 'gwei');
    let valueStored = await c.getValue.call({ from: account });

    assert.equal(valueStored, web3.utils.toWei('1', 'ether'));
    const valueToSend = web3.utils.toWei('1', 'ether');
    const tx = await c.sendValue({ value: valueToSend, from: account, gasPrice: 1000000000 });
    const txGasUsed = web3.utils.toWei(`${tx.receipt.gasUsed}`, 'gwei');
    const updatedBalance = await web3.eth.getBalance(account);
    const updatedValue = await c.getValue.call({ from: account });
    const totalValueSent = (new BN(initialSendValue)).add(new BN(valueToSend));
    const totalSpent = (new BN(createGasUsed)).add(new BN(txGasUsed)).add(totalValueSent);
    assert.equal(updatedValue.toString(), (new BN(valueStored)).add(new BN(valueToSend)).toString(), "contract value wrong");
    assert.equal(updatedBalance.toString(), (new BN(balance)).sub(totalSpent).toString(), "account balance wrong");
  });
});
