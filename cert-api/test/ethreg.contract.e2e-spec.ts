import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';
import { EthregContractEntity } from '../src/dev/ethreg.contract.entity';

describe('/dev/ethreg-contract API', () => {

  test('/dev/ethreg-contract', async () => {
    const response = await GetReq('/dev/ethreg-contract');
    ExpectRespError(response, HttpStatus.OK);
  });

  test('/dev/ethreg-contract, POST new contract, 201 created', async () => {
    const contract = new EthregContractEntity();
    contract.address = '0xad44a8ea9a9bb5ef66f041bb921a687331729eb4';
    contract.deployAccount = '0x1b2ae7ea68e81998c031122ea7aa6ed0c6975ee7';
    const response = await PostReq('/dev/ethreg-contract', contract);
    expect(response.statusCode).toBe(HttpStatus.CREATED);
    // console.log(response.body)
    expect(response.body.result.deployAccount).toBe('0x1b2ae7ea68e81998c031122ea7aa6ed0c6975ee7');
  });

});
