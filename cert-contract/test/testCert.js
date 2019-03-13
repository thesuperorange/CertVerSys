const Certificate = artifacts.require('Cert')

contract('Certificate', accounts => {

  let cert
  before(async () => {
    cert = await Certificate.new()
  })

  //issue
  //multiple owners, single signer
  let issue_id = 3
  let cert_id = [10, 11, 12, 13, 14]
  let user_id = [
    "0x49e8a1698ee5a5f184f6a867d17b6c8def70de216445a7d26df0b765287683bf",
    "0x38e8a1698ee5a5f184f6a867d17b6c8def70de216445a7d26df0b765287683bf",
    "0x42e8a1698ee5a5f184f6a867d17b6c8def70de216445a7d26df0b765287683bf",
    "0x12e8a1698ee5a5f184f6a867d17b6c8def70de216445a7d26df0b765287683bf",
    "0x34e8a1698ee5a5f184f6a867d17b6c8def70de216445a7d26df0b765287683bf"
  ]


  let owner_addr = [
    "0xaabb01ffee0100000000aabb01ffee0100000000",
    "0xd7efec012647227ee55d03e84622d1d6f2aacd0f",
    "0x3af474233df79e0cab2fa04c3ae1af0f75e3ba3e",
    "0xe7efec012647227ee55d03e84622d1d6f2aacd0f",
    "0x1af474233df79e0cab2fa04c3ae1af0f75e3ba3e"
  ]

  let cert_hash = [
    ['81', '109', '88', '99', '82', '67', '54', '83', '87', '105', '65', '54', '109', '82', '104', '110', '52', '51', '78', '54', '101', '72', '102', '76', '81', '118', '121', '49', '77', '89', '54', '82', '69', '77', '88', '117', '78', '68', '52', '76', '69', '115', '56', '82', '57', '66'],
    ['81', '109', '88', '99', '82', '67', '54', '83', '87', '105', '65', '54', '109', '82', '104', '110', '52', '51', '78', '54', '101', '72', '102', '76', '81', '118', '121', '49', '77', '89', '54', '82', '69', '77', '88', '117', '78', '68', '52', '76', '69', '115', '56', '82', '57', '66'],
    ['81', '109', '88', '99', '82', '67', '54', '83', '87', '105', '65', '54', '109', '82', '104', '110', '52', '51', '78', '54', '101', '72', '102', '76', '81', '118', '121', '49', '77', '89', '54', '82', '69', '77', '88', '117', '78', '68', '52', '76', '69', '115', '56', '82', '57', '66'],
    ['81', '109', '88', '99', '82', '67', '54', '83', '87', '105', '65', '54', '109', '82', '104', '110', '52', '51', '78', '54', '101', '72', '102', '76', '81', '118', '121', '49', '77', '89', '54', '82', '69', '77', '88', '117', '78', '68', '52', '76', '69', '115', '56', '82', '57', '66'],
    ['81', '109', '88', '99', '82', '67', '54', '83', '87', '105', '65', '54', '109', '82', '104', '110', '52', '51', '78', '54', '101', '72', '102', '76', '81', '118', '121', '49', '77', '89', '54', '82', '69', '77', '88', '117', '78', '68', '52', '76', '69', '115', '56', '82', '57', '66']
  ]


  let json_hash = [
    "0xd72ca07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6",
    "0xe32ca07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6",
    "0xa12ca07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6",
    "0xb82ca07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6",
    "0xaa2ca07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6"
  ]

  let issuer_addr = "0x1169aefa4218fee77e8e86a1445b3bdb8e083b45";

  let signer_addr = [
    "0xeddd3c6b1b40fc235bb67c8fd24fd156ceda8913",
    "0x4d7480393bf869b5ce7afc64c3e735d874f5d1c2",
    "0xfe27e3dcfdafcef4a8fd80c51863c091f8ad95df"
  ]
  let sign_id = [
    "0x49e8a1698ee5a5f184f6a867d17b6c8def70de216445a7d26df0b765287683bf",
    "0x38e8a1698ee5a5f184f6a867d17b6c8def70de216445a7d26df0b765287683bf",
    "0x42e8a1698ee5a5f184f6a867d17b6c8def70de216445a7d26df0b765287683bf"
  ]

  let version = "1.0.1"
  let cert_name = "Elementary School"
  let description = "this is a test"
  let timestamp = "1300000000000"
  it('[Issue] multiple owners(5), multiple signer(3)', async () => {


    //let revocation = false


    //-------------before sign----------------
    //function issueDetail(uint issue_id,uint[] certID, bytes32[] user_id,address[] owner_addr,uint8[46][] cert_hash, bytes32[] json_hash,  address[] signer_addr)public{
    //function issueCommon(uint issue_id,uint[] certID, address issuer_addr, address[] signer_addr, bytes32[] signer_id,string cert_name, string description, string timestamp
    let tx = await cert.issueCommon(issue_id, cert_id,  issuer_addr, signer_addr, sign_id, cert_name, description, timestamp)
    let tx2 = await cert.issueDetail(issue_id, cert_id, user_id, owner_addr, cert_hash, json_hash,  signer_addr)

    //getCertInfo
    let certinfo = await cert.getCertInfo(cert_id[0])
    assert.equal(description, certinfo[0], 'description is not correct')
    assert.equal(timestamp, certinfo[1], 'timestamp is not correct')
    assert.equal(version, certinfo[2], 'version is not correct')
    assert.equal(cert_name, certinfo[3], 'cert_name is not correct')
    assert.equal(issuer_addr, certinfo[4], 'issuer_addr is not correct')


    //getCertInfo2
    let certinfo2 = await cert.getCertInfo2(cert_id[0])
    var certHashArray = [];
    certinfo2[1].forEach(function(element) {
      certHashArray.push(element.toNumber().toString());
    })
    console.log("certHash test: ", certHashArray);
    assert.equal(owner_addr[0], certinfo2[0], 'owner address is not correct')
    assert.deepEqual(cert_hash[0], certHashArray, 'cert_hash is not correct')
    assert.equal(json_hash[0], certinfo2[2], 'json_hash is not correct')
    //didnt set before sign
    //assert.equal(signer_id, certinfo[3], 'owner address is not correct')    
    assert.equal(signer_addr[0], certinfo2[4][0], 'signer addr is not correct')
    assert.equal(user_id[0], certinfo2[5], 'user_id is not correct')

    //getCertHash
    let cert_hash_get = await cert.getCertHash(cert_id[0])
    certHashArray = [];
    cert_hash_get.forEach(function(element) {
      certHashArray.push(element.toNumber().toString());
    })
    assert.deepEqual(cert_hash[0], certHashArray, 'getCertHash is not correct')

    //getOwnerAddr
    let owner_address_get = await cert.getOwnerAddr(cert_id[0])
    assert.equal(owner_addr[0], owner_address_get, 'owner address is not correct')

    //getIssuerAddr
    let issuer_address = await cert.getIssuerAddr(cert_id[0])
    assert.equal(issuer_address, issuer_addr, 'issuer address is not correct')



    //getSignerAddr
    let signer_address = await cert.getSignerAddr(cert_id[0])
    console.log("signer address = " + signer_address)
    assert.equal(signer_address[0], signer_addr[0], 'signer[0] address is not correct')
    assert.equal(signer_address[1], signer_addr[1], 'signer[1] address is not correct')
    assert.equal(signer_address[2], signer_addr[2], 'signer[2] address is not correct')

    //getJsonHash1
    let json_hash_result = await cert.getJsonHash1(cert_id[0])
    assert.equal(json_hash_result, json_hash[0], 'issuer address is not correct')


    //getSignerStatus
    //initial status
    let status = await cert.checkStatus(cert_id[0])
    assert.equal(false, status, 'initial status = false')


  })

  let issue_id2 = 4
  let cert_id2 = [20, 21, 22, 23, 24]
  it('[Issue] issue2', async () => {

    //let revocation = false

    //-------------before sign----------------
    let tx = await cert.issueCommon(issue_id2, cert_id2,  issuer_addr, signer_addr, sign_id, cert_name, description, timestamp)
    let tx2 = await cert.issueDetail(issue_id2, cert_id2, user_id, owner_addr, cert_hash, json_hash,  signer_addr)

   // let tx = await cert.issue(issue_id2, cert_id2, user_id, owner_addr, cert_hash, json_hash, issuer_addr, signer_addr,
     // sign_id, cert_name, description, timestamp)

    //getCertInfo
    let certinfo = await cert.getCertInfo(cert_id2[0])
    assert.equal(description, certinfo[0], 'description is not correct')
    assert.equal(timestamp, certinfo[1], 'timestamp is not correct')
    assert.equal(version, certinfo[2], 'version is not correct')
    assert.equal(cert_name, certinfo[3], 'cert_name is not correct')
    assert.equal(issuer_addr, certinfo[4], 'issuer_addr is not correct')


    //getCertInfo2
    let certinfo2 = await cert.getCertInfo2(cert_id2[0])
    var certHashArray = [];
    certinfo2[1].forEach(function(element) {
      certHashArray.push(element.toNumber().toString());
    })
    assert.equal(owner_addr[0], certinfo2[0], 'owner address is not correct')
    assert.deepEqual(cert_hash[0], certHashArray, 'cert_hash is not correct')
    assert.equal(json_hash[0], certinfo2[2], 'json_hash is not correct')
    //didnt set before sign
    //assert.equal(signer_id, certinfo[3], 'owner address is not correct')    
    assert.equal(signer_addr[0], certinfo2[4][0], 'signer addr is not correct')
    assert.equal(user_id[0], certinfo2[5], 'user_id is not correct')

    //getCertHash
    let cert_hash_get = await cert.getCertHash(cert_id2[0])
    certHashArray = [];
    cert_hash_get.forEach(function(element) {
      certHashArray.push(element.toNumber().toString());
    })
    console.log("cert_hash_get: ",certHashArray);
    console.log("cert_hash_get: ",cert_hash[0]);
    assert.deepEqual(cert_hash[0], certHashArray, 'getCertHash is not correct')

    //getOwnerAddr
    let owner_address_get = await cert.getOwnerAddr(cert_id2[0])
    assert.equal(owner_addr[0], owner_address_get, 'owner address is not correct')

    //getIssuerAddr
    let issuer_address = await cert.getIssuerAddr(cert_id[0])
    assert.equal(issuer_address, issuer_addr, 'issuer address is not correct')



    //getSignerAddr
    let signer_address = await cert.getSignerAddr(cert_id2[0])
    console.log("signer address = " + signer_address)
    assert.equal(signer_address[0], signer_addr[0], 'signer[0] address is not correct')
    assert.equal(signer_address[1], signer_addr[1], 'signer[1] address is not correct')
    assert.equal(signer_address[2], signer_addr[2], 'signer[2] address is not correct')

    //getJsonHash1
    let json_hash_result = await cert.getJsonHash1(cert_id2[0])
    assert.equal(json_hash_result, json_hash[0], 'issuer address is not correct')


    //getSignerStatus
    //initial status
    let status = await cert.checkStatus(cert_id2[0])
    assert.equal(false, status, 'initial status = false')


  })
  it('[get user cert] ', async () => {
    let certid_list = await cert.getUserCert(owner_addr[0])
    assert.equal(certid_list[0], cert_id[0], 'query all certid by address failed')
    assert.equal(certid_list[1], cert_id2[0], 'query all certid by address failed')

  })
  //-------------after sign----------------
  it('[Sign] ', async () => {


    let publickey = "03ce0b6d90dd2c502a0bb1667fdcc59341e911e6e6a36b18bd0ed735dec8a7c657"

    let sjws = "AwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDMiLCJpc3N1ZXJfYWRkciI6IjB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsInNpZ25lciI6W3siYWRkcmVzcyI6IjB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsInNpZ25hdHVyZSI6bnVsbH1dLCJvcmdfY29udHJhY3QiOiIwNjg2MDA1IiwidmVyc2lvbiI6IjAuMS4wIiwiY2VydF9uYW1lIjoiVE9FRkwiLCJyZXZvY2F0aW9uIjpmYWxzZSwiZGVzY3JpcHRpb24iOiJ0aGlzIGlzIHRvZWZsIGNlcnRpZmljYXRpb24iLCJ0aW1lc3RhbXAiOiIxMjM0NTY3ODkwMTIzIiwiY2VydGhhc2giOiJkMTRhNmZ"
    let status_init = await cert.getStatus(cert_id[2], signer_addr[0])
    assert.equal(false, status_init, 'initial status = false')


    //get signer cert list before sign
    let signer1_certlist1 = await cert.getSignerCertList(signer_addr[0]);
    console.log("+++SIGNLIST"+signer1_certlist1[0])
    assert.equal(cert_id[0], signer1_certlist1[0], 'certid didnt sign yet')
    assert.equal(cert_id[1], signer1_certlist1[1], 'certid didnt sign yet')
    assert.equal(cert_id[2], signer1_certlist1[2], 'certid didnt sign yet')
    assert.equal(cert_id[3], signer1_certlist1[3], 'certid didnt sign yet')
    assert.equal(cert_id[4], signer1_certlist1[4], 'certid didnt sign yet')
    assert.equal(cert_id2[0], signer1_certlist1[5], 'certid2 didnt sign yet')
    assert.equal(cert_id2[1], signer1_certlist1[6], 'certid2 didnt sign yet')
    assert.equal(cert_id2[2], signer1_certlist1[7], 'certid2 didnt sign yet')
    assert.equal(cert_id2[3], signer1_certlist1[8], 'certid2 didnt sign yet')
    assert.equal(cert_id2[4], signer1_certlist1[9], 'certid2 didnt sign yet')

    let signer1_certlist2 = await cert.getSignerCertList(signer_addr[1]);
    assert.equal(cert_id[0], signer1_certlist2[0], 'certid didnt sign yet')
    assert.equal(cert_id[1], signer1_certlist2[1], 'certid didnt sign yet')
    assert.equal(cert_id[2], signer1_certlist2[2], 'certid didnt sign yet')
    assert.equal(cert_id[3], signer1_certlist2[3], 'certid didnt sign yet')
    assert.equal(cert_id[4], signer1_certlist2[4], 'certid didnt sign yet')
    assert.equal(cert_id2[0], signer1_certlist2[5], 'certid2 didnt sign yet')
    assert.equal(cert_id2[1], signer1_certlist2[6], 'certid2 didnt sign yet')
    assert.equal(cert_id2[2], signer1_certlist2[7], 'certid2 didnt sign yet')
    assert.equal(cert_id2[3], signer1_certlist2[8], 'certid2 didnt sign yet')
    assert.equal(cert_id2[4], signer1_certlist2[9], 'certid2 didnt sign yet')

    let signer1_certlist3 = await cert.getSignerCertList(signer_addr[2]);
    assert.equal(cert_id[0], signer1_certlist3[0], 'certid didnt sign yet')
    assert.equal(cert_id[1], signer1_certlist3[1], 'certid didnt sign yet')
    assert.equal(cert_id[2], signer1_certlist3[2], 'certid didnt sign yet')
    assert.equal(cert_id[3], signer1_certlist3[3], 'certid didnt sign yet')
    assert.equal(cert_id[4], signer1_certlist3[4], 'certid didnt sign yet')
    assert.equal(cert_id2[0], signer1_certlist3[5], 'certid2 didnt sign yet')
    assert.equal(cert_id2[1], signer1_certlist3[6], 'certid2 didnt sign yet')
    assert.equal(cert_id2[2], signer1_certlist3[7], 'certid2 didnt sign yet')
    assert.equal(cert_id2[3], signer1_certlist3[8], 'certid2 didnt sign yet')
    assert.equal(cert_id2[4], signer1_certlist3[9], 'certid2 didnt sign yet')
    assert.equal(10, signer1_certlist3.length, 'length not match')


    let tx = await cert.sign(cert_id[2], publickey, signer_addr[0], sjws)

    let pub = await cert.getSignerPubkey(cert_id[2], signer_addr[0])
    assert.equal(publickey, pub, 'initial status = false')

    let signature = await cert.getSignature(cert_id[2], signer_addr[0])
    assert.equal(sjws, signature, 'initial status = false')

    let status = await cert.getStatus(cert_id[2], signer_addr[0])
    assert.equal(true, status, 'initial status = false')



    //all sign
    let tx2 = await cert.sign(cert_id[2], publickey, signer_addr[1], sjws)
    let tx3 = await cert.sign(cert_id[2], publickey, signer_addr[2], sjws)

    let status_all = await cert.checkStatus(cert_id[2])
    assert.equal(true, status_all, 'initial status = false')

    //get signer cert list after sign
     let signer1_certlist1_s = await cert.getSignerCertList(signer_addr[0]);
     assert.equal(cert_id[0], signer1_certlist1_s[0], 'certid didnt sign yet')
     assert.equal(cert_id[1], signer1_certlist1_s[1], 'certid didnt sign yet')
     assert.equal(cert_id[3], signer1_certlist1_s[2], 'certid didnt sign yet')
     assert.equal(cert_id[4], signer1_certlist1_s[3], 'certid didnt sign yet')    
     assert.equal(cert_id2[0], signer1_certlist1_s[4], 'certid2 didnt sign yet')
     assert.equal(cert_id2[1], signer1_certlist1_s[5], 'certid2 didnt sign yet')
     assert.equal(cert_id2[2], signer1_certlist1_s[6], 'certid2 didnt sign yet')
     assert.equal(cert_id2[3], signer1_certlist1_s[7], 'certid2 didnt sign yet')
     assert.equal(cert_id2[4], signer1_certlist1_s[8], 'certid2 didnt sign yet')
     assert.equal(9, signer1_certlist1_s.length, 'length not match')

   let signer1_certlist2_s = await cert.getSignerCertList(signer_addr[1]);
    assert.equal(cert_id[0], signer1_certlist2_s[0], 'certid didnt sign yet')
    assert.equal(cert_id[1], signer1_certlist2_s[1], 'certid didnt sign yet')
    assert.equal(cert_id[3], signer1_certlist2_s[2], 'certid didnt sign yet')
    assert.equal(cert_id[4], signer1_certlist2_s[3], 'certid didnt sign yet')    
    assert.equal(cert_id2[0], signer1_certlist2_s[4], 'certid2 didnt sign yet')
    assert.equal(cert_id2[1], signer1_certlist2_s[5], 'certid2 didnt sign yet')
    assert.equal(cert_id2[2], signer1_certlist2_s[6], 'certid2 didnt sign yet')
    assert.equal(cert_id2[3], signer1_certlist2_s[7], 'certid2 didnt sign yet')
    assert.equal(cert_id2[4], signer1_certlist2_s[8], 'certid2 didnt sign yet')
    assert.equal(9, signer1_certlist2_s.length, 'length not match')

    let signer1_certlist3_s = await cert.getSignerCertList(signer_addr[2]);
    assert.equal(cert_id[0], signer1_certlist3_s[0], 'certid didnt sign yet')
    assert.equal(cert_id[1], signer1_certlist3_s[1], 'certid didnt sign yet')
    assert.equal(cert_id[3], signer1_certlist3_s[2], 'certid didnt sign yet')
    assert.equal(cert_id[4], signer1_certlist3_s[3], 'certid didnt sign yet')    
    assert.equal(cert_id2[0], signer1_certlist3_s[4], 'certid2 didnt sign yet')
    assert.equal(cert_id2[1], signer1_certlist3_s[5], 'certid2 didnt sign yet')
    assert.equal(cert_id2[2], signer1_certlist3_s[6], 'certid2 didnt sign yet')
    assert.equal(cert_id2[3], signer1_certlist3_s[7], 'certid2 didnt sign yet')
    assert.equal(cert_id2[4], signer1_certlist3_s[8], 'certid2 didnt sign yet')
    

  })


  it('json hash2 ', async () => {
    let certID = 14
    let json_hash = "0xd88ca07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6"

    let tx = await cert.setJsonHash2(certID, json_hash)

    let jh = await cert.getJsonHash2(certID)
    assert.equal(jh, json_hash, 'jsonhash2')



  })

  //---------query
  it('issue info', async () => {

    let signed_list = await cert.getSignedList(issue_id)
    console.log("!!!!! " + JSON.stringify(signed_list))
    assert.equal(signed_list[0], cert_id[2], 'signer certID is not correct')


    let issue_info = await cert.getIssueIDInfo(issue_id)
    assert.equal(cert_id[0], issue_info[0][0], 'issue info certID')
    assert.equal(cert_name, issue_info[1], 'issue info certname')
    assert.equal(description, issue_info[2], 'issue info certname')
    assert.equal(timestamp, issue_info[3], 'issue info certname')
    assert.equal(cert_id[2], issue_info[4], 'issue info signed ID')
  })

  it('issue list', async () => {



    //getIssuerAllCert
    let issue_id_sc = await cert.getIssuerIssueIDList(issuer_addr)
    console.log(issue_id_sc)
    assert.equal(issue_id_sc[0], issue_id, 'issuer address is not correct')
    //getIssuerAllCert
    let cert_id_sc = await cert.getCertIDList(issue_id)
    assert.equal(cert_id_sc[0], cert_id[0], 'certid is not correct')
    assert.equal(cert_id_sc[1], cert_id[1], 'certid is not correct')
    assert.equal(cert_id_sc[2], cert_id[2], 'certid is not correct')
    assert.equal(cert_id_sc[3], cert_id[3], 'certid is not correct')
    assert.equal(cert_id_sc[4], cert_id[4], 'certid is not correct')

  })
})