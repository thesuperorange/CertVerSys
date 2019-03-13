var Cert = artifacts.require("Certificate");

module.exports = function(deployer) {
  deployer.deploy(Cert);
};