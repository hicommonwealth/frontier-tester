const Create2Factory = artifacts.require('Create2Factory');
const ValueContract = artifacts.require('ValueContract');
const ValueContractJSON = require('../build/contracts/ValueContract.json');

contract('Create2Factory test', async (accounts) => {
  it('should deploy with create2', async () => {
    let c = await Create2Factory.deployed();

    // load bytecode and deploy
    const bytecode = ValueContractJSON.bytecode;
    await c.deploy(bytecode, 5, { from: accounts[0] });
    const addr = await c.viewAddr.call();

    // load new contract and check methods
    const valueContract = await ValueContract.at(addr);
    const value = await valueContract.getValue();
    assert.equal(value, '0');
  });
});
