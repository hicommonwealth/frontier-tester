var TokenA = artifacts.require("TokenA");
var TokenB = artifacts.require("TokenB");
var Multicall = artifacts.require("Multicall");

module.exports = function (deployer) {
  // deployment steps
  deployer.deploy(TokenA, "8000000000000000000000000", { gas: 5000000 });
  deployer.deploy(TokenB, "8000000000000000000000000", { gas: 5000000 });
  deployer.deploy(Multicall, { gas: 5000000 });
};

