import { Controller, Get, Post, Request, Response, Param, Next, HttpException, HttpStatus, Body, Patch, Delete, RequestMapping } from '@nestjs/common';
import { InputCertInfoDTO } from './certInfo.dto';
import { EthDTO } from '../dev/eth.dto';
import { GetHdProvider } from '../dev/eth.common';
import { UsersEthDTO, OrgsEthDTO } from './usersEth.dto'
const certCommon: any = require('cert-common');
const md5 = require('js-md5');
//var xor = require('base64-xor');
const fs: any = require('fs');
const CertContract: any = require("cert-contract");
const randomString = () =>
  Math.random()
    .toString(34)
    .substring(5, 15);

@Controller('cert/issue')
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

    if (instance && instance.address) {
      return res.status(HttpStatus.OK).json({
        address: instance.address,
        req: body
      });
    } else {
      throw new HttpException("Deployment Contract Error: ", HttpStatus.BAD_REQUEST);
    }
  }

  @Post('get-class-list')
  async getClassListBySchool(@Body() body: any, @Response() res: any) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }

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
          class_list_str_arr[i] = certCommon.ethtool.bytes32toStr(String(r.class_list[i]));
        }

        res.status(HttpStatus.OK).json(class_list_str_arr);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });


  }

  //!!!!!!!!!!!!!!!!!!MERGE to ISSUE!!!!!!!!!!!!
  /*@Post('set-userid-into-cert2')
  async set_userid_into_cert2(@Body() body: any, @Response() res: any) {
    const certDBContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    certDBContract.setProvider(hdProviderIssuer);

    const contract = body.contractname;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;
    console.log(body);
    await certDBContract
      .at(contract)
      .then(c => {
        callCert = c;

        let tx = callCert.pushuserid(body.certid, body.userid, { from: addressIssuer, gas: 3000000 });

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

    res.status(HttpStatus.OK).json(true);

  }*/

  @Post('get-teacher-list')
  async getTeacherListByOrg(@Body() body: any, @Response() res: any) {

    // let org_class = String(body.orgID + "@" + body.classID);
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
        return callCert.getTeacherList(body.orgID);
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          teacherlist: entry
        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
  }

  @Post('get-student-list')
  async getStudentListByClass(@Body() body: any, @Response() res: any) {

    // let org_class = String(body.orgID + "@" + body.classID);
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
        return callCert.getStudentList(body.orgID, body.classID);
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

  // 沒用到
  // @Post('get-contract')
  // async getContractByOrg(@Body() body: OrgsEthDTO, @Response() res: any) {
  //   if (!body) {
  //     return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
  //   }

  //   // call smart contract
  //   const certDBContract = CertContract.getCertDBContract();
  //   const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
  //   const addressIssuer = hdProviderIssuer.address;
  //   const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
  //   const addressSubject = hdProviderSubject.address;
  //   certDBContract.setProvider(hdProviderIssuer);

  //   const contract = body.contract
  //   if (!contract) {
  //     throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
  //   }
  //   let callCert = null;
  //   await certDBContract
  //     .at(contract)
  //     .then(c => {
  //       callCert = c;
  //       return callCert.getContractAddress(body.orgInfo.orgID);
  //     })
  //     .then(entry => {
  //       let r = {
  //         req: body,
  //         contract,
  //         addressIssuer,
  //         addressSubject,
  //         org_contract: entry
  //       };
  //       res.status(HttpStatus.OK).json(r);
  //     })
  //     .catch(err => {
  //       throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
  //     });
  // }


  @Post()
  async issue(@Body() body: InputCertInfoDTO, @Response() res: any) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }
    //res.status(HttpStatus.BAD_REQUEST);
    var CertIDList: string[];
    CertIDList = [];
    var cert_hash: string[];
    cert_hash = [];
    var json_hash: string[];
    json_hash = [];
    //var objList: string[];
    //objList = [];

    var IPFShashList = [];
    //TODO: random generate certID//
    var rn = require('random-number');
    var options = {
      min: 10000000
      , max: 99999999
      , integer: true
    }
    var issueid = rn(options);

    //must fill  version, certName, revocation, description, timestamp, issuer, owner, signer, contract
    //TODO: create json, save json to local, save pdf to local
    for (let a = 0; a < body.owners.length; a++) {
      var certid = body.ownerToCertID[body.owners[a]];
      var IPFShash = body.ownerToHash[body.owners[a]];
      var certhash = body.certHashList[body.owners[a]];
      
      //var certhash = certhash;
      var obj = {
        "certID": certid,
        "owner_addr": body.owners[a],
        "issuer_addr": body.issuer,
        "signer": [],
        "org_contract": body.contract,
        "version": body.version,
        "cert_name": body.certName,
        "revocation": false,
        "description": body.description,
        "timestamp": body.timestamp,
        "certhash": certhash,
        "ipfshash": IPFShash,
        "cert": "",
        "qrcode": ""
      }
      for (var i = 1; i <= body.signer.length; i++) {
        obj.signer.push({
          "address": body.signer[i - 1],
          "signature": "null"
        });
      };

      // let msgraw = JSON.stringify(obj);
      // var iv = new Buffer(32);
      // var v2 = Buffer.from(msgraw, 'utf8');
      // var v3 = v2.toString('hex');
      // var adpatch = Buffer.from('-', 'utf8');
      // var patch = adpatch.toString('hex');
      // if (v3.length % 32 != 0) {
      //   v3 += patch;
      // }

      const jsonpath = './json/' + body.owners[a] + certid + '.json';

      fs.writeFile(jsonpath, JSON.stringify(obj), function (err) {
        if (err) {
          return console.error(err);
        }
        console.log("File created!");
      });
      //TODO: compute hash1 by json
      const jsonhash = md5(JSON.stringify(obj));
      //console.log("certhash", certhash);
      //objList.push(v3);
      CertIDList.push(certid);
      cert_hash.push(certhash);
      json_hash.push(jsonhash);
      var hashArray = [];
      console.log(IPFShash);
      for (var i = 0; i < IPFShash.length; i++) {
        hashArray.push(IPFShash.charCodeAt(i))
      }
      IPFShashList.push(hashArray);
    }
    //TODO: init sc Record[certID]{version, cert_name, revocation, description, timestamp, owner_addr,signer_addr, hash1}

    const certContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certContract.setProvider(hdProviderIssuer);
    const contract = body.contract;

    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    //var callCert = null;

    const cert = await certContract.at(contract)

    let issueResult1 = await cert.issueCommon(issueid, CertIDList,  body.issuer, body.signer, body.signerID, body.certName, body.description, body.timestamp, { from: addressIssuer, gas: 3000000 });
    let issueResult2 = await cert.issueDetail(issueid, CertIDList, body.userID, body.owners, cert_hash, json_hash, body.signer, IPFShashList, { from: addressIssuer, gas: 3000000 });
    let responseData = {
      txId: [issueResult1.tx, issueResult2.tx],
      blockID: [issueResult1.receipt.blockNumber, issueResult2.receipt.blockNumber],
      issueID: issueid,
    };
    //var addIpfs = await cert.addIpfsHash(CertIDList[0], IPFShashList[CertIDList[0]], { from: addressIssuer, gas: 3000000 })
    
    res.status(HttpStatus.OK).json(responseData);

  }
}