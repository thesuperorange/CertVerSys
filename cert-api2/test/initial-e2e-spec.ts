import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, PostReqType, ExpectRespError } from './test.common';
import { ENETRESET } from 'constants';
import { aes_ipfsencrypt, aes_decrypt, HASH_SHA256 } from './encryptipfs'
import { SignString, getPubKey } from "./sign.js"
const fs: any = require('fs');
const needle = require('needle')

let TEST_MNEMONIC = "雛 張 壞 施 防 勵 鋼 廣 伸 弟 插 酒";
let publickeyexample = "";
let DEPLOY_CONTRACT_ADDRESS = '0x00';
let DEPLOY_CONTRACT_ADDRESS2 = '0x00';
let TEST_USER_ID = "0x38e8a1698ee5a5f184f6a867d17b6c8def70de216445a7d26df0b765287683bf"
let TEST_USER_ID2 = "0xd72ca07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6"
let TEST_USER_ID3 = "0xabcda07a966471257c2cf5b6126620314f43778ad72ca07a966471257c2cf5b6"
let TEST_OWNER_ADDR = "0x0000000000000000000000000000000000000002"
let TEST_OWNER_ADDR2 = "0x0000000000000000000000000000000000000001"
let TEST_OWNER_ADDR3 = "0x0000000000000000000000000000000000000003"
let TEST_CERT_ID;
let TEST_CERT_ID2;
let TEST_CERT_ID3;
let TEST_CERT_ID4;

let TEST_ORG_ID = "0x1dd84569ad60faa1b6838526ba7156388cf7c8d376ed0ccda9bce0419c2c3519"
let TEST_STUDENT_ID = "9417158"
let TEST_CERTNAME = "apple"
let TEST_VERSION = "1.0.1"
let TEST_DESCRIPTION = "this is toefl certification"
let TEST_TIMESTAMP = "1234567890123"
let TEST_DIDID = "iamdidid"
let TEST_DIDCON = "iamdidcontext"
let TEST_PUBID = "iampubid"
let TEST_PUBTYPE = "iampubtype"
let TEST_PUBOWNER = "iampubowner"
let TEST_PUBHEX = "iampubhex"
let TEST_ORG_NAME = "NCTU"
let TEST_CLASS_ID = "orange"
let TEST_ROLE = 3
let TEACHER_ROLE = 1
let TEST_USER_ADDRESS = "0x0000000000000000000000000000000000000999"
let TEST_SIGNER_ADDRESS = "0x0000000000000000000000000000000000008050"
var ListCertID: string[];
ListCertID = [];
let TEST_ISSUEID = 0;
let TEST_ISSUEID2 = 0;
let TEST_CREATE_ADDRESS = "0X00"
let TEST_PATH = "m/2018'/5'/1'/12345678";
let TEST_ECDSA_CURVE = "secp256r1"
let TEST_JWS = "eyJhbGciOiJFUzI1NiIsICJjdHkiOiJKV1QifQ.eyJjZXJ0SUQiOjM4LCJ2ZXJzaW9uIjoiMS4wLjAiLCJjZXJ0X25hbWUiOiJFbGVtZW50YXJ5IFNjaG9vbCIsInJldm9jYXRpb24iOmZhbHNlLCJkZXNjcmlwdGlvbiI6InRoaXMgaXMgYSB0ZXN0IiwidGltZXN0YW1wIjoiMTQwMDAwMDAwMDAwMCIsIm9yZ19jb250cmFjdCI6IjB4MWFmNDc0MjMzZGY3OWUwY2FiMmZhMDRjM2FlMWFmMGY3NWUzYmEzZSIsImlzc3Vlcl9hZGRyZXNzIjoiMHgwMCIsIm93bmVyX2FkZHIiOiIweGFhYmIwMWZmZWUwMTAwMDAwMDAwYWFiYjAxZmZlZTAxMDAwMDAwMDAiLCJjZXJ0aGFzaCI6IjB4NDllOGExNjk4ZWU1YTVmMTg0ZjZhODY3ZDE3YjZjOGRlZjcwZGUyMTY0NDVhN2QyNmRmMGI3NjUyODc2ODNiZiIsImpzb25faGFzaCI6IiIsImpzb25faGFzaDIiOiIiLCJzaWduZXIiOlt7ImFkZHJlc3MiOiIweGVkZGQzYzZiMWI0MGZjMjM1YmI2N2M4ZmQyNGZkMTU2Y2VkYTg5MTMiLCJzaWduYXR1cmUiOiIifSx7ImFkZHJlc3MiOiIweDRkNzQ4MDM5M2JmODY5YjVjZTdhZmM2NGMzZTczNWQ4NzRmNWQxYzIiLCJzaWduYXR1cmUiOiIifV0sImNlcnQiOiIiLCJxcmNvZGUiOiIifQ.kfqmaSuaHRBdgnbBvhVwNXfjs68a8B_4lEtd-0q6CA_FfBJj4un0BEXh_3vdVnaJCONCYxlCHSpIDo0XogJi8A"
var IPFS_HASH = '';
let FUNDAMENTAL_PDF;
let EXPIRE_IPFS_HASH;
let EXPIRE_KEY;
let PDF_PLAIN;
let IPFS_PLAINSTRING;
var OWNER_CERT_ID;
var OWNER_IPFS_HASH;
var OWNER_CERT_HASH;

