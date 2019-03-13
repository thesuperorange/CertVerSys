import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {InitialController} from './cert/initial.controller';
import {IssueController} from './cert/issue.controller';
import {SignController} from  './cert/sign.controller';
import {AuthController} from './auth/auth.controller';
import {DsDbController} from './datasrc/data.controller';
@Module({
  imports: [],
  controllers: [AppController,InitialController,IssueController,SignController,AuthController,DsDbController],
  providers: [AppService],
})
export class AppModule {}
