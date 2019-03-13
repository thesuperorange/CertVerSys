import { Get, Post, Body , Response, Request, HttpStatus, Controller } from '@nestjs/common';
import { QueryDTO } from './bob.query.dto';
import { EthregContractEntity } from './ethreg.contract.entity';
import { EthregContractService } from './ethreg.contract.service';

@Controller('dev/ethreg-contract')
export class EthRegContractController {

  constructor( private readonly ethregContractService: EthregContractService) {}

  @Get()
  root() {
    return this.ethregContractService.getContracts();
  }


  @Post()
  public async createContract(@Response() res, @Body() body: EthregContractEntity)
  {
      if (!body && !body.address && !body.deployAccount) {
          return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
      }
      const result = await this.ethregContractService.createContract(body);
      //console.log(body)
      return res.status(HttpStatus.CREATED).json({result, req: body});
  }

}
