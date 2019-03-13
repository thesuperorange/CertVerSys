import { Get, Controller } from '@nestjs/common';

@Controller('cert')
export class CertController {
  // localhost:3000/alpha1/cert
  @Get()
  root() {
    const message = 'Hello Cert Api : ' + new Date();
    const time = new Date();
    return { message, time };
  }
}
