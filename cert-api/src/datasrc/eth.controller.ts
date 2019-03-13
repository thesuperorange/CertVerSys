import { Get, Controller } from '@nestjs/common';

@Controller('datasrc/eth')
export class DsEthController {
  // localhost:3000/alpha1/datasrc/eth
  @Get()
  root() {
    const message = 'Hello Cert Api : ' + new Date();
    const time = new Date();
    return { message, time };
  }
}
