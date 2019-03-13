import { Controller, Get, Post, Request, Response, Param, Next, HttpException, HttpStatus, Body, Patch, Delete, RequestMapping } from '@nestjs/common';

import { InputCertInfoDTO } from './certInfo.dto';
import { EthDTO } from '../dev/eth.dto';
import { GetHdProvider } from '../dev/eth.common';
import { UsersEthDTO, OrgsEthDTO } from './usersEth.dto'

var watermark = require('image-watermark');
const certCommon: any = require('cert-common');
const CertContract: any = require("cert-contract");
const fs: any = require('fs');
const MD5 = require('crypto-js/md5');
const SHA256 = require('crypto-js/sha256');
const AES = require('crypto-js/aes');
var CryptoJS = require("crypto-js");

@Controller('cert/sign')
export class SignController {

  @Post('get-certinfo-bycertID')
  async getcertinfobycertid(@Body() body: InputCertInfoDTO, @Response() res: any) {
    if (!body) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }
    const certDBContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certDBContract.setProvider(hdProviderIssuer);
    var obj = {
      "revocation": "",
      "description": "",
      "timestamp": "",
      "version": "",
      "certname": "",
      "OwnerAddr": "",
      "CertHash": "",
      "JsonHash": "",
      "IssuerAddr": "",
      "SignerAddr": "",
      "Signerid": "",
      "userid": "",
      "IpfsHash": ""
    }

