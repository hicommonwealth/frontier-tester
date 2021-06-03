const { assert } = require('chai');
const Create2Factory = require('../build/contracts/Create2Factory.json');
const ValueContract = require('../build/contracts/ValueContract.json');
const { deployContract, account, initWeb3, GAS_PRICE, GAS_LIMIT } = require('../utils');
const contract = require("@truffle/contract");

describe('Create2Factory test', async () => {
  it('should deploy with create2', async () => {
    const web3 = initWeb3();
    let Create2 = contract({
      abi: Create2Factory.abi,
      unlinked_binary: Create2Factory.bytecode,
    });
    Create2.setProvider(web3.currentProvider);

    let c = await Create2.new({ from: account, gasLimit: GAS_LIMIT });

    // load bytecode and deploy
    await c.deploy(5, { from: account, gasLimit: GAS_LIMIT });
    const addr = await c.viewAddr.call({ from: account, gasLimit: GAS_LIMIT });

    let Value = contract({
      abi: ValueContract.abi,
      unlinked_binary: ValueContract.bytecode,
    });
    Value.setProvider(web3.currentProvider);

    // load new contract and check methods
    const valueContract = await Value.at(addr);
    const value = await valueContract.getValue.call({ from: account, gasLimit: GAS_LIMIT });
    assert.equal(value, '0');
  });
});
