import { Get, Controller } from '@nestjs/common';

@Controller('util')
export class UtilController {
  // http://api_prefix/util
  @Get()
  root() {
    const message = 'Hello util Api : ' + new Date();
    const time = new Date();
    return { message, time };
  }

  // /util/version
  @Get('version')
  version() {
    const version = process.env.VERSION || '0.0.19';
    return { version };
  }
}
