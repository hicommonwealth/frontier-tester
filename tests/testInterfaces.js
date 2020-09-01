const IContractUser = artifacts.require('IContractUser');
const ContractImpl = artifacts.require('ContractImpl');

contract('Interfaces test', async (accounts) => {
  it('should access deployed interface', async () => {
    const ci = await ContractImpl.deployed();
    const icu = await IContractUser.deployed();

    const result = await icu.linkContract.call(ci.address);
    assert.isTrue(result);
  });
});