const CONFIG_FILE = 'config/setting.js'
var config = fs.readFileSync(CONFIG_FILE).toString();
config = JSON.parse(config);
config["RevokeContractAddr"] = "";
var buf = Buffer.from(JSON.stringify(config));
fs.writeFileSync(CONFIG_FILE, buf)


test('/cert/contract-deploy', async () => {
  const body = {
    idAccount: 0
  }
  const response = await PostReq('/cert/contract-deploy', body);
  ExpectRespError(response, HttpStatus.OK);

  expect(response.body.address).toBeTruthy();
  DEPLOY_CONTRACT_ADDRESS = response.body.address;
  console.log("##TEST1--[contract-deploy] CERT CONTRACT ADDR=" + DEPLOY_CONTRACT_ADDRESS)

});




test('/cert/issue/contract-deploy', async () => {
  const body = {
    contract: DEPLOY_CONTRACT_ADDRESS,
    idAccount: 0,
    idIssuer: 0,
    idSubject: 1,
    orgID: TEST_ORG_ID,

    orgInfo: {
      orgID: TEST_ORG_ID,
      contract: "",
      orgIDOri: "",
      orgName: TEST_ORG_NAME
    }

  }
  const response_contract = await PostReq('/cert/issue/contract-deploy', body);
  ExpectRespError(response_contract, HttpStatus.OK);

  expect(response_contract.body.address).toBeTruthy();
  DEPLOY_CONTRACT_ADDRESS2 = response_contract.body.address;
  body.orgInfo.contract = DEPLOY_CONTRACT_ADDRESS2;
  body.orgInfo.orgIDOri = "064720"
  console.log("##TEST2.1--[contract-deploy] CERT CONTRACT ADDR2=" + DEPLOY_CONTRACT_ADDRESS2)



  const response_insert_org = await PostReq('/cert/insert-org', body);
  console.log("##TEST2.2--[insert-org]" )
  ExpectRespError(response_insert_org, HttpStatus.OK);


  //-----------------GET----------------------------

  const response_get_org = await PostReq('/cert/get-org-info', body);
  console.log("##TEST2.3--get-org-info]" )

  //orgID,classID,role,useraddr,name,studentID
  ExpectRespError(response_get_org, HttpStatus.OK);

  expect(response_get_org.body.orginfo_in_sc[0]).toEqual(TEST_ORG_NAME);
  expect(response_get_org.body.orginfo_in_sc[1]).toEqual(DEPLOY_CONTRACT_ADDRESS2);

});
test('/cert/createuser', async () => {

  const body = {
    contract: DEPLOY_CONTRACT_ADDRESS,
    idIssuer: 0,
    idSubject: 1,
    userID: TEST_USER_ID,
    result2: {
      "context": "https://w3id.org/did/v1",
      "id": "did:tcedu:nchc01lnjcy4spl58e8ujqulqj5ze4aw84xm2lrwv4d2",
      "publicKey": [
        {
          "id": "did:tcedu:nchc01lnjcy4spl58e8ujqulqj5ze4aw84xm2lrwv4d2#keys-1",
          "type": "Secp256r1VerificationKey2018",
          "owner": "did:tcedu:nchc01lnjcy4spl58e8ujqulqj5ze4aw84xm2lrwv4d2",
          "publicKeyHex": "027d11913d9fac2c66518e03aa86c1c110980895ac879657c0b5de925c988a2423"
        },
        {
          "id": "did:tcedu:nchc01lnjcy4spl58e8ujqulqj5ze4aw84xm2lrwv4d2#keys-2",
          "type": "Secp256r1VerificationKey2018",
          "owner": "did:tcedu:nchc01lnjcy4spl58e8ujqulqj5ze4aw84xm2lrwv4d2",
          "publicKeyHex": "029c13bb4935e1e10e1b967ecbadf1cb820ed0dc5280242f47c77af5e4ef85ebc2"
        },
        {
          "id": "did:tcedu:nchc01lnjcy4spl58e8ujqulqj5ze4aw84xm2lrwv4d2#keys-3",
          "type": "Secp256k1VerificationKey2018",
          "owner": "did:tcedu:nchc01lnjcy4spl58e8ujqulqj5ze4aw84xm2lrwv4d2",
          "publicKeyHex": "02190244c544c5532598d36deb800cfa74429b3a3203e24de51c73971c1cb7f47c"
        }],
      "authentication": [],
      "service": [],
      "proof": {
        "type": "LinkedDataSignature2015",
        "created": "2016-02-08T16:02:20Z",
        "creator": "did:example:8uQhQMGzWxR8vw5P3UWH1ja#keys-1",
        "signatureValue": "QNB13Y7Q9...1tzjn4w=="
      }
    }
  }
  console.log("##TEST3.1--createuser]"  + body)
 
  const response = await PostReq('/cert/create-user', body);

  //publickeyexample =response.body.public;
  TEST_CREATE_ADDRESS = response.body.address;
  //console.log("create publickeyexample = ",JSON.stringify(publickeyexample));
  //console.log("create address = ",JSON.stringify(response.body));
  ExpectRespError(response, HttpStatus.OK);




});

