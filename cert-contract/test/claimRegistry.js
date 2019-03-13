const EthereumClaimsRegistry = artifacts.require('EthereumClaimsRegistry')
// const Web3Utils = require('web3-utils');
const crypto = require('crypto')

//
// NOTE : http://truffleframework.com/docs/getting_started/javascript-tests
// 
contract('EthereumClaimsRegistry', accounts => {

  let claimsReg

  let testKey1 = 'key123'
  let testKey2 = 'key456'
  let testVal1 = 'abc123'
  let testVal2 = 'abc456'

  before(async () => {
    claimsReg = await EthereumClaimsRegistry.new()
  })

  it('should set a claim(sha256)', async () => {
    let keyhex = '0x'+ crypto.createHash('sha256').update('testkey').digest('hex');
    
    // console.log(keyhex);
    // "0x98483c6eb40b6c31a448c22a66ded3b5e5e8d5119cac8327b655c8b5c4836489"
    
    let valhex = '0x'+crypto.createHash('sha256').update('testval').digest('hex');

    // console.log(valhex)
    // "0x93285be41b243afa17cc06e34495c4ed06d3c96c68b07ceb2340baa71cb5c417"

    let tx = await claimsReg.setClaim(accounts[1], keyhex, valhex, {from: accounts[2]})
    let entry = await claimsReg.getClaim(accounts[2], accounts[1], keyhex)
    // console.log(entry)
    assert.equal(entry, '0x93285be41b243afa17cc06e34495c4ed06d3c96c68b07ceb2340baa71cb5c417', 'should have correct value')
  })

  it('should set a claim (number)', async () => {
    let keyhex = 0xaabb01
    let valhex = 0xffee01
    let tx = await claimsReg.setClaim(accounts[1], keyhex, valhex, {from: accounts[2]})
    let entry = await claimsReg.getClaim(accounts[2], accounts[1], keyhex)
    // console.log(entry)
    // 0xffee010000000000000000000000000000000000000000000000000000000000
    assert.equal(Buffer.from(entry.split('00').join('').slice(2), 'hex').toString('hex'), 'ffee01', 'should have correct value')
  })

  it('should set a claim and fire an event', async () => {
    let tx = await claimsReg.setClaim(accounts[1], testKey1, testVal1, {from: accounts[2]})

    let event = tx.logs[0]
    assert.equal(event.event, 'ClaimSet', 'should fire correct event')
    assert.equal(event.args.issuer, accounts[2], 'should have correct issuer')
    assert.equal(event.args.subject, accounts[1], 'should have correct subject')
    assert.equal(Buffer.from(event.args.key.split('00').join('').slice(2), 'hex').toString(), testKey1, 'should have correct key')
    assert.equal(Buffer.from(event.args.value.split('00').join('').slice(2), 'hex').toString(), testVal1, 'should have correct value')

    let entry = await claimsReg.registry(accounts[2], accounts[1], testKey1)
    assert.equal(Buffer.from(entry.split('00').join('').slice(2), 'hex').toString(), testVal1, 'should have correct value')
  })

  it('should set a self claim and fire an event', async () => {
    let tx = await claimsReg.setSelfClaim(testKey2, testVal2, {from: accounts[3]})

    let event = tx.logs[0]
    assert.equal(event.event, 'ClaimSet', 'should fire correct event')
    assert.equal(event.args.issuer, accounts[3], 'should have correct issuer')
    assert.equal(event.args.subject, accounts[3], 'should have correct subject')
    assert.equal(Buffer.from(event.args.key.split('00').join('').slice(2), 'hex').toString(), testKey2, 'should have correct key')
    assert.equal(Buffer.from(event.args.value.split('00').join('').slice(2), 'hex').toString(), testVal2, 'should have correct value')

    let entry = await claimsReg.registry(accounts[3], accounts[3], testKey2)
    assert.equal(Buffer.from(entry.split('00').join('').slice(2), 'hex').toString(), testVal2, 'should have correct value')
  })

  it('should get claim correctly', async () => {
    let entry = await claimsReg.getClaim(accounts[2], accounts[1], testKey1)
    assert.equal(Buffer.from(entry.split('00').join('').slice(2), 'hex').toString(), testVal1, 'should have correct value')

    entry = await claimsReg.getClaim(accounts[3], accounts[3], testKey2)
    assert.equal(Buffer.from(entry.split('00').join('').slice(2), 'hex').toString(), testVal2, 'should have correct value')
  })

  it('should not remove claim if called by a third party', async () => {
    try {
      await claimsReg.removeClaim(accounts[2], accounts[1], testKey1, {from: accounts[5]})
      assert.fail()
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert')
    }
  })

  it('should not remove non existing claim', async () => {
    try {
      await claimsReg.removeClaim(accounts[5], accounts[5], testKey1, {from: accounts[5]})
      assert.fail()
    } catch (error) {
      assert.equal(error.message, 'VM Exception while processing transaction: revert')
    }
  })

  it('should remove claim if called by issuer', async () => {
    let tx = await claimsReg.removeClaim(accounts[2], accounts[1], testKey1, {from: accounts[2]})

    let event = tx.logs[0]
    assert.equal(event.event, 'ClaimRemoved', 'should fire correct event')
    assert.equal(event.args.issuer, accounts[2], 'should have correct issuer')
    assert.equal(event.args.subject, accounts[1], 'should have correct subject')
    assert.equal(Buffer.from(event.args.key.split('00').join('').slice(2), 'hex').toString(), testKey1, 'should have correct key')

    let entry = await claimsReg.registry(accounts[2], accounts[1], testKey1)
    assert.equal(Buffer.from(entry.split('00').join('').slice(2), 'hex').toString(), '', 'entry should be removed')
  })

  it('should remove claim if called by subject', async () => {
    let tx = await claimsReg.removeClaim(accounts[3], accounts[3], testKey2, {from: accounts[3]})

    let event = tx.logs[0]
    assert.equal(event.event, 'ClaimRemoved', 'should fire correct event')
    assert.equal(event.args.issuer, accounts[3], 'should have correct issuer')
    assert.equal(event.args.subject, accounts[3], 'should have correct subject')
    assert.equal(Buffer.from(event.args.key.split('00').join('').slice(2), 'hex').toString(), testKey2, 'should have correct key')

    let entry = await claimsReg.registry(accounts[3], accounts[3], testKey2)
    assert.equal(Buffer.from(entry.split('00').join('').slice(2), 'hex').toString(), '', 'entry should be removed')
  })
})