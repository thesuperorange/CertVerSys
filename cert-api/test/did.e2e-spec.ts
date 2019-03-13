import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';

describe('Did API', () => {
  
  test('/dev/did, It should response the GET method', async () => {
      const response = await GetReq('/dev/did');
      ExpectRespError(response, HttpStatus.OK);
  });

  test('/dev/did/mnemonic ', async () => {
    const body = {
        chinese: true,
      }
      const response = await PostReq('/dev/did/mnemonic', body);
      ExpectRespError(response, HttpStatus.OK);
      // test "停 憶 校 集 下 鈴 退 隱 適 帶 支 煤"?
      // chinese_traditional length 12+11(space)
      expect(response.body.mnemonic).toHaveLength(12+11);
  });

});