    const contract = body.contractname;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;
    await certDBContract
      .at(contract)
      .then(c => {
        callCert = c;
        return callCert.getCertInfo(body.certID);
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          info1: entry
        };

        // obj.revocation = r.info1[0];
        obj.description = r.info1[0];
        obj.timestamp = r.info1[1];
        obj.version = r.info1[2];
        obj.certname = r.info1[3];
        obj.IssuerAddr = r.info1[4];
        obj.IpfsHash = String.fromCharCode(...r.info1[5]);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
    let callCert2 = null;
    await certDBContract
      .at(contract)
      .then(c => {
        callCert2 = c;
        return callCert2.getCertInfo2(body.certID);
      })
      .then(entry => {
        let e = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          info2: entry
        };

        obj.OwnerAddr = e.info2[0];
        obj.CertHash = e.info2[1];
        obj.JsonHash = e.info2[2];
        obj.Signerid = e.info2[3];
        obj.SignerAddr = e.info2[4];
        obj.userid = e.info2[5];
        obj.revocation = e.info2[6];

      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

    res.status(HttpStatus.OK).json(obj);

  }


  @Post('signsig')
  async signsig(@Body() body: any, @Response() res: any) {

    const owner = String(body.owneraddr);
    const certname = String(body.certID);
    const jsonname = body.owneraddr + body.certID;
    const jsonpath = './json/' + jsonname + '.json';

    var pub = "";
    const sjwsname = body.owneraddr + body.certID;
    var b = String(sjwsname);
    const sJWSpath = './sJWS/' + sjwsname + '.json';
    //抓publickey ====================

    const certDBContract = CertContract.getCertDBContract();
    const hdProviderIssuer2 = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer2 = hdProviderIssuer2.address;
    const hdProviderSubject2 = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject2.address;
    certDBContract.setProvider(hdProviderIssuer2);

    const contract2 = body.contractname2;
    if (!contract2) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert2 = null;

    await certDBContract
      .at(contract2)
      .then(c => {
        callCert2 = c;

        let tx = callCert2.getPublickeyHex(body.signerID, 1);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract2,
          addressIssuer2,
          addressSubject,
          status: entry
        };
        pub = entry;
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

    var certFilePath = './cert/' + body.owneraddr + body.certID + '.pdf';
    var data = fs.readFileSync(certFilePath);
    var base64_data = new Buffer(data).toString('base64');
    var swarm_cert_data = base64_data.slice(0, 1) + base64_data.slice(11);
    //========================================================================================== 
    var results = certCommon.sign.verifyByKjur(pub, body.sJWS);
    if (results == true) {
      //============================存public key 到certinfo========================================  
      const certContract = CertContract.getCertContract();
      const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
      const addressIssuer = hdProviderIssuer.address;
      const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
      //const addressSubject = hdProviderSubject.address;
      certContract.setProvider(hdProviderIssuer);

      const contract = body.contractname;
      if (!contract) {
        throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
      }
      let callCert = null;

      await certContract
        .at(contract)
        .then(c => {
          callCert = c;

          let tx = callCert.sign(body.certID, pub, body.signeraddr,/* body.issueid, */body.sJWS,/* body.signerID,*/ { from: addressIssuer, gas: 3000000 });

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

      //=================================
      fs.exists(sJWSpath, function (exists) {
        console.log(exists);
        if (exists == true) {
          var data = fs.readFileSync(sJWSpath);
          var obj = JSON.parse(data);
          obj.cert = swarm_cert_data;
          for (let i = 0; i < obj.signer.length; i++) {
            if (obj.signer[i].address == body.signeraddr) {
              obj.signer[i].signature = body.sJWS;
            }
          }
          fs.writeFile(sJWSpath, JSON.stringify(obj), function (err) {
            if (err) {
              return console.error(err);
            }
            console.log("success");
            res.status(HttpStatus.OK).json("true");
          });
          console.log(obj);
        } else {
          var data = fs.readFileSync(jsonpath);
          var obj = JSON.parse(data);
          obj.cert = swarm_cert_data;
          for (let i = 0; i < obj.signer.length; i++) {
            if (obj.signer[i].address == body.signeraddr) {
              obj.signer[i].signature = body.sJWS;
            }
          }
          fs.writeFile(sJWSpath, JSON.stringify(obj), function (err) {
            if (err) {
              return console.error(err);
            }
            console.log("File created!");
            res.status(HttpStatus.OK).json("true");
          });
        }

      });

    } else {
      res.status(HttpStatus.OK).json("false");
    }

  }
  /*
    @Post('debug')
    async get_CertID_by_Signer_idx(@Body() body: any, @Response() res: any) {
        const certContract = CertContract.getCertContract();
        const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
        const addressIssuer = hdProviderIssuer.address;
        const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
        const addressSubject = hdProviderSubject.address;
        certContract.setProvider(hdProviderIssuer);
        const contract = body.contractname;
        if (!contract) {
          throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
        }
        let callCert = null;
    
        await certContract
          .at(contract)
          .then(c => {
            callCert = c;
    
            let tx = callCert.getSignerCertList_idx( body.signerAddr);
    
            return tx
          })
    
          .then(entry => {
            let r = {
              req: body,
              contract,
              addressIssuer,
              addressSubject,
              certid: entry
            };
            res.status(HttpStatus.OK).json(r);
          })
          .catch(err => {
            throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
          });
      }
  */
  @Post('get-certID-by-signer')
  async get_CertID_by_Signer(@Body() body: any, @Response() res: any) {
    const certContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certContract.setProvider(hdProviderIssuer);
    const contract = body.contractname;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;

    await certContract
      .at(contract)
      .then(c => {
        callCert = c;

        let tx = callCert.getSignerCertList(body.signerAddr);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          certid: entry
        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
  }
  @Post('get-certID-in-issue')
  async get_CertID_List(@Body() body: any, @Response() res: any) {
    const certContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certContract.setProvider(hdProviderIssuer);
    const contract = body.contractname;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;

    await certContract
      .at(contract)
      .then(c => {
        callCert = c;

        let tx = callCert.getCertIDList(/*body.issueraddr,*/ body.issueid);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          issueid: entry
        };
        res.status(HttpStatus.OK).json(r.issueid);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
  }

  @Post('get-certInfo-in-issue')
  async get_IssueID_Info(@Body() body: any, @Response() res: any) {
    const certContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certContract.setProvider(hdProviderIssuer);
    const contract = body.contractname;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;

    await certContract
      .at(contract)
      .then(c => {
        callCert = c;

        let tx = callCert.getIssueIDInfo(/*body.issueraddr,*/ body.issueid);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          issueid: entry
        };
        res.status(HttpStatus.OK).json(r.issueid);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
  }

  @Post('get-status')
  async get_IssueID_Info2(@Body() body: any, @Response() res: any) {
    const certContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certContract.setProvider(hdProviderIssuer);
    const contract = body.contractname;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;

    await certContract
      .at(contract)
      .then(c => {
        callCert = c;

        let tx = callCert.getStatus(body.certid, body.signeraddr);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          issueid: entry
        };
        res.status(HttpStatus.OK).json(r.issueid);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
  }
  @Post('get-all-issueID')
  async get_IssueID_List(@Body() body: any, @Response() res: any) {
    const certDBContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certDBContract.setProvider(hdProviderIssuer);
    const contract = body.contractname2;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert2 = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert2 = c;

        let tx = callCert2.getIssuerIssueIDList(body.issueraddr);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          issueid: entry
        };
        res.status(HttpStatus.OK).json(entry);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
  }

  @Post('get-all-issueID-by-signer')
  async get_IssueID_List_by_Signer(@Body() body: any, @Response() res: any) {
    const certDBContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certDBContract.setProvider(hdProviderIssuer);
    const contract = body.contractname2;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert2 = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert2 = c;

        let tx = callCert2.getSignerIssueIDList(body.issueraddr);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          issueid: entry
        };
        res.status(HttpStatus.OK).json(entry);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
  }


  @Post('getpublic')
  async getpublic(@Body() body: any, @Response() res: any) {
    const jws = certCommon.sign.DeriveKey(body.mnemonic, body.derivePath, body.type);
    res.status(HttpStatus.OK).json(jws);
  }

  /*@Post('getjws')
  async getjws(@Body() body: any, @Response() res: any) {
    const jws = certCommon.sign.signJson(body.mnemonic, body.jws, body.path);
    const message = "finished";
    res.status(HttpStatus.OK).json(jws);
  }*/

  @Post('checkdownloadpermission')
  async checkdownloadpermission(@Body() body: any, @Response() res: any) {
    const jwspath = './sJWS/' + String(body.owneraddr + body.certID) + '.json';
    var data = fs.readFileSync(jwspath);
    var jwsfile = JSON.parse(data);
    var pub = "i am pub";
    var signer_length = jwsfile.signer.length;
    var sigstat: boolean[];
    sigstat = [];
    for (let i = 0; i < jwsfile.signer.length; i++) {
      const signerjws = jwsfile.signer[i].signature;
      //===============================================  
      const certDBContract2 = CertContract.getCertDBContract();
      const hdProviderIssuer2 = GetHdProvider(body.idIssuer, body.providerUrl);
      const addressIssuer2 = hdProviderIssuer2.address;
      const hdProviderSubject2 = GetHdProvider(body.idSubject, body.providerUrl);
      const addressSubject = hdProviderSubject2.address;
      certDBContract2.setProvider(hdProviderIssuer2);

      const contract2 = body.contractname2;
      if (!contract2) {
        throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
      }
      let callCert2 = null;

      await certDBContract2
        .at(contract2)
        .then(c => {
          callCert2 = c;

          let tx = callCert2.getPublickeyHex(body.signerID, 1);

          return tx
        })

        .then(entry => {
          let r = {
            req: body,
            contract2,
            addressIssuer2,
            addressSubject,
            status: entry
          };
          pub = entry;
        })
        .catch(err => {
          throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
        });

      //====================================
      var results = certCommon.sign.verifyByKjur(pub, signerjws);
      sigstat.push(results);

    }
    if (signer_length == 1) {
      if (sigstat[0] == true) {
        res.status(HttpStatus.OK).json("true");
      }
      else {
        res.status(HttpStatus.OK).json("false");
      }
    }
    if (signer_length == 2) {
      if (sigstat[0] == true && sigstat[1] == true) {
        res.status(HttpStatus.OK).json("true");
      }
      else {
        res.status(HttpStatus.OK).json("false");
      }
    }
    if (signer_length == 3) {
      if (sigstat[0] == true && sigstat[1] == true && sigstat[2] == true) {
        res.status(HttpStatus.OK).json("true");
      }
      else {
        res.status(HttpStatus.OK).json("false");
      }
    }

  }

  @Post('verifyfile')
  async verifyfile(@Body() body: any, @Response() res: any) {
    if (!body.jwsfile.certID && body.jwsfile.owner_addr) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    }
    var filepath = './sJWS/' + body.jwsfile.owner_addr + body.jwsfile.certID + '.json';
    fs.exists(filepath, function (exists) {
      if (!exists) {
        res.status(HttpStatus.OK).json("false");
      }
    });

    var data = fs.readFileSync(filepath);
    var jwsfile = JSON.parse(data);
    var hashed_jwsfile = MD5(JSON.stringify(jwsfile)).toString(CryptoJS.enc.Hex);
    var hashed_upload_jwsfile = MD5(JSON.stringify(body.jwsfile)).toString(CryptoJS.enc.Hex);
    if (hashed_jwsfile != hashed_upload_jwsfile) {
      res.status(HttpStatus.OK).json("false");
    }

    var pub = "i am pub";
    var signer_length = body.jwsfile.signer.length;
    var sigstat: boolean[];
    sigstat = [];
    for (let i = 0; i < body.jwsfile.signer.length; i++) {
      const signerjws = body.jwsfile.signer[i].signature;

      //===============================================        
      const certContract = CertContract.getCertContract();
      const hdProviderIssuer2 = GetHdProvider(body.idIssuer, body.providerUrl);
      const addressIssuer2 = hdProviderIssuer2.address;
      const hdProviderSubject2 = GetHdProvider(body.idSubject, body.providerUrl);
      const addressSubject = hdProviderSubject2.address;
      certContract.setProvider(hdProviderIssuer2);

      const contract = body.contractname;
      if (!contract) {
        throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
      }
      let callCert = null;

      await certContract
        .at(contract)
        .then(c => {
          callCert = c;

          let tx = callCert.getSignerPubkey(body.certID, body.jwsfile.signer[i].address);


          return tx
        })

        .then(entry => {
          let r = {
            req: body,
            contract,
            addressIssuer2,
            addressSubject,
            status: entry
          };
          pub = entry;
        })
        .catch(err => {
          throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
        });
      //====================================
      var results = certCommon.sign.verifyByKjur(pub, body.jwsfile.signer[i].signature);
      sigstat.push(results);
    }
    if (signer_length == 1) {
      if (sigstat[0] == true) {
        res.status(HttpStatus.OK).json("true");
      }
      else {
        res.status(HttpStatus.OK).json("false");
      }
    }
    if (signer_length == 2) {
      if (sigstat[0] == true && sigstat[1] == true) {
        res.status(HttpStatus.OK).json("true");
      }
      else {
        res.status(HttpStatus.OK).json("false");
      }
    }
    if (signer_length == 3) {
      if (sigstat[0] == true && sigstat[1] == true && sigstat[2] == true) {
        res.status(HttpStatus.OK).json("true");
      }
      else {
        res.status(HttpStatus.OK).json("false");
      }
    }


  }

  //================
  @Post('get-qrcode-code')
  async get_qrcode_url(@Body() body: any, @Response() res: any) {
    var IPFS_hash = "";
    const certContract = CertContract.getCertContract();
    const hdProviderIssuer2 = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer2 = hdProviderIssuer2.address;
    const hdProviderSubject2 = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject2.address;
    certContract.setProvider(hdProviderIssuer2);

    const ContractAddr = body.certContractAddr;
    if (!ContractAddr) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;

    await certContract
      .at(ContractAddr)
      .then(c => {
        callCert = c;

        let tx = callCert.getIpfsHash(body.certID);
        return tx
      })

      .then(entry => {
        IPFS_hash = String.fromCharCode(...entry);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

    var schooID = body.schooid;
    var code = MD5(body.certID + IPFS_hash + schooID).toString(CryptoJS.enc.Hex).substring(0, 4);
    console.log("code", code);
    var qrcode_url = 'q' + body.certID + code + IPFS_hash + schooID;
    res.status(HttpStatus.OK).json(qrcode_url);
  }

  @Post('verify_qrcode_1')
  async fetch_qrcode_info(@Body() body: any, @Response() res: any) {

    var certID = body.verifycode.slice(1, 1 + 8);
    var code = body.verifycode.slice(9, 9 + 4);
    var ipfsHash = body.verifycode.slice(13, 13 + 46);
    var schooID = body.verifycode.slice(13 + 46);
    var md5Check = MD5(certID + ipfsHash + schooID).toString(CryptoJS.enc.Hex).substring(0, 4);
    if (md5Check === code) {
      res.status(HttpStatus.OK).json(true);
    } else {
      res.status(HttpStatus.OK).json(false);
    }
  }

  @Post('verify_qrcode_2')
  async download_json_from_swarm(@Body() body: any, @Response() res: any) {
    res.status(HttpStatus.OK).json(true);
  }

  @Post('verify_qrcode_3')
  async combine_code(@Body() body: any, @Response() res: any) {
    var secretkey = SHA256("nchc").toString(CryptoJS.enc.Hex);

    try {
      var plaintext = AES.decrypt(body.file, secretkey).toString(CryptoJS.enc.Utf8);
      res.status(HttpStatus.OK).json(plaintext);
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("decrypt failed");
    }
    // var certID = body.verifycode.slice(0 + 1, 8 + 1);
    // var code = body.verifycode.slice(8 + 1, 18 + 1);
    // var swarmhash = body.verifycode.slice(18 + 1, 18 + 1 + 42);
    // const jwspath = './sJWS/' + swarmhash + certID + '.json';
    // var data = fs.readFileSync(jwspath);
    // var jwsfile = JSON.parse(data);
    // var json_file_cert = jwsfile.cert;
    // var combined_cert = jwsfile.cert.slice(0, 1) + code + jwsfile.cert.slice(1);
    // res.status(HttpStatus.OK).json(combined_cert);
  }

  @Post('verify_qrcode_4')
  async hash_cert(@Body() body: any, @Response() res: any) {
    var certID = body.verifycode.slice(0 + 1, 8 + 1);
    const cert2Contract = CertContract.getCertContract();
    const hdProviderIssuer2 = GetHdProvider(body.idIssuer, body.providerUrl);
    cert2Contract.setProvider(hdProviderIssuer2);
    const contract = body.contractname;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;

    await cert2Contract
      .at(contract)
      .then(c => {
        callCert = c;

        let tx = callCert.getCertHash(certID);

        return tx
      })

      .then(certHash => {
        res.status(HttpStatus.OK).json(certHash);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
  }

  @Post('verify_qrcode_5')
  async compare_hash(@Body() body: any, @Response() res: any) {

  }



  @Post('getjwsfile')
  async getjwsfile(@Body() body: any, @Response() res: any) {
    const jwspath = body.jwspath;
    var data = fs.readFileSync(jwspath);
    var jwsfile = JSON.parse(data);
    res.status(HttpStatus.OK).json(jwsfile);
  }

  @Post('verifysjws')
  async verifysjws(@Body() body: any, @Response() res: any) {
    var result = certCommon.sign.verifyByKjur(body.publickey, body.sjws);
    res.status(HttpStatus.OK).json(result);
  }

  @Post('get-pdf') async getpdf(@Body() body: any, @Response() res: any) {
    console.log("fdfadf");
    const pdfpath = body.pdfpath;
    var tempFilename = './cert/watermark';
    const nowTime = new Date().toLocaleString();
    var options = {
      'text': 'certproof.nchc.org.tw\n' + nowTime,
      'dstPath': tempFilename,
      'align': 'dia1'
    };
    console.log(pdfpath);
    console.log(fs.statSync(pdfpath));
    //watermark.embedWatermarkWithCb(pdfpath, options, err => {
      //if (!err) {
        var data = fs.readFileSync(pdfpath);
        var base64_data = new Buffer(data).toString('base64');
      //  console.log(base64_data.substring(0,100));
      //  fs.unlink(tempFilename + '.pdf', err => {
      //    if (!err) {
            res.status(HttpStatus.OK).json(base64_data);
      //    }
      //  });
      //}
    //});


  }

  @Post('get-json')
  async getjson(@Body() body: any, @Response() res: any) {
    const jsonpath = body.jsonpath;
    var data = fs.readFileSync(jsonpath);
    var jsonfile = JSON.parse(data);
    res.status(HttpStatus.OK).json(jsonfile);
  }

  @Post('revokeToCertInfo')
  async setCertInfoRevoke(@Body() body: any, @Response() res: any){
    const certID = body.certID;
    console.log("-------------- revoke --------------")
    console.log(certID)
    console.log(body.contractname)
    const certContract = CertContract.getCertContract();
      const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
      const addressIssuer = hdProviderIssuer.address;
      const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
      //const addressSubject = hdProviderSubject.address;
      certContract.setProvider(hdProviderIssuer);

      const contract = body.contractname;
      if (!contract) {
        throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
      }
      let callCert = null;

      await certContract
        .at(contract)
        .then(c => {
          callCert = c;

          let tx = callCert.revoke(body.certID, { from: addressIssuer, gas: 3000000 });

          return tx
        })

        .then(txSetClaim => {
          res.status(HttpStatus.OK).json(txSetClaim);
        })
        .catch(err => {
          throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
        });
  }




}