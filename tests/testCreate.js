const { assert } = require("chai");

const CreateContract = artifacts.require("CreateContract");
const SubContract = artifacts.require("SubContract");

contract("CreateContract test", async (accounts) => {
  it("should spawn subcontract", async () => {
    let c = await CreateContract.deployed();
    let startNonce = await web3.eth.getTransactionCount(c.address);

    // create without value
    await c.spawn({ from: accounts[0] });
    let address = await c.deployed.call(0);
    let sub = await SubContract.at(address);
    let balance = await sub.getValue();
    assert.equal(balance, '0', 'balance of deployed subcontract should be 0');

    // check nonce
    let nonce = await web3.eth.getTransactionCount(c.address);
    assert.equal(nonce, startNonce + 1, 'contract nonce should increment');

    // create with value
    const value = web3.utils.toWei('10', 'ether');
    await c.spawnWithValue({ value, from: accounts[0] });
    address = await c.deployed.call(1);
    let sub2 = await SubContract.at(address);
    assert.notEqual(sub2.address, sub.address, 'new subcontract should have different address');
    let balance2 = await sub2.getValue();
    assert.equal(balance2, value, 'new subcontract should have balance paid to it');
    balance = await sub.getValue();
    assert.equal(balance, '0', 'balance of old subcontract should still be 0');

    // check nonce
    nonce = await web3.eth.getTransactionCount(c.address);
    assert.equal(nonce, startNonce + 2, 'contract nonce should increment twice');
  });
});
