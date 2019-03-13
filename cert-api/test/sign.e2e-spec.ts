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
    let TEST_USER_ID=55688
    let TEST_USER_ID2=556
    let TEST_ORG_ID=101
    let TEST_DIDID = "iamdidid"
    let TEST_DIDCON = "iamdidcontext"
    let TEST_PUBID = "iampubid"
    let TEST_PUBTYPE = "iampubtype"
    let TEST_PUBOWNER = "iampubowner"
    let TEST_PUBHEX = "iampubhex"
    let TEST_ORG_NAME = "NCTU"
    let TEST_CLASS_ID="orange"
    let TEST_ROLE=3
    let TEST_USER_ADDRESS="0x0000000000000000000000000000000000000000"
    var ListCertID: string[];
    ListCertID =[];
    let TEST_ISSUEID =0;
    let TEST_CREATE_ADDRESS = "0X00"
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
    test('/certtest/createuser', async () => {
      const body = {
        contract :DEPLOY_CONTRACT_ADDRESS,
        idIssuer: 0,
        idSubject: 1, 
        userID:TEST_USER_ID2,
        path:"m/2018'/5'/1'/12345678"
        
      }
      const response = await PostReq('/certtest/createuser', body);
      mnemonicexample = response.body.mnemonic;
      publickeyexample =response.body.public;
      TEST_CREATE_ADDRESS = response.body.address;
      console.log("create mnemonicexample = ",JSON.stringify(mnemonicexample));
      console.log("create publickeyexample = ",JSON.stringify(publickeyexample));
      console.log("create address = ",JSON.stringify(response.body));
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
      console.log("create mnemonicexample = ",JSON.stringify(mnemonicexample));
      console.log("create publickeyexample = ",JSON.stringify(publickeyexample));
      console.log("create address = ",JSON.stringify(response.body));
      ExpectRespError(response, HttpStatus.OK);
    });

    let ownerexample  = "0x0000000000000000000000000000000000000003";
    test('/certtest/issue POST ', async () => {
  
        const body = {
          owner: ["0x0000000000000000000000000000000000000003","0x0000000000000000000000000000000000000001","0x0000000000000000000000000000000000000002"],  //owner address
          issuer: TEST_USER_ADDRESS,  //issuer address
          signer: [TEST_USER_ADDRESS], //signer address
          contract: "0686005", //org contract
          version: "0.1.0",
          certName: "apple",
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
          
          TEST_ISSUEID = response.body;
         console.log("response = = = = ", JSON.stringify(response.body));
          ExpectRespError(response, HttpStatus.OK);
          //expect(response.body.req.issuer).toEqual(String(TEST_USER_ADDRESS));
      });

     

  

      test('/certtest/sign/get-CertID-List POST ', async () => {
  
        const body = {  
          contractname2 : DEPLOY_CONTRACT_ADDRESS2,
          idIssuer: 0,
          idSubject: 1, 
          issueraddr:TEST_USER_ADDRESS,
          issueid:TEST_ISSUEID
         }
          const response = await PostReq('/certtest/sign/get-CertID-List', body);
          ListCertID.push(response.body[0]);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" ============",response.body);
          //expect(response.body.certID).toEqual(1);
      });


      test('/certtest/sign/get-IssueID-List POST ', async () => {
  
        const body = {  
          contractname2 : DEPLOY_CONTRACT_ADDRESS2,
          idIssuer: 0,
          idSubject: 1, 
          issueraddr:TEST_USER_ADDRESS,
         }
          const response = await PostReq('/certtest/sign/get-IssueID-List', body);
          
          ExpectRespError(response, HttpStatus.OK);
          console.log(" =================get-IssueID-List==================",response.body);
          //expect(response.body.certID).toEqual(1);
      });



      test('/certtest/sign/get-certinfo-bycertID POST ', async () => {
  
        const body = {  
          contractname : DEPLOY_CONTRACT_ADDRESS2,
          idIssuer: 0,
          idSubject: 1, 
          certID :ListCertID[0]
         }
          const response = await PostReq('/certtest/sign/get-certinfo-bycertID', body);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" ============",response.body);
          //expect(response.body.certID).toEqual(1);
      });
   
      let swjsexample ="";
    test('/certtest/sign/getjws POST', async () => {
      const jsonpath = './json/941716099949916.json';
      var data = fs.readFileSync(jsonpath); 
      var string = JSON.parse(data);
      var string2 = JSON.stringify(string);
      const body = {
        mnemonic:mnemonicexample,
        path:"m/2018'/5'/1'/12345678",
        jws: string2,
      }

      const response = await PostReq('/certtest/sign/getjws', body);
      swjsexample = response.body;
      console.log("========================create jws============ = ",JSON.stringify(response.body));
      ExpectRespError(response, HttpStatus.OK);
  });
  
      test('/certtest/sign/signsig POST ', async () => {
  
        const body = {  
           contractname : DEPLOY_CONTRACT_ADDRESS2,
           contractname2: DEPLOY_CONTRACT_ADDRESS,
           signerID:TEST_USER_ID,
           idIssuer: 0,
           idSubject: 1, 
           owneraddr:ownerexample,
           certID:ListCertID[0],
           issueid:TEST_ISSUEID,
           sJWS:swjsexample,
           signeraddr:"0x0000000000000000000000000000000000000000",
        };
          const response = await PostReq('/certtest/sign/signsig', body);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" ============",response.body);
          //expect(response.body.certID).toEqual(1);
      });
      
      test('/certtest/sign/test POST ', async () => {
  
        const body = {  
           contractname : DEPLOY_CONTRACT_ADDRESS2,
           idIssuer: 0,
           idSubject: 1, 
           certID:ListCertID[0],
           signeraddr:"0x0000000000000000000000000000000000000000",
        };
          const response = await PostReq('/certtest/sign/test', body);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" ============",response.body);
          //expect(response.body.certID).toEqual(1);
      });

      test('/certtest/sign/checkdownloadpermission POST ', async () => {
  
        const body = {  
           
           contractname2: DEPLOY_CONTRACT_ADDRESS,
           idIssuer: 0,
           idSubject: 1, 
           signerID:TEST_USER_ID,
           owneraddr:ownerexample,
           certID:ListCertID[0],
           signeraddr:"0x0000000000000000000000000000000000000000",
        };
          const response = await PostReq('/certtest/sign/checkdownloadpermission', body);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" ==========checkdownloadpermission=======",response.body);
          //expect(response.body.certID).toEqual(1);
      });

      test('/certtest/sign/verifyfile POST ', async () => {
        const jwspath = './sJWS/'+String(ownerexample+ListCertID[0])+'.json';
        var data = fs.readFileSync(jwspath); 
        var string = JSON.parse(data);   
        const body = {  
           
            contractname2: DEPLOY_CONTRACT_ADDRESS2,
            idIssuer: 0,
            idSubject: 1, 
            jwsfile:string,
            certID:ListCertID[0],
        };
          const response = await PostReq('/certtest/sign/verifyfile', body);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" ==========verifyfile=======",response.body);
  
      });

      test('/certtest/sign/get-IssueID-Info POST ', async () => {
  
        const body = {  
          contractname2 : DEPLOY_CONTRACT_ADDRESS2,
          idIssuer: 0,
          idSubject: 1, 
          issueraddr:TEST_USER_ADDRESS,
          issueid:TEST_ISSUEID
         }
          const response = await PostReq('/certtest/sign/get-IssueID-Info', body);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" ============get-IssueID-Info==============",response.body);
          //expect(response.body.certID).toEqual(1);
      });
      
      let qrcode_string ="";
      test('/certtest/sign/create-QRcode POST ', async () => {
         
        const body = {  
           
            contractname2: DEPLOY_CONTRACT_ADDRESS2,
            idIssuer: 0,
            idSubject: 1, 
            owner: ownerexample ,
            certID:ListCertID[0],
        };
          const response = await PostReq('/certtest/sign/create-QRcode', body);
          qrcode_string = JSON.stringify(response.body);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" ==========create_QRcode=======",response.body);
         
      });

      test('/certtest/sign/verify-QRcode POST ', async () => {
        const body = {          
            contractname2: DEPLOY_CONTRACT_ADDRESS2,
            idIssuer: 0,
            idSubject: 1, 
            qrcodestring:qrcode_string
        };
          const response = await PostReq('/certtest/sign/verify-QRcode', body);
          ExpectRespError(response, HttpStatus.OK);
          console.log(" ==========verify-QRcode=======",response.body);

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

   

    });