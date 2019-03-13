import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';
import { UserInfoentity, DidInfoentity } from '../src/certtest/certtest.entity';
import { OrgInfoentity } from '../src/certtest/certtest.entity';
import { ENETRESET } from 'constants';
import {IssueController} from '../src/certtest/issue.controller';
const fs: any = require('fs');
/*
describe('test simple function in Issue Controller',()=>
{
  test('bytes32tostr',()=>{
      const test = IssueController.bytes32toStr("6f72616e6765");
      expect(test).toEqual("orange");

});
});*/

describe('Certtest API', () => {
  

//  contract related
let DEPLOY_CONTRACT_ADDRESS = '0x00';
let DEPLOY_CONTRACT_ADDRESS2 = '0x00';

//----------------0. initial.administrater-----------------
test('/certtest/contract-deploy', async () => {
  const body = {
    idAccount: 0
  }
  const response = await PostReq('/certtest/contract-deploy', body);
  ExpectRespError(response, HttpStatus.OK);
   
  expect(response.body.address).toBeTruthy();
  DEPLOY_CONTRACT_ADDRESS = response.body.address;
  console.log("!!! CERT CONTRACT ADDR !!!!"+DEPLOY_CONTRACT_ADDRESS)
});

test('/certtest/get-certDB-addr', async () => {
  
  const response = await GetReq('/certtest/get-certDB-addr');
  ExpectRespError(response, HttpStatus.OK); 
  expect(response.body).toBe(DEPLOY_CONTRACT_ADDRESS);
});
test('/certtest/issue/contract-deploy', async () => {
  const body = {
    idAccount: 0
  }
  const response = await PostReq('/certtest/issue/contract-deploy', body);
  ExpectRespError(response, HttpStatus.OK);
   
  expect(response.body.address).toBeTruthy();
  DEPLOY_CONTRACT_ADDRESS2 = response.body.address;
  console.log("!!! CERT CONTRACT ADDR !!!!"+DEPLOY_CONTRACT_ADDRESS2)
});

//----------------1. initial-----------------




//-----------1.1 user--------------
  //--  [1.1.1] create address  --



  //--  [1.1.2] insert-user  --
  let TEST_USER_ID=55688
  let TEST_ORG_ID=101
  let TEST_DIDID = "iamdidid"
  let TEST_DIDCON = "iamdidcontext"
  let TEST_PUBID = "iampubid"
  let TEST_PUBTYPE = "iampubtype"
  let TEST_PUBOWNER = "iampubowner"
  let TEST_PUBHEX = "iampubhex"
  let TEST_ORG_NAME = "NCTU"
  let TEST_CLASS_ID="orange"
  let TEST_STUDENT_ID="s102213028"
  let TEST_NANE="APPLE"
  let TEST_ROLE=3
  let TEST_USER_ADDRESS="0x0000000000000000000000000000000000000000"
  var ListCertID: string[];
  ListCertID =[];
  test('/certtest/insert-user', async () => {
    const user = new UserInfoentity();
    user.userID = TEST_USER_ID;
    user.studentID =TEST_STUDENT_ID;
    user.name =TEST_NANE;
    user.orgID = TEST_ORG_ID;
    user.classID = TEST_CLASS_ID;
    user.role = TEST_ROLE;
    user.address = TEST_USER_ADDRESS;  //temp
    const body = {
     // idAccount: 0,
      contract :DEPLOY_CONTRACT_ADDRESS,
      idIssuer: 0,
      idSubject: 1, 
      userInfo: user
    }
 
    const response = await PostReq('/certtest/insert-user', body);
    console.log(response.body);
    ExpectRespError(response, HttpStatus.OK);
   

  }); 

  let mnemonicexample = "";
  let publickeyexample = "";
   test('/certtest/create-did', async () => {
     const body = {
       test:"test"
     }
     const response = await PostReq('/certtest/create-did', body);
     //console.log("create did = ",JSON.stringify(response.body));
     mnemonicexample = response.body.service[0];
     publickeyexample = response.body.publicKey[0].publicKeyHex;
     console.log("=============did================ ",JSON.stringify(response.body));
     console.log("=============mnemonicexample================ ",JSON.stringify(mnemonicexample));
     console.log("=============publickeyexample=============== ",JSON.stringify(publickeyexample));
     ExpectRespError(response, HttpStatus.OK);
   });

 
  
 

  // get did 
  

  
 //--  [1.1.3] get address  --
//get address by userID
test('/certtest/issue/get-address', async () => {
  const user = new UserInfoentity();
  user.userID = TEST_USER_ID;
  const body = {
    idIssuer: 0,
    idSubject: 1, 
    contract: DEPLOY_CONTRACT_ADDRESS ,
    userInfo: user
  }
  const response = await PostReq('/certtest/issue/get-address', body);
  ExpectRespError(response, HttpStatus.OK);
  //userinfo: orgID, classID, role, userAddr
  console.log("[debug] userinfo = "+response.body.address);  
  expect(response.body.address).toBe(TEST_USER_ADDRESS);
});

 //--  [1.1.4] get user info  --
 test('/certtest/userinfo', async () => {
  const user = new UserInfoentity();
  user.userID = TEST_USER_ID;
  const body = {
    idIssuer: 0,
    idSubject: 1, 
    contract: DEPLOY_CONTRACT_ADDRESS ,
    userInfo: user
  }
  const response = await PostReq('/certtest/userinfo', body);
  console.log("==================================",response.body);
  ExpectRespError(response, HttpStatus.OK);
  //userinfo: orgID, classID, role, userAddr
  //console.log("[debug] userinfo = "+response.body.userinfo[0]);
  
  expect(response.body.userinfo[0]).toBe(String(TEST_ORG_ID));
  expect(response.body.userinfo[1]).toBe(TEST_CLASS_ID);
  expect(response.body.userinfo[2]).toBe(String(TEST_ROLE));
  expect(response.body.userinfo[3]).toBe(String(TEST_USER_ADDRESS));
});

 //-----------1.2 org--------------

 //--  [1.2.1] create contract  --
  let ORG_CONTRACT_ADDRESS = '0x00';
  test('/certtest/create-contract/ POST ', async () => {
    //const users = new OrgInfoentity();

    const body = {
      idAccount: 0
    }

    const response = await PostReq('/certtest/create-contract',body);
    ExpectRespError(response, HttpStatus.OK);
  
  expect(response.body.address).toBeTruthy();
  ORG_CONTRACT_ADDRESS = response.body.address;
  console.log("ORG_CONTRACT_ADDRESS="+ORG_CONTRACT_ADDRESS);
});
//--  [1.2.2] insert org  --
  test('/certtest/insert-org, POST new contract, 201 created', async () => {
    const org = new OrgInfoentity();
    org.orgID = TEST_ORG_ID;
    org.orgName = TEST_ORG_NAME;
    org.contract = ORG_CONTRACT_ADDRESS;
    const body = {
     // idAccount: 0,
      contract :DEPLOY_CONTRACT_ADDRESS,
      idIssuer: 0,
      idSubject: 1, 
      orgInfo: org
    }

    const response = await PostReq('/certtest/insert-org', body);
    ExpectRespError(response, HttpStatus.OK);
   

//    expect(response.body.result.orgName).toBe('NCTU');
  });

//--  [1.2.3] get contract  --
test('/certtest/issue/get-contract', async () => {
  const org = new OrgInfoentity();
  org.orgID = TEST_ORG_ID;
  const body = {
    idIssuer: 0,
    idSubject: 1, 
    contract: DEPLOY_CONTRACT_ADDRESS ,
    orgInfo: org
  }
  const response = await PostReq('/certtest/issue/get-contract', body);
  ExpectRespError(response, HttpStatus.OK);
  //userinfo: orgID, classID, role, userAddr
  //console.log("[debug] userinfo = "+response.body.org_contract);  
  expect(response.body.org_contract).toBe(ORG_CONTRACT_ADDRESS);
});

//----------------2. issue-----------------

//-----------2.1 query--------------
//--  [2.1.1] insert multiple classes, multiple students in the same class --


//--  [2.1.2] get class list --






//--  [2.1.3] get student list --

//-----------2.2 issue--------------
test('/certtest/issue POST ', async () => {
  
  const body = {
    owner: ["0x0000000000000000000000000000000000000003","0x0000000000000000000000000000000000000001","0x0000000000000000000000000000000000000002"],  //owner address
    issuer: TEST_USER_ADDRESS,  //issuer address
    signer: [TEST_USER_ADDRESS,0x0000000000000000000000000000000000000001,0x0000000000000000000000000000000000000002], //signer address
    contract: "0686005", //org contract
    version: "0.1.0",
    certName: "TOEFL",
    revocation: false,
    description: "this is toefl certification",
    timestamp: "1234567890123",  
    certFilePath: ["./json/100100.pdf",
                    "./json/100100.pdf",
                    "./json/100100.pdf"],
    contractname : DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1 
  }

    const response = await PostReq('/certtest/issue', body);
    
    ListCertID.push(response.body[0]);
   console.log("response = = = = ", JSON.stringify(response.body));
    ExpectRespError(response, HttpStatus.OK);
    //expect(response.body.req.issuer).toEqual(String(TEST_USER_ADDRESS));
});




test('/certtest/certfind POST ', async () => {
  
  const body = {  
    contractname : DEPLOY_CONTRACT_ADDRESS2,
    idIssuer: 0,
    idSubject: 1, 
    useraddr:"0x0000000000000000000000000000000000000003",
    
  };
    const response = await PostReq('/certtest/certfind', body);
    ExpectRespError(response, HttpStatus.OK);
    console.log(" ============",response.body);
    
});


//----------------3. sign-----------------


});
