import {
  Get,
  Post,
  Body,
  Query,
  Response,
  Request,
  HttpStatus,
  Controller,
} from '@nestjs/common';
import { QueryDTO } from './bob.query.dto';

function sleep(time = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

@Controller('dev/bob')
export class BobController {
  // http://api_prefix/dev/bob
  @Get()
  root() {
    const message = 'Hello util Api : ' + new Date();
    const time = new Date();
    return { message, time };
  }

  // http://localhost:3000/api/v1/dev/bob/blockreq?seconds=7
  // blocking request testonly
  @Get('blockreq')
  async blockreq(@Query() query, @Response() res: any) {
    const timeStart = new Date();
    const seconds = query.seconds ? parseInt(query.seconds) : 5;
    await sleep(seconds * 1000);
    const timeEnd = new Date();
    const r = { seconds, timeStart, timeEnd };
    res.status(HttpStatus.OK).json(r);
  }

  // http://api_prefix/dev/bob/address
  @Post('address')
  getAddress(@Body() body: QueryDTO, @Response() res: any) {
    const r = {
      address: '12qbPpjGogvzos7eDJkXqSy34T2KoUWZcm',
      req: body,
    };
    res.status(HttpStatus.OK).json(r);
  }
}