//-------insert teacher
test('/cert/insert-user teacher ', async () => {
  const body = {
    contract: DEPLOY_CONTRACT_ADDRESS,
    idIssuer: 0,
    idSubject: 1,
    userInfo: {
      userID: TEST_USER_ID2,
      orgID: TEST_ORG_ID,
      classID: "", //null for teacher
      role: TEACHER_ROLE,
      studentID: TEST_USER_ID2,  //same as userID for teacher
      name: TEST_ORG_NAME
    }

  }
  const response = await PostReq('/cert/insert-user', body);
  console.log("##TEST4.1--insert-user]  teacher" +TEST_USER_ID2 )
  ExpectRespError(response, HttpStatus.OK);
  //-----------------GET----------------------------

  const response2 = await PostReq('/cert/get-user-info', body);
  console.log("##TEST4.2--get-user-info]"  )

  //orgID,classID,role,useraddr,name,studentID
  ExpectRespError(response2, HttpStatus.OK);

  expect(response2.body.userinfo_in_sc[0]).toEqual(TEST_ORG_ID);
  //expect(response2.body.userinfo_in_sc[1]).toEqual(TEST_CLASS_ID);
  expect(response2.body.userinfo_in_sc[2]).toEqual(String(TEACHER_ROLE));

  //??address didn't set in insert-user
 // expect(response2.body.userinfo_in_sc[3]).toEqual(TEST_CREATE_ADDRESS);
  expect(response2.body.userinfo_in_sc[4]).toEqual(TEST_ORG_NAME);
  expect(response2.body.userinfo_in_sc[5]).toEqual(TEST_USER_ID2);

});

test('/cert/insert-user POST ', async () => {
  const body = {
    contract: DEPLOY_CONTRACT_ADDRESS,
    idIssuer: 0,
    idSubject: 1,
    userInfo: {
      userID: TEST_USER_ID,
      orgID: TEST_ORG_ID,
      classID: TEST_CLASS_ID,
      role: TEST_ROLE,
      studentID: TEST_STUDENT_ID,
      name: TEST_ORG_NAME
    }

  }
  const response = await PostReq('/cert/insert-user', body);
  console.log("##TEST5.1--insert-user] student" +TEST_USER_ID )
  ExpectRespError(response, HttpStatus.OK);



  //-----------------GET----------------------------

  const response2 = await PostReq('/cert/get-user-info', body);
  console.log("##TEST5.2--get-user-info] student"  )

  //orgID,classID,role,useraddr,name,studentID
  ExpectRespError(response2, HttpStatus.OK);

  expect(response2.body.userinfo_in_sc[0]).toEqual(TEST_ORG_ID);
  expect(response2.body.userinfo_in_sc[1]).toEqual(TEST_CLASS_ID);
  expect(response2.body.userinfo_in_sc[2]).toEqual(String(TEST_ROLE));

  //??address didn't set in insert-user
  expect(response2.body.userinfo_in_sc[3]).toEqual(TEST_CREATE_ADDRESS);
  expect(response2.body.userinfo_in_sc[4]).toEqual(TEST_ORG_NAME);
  expect(response2.body.userinfo_in_sc[5]).toEqual(TEST_STUDENT_ID);

});
//-----------------query CertDB------------------
test('/cert/issue/get-class-list POST ', async () => {

  const body = {
    contract: DEPLOY_CONTRACT_ADDRESS,
    orgID: TEST_ORG_ID
  }

  const response = await PostReq('/cert/issue/get-class-list', body);

  console.log("##TEST6.1--get-class-list] "  )
  console.log("response=", JSON.stringify(response.body));
  ExpectRespError(response, HttpStatus.OK);
  expect(response.body[0]).toEqual(TEST_CLASS_ID);
});

test('/cert/issue/get-teacher-list POST ', async () => {

  const body = {
    contract: DEPLOY_CONTRACT_ADDRESS,
    orgID: TEST_ORG_ID
  }

  const response = await PostReq('/cert/issue/get-teacher-list', body);

  console.log("##TEST7.1--get teacher list] "  )
  console.log("RESPONSE=== ", JSON.stringify(response.body));
  ExpectRespError(response, HttpStatus.OK);
  expect(response.body.teacherlist[0]).toEqual(TEST_USER_ID2);
});

