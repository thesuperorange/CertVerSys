// Testing Solidity with Truffle and Async/Await – HelloSugoi – Medium https://medium.com/hello-sugoi/testing-solidity-with-truffle-and-async-await-396e81c54f93
var Token = artifacts.require("TutorialToken");

contract('Token', function (accounts) {

  it("should put 12000 Token in the first account", async function () {
    let token = await Token.deployed();
    let balance = await token.balanceOf.call(accounts[0]);
    assert.equal(balance.valueOf(), 12000, "12000 wasn't in the first account")
  });

 
  
})