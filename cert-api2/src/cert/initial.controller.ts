import { Controller, Get, Post, Request, Response, Param, Next, HttpException, HttpStatus, Body, Patch, Delete, RequestMapping } from '@nestjs/common';
import { EthDTO } from '../dev/eth.dto';
import { UsersEthDTO, OrgsEthDTO, DidEthDTO } from './usersEth.dto'
import { GetHdProvider } from '../dev/eth.common';
const crypto = require('crypto');
var config = require('../../config/config');
const fs = require('fs');
var bigi = require('bigi');
const createaddr = require('bitcoinjs-lib');
const certCommon: any = require('cert-common');
const util = require('ethereumjs-util');
const CertContract: any = require("cert-contract");
const CONFIG_FILE = 'config/setting.js'
//const createjws: any = require('../sign');
@Controller('cert')

export class InitialController {


  @Post("contract-deploy")
  async contractRegistryDeploy(@Body() body: EthDTO, @Response() res: any) {
    // 測試時使用 idAccount:0 
    const hdProviderAccount = GetHdProvider(body.idAccount, body.providerUrl);

    const certDBContract = CertContract.getCertDBContract();
    certDBContract.setProvider(hdProviderAccount);
    certDBContract.defaults({ from: hdProviderAccount.address });

    let instance = await certDBContract.new();

    console.log("deploy certDB Contract")
    var data = fs.readFileSync(CONFIG_FILE).toString();
    data = JSON.parse(data);
    data["CertDBContract"] = instance.address;
    var buf = Buffer.from(JSON.stringify(data));
    fs.writeFileSync(CONFIG_FILE,buf)

    // var json = { "CertDBContract": instance.address }
    // console.log("deploy certDB Contract")
    // fs.writeFile(CONFIG_FILE, JSON.stringify(json), function (err) {
    //   if (err) {
    //     return console.error(err);
    //   }
    //   console.log("File created!");
    // });

    if (instance && instance.address) {
      return res.status(HttpStatus.OK).json({
        address: instance.address,
        req: body
      });
    } else {
      throw new HttpException("Deployment Contract Error: ", HttpStatus.BAD_REQUEST);
    }
  }
//createuser
  @Post("create-user")
  public async createuser(@Response() res, @Body() body: any) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: ' entity is required!' });
    }
    //res.status(HttpStatus.BAD_REQUEST);
    var obj = {
     // "mnemonic": "",
      "publickey": "",
      "address": "",
      "result2": "",
    }
    //const mnemonic = certCommon.keytool.GenerateMnemonic(true);
    //const type = "secp256r1";
    //const result2 = certCommon.keytool.CreateTcEduNchcV0DIDoc(mnemonic, body.path, type);
    //obj.mnemonic = mnemonic;
    obj.publickey = body.result2.publicKey[0].publicKeyHex;
    obj.result2 = body.result2;
    const certDBContract = CertContract.getCertDBContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    certDBContract.setProvider(hdProviderIssuer);

    const contract = body.contract
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;
    var fullpublickey = certCommon.sign.pubxtofull(body.result2.publicKey[1].publicKeyHex);
    var upk_buf = new Buffer(fullpublickey, 'hex');
    var addr_buf = util.pubToAddress(upk_buf.slice(1, 65), true);
    var addr = addr_buf.toString('hex');
    obj.address = "0x" + addr;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert = c;
        body.userID, body.result2.id, body.result2.context
        let tx = callCert.setDidInfo(body.userID, body.result2.context, body.result2.id, body.result2.publicKey[0].id, body.result2.publicKey[0].type, body.result2.publicKey[0].owner, body.result2.publicKey[0].publicKeyHex, 1, obj.address, { from: addressIssuer });
        return tx
      })

      .then(txSetClaim => {
        let r = {
          req: body,
          addressIssuer

        };

      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

    res.status(HttpStatus.OK).json(obj)
  }


  @Post("insert-user")
  public async insertUsers(@Response() res, @Body() body: UsersEthDTO) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }
    // res.status(HttpStatus.BAD_REQUEST);
    // call smart contract
    const certDBContract = CertContract.getCertDBContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    //const addressSubject = hdProviderSubject.address;
    certDBContract.setProvider(hdProviderIssuer);

    const contract = body.contract
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    //--------------add distinct class & student list

    let callCert = null;
    await certDBContract
      .at(contract)
      .then(c => {
        callCert = c;

        //let org_class = String(body.userInfo.orgID + "@" + body.userInfo.classID);
        let tx = callCert.insertUser(body.userInfo.userID, body.userInfo.orgID, body.userInfo.classID, body.userInfo.role, body.userInfo.studentID, body.userInfo.name, { from: addressIssuer });

        return tx
      })
      .then(txSetClaim => {
        let r = {
          req: body,
          addressIssuer,
          txId: txSetClaim.tx

        };

        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {

        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }

  @Post('get-user-certid')
  public async certfind(@Body() body: any, @Response() res: any) {
    console.log("body = ",body)
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }

    // call smart contract
    const certDBContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certDBContract.setProvider(hdProviderIssuer);

    const contract = body.contractname
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;
    await certDBContract
      .at(contract)
      .then(c => {
        callCert = c;

        return callCert.getUserCert(body.useraddr, { from: addressIssuer });
      })
      .then(entry => {
        console.log("student cert = ",entry);
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          userinfo: entry
        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }

//get-userinfo
  @Post('get-user-info')
  public async userinfofind(@Body() body: UsersEthDTO, @Response() res: any) {

    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }

    // call smart contract
    const certDBContract = CertContract.getCertDBContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certDBContract.setProvider(hdProviderIssuer);

    const contract = body.contract
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;
    await certDBContract
      .at(contract)
      .then(c => {
        callCert = c;

        return callCert.getUserInfo(body.userInfo.userID);
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          userinfo_in_sc: entry
        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }


  @Post('get-org-info')
  public async get_Org_Info(@Response() res, @Body() body: any) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }
    const certDBContract = CertContract.getCertDBContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certDBContract.setProvider(hdProviderIssuer);

    const contract = body.contract
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;
    await certDBContract
      .at(contract)
      .then(c => {
        callCert = c;        
        return callCert.getOrgInfo(body.orgID);
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          orginfo_in_sc: entry
        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {

        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });


  }

  @Post("encrypt-pdf")
  async encrypt_pdf(@Body() body: any, @Response() res: any) {
    // 測試時使用 idAccount:0 
    var data = fs.readFileSync(body.certfile_path);
    var iv = new Buffer(16);
    iv.fill("nchcnchcyeh");
    let key = '1234567891234567';
    
    let data_encrypt = certCommon.keytool.aesEncryptNew(data, key, iv);
    fs.writeFile(body.certfile_path, new Buffer(data_encrypt, 'hex'), function (err) {
      if (err) throw err;
    });
    res.status(HttpStatus.OK).json("encrypted");

  }

  @Post("decrypt-pdf")
  async decrypt_pdf(@Body() body: any, @Response() res: any) {
    // 測試時使用 idAccount:0 
    var data = fs.readFileSync(body.certfile_path);
    var iv = new Buffer(16);
    iv.fill("nchcnchcyeh");
    let key = '1234567891234567';
    let deHex = certCommon.keytool.aesDecryptNew(data, key, iv);
    fs.writeFileSync(body.certfile_path, new Buffer(deHex, 'hex'));
    res.status(HttpStatus.OK).json("decrypted");

  }

  @Post('insert-org')
  public async insertOrgIntoDB(@Response() res, @Body() body: OrgsEthDTO) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }

    // call smart contract
    const certDBContract = CertContract.getCertDBContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    certDBContract.setProvider(hdProviderIssuer);

    const contract = body.contract
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert = c;
        let tx = callCert.setOrgInfo(body.orgInfo.orgID, body.orgInfo.orgIDOri, body.orgInfo.orgName, body.orgInfo.contract, { from: addressIssuer });

        return tx
      })

      .then(txSetClaim => {
        let r = {
          req: body,
          addressIssuer,

          txId: txSetClaim.tx

        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }



}