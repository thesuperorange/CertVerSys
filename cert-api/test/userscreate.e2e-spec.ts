import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';
import { UserInfoentity, DidInfoentity } from '../src/certtest/certtest.entity';
import { OrgInfoentity } from '../src/certtest/certtest.entity';
import { ENETRESET } from 'constants';
import {IssueController} from '../src/certtest/issue.controller';
const fs: any = require('fs');

describe('Certtest API', () => { 
    let mnemonicexample = "";
    let publickeyexample = "";
    let DEPLOY_CONTRACT_ADDRESS = '0x00';
    let DEPLOY_CONTRACT_ADDRESS2 = '0x00';
    let TEST_USER_ID2=556
    let TEST_ISSUEID =0;
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


    test('/certtest/contract-deploy', async () => {
        const body = {
          idAccount: 0
        }
        const response = await PostReq('/certtest/contract-deploy', body);
        ExpectRespError(response, HttpStatus.OK);
         
        expect(response.body.address).toBeTruthy();
        DEPLOY_CONTRACT_ADDRESS = response.body.address;
        console.log("===============CertDB Contract======================="+DEPLOY_CONTRACT_ADDRESS)
      });
    
    test('/certtest/issue/contract-deploy', async () => {
        const body = {
          idAccount: 0
        }
        const response = await PostReq('/certtest/issue/contract-deploy', body);
        ExpectRespError(response, HttpStatus.OK);
         
        expect(response.body.address).toBeTruthy();
        DEPLOY_CONTRACT_ADDRESS2 = response.body.address;
        console.log("===============Cert2 Contract======================="+DEPLOY_CONTRACT_ADDRESS2)
    });

    test('/certtest/insert-user', async () => {
        const user = new UserInfoentity();
        user.userID = TEST_USER_ID;
        user.studentID =TEST_STUDENT_ID;
        user.name =TEST_NANE;
        user.orgID = TEST_ORG_ID;
        user.classID = TEST_CLASS_ID;
        user.role = TEST_ROLE;
        const body = {
         // idAccount: 0,
          contract :DEPLOY_CONTRACT_ADDRESS,
          idIssuer: 0,
          idSubject: 1, 
          userInfo: user
        }
     
        const response = await PostReq('/certtest/insert-user', body);
        console.log("==============insert-user================",response.body);
        ExpectRespError(response, HttpStatus.OK);
           
      });
      
      test('/certtest/createuser', async () => {
        const body = {
          contract :DEPLOY_CONTRACT_ADDRESS,
          idIssuer: 0,
          idSubject: 1, 
          userID:TEST_USER_ID,
          path:"m/2018'/5'/1'/12345678"
          
        }
        const response = await PostReq('/certtest/createuser', body);
        mnemonicexample = response.body.mnemonic;
        publickeyexample =response.body.public;
        console.log("================mnemonicexample====================",JSON.stringify(mnemonicexample));
        console.log(" ===============publickeyexample=================== ",JSON.stringify(publickeyexample));
        console.log("===================createuser====================== ",JSON.stringify(response.body));
        ExpectRespError(response, HttpStatus.OK);
      });

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
        console.log("=================userinfo=================",response.body);
        ExpectRespError(response, HttpStatus.OK);
        
      });

