import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';

describe('Block API', () => {
  test('/dev/ethreg/contract-deploy', async () => {
        const body = {
          idAccount: 0
        }
        const response = await PostReq('/dev/ethreg/contract-deploy', body);
        ExpectRespError(response, HttpStatus.OK);
        expect(response.body.address).toBeTruthy();
  });
  test('/ethereum/block/getlatestblock, It should response the GET method', async () => {
      const response = await GetReq('/ethereum/block/getlatestblock');
      ExpectRespError(response, HttpStatus.OK);
  });

  test('/ethereum/block/1 ', async () => {
      const response = await GetReq('/ethereum/block/1');
      ExpectRespError(response, HttpStatus.OK);
      expect(response.body.result2.number).toBe(1);
      
  });

});
