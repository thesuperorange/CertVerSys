import { Get, Controller } from '@nestjs/common';

@Controller('datasrc/swarm')
export class DsSwarmController {
  // localhost:3000/alpha1/datasrc/swarm
  @Get()
  root() {
    const message = 'Hello Cert Api : ' + new Date();
    const time = new Date();
    return { message, time };
  }
}