test('/cert/issue/get-student-list POST ', async () => {

  const body = {
    contract: DEPLOY_CONTRACT_ADDRESS,
    orgID: TEST_ORG_ID,
    classID: TEST_CLASS_ID
  }

  const response = await PostReq('/cert/issue/get-student-list', body);

  console.log("##TEST8.1--get student list] "  )
  console.log("response= ", JSON.stringify(response.body));
  ExpectRespError(response, HttpStatus.OK);
  expect(response.body.studentlist[0]).toEqual(TEST_USER_ID);
});

// 沒用到
// test('/cert/issue/get-contract POST ', async () => {

//   const body = {
//     contract :DEPLOY_CONTRACT_ADDRESS,
//     orgInfo:{
//     orgID:TEST_ORG_ID
//     }

//   }

//     const response = await PostReq('/cert/issue/get-contract', body);


//    console.log("response = = = = ", JSON.stringify(response.body));
//     ExpectRespError(response, HttpStatus.OK);
//     expect(response.body.org_contract).toEqual(DEPLOY_CONTRACT_ADDRESS2);
// });

//----------------------ISSUE----------------------------

test('/datasrc/db/uploads POST', async () => {
  function postUpload(data) {
    return new Promise(resolve => { needle.post('http://127.0.0.1:3000/api/v1/datasrc/db/uploads', data, { multipart: true }, (err, resp, body) => resolve(body)) })
  }
  
  var ownerToCertID = {};
  var ownerToIPFShash = {};
  var ownerToCerthash = {};
  var owner = {
    10107: TEST_OWNER_ADDR
  };
  var data = {
    owner: JSON.stringify(owner),
    uploadfile: {
      file: './test/testCert/10107.pdf',
      content_type: 'application/pdf'
    }
  }
  var res = await postUpload(data);
  for(var key in res.certid_list) {
    TEST_CERT_ID = parseInt(res.certid_list[key]);
    ownerToCertID[key] = res.certid_list[key];
    ownerToIPFShash[key] = res.IPFS_hash_list[key];
    ownerToCerthash[key] = res.cert_Hash_list[key];
  }
  
  owner = {
    10108: TEST_OWNER_ADDR2
  };
  data = {
    owner: JSON.stringify(owner),
    uploadfile: {
      file: './test/testCert/10108.pdf',
      content_type: 'application/pdf'
    }
  }
  res = await postUpload(data);
  for(var key in res.certid_list) {
    TEST_CERT_ID2 = parseInt(res.certid_list[key]);
    ownerToCertID[key] = res.certid_list[key];
    ownerToIPFShash[key] = res.IPFS_hash_list[key];
    ownerToCerthash[key] = res.cert_Hash_list[key];
  }

  owner = {
    10109: TEST_OWNER_ADDR3
  };
  data = {
    owner: JSON.stringify(owner),
    uploadfile: {
      file: './test/testCert/10109.pdf',
      content_type: 'application/pdf'
    }
  }
  res = await postUpload(data);
  for(var key in res.certid_list) {
    TEST_CERT_ID3 = parseInt(res.certid_list[key]);
    ownerToCertID[key] = res.certid_list[key];
    ownerToIPFShash[key] = res.IPFS_hash_list[key];
    ownerToCerthash[key] = res.cert_Hash_list[key];
  }

  OWNER_CERT_ID = ownerToCertID;
  OWNER_IPFS_HASH = ownerToIPFShash;
  OWNER_CERT_HASH = ownerToCerthash;
  console.log("##TEST9.1--upload] "  )
  console.log("+++++++++++++++");
  console.log("owner to certID", ownerToCertID);
  console.log("owner to IPFS hash", ownerToIPFShash);
  console.log("owner to Cert hash", ownerToCerthash);
})

test('/cert/issue1 POST ', async () => {

  const body = {
    owners: [TEST_OWNER_ADDR, TEST_OWNER_ADDR2, TEST_OWNER_ADDR3],  //owner address
    issuer: TEST_USER_ADDRESS,  //issuer address
    userID: [TEST_USER_ID, TEST_USER_ID2, TEST_USER_ID3],
    signerID: [TEST_USER_ID],
    signer: [TEST_SIGNER_ADDRESS], //signer address
    contract: DEPLOY_CONTRACT_ADDRESS2, //org contract
    certName: TEST_CERTNAME,
    description: TEST_DESCRIPTION,
    timestamp: TEST_TIMESTAMP,
    ownerToCertID: OWNER_CERT_ID,
    ownerToHash: OWNER_IPFS_HASH,
    certHashList: OWNER_CERT_HASH, 

    certFilePath: ["./json/0x000000000000000000000000000000000000000112312311.pdf",
      "./json/0x000000000000000000000000000000000000000212312312.pdf",
      "./json/0x000000000000000000000000000000000000000312312313.pdf"],
    //contractname : DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1
  }
  const response = await PostReq('/cert/issue', body);

  TEST_ISSUEID = parseInt(response.body.issueID);
  console.log("##TEST10.1--issue] "  )
  console.log("issue [TEST_ISSUEID] ", JSON.stringify(response.body));
  ExpectRespError(response, HttpStatus.OK);
  //expect(response.body.req.issuer).toEqual(String(TEST_USER_ADDRESS));
});