/*
      test('/certtest/issue/set-class-list POST', async () => {
  
        const body = {
          idIssuer: 0,
          idSubject: 1, 
          contract: DEPLOY_CONTRACT_ADDRESS ,
          orgID: TEST_ORG_ID,
          classID:TEST_CLASS_ID
        }
        const response = await PostReq('/certtest/issue/set-class-list', body);
        console.log("===============set-class-list=================",response.body);
        ExpectRespError(response, HttpStatus.OK);
        
        //expect(response.body).toEqual(["classA","classB","classC"]);
      });*/

      let TEST_CLASS_ID2="apple"
      let TEST_CLASS_ID3="banana"
      test('/certtest/insert-user', async () => {
        const user = new UserInfoentity();
        user.userID = TEST_USER_ID;
        user.studentID =TEST_STUDENT_ID;
        user.name =TEST_NANE;
        user.orgID = TEST_ORG_ID;
        user.classID = TEST_CLASS_ID2;
        user.role = TEST_ROLE;
        const body = {
         // idAccount: 0,
          contract :DEPLOY_CONTRACT_ADDRESS,
          idIssuer: 0,
          idSubject: 1, 
          userInfo: user
        }
     
        const response = await PostReq('/certtest/insert-user', body);
        console.log("==============insert-user================",response.body);
        ExpectRespError(response, HttpStatus.OK);
           
      });
      test('/certtest/insert-user', async () => {
        const user = new UserInfoentity();
        user.userID = TEST_USER_ID;
        user.studentID =TEST_STUDENT_ID;
        user.name =TEST_NANE;
        user.orgID = TEST_ORG_ID;
        user.classID = TEST_CLASS_ID3;
        user.role = TEST_ROLE;
        const body = {
         // idAccount: 0,
          contract :DEPLOY_CONTRACT_ADDRESS,
          idIssuer: 0,
          idSubject: 1, 
          userInfo: user
        }
     
        const response = await PostReq('/certtest/insert-user', body);
        console.log("==============insert-user================",response.body);
        ExpectRespError(response, HttpStatus.OK);
           
      });
    /*  test('/certtest/issue/set-class-list POST', async () => {
  
        const body = {
          idIssuer: 0,
          idSubject: 1, 
          contract: DEPLOY_CONTRACT_ADDRESS ,
          orgID: TEST_ORG_ID,
          classID:TEST_CLASS_ID2
        }
        const response = await PostReq('/certtest/issue/set-class-list', body);
        console.log("===============set-class-list=================",response.body);
        ExpectRespError(response, HttpStatus.OK);
        
        //expect(response.body).toEqual(["classA","classB","classC"]);
      });

      test('/certtest/issue/set-class-list POST', async () => {
  
        const body = {
          idIssuer: 0,
          idSubject: 1, 
          contract: DEPLOY_CONTRACT_ADDRESS ,
          orgID: TEST_ORG_ID,
          classID:TEST_CLASS_ID3
        }
        const response = await PostReq('/certtest/issue/set-class-list', body);
        console.log("===============set-class-list=================",response.body);
        ExpectRespError(response, HttpStatus.OK);
        
        //expect(response.body).toEqual(["classA","classB","classC"]);
      });*/
      const TEST_ORG_ID2=102

      test('/certtest/insert-user', async () => {
        const user = new UserInfoentity();
        user.userID = TEST_USER_ID;
        user.studentID =TEST_STUDENT_ID;
        user.name =TEST_NANE;
        user.orgID = TEST_ORG_ID2;
        user.classID = TEST_CLASS_ID2;
        user.role = TEST_ROLE;
        const body = {
         // idAccount: 0,
          contract :DEPLOY_CONTRACT_ADDRESS,
          idIssuer: 0,
          idSubject: 1, 
          userInfo: user
        }
     
        const response = await PostReq('/certtest/insert-user', body);
        console.log("==============insert-user================",response.body);
        ExpectRespError(response, HttpStatus.OK);
           
      });
      test('/certtest/insert-user', async () => {
        const user = new UserInfoentity();
        user.userID = TEST_USER_ID;
        user.studentID =TEST_STUDENT_ID;
        user.name =TEST_NANE;
        user.orgID = TEST_ORG_ID2;
        user.classID = TEST_CLASS_ID3;
        user.role = TEST_ROLE;
        const body = {
         // idAccount: 0,
          contract :DEPLOY_CONTRACT_ADDRESS,
          idIssuer: 0,
          idSubject: 1, 
          userInfo: user
        }
     
        const response = await PostReq('/certtest/insert-user', body);
        console.log("==============insert-user================",response.body);
        ExpectRespError(response, HttpStatus.OK);
           
      });
      /*test('/certtest/issue/set-class-list POST', async () => {
  
        const body = {
          idIssuer: 0,
          idSubject: 1, 
          contract: DEPLOY_CONTRACT_ADDRESS ,
          orgID: TEST_ORG_ID2,
          classID:TEST_CLASS_ID2
        }
        const response = await PostReq('/certtest/issue/set-class-list', body);
        console.log("===============set-class-list=================",response.body);
        ExpectRespError(response, HttpStatus.OK);
        
        //expect(response.body).toEqual(["classA","classB","classC"]);
      });

      test('/certtest/issue/set-class-list POST', async () => {
  
        const body = {
          idIssuer: 0,
          idSubject: 1, 
          contract: DEPLOY_CONTRACT_ADDRESS ,
          orgID: TEST_ORG_ID2,
          classID:TEST_CLASS_ID3
        }
        const response = await PostReq('/certtest/issue/set-class-list', body);
        console.log("===============set-class-list=================",response.body);
        ExpectRespError(response, HttpStatus.OK);
        
        //expect(response.body).toEqual(["classA","classB","classC"]);
      });
*/
      test('/certtest/issue/get-class-list POST', async () => {
  
        const body = {
          idIssuer: 0,
          idSubject: 1, 
          contract: DEPLOY_CONTRACT_ADDRESS ,
          orgID: TEST_ORG_ID
        }
        const response = await PostReq('/certtest/issue/get-class-list', body);
        console.log("===============get-class-list=================",response.body);
        ExpectRespError(response, HttpStatus.OK);
        
        expect(response.body).toEqual([TEST_CLASS_ID,TEST_CLASS_ID2,TEST_CLASS_ID3]);
      });

      
      test('/certtest/issue/get-class-list POST', async () => {
  
        const body = {
          idIssuer: 0,
          idSubject: 1, 
          contract: DEPLOY_CONTRACT_ADDRESS ,
          orgID: TEST_ORG_ID2
        }
        const response = await PostReq('/certtest/issue/get-class-list', body);
        console.log("===============get-class-list=================",response.body);
        ExpectRespError(response, HttpStatus.OK);
        
        expect(response.body).toEqual([TEST_CLASS_ID2,TEST_CLASS_ID3]);
      });

