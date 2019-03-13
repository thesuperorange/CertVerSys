import { Get, Controller } from '@nestjs/common';

@Controller('datasrc/ipfs')
export class DsIpfsController {
  // localhost:3000/alpha1/datasrc/ipfs
  @Get()
  root() {
    const message = 'Hello Cert Api : ' + new Date();
    const time = new Date();
    return { message, time };
  }
}
