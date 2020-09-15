const IContractUser = require('../build/contracts/IContractUser.json');
const ContractImpl = require('../build/contracts/ContractImpl.json');
const { deployContract, account } = require('../utils');

describe('Interfaces test', async () => {
  it('should access deployed interface', async () => {
    const ci = await deployContract('ContractImpl', ContractImpl);
    const icu = await deployContract('IContractUser', IContractUser);

    const result = await icu.methods.linkContract(ci.address).call({ from: account });
    assert.isTrue(result);
  });
});
