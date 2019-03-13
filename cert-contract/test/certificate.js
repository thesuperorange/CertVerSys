// Testing Solidity with Truffle and Async/Await – HelloSugoi – Medium https://medium.com/hello-sugoi/testing-solidity-with-truffle-and-async-await-396e81c54f93
var Cert = artifacts.require("Certificate");

contract('Certificate Test', function (accounts) {

  it("Contract's address", async function () {
    let cert = await Cert.deployed();
    let address = cert.address;
    // TODO
    // k = bytes32(address(this)) ^ key;
    // cert.xor32(a) = a ^ K
    assert.equal(address.length, 42)
    // assert.equal(cert.xor32(a), '0x00000??')
  });
})