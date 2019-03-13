const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = "zoo hard daughter win aerobic step glad client symptom stove unlock guitar"
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  }
};
