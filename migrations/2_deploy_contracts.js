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
  deployer.deploy(Create2Factory, { from: accounts[0] });
  deployer.deploy(CreateContract, { from: accounts[0] });
  deployer.deploy(TimeContract, { from: accounts[0] });
  deployer.deploy(OwnerContract, { from: accounts[0] });
  deployer.deploy(ValueContract, { from: accounts[0] });
  deployer.deploy(IContractUser, { from: accounts[0] });
  deployer.deploy(ContractImpl, { from: accounts[0] });

  let time = await utility.getCurrentTimestamp(web3);

  await deployer.deploy(Lockdrop, time, { from: accounts[0] });
};
