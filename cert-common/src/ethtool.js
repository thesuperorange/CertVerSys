const ProviderEngine = require('web3-provider-engine')
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js')
const PkHookedWalletSubprovider = require('web3-provider-engine/subproviders/hooked-wallet-ethtx.js')
const NonceSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js')
const ethUtil = require('ethereumjs-util')

// 
// NOTE: this is Web3 1.0 version
// truffle use web3-0.20 not web3-1.0
// https://github.com/nosuchip/truffle-privatekey-provider
// 

function bytes32toStr(input) {
  return Buffer.from(input.substr(2), 'hex').toString('utf8').replace(/\0/g, '')
}

function RpcWrapperEngine(opts){
  opts = opts || {}
  
  var engine = opts.engine || new ProviderEngine()
  
  // tx signing
  var privateKey = opts.privateKey
  var addressHex =  ethUtil.privateToAddress(Buffer.from(privateKey, 'hex')).toString('hex')
  var addresses = ['0x'+addressHex]
  
  engine.addProvider(new PkHookedWalletSubprovider({
    getAccounts: function(cb){
      cb(null, addresses)
    },
    getPrivateKey: function(from, cb){
      cb(null, Buffer.from(privateKey,'hex'))
    },
  }))
  
  // pending nonce
  engine.addProvider(new NonceSubprovider())
  
  // data source
  engine.addProvider(new RpcSubprovider({
    rpcUrl: opts.rpcUrl,
  }))
  
  // start polling
  engine.start()
  
  return engine
}

module.exports = {
  PrivateKeyProvider: RpcWrapperEngine,
  bytes32toStr:bytes32toStr
}
