import { Get, Post, Body , Response, Request, HttpStatus, Controller } from '@nestjs/common';
import { QueryDTO } from './bob.query.dto';
const certCommon: any = require('cert-common') ;

@Controller('dev/did')
export class DidController {
  // http://api_prefix/dev/did
  @Get()
  root() {
    const message = 'Hello Api : ' + new Date();
    const time = new Date();
    return { message, time };
  }

  @Post("mnemonic")
  getMnemonic(@Body() body: any, @Response() res: any) {
    const m = certCommon.keytool.GenerateMnemonic(body.chinese);
    const r = {
      mnemonic: m , 
      req: body
    };
    res.status(HttpStatus.OK).json(r);
  }

}
