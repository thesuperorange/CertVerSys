import {
  Get,
  Post,
  Controller,
  Request,
  Response,
  Body,
  ForbiddenException,
  HttpStatus,
  HttpException,
  UseGuards
} from "@nestjs/common";

import { ClaimDTO } from './claim.dto';
import { EthDTO } from './eth.dto';
import { GetHdProvider } from './eth.common';


//const CertCommon: any = require("cert-common");
//const Web3: any = CertCommon.Web3;

const HDWalletProvider: any = require("truffle-hdwallet-provider");
const CertContract: any = require("cert-contract");

@Controller('dev/ethreg')
export class EthRegController {
  // http://api_prefix/dev/ethreg
  @Get()
  root() {
    const message = 'Hello Api : ' + new Date();
    const time = new Date();
    return { message, time };
  }

  @Post("contract-deploy")
  async contractRegistryDeploy( @Body() body: EthDTO, @Response() res: any) {
    // 測試時使用 idAccount:0 
    const hdProviderAccount = GetHdProvider(body.idAccount, body.providerUrl);

    const registryContract = CertContract.getRegistryContract();
    registryContract.setProvider(hdProviderAccount);
    registryContract.defaults({ from: hdProviderAccount.address });
    
    let instance = await registryContract.new();
    //   address: instance.address,
    //  transactionHash: instance.transactionHash
    if( instance && instance.address){
      return res.status(HttpStatus.OK).json({
        address: instance.address,
        req: body
      });
    }else{
      throw new HttpException( "Deployment Contract Error: ", HttpStatus.BAD_REQUEST);
    }  
  }
  
  
  @Post("get-claim")
  async getClaim(@Body() body: ClaimDTO, @Response() res: any) {
    const registryContract = CertContract.getRegistryContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider( body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    registryContract.setProvider(hdProviderIssuer);

    const contract = body.contract
    if(!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let claimReg = null;

    await registryContract
      .at(contract)
      .then(c => {
        claimReg = c;
        return claimReg.getClaim(addressIssuer, addressSubject, body.keyHex);
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          claimHex: entry
        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException( err.toString(), HttpStatus.BAD_REQUEST);
      });
  }

  @Post("set-claim")
  async setClaim(@Body() body: ClaimDTO, @Response() res: any) {
    const registryContract = CertContract.getRegistryContract();
    const hdProviderIssuer = GetHdProvider( body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider( body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    registryContract.setProvider(hdProviderIssuer);
    const contract = body.contract
    if(!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let claimReg = null;

    await registryContract
      .at(contract)
      .then(c => {
        claimReg = c;
        //let tx = await claimsReg.setClaim(accounts[1], keyhex, valhex, {from: accounts[2]})
        return claimReg.setClaim(addressSubject, body.keyHex, body.valueHex, { from: addressIssuer });
      })
      .then(txSetClaim => {
        let r = {
          req: body,
          addressIssuer,
          addressSubject,
          txId: txSetClaim.tx
        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException( err.toString(), HttpStatus.BAD_REQUEST);
      });
  }

}