test('/cert/get-user-certid POST ', async () => {

  const body = {
    contractname: DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1,
    useraddr: TEST_OWNER_ADDR3,
  };
  const response = await PostReq('/cert/get-user-certid', body);
  ExpectRespError(response, HttpStatus.OK);
  console.log("##TEST11.1--get-user-certid] CERTID" , response.body )
  
  expect(response.body.userinfo[0]).toEqual(String(TEST_CERT_ID3));
});

test('/datasrc/db/uploads POST', async () => {
  function postUpload(data) {
    return new Promise(resolve => { needle.post('http://127.0.0.1:3000/api/v1/datasrc/db/uploads', data, { multipart: true }, (err, resp, body) => resolve(body)) })
  }
  
  var ownerToCertID = {};
  var ownerToIPFShash = {};
  var ownerToCerthash = {};

  var owner = {
    10110: TEST_OWNER_ADDR3
  };
  var data = {
    owner: JSON.stringify(owner),
    uploadfile: {
      file: './test/testCert/10110.pdf',
      content_type: 'application/pdf'
    }
  }
  var res = await postUpload(data);
  for(var key in res.certid_list) {
    TEST_CERT_ID4 = parseInt(res.certid_list[key]);
    ownerToCertID[key] = res.certid_list[key];
    ownerToIPFShash[key] = res.IPFS_hash_list[key];
    ownerToCerthash[key] = res.cert_Hash_list[key];
  }

  OWNER_CERT_ID = ownerToCertID;
  OWNER_IPFS_HASH = ownerToIPFShash;
  OWNER_CERT_HASH = ownerToCerthash;
  console.log("##TEST12.1--upload] "  )  
  console.log("owner to certID" +ownerToCertID);
  console.log("owner to IPFS hash"+ownerToIPFShash);
  console.log("owner to Cert hash", ownerToCerthash);
})

//-------------ISSUE2-------------
test('/cert/issue2 POST ', async () => {

  const body = {
    owners: [TEST_OWNER_ADDR3],  //owner address
    issuer: TEST_USER_ADDRESS,  //issuer address
    userID: [TEST_USER_ID3],
    signerID: [TEST_USER_ID],
    signer: [TEST_SIGNER_ADDRESS], //signer address
    contract: DEPLOY_CONTRACT_ADDRESS2, //org contract
    certName: TEST_CERTNAME,
    description: TEST_DESCRIPTION,
    timestamp: TEST_TIMESTAMP,
    ownerToCertID: OWNER_CERT_ID,
    ownerToHash: OWNER_IPFS_HASH,
    certHashList: OWNER_CERT_HASH, 
    //certFilePath: ["./json/0x000000000000000000000000000000000000000345645678.pdf"],
    //contractname : DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1
  }

  body.ownerToCertID[TEST_OWNER_ADDR3] = TEST_CERT_ID4;
  const response = await PostReq('/cert/issue', body);
  console.log("##TEST13.1--issue] "  )
  TEST_ISSUEID2 = parseInt(response.body.issueID);
  console.log("issue [TEST_ISSUEID] ", JSON.stringify(response.body));
  ExpectRespError(response, HttpStatus.OK);
  //expect(response.body.req.issuer).toEqual(String(TEST_USER_ADDRESS));
});

test('/cert/get-user-certid POST ', async () => {

  const body = {
    contractname: DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1,
    useraddr: TEST_OWNER_ADDR3,
  };
  const response = await PostReq('/cert/get-user-certid', body);
  ExpectRespError(response, HttpStatus.OK);
  console.log("##TEST14.1--issue] get-user-certid [CERTID]", response.body  )
  
  expect(response.body.userinfo[0]).toEqual(String(TEST_CERT_ID3));
  expect(response.body.userinfo[1]).toEqual(String(TEST_CERT_ID4));


});
//-----------------------------

/*
test('/cert/sign/getjws POST', async () => {
const jsonpath = './json/941716099949916.json';
var data = fs.readFileSync(jsonpath); 
var string = JSON.parse(data);
var string2 = JSON.stringify(string);
const body = {
  mnemonic:TEST_MNEMONIC,
  path:TEST_PATH,
  jws: string2,
}

const response = await PostReq('/cert/sign/getjws', body);
swjsexample = response.body;
console.log("========================create jws============ = ",JSON.stringify(response.body));
ExpectRespError(response, HttpStatus.OK);
});*/

test('/cert/sign/get-all-issueID POST ', async () => {

  const body = {
    contractname2: DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1,
    issueraddr: TEST_USER_ADDRESS,
  }
  const response = await PostReq('/cert/sign/get-all-issueID', body);

  ExpectRespError(response, HttpStatus.OK);
  console.log("##TEST15.1--get-IssueID-List] ", response.body  )
  
  expect(response.body[0]).toEqual(String(TEST_ISSUEID));
  expect(response.body[1]).toEqual(String(TEST_ISSUEID2));

});

