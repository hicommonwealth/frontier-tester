const { assert } = require("chai");

const CreateContract = artifacts.require("CreateContract");
const SubContract = artifacts.require("SubContract");

contract("CreateContract test", async (accounts) => {
  it("should spawn subcontract", async () => {
    let c = await CreateContract.deployed();
    let nonce = await web3.eth.getTransactionCount(c.address);
    assert.equal(nonce, 1, 'contract nonce should be 1 to start');

    // create without value
    await c.spawn({ from: accounts[0] });
    let address = await c.deployed.call(0);
    let sub = await SubContract.at(address);
    let balance = await sub.getValue();
    assert.equal(balance, '0', 'balance of deployed subcontract should be 0');

    // check nonce
    nonce = await web3.eth.getTransactionCount(c.address);
    assert.equal(nonce, 2, 'contract nonce should be 2');

    // create with value
    const value = web3.utils.toWei('10', 'ether');
    await c.spawnWithValue({ value, from: accounts[0] });
    address = await c.deployed.call(1);
    sub = await SubContract.at(address);
    balance = await sub.getValue();
    assert.equal(balance, value, 'subcontract should have balance paid to it');

    // check nonce
    nonce = await web3.eth.getTransactionCount(c.address);
    assert.equal(nonce, 3, 'contract nonce should be 3');
  });
});
