import { Controller, Get, Post, Request, Response, Param, Next, HttpException, HttpStatus, Body, Patch, Delete, RequestMapping } from '@nestjs/common';
import { UsersDTO } from './users.dto';
import { OrgsDTO } from './orgs.dto';
import { DidDTO } from './did.dto';
import { EthDTO } from '../dev/eth.dto';
import { UsersEthDTO, OrgsEthDTO, DidEthDTO } from './usersEth.dto'
import { UserInfoentity } from './certtest.entity';
import { DidInfoentity } from './certtest.entity';
import { OrgInfoentity } from './certtest.entity';
import { UserinfoService } from './certtest.service'
import { Repository } from 'typeorm';
import { GetHdProvider } from '../dev/eth.common';
var config = require('../../config/config');
const fs = require('fs');
var bigi = require('bigi');
const createaddr = require('bitcoinjs-lib')
const util = require('ethereumjs-util');
const createdid: any = require('../../../cert-common/src/keytool');
const CertContract: any = require("cert-contract");
const CONFIG_FILE = 'config/setting.js'
const createjws: any = require('../../../cert-api/src/sign');
@Controller('certtest')

export class InitialController {
  constructor(private readonly UserInfoservice: UserinfoService) { }
  /*  @Get()
  root() {
    return this.UserInfoservice.getUsers();
  }*/


