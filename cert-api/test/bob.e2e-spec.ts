import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';

describe('Bob API', () => {
  
  test('/dev/bob, It should response the GET method', async () => {
      const response = await GetReq('/dev/bob');
      ExpectRespError(response, HttpStatus.OK);
  });

  test('/dev/bob/address ', async () => {
    const body = {
        id: 0,
        type: "SYSTEM"
      }
      const response = await PostReq('/dev/bob/address', body);
      ExpectRespError(response, HttpStatus.OK);
      expect(response.body.address).toBe('12qbPpjGogvzos7eDJkXqSy34T2KoUWZcm');
  });

});
