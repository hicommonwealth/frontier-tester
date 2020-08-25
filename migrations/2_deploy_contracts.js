const TimeContract = artifacts.require("TimeContract");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(TimeContract);
};