//--------------------test set student list
/*
test('/certtest/issue/set-student-list POST', async () => {
  
  const body = {
    idIssuer: 0,
    idSubject: 1, 
    contract: DEPLOY_CONTRACT_ADDRESS ,
    orgID: TEST_ORG_ID,
    classID:TEST_CLASS_ID,
    userID:TEST_USER_ID
  }
  const response = await PostReq('/certtest/issue/set-student-list', body);
  console.log("===============set-student-list=================",response.body);
  ExpectRespError(response, HttpStatus.OK);
  
  //expect(response.body).toEqual(["classA","classB","classC"]);
});*/
test('/certtest/insert-user', async () => {
  const user = new UserInfoentity();
  user.userID = TEST_USER_ID2;
  user.studentID =TEST_STUDENT_ID;
  user.name =TEST_NANE;
  user.orgID = TEST_ORG_ID;
  user.classID = TEST_CLASS_ID;
  user.role = TEST_ROLE;
  const body = {
   // idAccount: 0,
    contract :DEPLOY_CONTRACT_ADDRESS,
    idIssuer: 0,
    idSubject: 1, 
    userInfo: user
  }

  const response = await PostReq('/certtest/insert-user', body);
  console.log("==============insert-user================",response.body);
  ExpectRespError(response, HttpStatus.OK);
     
});
/*
test('/certtest/issue/set-student-list POST', async () => {
  
  const body = {
    idIssuer: 0,
    idSubject: 1, 
    contract: DEPLOY_CONTRACT_ADDRESS ,
    orgID: TEST_ORG_ID,
    classID:TEST_CLASS_ID,
    userID:TEST_USER_ID2
  }
  const response = await PostReq('/certtest/issue/set-student-list', body);
  console.log("===============set-student-list=================",response.body);
  ExpectRespError(response, HttpStatus.OK);
  
  //expect(response.body).toEqual(["classA","classB","classC"]);
});
*/
test('/certtest/issue/get-student-list POST ', async () => {
  const body = {
    idIssuer: 0,
    idSubject: 1, 
    contract: DEPLOY_CONTRACT_ADDRESS ,
    classID: TEST_CLASS_ID,
    orgID:TEST_ORG_ID,
  }
  
    const response = await PostReq('/certtest/issue/get-student-list', body);
    console.log("=====================get-student-list===================",response.body.studentlist);
    ExpectRespError(response, HttpStatus.OK);
    expect(response.body.studentlist).toEqual([String(TEST_USER_ID),String(TEST_USER_ID2)]);
});




});