//------------before sign
test('/cert/sign/get-certID by signer ', async () => {

  const body = {
    contractname: DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1,
    signerAddr: TEST_SIGNER_ADDRESS
  }
 
  const response = await PostReq('/cert/sign/get-certID-by-signer', body);
  ExpectRespError(response, HttpStatus.OK);
  console.log("##TEST16.1--get-certinfo-bysigner] ", response.body  )
  console.log("TEST_CERT_ID="+TEST_CERT_ID)
  console.log("TEST_CERT_ID2="+TEST_CERT_ID2)
  console.log("TEST_CERT_ID3="+TEST_CERT_ID3)
  console.log("TEST_CERT_ID4="+TEST_CERT_ID4)
  
  
  expect(response.body.certid[0]).toEqual(String(TEST_CERT_ID));
  expect(response.body.certid[1]).toEqual(String(TEST_CERT_ID2));
  expect(response.body.certid[2]).toEqual(String(TEST_CERT_ID3));
  expect(response.body.certid[3]).toEqual(String(TEST_CERT_ID4));
  
  
});

test('sign 1 cert', async () => {

  const body = {
    contractname: DEPLOY_CONTRACT_ADDRESS2,
    contractname2: DEPLOY_CONTRACT_ADDRESS,
    signerID: TEST_USER_ID,
    idIssuer: 0,
    idSubject: 1,
    owneraddr: TEST_OWNER_ADDR2,
    certID: TEST_CERT_ID2,
    issueid: TEST_ISSUEID,
    sJWS: TEST_JWS,
    signeraddr: TEST_SIGNER_ADDRESS,
    userid: TEST_USER_ID
  };
  const response = await PostReq('/cert/sign/signsig', body);
  console.log("##TEST17--sign] signerAddr="+TEST_SIGNER_ADDRESS+"  signerID="+ TEST_USER_ID+"  certID="+TEST_CERT_ID2 )
  ExpectRespError(response, HttpStatus.OK);
  //expect(response.body.certID).toEqual(1);
});




test('/cert/sign/get-certinfo-bycertID POST ', async () => {

  const body = {
    contractname: DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1,
    certID: TEST_CERT_ID2
  }
  console.log("##TEST18--get-certinfo-bycertID] TEST_CERT_ID2:="+TEST_CERT_ID2 )
  
  const response = await PostReq('/cert/sign/get-certinfo-bycertID', body);
  ExpectRespError(response, HttpStatus.OK);
  console.log("[get-certinfo-bycertID] respons=", response.body);

  IPFS_HASH = response.body.IpfsHash;
  //IPFS_HASH = response.body.CertHash;
  expect(response.body.OwnerAddr).toEqual(TEST_OWNER_ADDR2);
  //   expect(response.body.CertHash).toEqual("0x0000000000000000000000000000000000000002");
  //   expect(response.body.JsonHash).toEqual("0x0000000000000000000000000000000000000002");
  expect(response.body.IssuerAddr).toEqual(TEST_USER_ADDRESS);
  expect(response.body.SignerAddr[0]).toEqual(TEST_SIGNER_ADDRESS);
  expect(response.body.userid).toEqual(TEST_USER_ID2);

  expect(response.body.description).toEqual(TEST_DESCRIPTION);
  expect(response.body.timestamp).toEqual(TEST_TIMESTAMP);
  expect(response.body.version).toEqual(TEST_VERSION);
  expect(response.body.certname).toEqual(TEST_CERTNAME);
  expect(response.body.Signerid[0]).toEqual(TEST_USER_ID);
});

test('/cert/sign/getstatus POST', async () => {

  const body = {
    certid: TEST_CERT_ID2,
    signeraddr: TEST_SIGNER_ADDRESS,
    contractname: DEPLOY_CONTRACT_ADDRESS2
  }

  const response = await PostReq('/cert/sign/get-status', body);

  console.log("##TEST19--getstatus] STATUS="+ JSON.stringify(response.body) )
  
  ExpectRespError(response, HttpStatus.OK);
  expect(response.body).toEqual(true);
});
//only 1 signer, must add multiple signer test
test('get issue info ', async () => {

  const body = {
    contractname: DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1,
    //issueraddr:TEST_USER_ADDRESS,
    issueid: TEST_ISSUEID
  }
  const response = await PostReq('/cert/sign/get-certInfo-in-issue', body);
  ExpectRespError(response, HttpStatus.OK);
  
  console.log("##TEST20--get-IssueID-Info]"+ JSON.stringify(response.body) )
  
  expect(response.body[0][0]).toEqual(String(TEST_CERT_ID));
  expect(response.body[1]).toEqual(TEST_CERTNAME);
  expect(response.body[2]).toEqual(TEST_DESCRIPTION);
  expect(response.body[3]).toEqual(TEST_TIMESTAMP);
  expect(response.body[4][0]).toEqual(String(TEST_CERT_ID2));
});
/*
test('/cert/sign/get-certID by signer DEBUG ', async () => {

  const body = {
    contractname: DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1,
    signerAddr: TEST_SIGNER_ADDRESS
  }
 
  const response = await PostReq('/cert/sign/debug', body);
  ExpectRespError(response, HttpStatus.OK);
  console.log("##DEBUG--get-certinfo-bysigner] ", response.body  )
  
  expect(response.body.certid.length).toEqual(3);
  expect(response.body.certid).toEqual(3);
  
  
  
});*/
test('/cert/sign/get-certID by signer after sign ', async () => {

  const body = {
    contractname: DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1,
    signerAddr: TEST_SIGNER_ADDRESS
  }
 
  const response = await PostReq('/cert/sign/get-certID-by-signer', body);
  ExpectRespError(response, HttpStatus.OK);
  console.log("##TEST21--get-certinfo-bysigner] ", response.body  )
  
  expect(response.body.certid.length).toEqual(3);
  expect(response.body.certid[0]).toEqual(String(TEST_CERT_ID));
  expect(response.body.certid[1]).toEqual(String(TEST_CERT_ID3));
  expect(response.body.certid[2]).toEqual(String(TEST_CERT_ID4));
  
  
});

