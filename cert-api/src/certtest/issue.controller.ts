import { Controller, Get, Post, Request, Response, Param, Next, HttpException, HttpStatus, Body, Patch, Delete, RequestMapping } from '@nestjs/common';
import { UsersDTO } from './users.dto';
import { InputCertInfoDTO } from './certInfo.dto';
import { EthDTO } from '../dev/eth.dto';
import { GetHdProvider } from '../dev/eth.common';
import { UsersEthDTO, OrgsEthDTO } from './usersEth.dto'

const md5 = require('js-md5');
var xor = require('base64-xor');
const fs: any = require('fs');
const CertContract: any = require("cert-contract");
const randomString = () =>
  Math.random()
    .toString(34)
    .substring(5, 15);


@Controller('certtest/issue')
export class IssueController {
  //private fs = require('fs');
  //------smart contract
  @Post("contract-deploy")
  async contractRegistryDeploy(@Body() body: EthDTO, @Response() res: any) {
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
  }
  @Post('set-class-list')
  async setClassListBySchool(@Body() body: any, @Response() res: any) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }
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

        let tx = callCert.addDistinctClass(body.orgID, body.classID, { from: addressIssuer });

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
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }

  @Post('get-class-list')
  async getClassListBySchool(@Body() body: any, @Response() res: any) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }

    /*const schoolID = body.userInfo.orgID;
    const classList =["classA","classB","classC"];
    res.status(HttpStatus.OK).json(classList)*/

    const schoolID = body.orgID;
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
        return callCert.getDistinctClass(schoolID);
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          class_list: entry
        };

        var class_list_str_arr = []
        for (var i = 0; i < r.class_list.length; i++) {
          class_list_str_arr[i] = Buffer.from(String(r.class_list[i]).substr(2), 'hex').toString('utf8').replace(/\0/g, '');
        }

        // var convert_to_string =String(r.class_list[1]);
        //  console.log("[DEBUG-getclass] "+convert_to_string)
        //  var decode = Buffer.from(convert_to_string.substr(2),'hex').toString('utf8').replace(/\0/g, '')
        res.status(HttpStatus.OK).json(class_list_str_arr);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });


  }

  public bytes32toStr(input) {
    return Buffer.from(input.substr(2), 'hex').toString('utf8').replace(/\0/g, '')
  }

  @Post('set-student-list')
  async setStudentList(@Body() body: any, @Response() res: any) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }
    let org_class = String(body.orgID + "@" + body.classID);
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

        let tx = callCert.addStudentBySchoolClass(org_class, body.userID, { from: addressIssuer });

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
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }

  @Post('get-student-list')
  async getStudentListByClass(@Body() body: any, @Response() res: any) {
    //select studentID from users where schoolID=xxx and classID=xxx

    /* const classID = users.classID;
      const schoolID = users.orgID;
      const studentID =["094090916","094100962","094100963"];
      res.status(HttpStatus.OK).json(studentID)*/

    let org_class = String(body.orgID + "@" + body.classID);
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
        return callCert.getStudentList(org_class);
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          studentlist: entry
        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
  }

  @Post('get-contract')
  async getContractByOrg(@Body() body: OrgsEthDTO, @Response() res: any) {
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
        return callCert.getContractAddress(body.orgInfo.orgID);
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          org_contract: entry
        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
  }

  @Post('get-address')
  async getAddressByUser(@Body() body: UsersEthDTO, @Response() res: any) {
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
        return callCert.getUserAddress(body.userInfo.userID);
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          address: entry
        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
  }

  @Post()
  async issue(@Body() body: InputCertInfoDTO, @Response() res: any) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }

    var CertIDList: string[];
    CertIDList = [];
    var cert_hash: string[];
    cert_hash = [];
    var json_hash: string[];
    json_hash = [];
    var objList: string[];
    objList = [];
    //TODO: random generate certID//
    var Issue_ID = "";
    var possible = "0123456789";
    for (var i = 0; i < 8; i++) {
      Issue_ID += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    var issueid = parseInt(Issue_ID);
    //must fill  version, certName, revocation, description, timestamp, issuer, owner, signer, contract
    //TODO: create json, save json to local, save pdf to local
    for (let a = 0; a < body.owners.length; a++) {
      var certid = body.ownerToCertID[body.owners[a]];
      //const certpath1 = './json/100.pdf';
      var certFilePath = './cert/' + body.owners[a] + certid + '.pdf';
      var data = fs.readFileSync(certFilePath);
      var base64_data =new Buffer(data).toString('base64');
      var certhash = md5(base64_data);
      var swarm_cert_data =base64_data.slice(0,1)+base64_data.slice(11);

      console.log("certhash = ", data);
      if (body.signer.length == 1) {
        var obj = {
          "certID": certid,
          "owner_addr": body.owners[a],
          "issuer_addr": body.issuer,
          "signer": [{
            "address": body.signer[0],
            "signature": null
          }],
          "org_contract": body.contract,
          "version": body.version,
          "cert_name": body.certName,
          "revocation": false,
          "description": body.description,
          "timestamp": body.timestamp,
          "certhash": certhash,
          "cert": "",
          "qrcode": ""
        }
      }
      if (body.signer.length == 2) {
        var obj = {
          "certID": certid,
          "owner_addr": body.owners[a],
          "issuer_addr": body.issuer,
          "signer": [{
            "address": body.signer[0],
            "signature": null
          }, {
            "address": body.signer[1],
            "signature": null
          }],
          "org_contract": body.contract,
          "version": body.version,
          "cert_name": body.certName,
          "revocation": false,
          "description": body.description,
          "timestamp": body.timestamp,
          "certhash": certhash,
          "cert": "",
          "qrcode": ""
        }
      }
      if (body.signer.length == 3) {
        var obj = {
          "certID": certid,
          "owner_addr": body.owners[a],
          "issuer_addr": body.issuer,
          "signer": [{
            "address": body.signer[0],
            "signature": null
          }, {
            "address": body.signer[1],
            "signature": null
          }, {
            "address": body.signer[2],
            "signature": null
          }],
          "org_contract": body.contract,
          "version": body.version,
          "cert_name": body.certName,
          "revocation": false,
          "description": body.description,
          "timestamp": body.timestamp,
          "certhash": certhash,
          "cert": "",
          "qrcode": ""
        }
      }
      //console.log(JSON.stringify(obj));
      let msgraw = JSON.stringify(obj);
      var iv = new Buffer(32);
      var v2 = Buffer.from(msgraw, 'utf8');
      var v3 = v2.toString('hex');
      var adpatch = Buffer.from('-', 'utf8');
      var patch = adpatch.toString('hex');
      if (v3.length % 32 != 0) {
        v3 += patch;
      }

      console.log("msssssgg", v3.length);

      const jsonpath = './json/' + body.owners[a] + certid + '.json';
      
      fs.writeFile(jsonpath, JSON.stringify(obj), function (err) {
        if (err) {
          return console.error(err);
        }
        console.log("File created!");
      });
      //TODO: compute hash1 by json
      const jsonhash = md5(JSON.stringify(obj));
      console.log("jsonhash", jsonhash);
      objList.push(v3);
      CertIDList.push(certid);
      cert_hash.push(certhash);
      json_hash.push(jsonhash);

    }

    //console.log(objList);
    //console.log(JSON.stringify(objList));

    //TODO: init sc Record[certID]{version, cert_name, revocation, description, timestamp, owner_addr,signer_addr, hash1}

    const certDBContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    //const addressSubject = hdProviderSubject.address;
    certDBContract.setProvider(hdProviderIssuer);

    const contract = body.contractname;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert = c;

        let tx = callCert.issue(CertIDList, body.owners, cert_hash, json_hash, body.issuer, body.signer, body.version, body.certName, body.description, body.timestamp, body.revocation, { from: addressIssuer, gas: 3000000 });

        return tx
      })

      .then(txSetClaim => {
        let r = {
          req: body,
          addressIssuer,
          txId: txSetClaim.tx

        };
        //res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
    let callCert2 = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert2 = c;

        let tx2 = callCert2.pushusercert(body.owners, CertIDList, { from: addressIssuer, gas: 3000000 });

        return tx2
      })

      .then(txSetClaim => {
        let r2 = {
          req: body,
          addressIssuer,
          txId: txSetClaim.tx

        };
        //res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

    let callCert3 = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert3 = c;
        //console.log(body.description);
        let tx3 = callCert3.setSignerList(body.issuer, issueid, CertIDList, body.certName, body.description, body.timestamp, { from: addressIssuer, gas: 3000000 });

        return tx3
      })

      .then(txSetClaim => {
        let r2 = {
          req: body,
          addressIssuer,
          tx3Id: txSetClaim.tx

        };


      })
      .catch(err => {
        // console.log(err);
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

    res.status(HttpStatus.OK).json(issueid);
  }
  //return certList  random generate, how to test?



}