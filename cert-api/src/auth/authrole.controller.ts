import {Controller,Post,HttpStatus,HttpCode,Get,Request,Response,Body,Query,Param,UseGuards,Next,HttpException,Patch,Delete,RequestMapping} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { UsersDTO } from '../certtest/users.dto';
import { OrgsDTO } from '../certtest/orgs.dto';
import { DidDTO } from '../certtest/did.dto';
import { EthDTO } from '../dev/eth.dto';
import { UsersEthDTO, OrgsEthDTO, DidEthDTO } from '../certtest/usersEth.dto'
import { UserInfoentity } from '../certtest/certtest.entity';
import { DidInfoentity } from '../certtest/certtest.entity';
import { OrgInfoentity } from '../certtest/certtest.entity';
import { UserinfoService } from '../certtest/certtest.service'
import { Repository } from 'typeorm';
import { GetHdProvider } from '../dev/eth.common';
const _: any = require('lodash');
const createdid: any = require('../../../cert-common/src/keytool');
var config = require('../../config/config');
const fs = require('fs');
var bigi = require('bigi');
const createaddr = require('bitcoinjs-lib')
const util = require('ethereumjs-util');
const CertContract: any = require("cert-contract");
const CONFIG_FILE = 'config/setting.js'
const createjws: any = require('../../../cert-api/src/sign');


@Controller('authrole')
@UseGuards(RolesGuard)
export class AuthRoleController {
  
  
  @Get('user')
  @Roles('USER')
  getUser(@Request() req: any) {
    const mnemonic = createdid.GenerateMnemonic(true);
      //console.log("mnemonic = ",mnemonic);
      //const mnemonic = "雛 張 壞 施 防 勵 鋼 廣 伸 弟 插 酒";
      const path = config.path;
      const type = "secp256r1";
      const result2 = createdid.CreateTcEduNchcV0DIDoc(mnemonic, path,type);
    return {  user : req.user , time :  new Date() , did:result2};
  }

  @Get('teacher')
  @Roles('TEACHER')
  getTeacher(@Request() req: any) {
    return {  user : req.user , time :  new Date() };
  }

  @Get('student')
  @Roles('STUDENT')
  getStudent(@Request() req: any) {
    return {  user : req.user , time :  new Date() };
  }


  @Post("contract-deploy")
  @Roles('STUDENT')
  async contractRegistryDeploy(@Body() body: any, @Response() res: any) {
    // 測試時使用 idAccount:0 
    const hdProviderAccount = GetHdProvider(body.idAccount, body.providerUrl);

    const certDBContract = CertContract.getCertDBContract();
    certDBContract.setProvider(hdProviderAccount);
    certDBContract.defaults({ from: hdProviderAccount.address });

    let instance = await certDBContract.new();

    var json = { "CertDBContract": instance.address }
    fs.writeFile(CONFIG_FILE, JSON.stringify(json), function (err) {
      if (err) {
        return console.error(err);
      }
      console.log("File created!");
    });


    //   address: instance.address,
    //  transactionHash: instance.transactionHash
    if (instance && instance.address) {
      return res.status(HttpStatus.OK).json({
        address: instance.address,
        req: body
      });
    } else {
      throw new HttpException("Deployment Contract Error: ", HttpStatus.BAD_REQUEST);
    }
  }

}