test('/cert/sign/get-qrcode-code POST', async () => {
  var body = {
    certContractAddr: DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1, 
    certID: TEST_CERT_ID2,
    owneraddr: TEST_OWNER_ADDR2,
    schooid: TEST_ORG_ID
  };
  const response = await PostReq('/cert/sign/get-qrcode-code', body);
  ExpectRespError(response, HttpStatus.OK);
  console.log("QRCode:", response.body)
});


//------------------------------------
test('/datasrc/db/deployRevoke GET', async () => {

  const response = await GetReq('/datasrc/db/deployRevoke');
  ExpectRespError(response, HttpStatus.OK);
  expect(response.body).toEqual("true")

});

test('/datasrc/db/ipfshash POST', async () => {

  console.log("=========== IPFS_HASH: " + IPFS_HASH + " ===========")
  const body = {
    hash: IPFS_HASH,
    role: 1
  };
  const response = await PostReq('/datasrc/db/ipfshash', body);
  ExpectRespError(response, HttpStatus.OK);
  FUNDAMENTAL_PDF = response.body;

});

test('/datasrc/db/ipfsupload POST', async () => {

  var secretkey = HASH_SHA256("nchc");
  PDF_PLAIN = aes_decrypt(FUNDAMENTAL_PDF, secretkey);
  var cipher = aes_ipfsencrypt(PDF_PLAIN, TEST_MNEMONIC);
  EXPIRE_KEY = cipher.key;
  const body = {
    file: cipher.cipher, //cipher in base64 mode
    expire: 7
  }
  const response = await PostReq('/datasrc/db/ipfsupload', body);
  ExpectRespError(response, HttpStatus.OK);
  EXPIRE_IPFS_HASH = response.body.split(',')[2];
  console.log("EXPIRE_KEY: " + EXPIRE_KEY)
  console.log("EXPIRE_IPFS_HASH: " + EXPIRE_IPFS_HASH)

});

test('/datasrc/db/ipfshash Verify IPFS', async () => {

  console.log("=========== IPFS_HASH: " + EXPIRE_IPFS_HASH + " ===========")
  const body = {
    hash: EXPIRE_IPFS_HASH,
    role: 1
  };
  const response = await PostReq('/datasrc/db/ipfshash', body);
  ExpectRespError(response, HttpStatus.OK);
  var en_pdf = response.body;
  var plaintext = aes_decrypt(en_pdf, EXPIRE_KEY);
  console.log("fund_pdf: " + PDF_PLAIN.substring(0, 20) + ", expire: " + plaintext.substring(0, 20));
  expect(plaintext).toEqual(PDF_PLAIN);

});

test('/datasrc/db/addRevokeList POST', async () => {

  const body = {
    filehash: IPFS_HASH,
    CertName: TEST_CERTNAME,
    ApplierAddr: TEST_USER_ADDRESS,
    TeacherAddr: [TEST_SIGNER_ADDRESS],
    reason: "RevokeReason",
    RevokeCertID: TEST_CERT_ID2
  }
  const response = await PostReq('/datasrc/db/addRevokeList', body);
  ExpectRespError(response, HttpStatus.OK);
  expect(response.body).toEqual("success");

});

test('/datasrc/db/DumpRevokeData POST', async () => {

  const body = {
    revokehash: IPFS_HASH
  }
  const response = await PostReq('/datasrc/db/DumpRevokeData', body);
  ExpectRespError(response, HttpStatus.OK);
  console.log(response.body)
  expect(response.body.certificate_Name).toEqual("apple");
  expect(response.body.isRevoc).toEqual(false);
  expect(response.body.Applier_Address).toEqual(TEST_USER_ADDRESS);
  expect(response.body.Teacher_Address).toEqual([TEST_SIGNER_ADDRESS]);
  expect(response.body.confirm_Status).toEqual([false]);
  IPFS_PLAINSTRING = response.body.PlainString;

});

