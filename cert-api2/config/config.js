var config = {    
  debug: true,//true  local  
  path: "m/2018'/5'/1'/0",
  CertDBContract:"0x464d6d178f2e01fb19d77fd2653cdff44d96a406",
};

var ipfsconfig = {
	ip: "localhost",
	port: 5001
}

var revokeConfig = {
	RevokeContractAddr:"0xa3a4b5d6784a235424e257e85f17d19e6c9eaceb"
}

module.exports = config;
module.exports.ipfsconfig = ipfsconfig;
module.exports.revokeConfig = revokeConfig;
