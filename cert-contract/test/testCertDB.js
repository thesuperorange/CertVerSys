const EthereumCertDB = artifacts.require('CertDB')

contract('EthereumCertDB', accounts => {

    let certDB    
    before(async () => {
        certDB = await EthereumCertDB.new()
    })
//-----------------did


let user_addr_stu = "0xaabb01ffee0100000000aabb01ffee0100000000"
let user_addr_teacher = "0xaabb01ffee0100000000aabb01ffee0100000000"
it('test setDID', async () => {
  
  let context = "https://w3id.org/did/v1"
  let didid = "did:tcedu:nchc1qqxmkyf4zeujavd53adycve76tld7tus85jnhnw"
  let user_id="0xd72ca07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6"
  let pub_id = "did:tcedu:nchc1qqxmkyf4zeujavd53adycve76tld7tus85jnhnw#keys-1"
  let pub_type = "Secp256k1VerificationKey2018"
  let pub_owner = "did:tcedu:nchc1qqxmkyf4zeujavd53adycve76tld7tus85jnhnw"
  let pub_hex = "03ce0b6d90dd2c502a0bb1667fdcc59341e911e6e6a36b18bd0ed735dec8a7c657"
 
  let tx = await certDB.setDidInfo(user_id,context,didid,pub_id,pub_type,pub_owner,pub_hex,1,user_addr_stu,{from: accounts[5]})

  let entry = await certDB.getDidRecord(user_id)  
  assert.equal(entry[0], context, 'did context should have correct value')
  assert.equal(entry[1], didid, 'did id should have correct value')

  let sc_pubkey_hex = await certDB.getPublickeyHex(user_id,1)  
  assert.equal(sc_pubkey_hex, pub_hex, 'publickey hex should have correct value')
  
  let sc_user_address = await certDB.getUserAddress(user_id)  
  assert.equal(sc_user_address, user_addr_stu, 'user address should have correct value') 
  
})

it('test insertUser', async () => {
    let user_id="0xd72ca07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6"
    let org_id="0x1dd84569ad60faa1b6838526ba7156388cf7c8d376ed0ccda9bce0419c2c3519"
    let class_id="orange"
    let user_role=3
    let student_id = "1234567"
    let name = "myname"
    
    //let org_class = "123@class"
    
    let tx = await certDB.insertUser(user_id,org_id,class_id,user_role,student_id, name, {from: accounts[5]})
    let entry = await certDB.getUserInfo(user_id)
    // console.log("+++++++++"+JSON.stringify(entry))
    assert.equal(entry[0], org_id, 'org_id should have correct value')
    assert.equal(entry[1], class_id, 'class_id should have correct value')
    assert.equal(entry[2], user_role, 'user_role should have correct value')
    assert.equal(entry[3], user_addr_stu, 'user_addr should have correct value')
    assert.equal(entry[4], name, 'name should have correct value')
    assert.equal(entry[5], student_id, 'student_id should have correct value')
    
    let sc_user_org = await certDB.getUserOrg(user_id)
    assert.equal(sc_user_org, org_id, 'org_id should have correct value')

    let sc_user_class = await certDB.getUserClass(user_id)
    assert.equal(sc_user_class, class_id, 'user class should have correct value')
   
    let sc_user_role = await certDB.getUserRole(user_id)
    assert.equal(sc_user_role, user_role, 'user role should have correct value')
   
  
    let entry2 = await certDB.getStudentList(org_id,class_id)  
    assert.equal(entry2[0], user_id, 'should have correct value')
   
  
    let entry3 = await certDB.getDistinctClass(org_id)
    assert.equal(bytes32toStr(entry3[0]), class_id, 'should have correct value')
   

})


it('test setOrgInfo', async () => {
  let org_id="0x1dd84569ad60faa1b6838526ba7156388cf7c8d376ed0ccda9bce0419c2c3519"   
  let org_id_ori="064720"
  let org_name="NCTU"
  let contract_addr = "0xaabb01ffee0100000000aabb01ffee0100000000"

  let tx = await certDB.setOrgInfo(org_id, org_id_ori, org_name,contract_addr, {from: accounts[5]})
  let entry = await certDB.getOrgInfo(org_id)
  // console.log("+++++++++"+JSON.stringify(entry))
  assert.equal(entry[0], org_name, 'org_name should have correct value')
  assert.equal(entry[1], contract_addr, 'contract_addr should have correct value')
  assert.equal(entry[2], org_id_ori, 'org_id_ori should have correct value')

  let orgname = await certDB.getOrgName(org_id)
  assert.equal(orgname, org_name, 'orgname should have correct value')


  let contract = await certDB.getContractAddress(org_id)
  assert.equal(contract, contract_addr, 'contract addr should have correct value')

 
})


function bytes32toStr(input){
  return Buffer.from(input.substr(2),'hex').toString('utf8').replace(/\0/g, '')
}

it('test setDID teacher (fake)', async () => {
  
  let context = "https://w3id.org/did/v1"
  let didid = "did:tcedu:nchc1qqxmkyf4zeujavd53adycve76tld7tus85jnhnw"
  let user_id="0xd888a07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6"
  let pub_id = "did:tcedu:nchc1qqxmkyf4zeujavd53adycve76tld7tus85jnhnw#keys-1"
  let pub_type = "Secp256k1VerificationKey2018"
  let pub_owner = "did:tcedu:nchc1qqxmkyf4zeujavd53adycve76tld7tus85jnhnw"
  let pub_hex = "03ce0b6d90dd2c502a0bb1667fdcc59341e911e6e6a36b18bd0ed735dec8a7c657"
 
  let tx = await certDB.setDidInfo(user_id,context,didid,pub_id,pub_type,pub_owner,pub_hex,1,user_addr_teacher,{from: accounts[5]})

  let entry = await certDB.getDidRecord(user_id)  
  assert.equal(entry[0], context, 'did context should have correct value')
  assert.equal(entry[1], didid, 'did id should have correct value')

  let sc_pubkey_hex = await certDB.getPublickeyHex(user_id,1)  
  assert.equal(sc_pubkey_hex, pub_hex, 'publickey hex should have correct value')
  
  let sc_user_address = await certDB.getUserAddress(user_id)  
  assert.equal(sc_user_address, user_addr_teacher, 'user address should have correct value') 
  
})

it('test insert teacher', async () => {
  let user_id="0xd888a07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6"
  let org_id="0xe32ca07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6"
 
  let user_role=1  
  let name = "IamTeacher"
  
  let tx = await certDB.insertUser(user_id,org_id,"",user_role,user_id, name, {from: accounts[5]})
  let entry = await certDB.getUserInfo(user_id)
  // console.log("+++++++++"+JSON.stringify(entry))
  assert.equal(entry[0], org_id, 'org_id should have correct value')
  assert.equal(entry[1], "", 'class_id is empty')
  assert.equal(entry[2], user_role, 'user_role should have correct value')
  assert.equal(entry[3], user_addr_teacher, 'user_addr should have correct value')
  assert.equal(entry[4], name, 'name should have correct value')
  assert.equal(entry[5], user_id, 'student_id is same as userid (teacher)')
  
  let sc_user_org = await certDB.getUserOrg(user_id)
  assert.equal(sc_user_org, org_id, 'org_id should have correct value')


  let sc_user_role = await certDB.getUserRole(user_id)
  assert.equal(sc_user_role, user_role, 'user role should have correct value')
 

  let entry2 = await certDB.getTeacherList(org_id)  
  assert.equal(entry2[0], user_id, 'should have correct value')


})
  
//--------------test student list
/*it('test add student list', async () => {
    
  let org_id = 4
  let class_id = "orange"
  let class_id2 = "apple"

  let key = org_id+"@"+class_id

  let user_id = [38,39,40,41,42]

  await certDB.addStudentBySchoolClass(key,user_id[0], {from: accounts[5]})
  await certDB.addStudentBySchoolClass(key,user_id[1], {from: accounts[5]})
  await certDB.addStudentBySchoolClass(key,user_id[2], {from: accounts[5]})
  await certDB.addStudentBySchoolClass(key,user_id[3], {from: accounts[5]})
  await certDB.addStudentBySchoolClass(key,user_id[4], {from: accounts[5]})
  
  let key2 = org_id+"@"+class_id2
  await certDB.addStudentBySchoolClass(key2,user_id[3], {from: accounts[5]})
  await certDB.addStudentBySchoolClass(key2,user_id[4], {from: accounts[5]})

  let entry = await certDB.getStudentList(key)
  
  assert.equal(entry[0], user_id[0], 'should have correct value')
  assert.equal(entry[1], user_id[1], 'should have correct value')
  assert.equal(entry[2], user_id[2], 'should have correct value')
  assert.equal(entry[3], user_id[3], 'should have correct value')
  assert.equal(entry[4], user_id[4], 'should have correct value')

  let entry2 = await certDB.getStudentList(key2)  
  assert.equal(entry2[0], user_id[3], 'should have correct value')
  assert.equal(entry2[1], user_id[4], 'should have correct value')
})

//--------------test class list
it('test add distinct class list', async () => {

  let org_id = 4
  let org_id2 = 3
  let class_id = "orange"
  let class_id2 = "apple"
  let class_id3 = "banana"
  let class_id4 = "cherry"
  
  //add new class
  await certDB.addDistinctClass(org_id,class_id, {from: accounts[3]})
  await certDB.addDistinctClass(org_id,class_id2, {from: accounts[3]})

  
 /* let test = await certDB.stringToBytes32("hi")
  console.log("--------- "+JSON.stringify(test)+"-----------------")
  assert.equal(test, "0x6869", 'should have correct value')*/
/*
  let entry = await certDB.getDistinctClass(org_id)
  assert.equal( bytes32toStr(entry[0]),class_id, 'should have correct value')
  assert.equal( bytes32toStr(entry[1]), class_id2, 'should have correct value')
  console.log("--------- distinct class test1 "+JSON.stringify(entry)+"-----------------")
  //add same class
  await certDB.addDistinctClass(org_id,class_id, {from: accounts[3]}) 
  let entry2 = await certDB.getDistinctClass(org_id)
  assert.equal(bytes32toStr(entry2[0]), class_id, 'should have correct value')
  assert.equal(bytes32toStr(entry2[1]), class_id2, 'should have correct value')
  console.log("--------- distinct class test2 "+JSON.stringify(entry2)+"-----------------")

  //add new class
  await certDB.addDistinctClass(org_id2,class_id, {from: accounts[3]}) 
  await certDB.addDistinctClass(org_id,class_id2, {from: accounts[3]}) 
  await certDB.addDistinctClass(org_id,class_id3, {from: accounts[3]}) 
  await certDB.addDistinctClass(org_id2,class_id4, {from: accounts[3]}) 
  
  let entry3 = await certDB.getDistinctClass(org_id)
  assert.equal(bytes32toStr(entry3[0]), class_id, 'should have correct value')
  assert.equal(bytes32toStr(entry3[1]), class_id2, 'should have correct value')
  assert.equal(bytes32toStr(entry3[2]), class_id3, 'should have correct value')
  console.log("--------- distinct class test3 "+JSON.stringify(entry3)+"-----------------")

  let entry4 = await certDB.getDistinctClass(org_id2)
  assert.equal(bytes32toStr(entry4[0]), class_id, 'should have correct value')
  assert.equal(bytes32toStr(entry4[1]), class_id4, 'should have correct value')
  console.log("--------- distinct class test4 "+JSON.stringify(entry4)+"-----------------")
  
})


//--------------test utility-------------
 /* it('test concat school and class', async () => {
    let org_id = 4
    let class_id = "orange"
    let result = await certDB.concat_school_class( org_id,  class_id);
    console.log("+++++++++"+JSON.stringify(result))
    assert.equal(result,"orange@4", 'should have correct value')
  })
  it('test uint to string', async () => {
    let org_id = 4
    let result = await certDB.uint2str( org_id);
    console.log("+++++++++"+JSON.stringify(result))
    assert.equal(result,"4", 'should have correct value')
  })
  it('test ', async () => {  
      
    let result = await certDB.test( 4);
    console.log("+++++++++"+JSON.stringify(result))
    assert.equal(result,"33", 'should have correct value')
  })
  */
})
