import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';

describe('/dev/ethreg sync API', () => {
  
  // http://140.110.141.7:8888/dadu3cert/dadu3cert-core/issues/50
  // jestjs - How to run Jest tests sequentially? - Stack Overflow https://stackoverflow.com/questions/32751695/how-to-run-jest-tests-sequentially
  // 

  test('/dev/ethreg/contract-deploy', async () => {
    const body = {
      idAccount: 0
    }
    const response = await PostReq('/dev/ethreg/contract-deploy', body);
    ExpectRespError(response, HttpStatus.OK);
    expect(response.body.address).toBeTruthy();
  });

});
