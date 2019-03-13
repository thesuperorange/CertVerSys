import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';

describe('Test API', () => {
  
  test('/util, It should response the GET method', async () => {
      const response = await GetReq('/util');
      ExpectRespError(response, HttpStatus.OK);
  });

  test('/util/version', async () => {
      const response = await GetReq('/util/version');
      ExpectRespError(response, HttpStatus.OK);
  });
});
