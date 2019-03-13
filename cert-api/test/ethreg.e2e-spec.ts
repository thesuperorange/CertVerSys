import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';

describe('/dev/ethreg API', () => {

  let DEPLOY_CONTRACT_ADDRESS = '0x00';
  
  test('/dev/ethreg, It should response the GET method', async () => {
      const response = await GetReq('/dev/ethreg');
      ExpectRespError(response, HttpStatus.OK);
  });

  
  test('/dev/ethreg/contract-deploy', async () => {
    const body = {
      idAccount: 0
    }
    const response = await PostReq('/dev/ethreg/contract-deploy', body);
    ExpectRespError(response, HttpStatus.OK);
    // console.log(response.body)
    expect(response.body.address).toBeTruthy();
    DEPLOY_CONTRACT_ADDRESS = response.body.address;
  });

  test('/dev/ethreg/set-claim', async () => {
    const body = {
      idIssuer: 0,
      idSubject: 1, 
      contract: DEPLOY_CONTRACT_ADDRESS ,
      keyHex: '0xFAA0B4B8BA99B7625152350AE2B38F9BAA06567E5D321B00FE32DB3B6DB1553B',
      valueHex: '0x93285be41b243afa17cc06e34495c4ed06d3c96c68b07ceb2340baa71cb5c418'
    }
    const response = await PostReq('/dev/ethreg/set-claim', body);
    ExpectRespError(response, HttpStatus.OK);
  });

  test('/dev/ethreg/get-claim', async () => {
    const body = {
      idIssuer: 0,
      idSubject: 1, 
      contract: DEPLOY_CONTRACT_ADDRESS ,
      keyHex: '0xFAA0B4B8BA99B7625152350AE2B38F9BAA06567E5D321B00FE32DB3B6DB1553B',
    }
    const response = await PostReq('/dev/ethreg/get-claim', body);
    ExpectRespError(response, HttpStatus.OK);
  });

});
