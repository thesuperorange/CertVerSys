const Web3 = require("web3");
const HDWalletProvider = require("truffle-hdwallet-provider");
const TruffleContract = require("truffle-contract");

const RegistryJson = require("./build/contracts/EthereumClaimsRegistry.json");
const registryContract = TruffleContract(RegistryJson);

const CertJson = require("./build/contracts/Cert.json");
const certContract = TruffleContract(CertJson);

const CertDBJson = require("./build/contracts/CertDB.json");
const certDBContract = TruffleContract(CertDBJson);

const CertificateJson = require("./build/contracts/Certificate.json");
const certificatecontract = TruffleContract(CertificateJson);

const RevokeJson = require('./build/contracts/RevocationList.json')
const RevokeContract = TruffleContract(RevokeJson);

module.exports = {

  getRegistryContract: function() {
    return registryContract;
  },
  
  getCertificateContract: function(){
    return certificatecontract;
  },

  getCertContract: function() {
    return certContract;
  },

  getCertDBContract: function() {
    return certDBContract;
  },

  getRevokeContract: function(){
    console.log("getRevokeContract function called")
    return RevokeContract;
  }
};
