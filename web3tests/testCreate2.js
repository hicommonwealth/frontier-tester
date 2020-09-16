const { assert } = require('chai');
const Create2Factory = require('../build/contracts/Create2Factory.json');
const ValueContract = require('../build/contracts/ValueContract.json');
const { deployContract, account, initWeb3 } = require('../utils');

describe('Create2Factory test', async () => {
  it('should deploy with create2', async () => {
    const web3 = initWeb3();
    let c = await deployContract('Create2Factory', Create2Factory);

    // load bytecode and deploy
    await c.methods.deploy(5).send({ from: account, gasPrice: 1000000000 });
    const addr = await c.methods.viewAddr().call({ from: account, gasPrice: 1000000000 });

    // load new contract and check methods
    const valueContract = new web3.eth.Contract(ValueContract.abi, addr);
    const value = await valueContract.methods.getValue().call({ from: account, gasPrice: 1000000000 });
    assert.equal(value, '0');
  });
});
