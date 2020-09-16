const Create2Factory = artifacts.require("Create2Factory");
const CreateContract = artifacts.require("CreateContract");
const TimeContract = artifacts.require("TimeContract");
const OwnerContract = artifacts.require("OwnerContract");
const ValueContract = artifacts.require("ValueContract");
const IContractUser = artifacts.require('IContractUser');
const ContractImpl = artifacts.require('ContractImpl');
const Lockdrop = artifacts.require('Lockdrop');

const utility = require('../helpers/util');

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Create2Factory, { from: accounts[0] });
  await deployer.deploy(CreateContract, { from: accounts[0] });
  await deployer.deploy(TimeContract, { from: accounts[0] });
  await deployer.deploy(OwnerContract, { from: accounts[0] });
  await deployer.deploy(ValueContract, { from: accounts[0] });
  await deployer.deploy(IContractUser, { from: accounts[0] });
  await deployer.deploy(ContractImpl, { from: accounts[0] });

  // let time = await utility.getCurrentTimestamp(web3);

  // await deployer.deploy(Lockdrop, time, { from: accounts[0] });
};
