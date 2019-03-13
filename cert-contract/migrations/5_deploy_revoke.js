var Revoke = artifacts.require("RevocationList");

module.exports = function(deployer) {
  deployer.deploy(Revoke);
};