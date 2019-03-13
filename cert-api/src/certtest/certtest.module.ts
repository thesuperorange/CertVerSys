import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import {InitialController} from './initial.controller'
import {IssueController} from './issue.controller'
import {SignController} from './sign.controller'
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInfoentity } from './certtest.entity';
import { UserinfoService } from './certtest.service';
import { OrgInfoentity } from './certtest.entity';

@Module({
    controllers: [UsersController, InitialController, IssueController, SignController],
    imports: [TypeOrmModule.forFeature([UserInfoentity]),TypeOrmModule.forFeature([OrgInfoentity])],
    components: [UserinfoService]


})

export class CerttestModule {}
