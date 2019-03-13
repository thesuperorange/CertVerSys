import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';

describe('AuthRole API', () => {

  let bobToken = null;
  let aliceToken = null;
  const bobBody = {
    id:0,
    username:'bob',
    roles:['USER', 'STUDENT']
  }

  

  const aliceBody = {
    id:1,
    username:'alice',
    roles:['TEACHER']
  }
 let DEPLOY_CONTRACT_ADDRESS ="0x00"
  test('/authrole/contract-deploy', async () => {
    const body = {
      idAccount: 0
    }
    const response = await PostReq('/auth/jwt-token', bobBody);
    ExpectRespError(response, HttpStatus.OK);
    const r = response.body;
    expect(r.token.access_token).toBeTruthy();
    const token = r.token.access_token;
    const responseUser = await PostReq('/authrole/contract-deploy', body,token);
    ExpectRespError(responseUser, HttpStatus.OK);   
    expect(responseUser.body.address).toBeTruthy();
    DEPLOY_CONTRACT_ADDRESS = responseUser.body.address;
    console.log("!!! CERT CONTRACT ADDR !!!!"+DEPLOY_CONTRACT_ADDRESS)
  });

  test('/authrole/teacher without token' , async () => {
    const responseWithoutToken = await GetReq('/authrole/teacher');
    console.log("=================teacher without token=====================",responseWithoutToken.body);
    ExpectRespError(responseWithoutToken, HttpStatus.UNAUTHORIZED);
  });

  test('/authrole/user without token' , async () => {
    const responseWithoutToken = await GetReq('/authrole/user');
    console.log("=================user without token=====================",responseWithoutToken.body);
    ExpectRespError(responseWithoutToken, HttpStatus.UNAUTHORIZED);
  });

  test('/authrole/student without token' , async () => {
    const responseWithoutToken = await GetReq('/authrole/student');
    console.log("=================stident without token=====================",responseWithoutToken.body);
    ExpectRespError(responseWithoutToken, HttpStatus.UNAUTHORIZED);
  });

  test('/authrole/teacher with teacher role' , async () => {
    const response = await PostReq('/auth/jwt-token', aliceBody);
    ExpectRespError(response, HttpStatus.OK);
    const r = response.body;
    expect(r.token.access_token).toBeTruthy();
    const token = r.token.access_token;
    const response2 = await GetReq('/authrole/teacher', token);
    ExpectRespError(response2, HttpStatus.OK);

    const responseUser = await GetReq('/authrole/user', token);
    ExpectRespError(responseUser, HttpStatus.FORBIDDEN);
  });

  test('/authrole/user with user,student role' , async () => {
    const response = await PostReq('/auth/jwt-token', bobBody);
    ExpectRespError(response, HttpStatus.OK);
    const r = response.body;
    expect(r.token.access_token).toBeTruthy();
    const token = r.token.access_token;
    const responseUser = await GetReq('/authrole/user', token);
    ExpectRespError(responseUser, HttpStatus.OK);
   
    const responseStudent = await GetReq('/authrole/student', token);
    ExpectRespError(responseStudent, HttpStatus.OK);

    const responseTeacher = await GetReq('/authrole/teacher', token);
    ExpectRespError(responseTeacher, HttpStatus.FORBIDDEN);
  });

  
});