  @Post("contract-deploy")
  async contractRegistryDeploy(@Body() body: EthDTO, @Response() res: any) {
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

  @Get("get-certDB-addr")
  getCertDBAddr(@Request() req, @Response() res) {
    interface MyObj {
      CertDBContract: string;
    }
    // let obj:MyObj;//={CertDBContract:"0x00"}
    fs.readFile(CONFIG_FILE, function (err, data) {
      if (err) {
        return console.error(err);
      }
      let obj = JSON.parse(data.toString());
      console.log("get-certDB-addr  = " + obj.CertDBContract);
      res.status(HttpStatus.OK).json(obj.CertDBContract);
    });
  }

  @Post("createuser")
  public async createuser(@Response() res, @Body() body: any) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: ' entity is required!' });
    }
    var obj = {
      "mnemonic": "",
      "public": "",
      "address": "",
      "result2": "",
    }
    const mnemonic = createdid.GenerateMnemonic(true);
    const path = config.path;
    const type = "secp256r1";
    const result2 = createdid.CreateTcEduNchcV0DIDoc(mnemonic, body.path, type);
    obj.mnemonic = mnemonic;
    obj.public = result2.publicKey[0].publicKeyHex;
    obj.result2 = result2;
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

        let tx = callCert.setdidrecord(body.userID, result2.id, result2.context, { from: addressIssuer });

        return tx
      })

      .then(txSetClaim => {
        let r = {
          req: body,
          addressIssuer,
          txId: txSetClaim.tx

        };
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

    let callCert2 = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert2 = c;

        let tx2 = callCert2.setpublickey1(body.userID, result2.publicKey[0].id, result2.publicKey[0].type, result2.publicKey[0].owner, result2.publicKey[0].publicKeyHex, { from: addressIssuer });
        return tx2
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

    let callCert3 = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert3 = c;

        let tx3 = callCert3.setpublickey2(body.userID, result2.publicKey[1].id, result2.publicKey[1].type, result2.publicKey[1].owner, result2.publicKey[1].publicKeyHex, { from: addressIssuer });
        return tx3
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
    let callCert4 = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert4 = c;

        let tx4 = callCert4.setpublickey3(body.userID, result2.publicKey[2].id, result2.publicKey[2].type, result2.publicKey[2].owner, result2.publicKey[2].publicKeyHex, { from: addressIssuer });
        return tx4
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

    var fullpublickey = createjws.pubxtofull(result2.publicKey[2].publicKeyHex);
    var upk_buf = new Buffer(fullpublickey, 'hex');
    var addr_buf = util.pubToAddress(upk_buf.slice(1, 65), true);
    var addr = addr_buf.toString('hex');
    obj.address = "0x" + addr;



    let callCert5 = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert5 = c;

        let tx5 = callCert5.setUserAddr(body.userID, obj.address, { from: addressIssuer });
        return tx5
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



  @Post("create-did")
  public async createdid(@Response() res, @Body() body: any) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: ' entity is required!' });
    }
    const mnemonic = createdid.GenerateMnemonic(true);
    //console.log("mnemonic = ",mnemonic);
    //const mnemonic = "雛 張 壞 施 防 勵 鋼 廣 伸 弟 插 酒";
    const path = config.path;
    const type = "secp256r1";
    const result2 = createdid.CreateTcEduNchcV0DIDoc(mnemonic, path, type);

    result2.service[0] = mnemonic
    console.log(result2.context);
    res.status(HttpStatus.OK).json(result2);
  }


  @Post("insert-user")
  public async insertUsers(@Response() res, @Body() body: UsersEthDTO) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }

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
    let callCert3 = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert3 = c;
        let tx3 = callCert3.addDistinctClass(body.userInfo.orgID, body.userInfo.classID, { from: addressIssuer });
        return tx3
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

    //only insert student
    if (body.userInfo.role == 3) {
      let callCert2 = null;
      await certDBContract
        .at(contract)
        .then(c => {
          callCert2 = c;
          let org_class = String(body.userInfo.orgID + "@" + body.userInfo.classID);
          let tx2 = callCert2.addStudentBySchoolClass(org_class, body.userInfo.userID, { from: addressIssuer });
          return tx2
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

    }

    let callCert = null;
    await certDBContract
      .at(contract)
      .then(c => {
        callCert = c;

        let tx = callCert.setUserInfo(body.userInfo.userID, body.userInfo.orgID, body.userInfo.classID, body.userInfo.role, body.userInfo.studentID, body.userInfo.name, { from: addressIssuer });

        // let result = callCert.getUserInfo( body.userInfo.userID);
        //console.log("+++++"+result[0]);
        return tx
      })
      .then(txSetClaim => {
        let r = {
          req: body,
          addressIssuer,
          // addressSubject,            
          /* orgID:getUserInfoResult[0],
           classID:getUserInfoResult[1],
           role:getUserInfoResult[2],
           userAddr:getUserInfoResult[3]*/
          txId: txSetClaim.tx

        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }


  @Post('certfind')
  public async certfind(@Body() body: any, @Response() res: any) {

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

        return callCert.getusercert(body.useraddr, { from: addressIssuer });
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          userinfo: entry
        };
        res.status(HttpStatus.OK).json(r);
        console.log("++++++++" + r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }

  @Post('didfind')
  public async didfind(@Body() body: DidEthDTO, @Response() res: any) {
    //var users = await this.UserInfoservice.findOne(params.id);
    //return res.status(HttpStatus.OK).json(users);
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

        return callCert.getdidrecord(body.didInfo.userID, { from: addressIssuer });
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          didinfo: entry
        };
        res.status(HttpStatus.OK).json(r);
        console.log("++++++++" + r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }

  @Post('didpub')
  public async didpubfind(@Body() body: DidEthDTO, @Response() res: any) {
    //var users = await this.UserInfoservice.findOne(params.id);
    //return res.status(HttpStatus.OK).json(users);
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

        return callCert.getpublickey1(body.didInfo.userID, { from: addressIssuer });
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          didinfo: entry
        };
        res.status(HttpStatus.OK).json(r);
        console.log("++++++++" + r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }



  @Post('userinfo')
  public async userinfofind(@Body() body: UsersEthDTO, @Response() res: any) {
    //var users = await this.UserInfoservice.findOne(params.id);
    //return res.status(HttpStatus.OK).json(users);
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
        //let tx = await claimsReg.setClaim(accounts[1], keyhex, valhex, {from: accounts[2]})
        return callCert.getUserInfo(body.userInfo.userID);
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          userinfo: entry
        };
        res.status(HttpStatus.OK).json(r);
        console.log("++++++++" + r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }
  /* @Get('insertaddress/:userID')
   public async insertaddress( @Param() params , @Response() res: any ){
     var users = await this.UserInfoservice.findOne(params.id);
     users.address="123123";
     users = await this.UserInfoservice.save(users);
     return res.status(HttpStatus.OK).json(users);
   }*/

   @Post('get-org_info')
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
         //let tx = await claimsReg.setClaim(accounts[1], keyhex, valhex, {from: accounts[2]})
         return callCert.getOrgInfo(body.orgID);
       })
       .then(entry => {
         let r = {
           req: body,
           contract,
           addressIssuer,
           addressSubject,
           orgID: entry
         };
         res.status(HttpStatus.OK).json(entry);
         console.log("++++++++" + entry);
       })
       .catch(err => {
         // console.log(err);
         throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
       });
 

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
    //const addressSubject = hdProviderSubject.address;
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
        let tx = callCert.setOrgInfo(body.orgInfo.orgID, body.orgInfo.orgName, body.orgInfo.contract, { from: addressIssuer });

        // let result = callCert.getUserInfo( body.userInfo.userID);
        //console.log("+++++"+result[0]);
        return tx
      })

      .then(txSetClaim => {
        let r = {
          req: body,
          addressIssuer,
          // addressSubject,            
          /* orgID:getUserInfoResult[0],
           classID:getUserInfoResult[1],
           role:getUserInfoResult[2],
           userAddr:getUserInfoResult[3]*/
          txId: txSetClaim.tx

        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
    //const result = await this.UserInfoservice.createOrg(body);      
    //return res.status(HttpStatus.CREATED).json({result, req: body});
  }

  @Post('create-contract')
  public async createOrgContract(@Body() body: EthDTO, @Response() res: any) {
    // 測試時使用 idAccount:0 
    const hdProviderAccount = GetHdProvider(body.idAccount, body.providerUrl);

    const certMainContract = CertContract.getCertContract();
    certMainContract.setProvider(hdProviderAccount);
    certMainContract.defaults({ from: hdProviderAccount.address });

    let instance = await certMainContract.new();
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

    /*var users = await this.UserInfoservice.findOrg(params.orgID);
    users.contract="123123";
    users = await this.UserInfoservice.saveOrg(users);
    return res.status(HttpStatus.OK).json(users);*/
  }


}