test('/datasrc/db/dumpRevokeList POST', async () => {

  const body = {
    TeacherAddr: TEST_SIGNER_ADDRESS
  }
  const response = await PostReq('/datasrc/db/dumpRevokeList', body);
  ExpectRespError(response, HttpStatus.OK);
  console.log(response.body)
  expect(response.body.certName[0]).toEqual("apple");
  expect(response.body.isRevoc[0]).toEqual(false);
  expect(response.body.certID[0]).toEqual(String(TEST_CERT_ID2));

});

test('/datasrc/db/TeacherSig POST', async () => {

  var output = SignString(TEST_MNEMONIC, IPFS_PLAINSTRING);
  var pubKey = getPubKey(TEST_MNEMONIC);
  const body = {
    signfile: IPFS_HASH,
    Addr: TEST_SIGNER_ADDRESS,
    SignedString: output,
    plain: IPFS_PLAINSTRING,
    pubkey: pubKey
  }
  const response = await PostReq('/datasrc/db/TeacherSig', body);
  ExpectRespError(response, HttpStatus.OK);

});

test('/datasrc/db/AllRevokeList POST', async () => {

  const response = await GetReq('/datasrc/db/AllRevokeList');
  console.log("AllRevokeList", response.body);
  ExpectRespError(response, HttpStatus.OK);
  expect(response.body[0]).toEqual(IPFS_HASH);
  
});

test('/datasrc/db/DumpRevokeData POST', async () => {

  const body = {
    revokehash: IPFS_HASH
  }
  const response = await PostReq('/datasrc/db/DumpRevokeData', body);
  ExpectRespError(response, HttpStatus.OK);
  expect(response.body.certificate_Name).toEqual("apple");
  expect(response.body.isRevoc).toEqual(true);
  expect(response.body.Applier_Address).toEqual(TEST_USER_ADDRESS);
  expect(response.body.Teacher_Address).toEqual([TEST_SIGNER_ADDRESS]);
  expect(response.body.confirm_Status).toEqual([true]);

});


/*
    

      test('/cert/issue/set-userid-into-cert2 POST ', async () => {
  
        const body = {  
          contractname : DEPLOY_CONTRACT_ADDRESS2,
          idIssuer: 0,
          idSubject: 1, 
          certid:[12312312],
          userid:[55688]
         }
          const response = await PostReq('/cert/issue/set-userid-into-cert2', body);
          ListCertID.push(response.body[0]);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" =================",response.body);
          //expect(response.body.certID).toEqual(1);
      });


   




   
      let swjsexample ="";
    test('/cert/sign/getjws POST', async () => {
      const jsonpath = './json/941716099949916.json';
      var data = fs.readFileSync(jsonpath); 
      var string = JSON.parse(data);
      var string2 = JSON.stringify(string);
      const body = {
        mnemonic:mnemonicexample,
        path:"m/2018'/5'/1'/12345678",
        jws: string2,
      }

      const response = await PostReq('/cert/sign/getjws', body);
      swjsexample = response.body;
      console.log("========================create jws============ = ",JSON.stringify(response.body));
      ExpectRespError(response, HttpStatus.OK);
  });
  
     



      test('/cert/sign/checkdownloadpermission POST ', async () => {
  
        const body = {  
           
           contractname2: DEPLOY_CONTRACT_ADDRESS,
           idIssuer: 0,
           idSubject: 1, 
           signerID:TEST_USER_ID,
           owneraddr:ownerexample,
           certID:ListCertID[0],
           signeraddr:"0x0000000000000000000000000000000000000000",
        };
          const response = await PostReq('/cert/sign/checkdownloadpermission', body);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" ==========checkdownloadpermission=======",response.body);
          //expect(response.body.certID).toEqual(1);
      });

      test('/cert/sign/verifyfile POST ', async () => {
        const jwspath = './sJWS/'+String(ownerexample+ListCertID[0])+'.json';
        var data = fs.readFileSync(jwspath); 
        var string = JSON.parse(data);   
        const body = {  
           
            contractname2: DEPLOY_CONTRACT_ADDRESS2,
            idIssuer: 0,
            idSubject: 1, 
            jwsfile:string,
            certID:12312312,
        };
          const response = await PostReq('/cert/sign/verifyfile', body);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" ==========verifyfile=======",response.body);
  
      });


      




      test('/cert/decrypt-pdf POST ', async () => {
  
        const body = {  
          certfile_path:'./cert/111.pdf',
         }
          const response2 = await PostReq('/cert/encrypt-pdf', body);
          const response = await PostReq('/cert/decrypt-pdf', body);
          
          ExpectRespError(response, HttpStatus.OK);
          ExpectRespError(response2, HttpStatus.OK);
          console.log(" =================encrypt-pdf==================",response2.body);
          console.log(" =================decrypt-pdf==================",response.body);
       
      });
      */


