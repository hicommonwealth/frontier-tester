const Create2Factory = artifacts.require("Create2Factory");
const CreateContract = artifacts.require("CreateContract");
const TimeContract = artifacts.require("TimeContract");
const OwnerContract = artifacts.require("OwnerContract");
const ValueContract = artifacts.require("ValueContract");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Create2Factory, { from: accounts[0] });
  deployer.deploy(CreateContract, { from: accounts[0] });
  deployer.deploy(TimeContract, { from: accounts[0] });
  deployer.deploy(OwnerContract, { from: accounts[0] });
  deployer.deploy(ValueContract, { from: accounts[0] });
};
