import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';
import { UserInfoentity, DidInfoentity } from '../src/certtest/certtest.entity';
import { OrgInfoentity } from '../src/certtest/certtest.entity';
import { ENETRESET } from 'constants';
import {IssueController} from '../src/certtest/issue.controller';


describe('Certtest API', () => {

  let TEST_USER_ADDRESS="0x0000000000000000000000000000000000000000"
  let DEPLOY_CONTRACT_ADDRESS2 = '0x00';
  var ListCertID: string[];
  ListCertID =[];
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


test('/certtest/issue POST ', async () => {
  
    const body = {
      owner: ["9417158","9417159","9417160"],  //owner address
      issuer: TEST_USER_ADDRESS,  //issuer address
      signer: [TEST_USER_ADDRESS,TEST_USER_ADDRESS,TEST_USER_ADDRESS], //signer address
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
      ListCertID.push(response.body[1]);
      ListCertID.push(response.body[2]);
     console.log("response = = = = ", JSON.stringify(response.body));
      ExpectRespError(response, HttpStatus.OK);
      //expect(response.body.req.issuer).toEqual(String(TEST_USER_ADDRESS));
  });
  
});