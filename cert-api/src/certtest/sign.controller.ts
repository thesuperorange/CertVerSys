import { Controller, Get, Post, Request, Response, Param, Next, HttpException, HttpStatus, Body, Patch, Delete, RequestMapping } from '@nestjs/common';
import { UsersDTO } from './users.dto';
import { InputCertInfoDTO } from './certInfo.dto';
import { EthDTO } from '../dev/eth.dto';
import { GetHdProvider } from '../dev/eth.common';
import { UsersEthDTO, OrgsEthDTO } from './usersEth.dto'
import { VerifyDTO, WalletPwdDTO, SignDTO } from './signature.dto';
const CertContract: any = require("cert-contract");
const fs: any = require('fs');
const createjws: any = require('../../../cert-api/src/sign');
const qr: any = require('qr-image');
const md5 = require('js-md5');
const sha256 = require('sha256');
var isfile = 0;

@Controller('certtest/sign')
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
    let allinfo = "";

    const contract = body.contractname;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;
    await certDBContract
      .at(contract)
      .then(c => {
        callCert = c;
        return callCert.getallinfo(body.certID);
      })
      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          address: entry
        };
        allinfo = r.address;
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
    let callCert2 = null;
    await certDBContract
      .at(contract)
      .then(c => {
        callCert2 = c;
        return callCert2.getallinfo2(body.certID);
      })
      .then(entry => {
        let e = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          address: entry
        };
        let allinfo2 = e.address;
        allinfo = JSON.stringify(allinfo + ',' + allinfo2);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
    console.log("1", allinfo[0]);
    console.log("1", allinfo[0][0]);
    console.log("2", allinfo[1]);
    console.log("2", allinfo[1][3]);
    res.status(HttpStatus.OK).json(allinfo);

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

        let tx = callCert2.getpublickey1(body.signerID);

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


    //============================存public key 到certinfo========================================  
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

        let tx = callCert.pushsignerpublickey(body.certID, pub, body.signeraddr, { from: addressIssuer, gas: 6000000 });

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

    let callCert6 = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert6 = c;

        let tx = callCert6.setSignedList(body.signeraddr, body.certID, body.issueid, { from: addressIssuer, gas: 6000000 });

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

      var certFilePath = './cert/' + body.owneraddr + body.certID + '.pdf';
      var data = fs.readFileSync(certFilePath);
      var base64_data =new Buffer(data).toString('base64');
      var swarm_cert_data =base64_data.slice(0,1)+base64_data.slice(11);
    //========================================================================================== 
    var results = createjws.verifyByKjur(pub, body.sJWS);
    if (results == true) {
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
            console.log("success")
          });
          console.log(obj);
        }
        if (exists == false) {
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
          });

        }
      });

      //res.status(HttpStatus.OK).json(obj);

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

          let tx = callCert.setsig(body.certID, body.sJWS, body.signeraddr, { from: addressIssuer, gas: 6000000 });

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
          // console.log(err);
          throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
        });
      // res.status(HttpStatus.OK).json(isfile);
      //console.log(obj.signer[0].address);

    }
    if (results == false) {
      res.status(HttpStatus.OK).json("false");
    } else {
      res.status(HttpStatus.OK).json("true");
    }

  }



  @Post('test')
  async testtttt(@Body() body: any, @Response() res: any) {
    const certDBContract = CertContract.getCertContract();
    const hdProviderIssuer = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer = hdProviderIssuer.address;
    const hdProviderSubject = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject.address;
    certDBContract.setProvider(hdProviderIssuer);

    const contract = body.contractname;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert8 = null;

    await certDBContract
      .at(contract)
      .then(c => {
        callCert8 = c;

        let tx = callCert8.getsignerpub(body.certID, body.signeraddr);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer,
          addressSubject,
          status: entry
        };
        res.status(HttpStatus.OK).json(r);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });

  }



  @Post('get-CertID-List')
  async get_CertID_List(@Body() body: any, @Response() res: any) {
    const certDBContract2 = CertContract.getCertContract();
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

        let tx = callCert2.getSignedList(body.issueraddr, body.issueid);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract2,
          addressIssuer2,
          addressSubject,
          issueid: entry
        };
        res.status(HttpStatus.OK).json(r.issueid);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });



  }


  @Post('get-IssueID-Info')
  async get_IssueID_Info(@Body() body: any, @Response() res: any) {
    const certDBContract2 = CertContract.getCertContract();
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

        let tx = callCert2.getIssueIDInfo(body.issueraddr, body.issueid);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract2,
          addressIssuer2,
          addressSubject,
          issueid: entry
        };
        res.status(HttpStatus.OK).json(r.issueid);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });



  }

  @Post('get-IssueID-List')
  async get_IssueID_List(@Body() body: any, @Response() res: any) {
    const certDBContract2 = CertContract.getCertContract();
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

        let tx = callCert2.getIssuerIssueIDList(body.issueraddr);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract2,
          addressIssuer2,
          addressSubject,
          issueid: entry
        };
        res.status(HttpStatus.OK).json(r.issueid);
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });



  }


  @Post('getpublic')
  async getpublic(@Body() body: any, @Response() res: any) {
    //const jws = Createsjws.signJson(body.mnemonic,body.jsonstring)
    const jws = createjws.DeriveKey(body.mnemonic, body.derivePath, body.type);
    res.status(HttpStatus.OK).json(jws);
  }

  @Post('getjws')
  async getjws(@Body() body: any, @Response() res: any) {
    //const jws = Createsjws.signJson(body.mnemonic,body.jsonstring)
    const jws = createjws.signJson(body.mnemonic, body.jws, body.path);
    const message = "finished";
    res.status(HttpStatus.OK).json(jws);
  }

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

          let tx = callCert2.getpublickey1(body.signerID);

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
      var results = createjws.verifyByKjur(pub, signerjws);
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
    if (!body.jwsfile.certID && body.jwsfile.owner_addr ) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'entity is required!' });
    } 
    var filepath = './sJWS/'+body.jwsfile.owner_addr+body.jwsfile.certID+'.json';
    fs.exists(filepath, function (exists) {
        if (!exists){
          res.status(HttpStatus.OK).json("false");
        }
    });

      var data = fs.readFileSync(filepath);
      var jwsfile = JSON.parse(data);
      var hashed_jwsfile = md5(JSON.stringify(jwsfile));   
      var hashed_upload_jwsfile = md5(JSON.stringify(body.jwsfile));    
      if(hashed_jwsfile != hashed_upload_jwsfile){
        res.status(HttpStatus.OK).json("false");
      }
    
    
    
    var pub = "i am pub";
    var signer_length = body.jwsfile.signer.length;
    var sigstat: boolean[];
    sigstat = [];
    for (let i = 0; i < body.jwsfile.signer.length; i++) {
      const signerjws = body.jwsfile.signer[i].signature;

      //===============================================        
      const certDBContract2 = CertContract.getCertContract();
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

                let tx = callCert2.getsignerpub(body.certID, body.jwsfile.signer[i].address);
                

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
      var results = createjws.verifyByKjur(pub, body.jwsfile.signer[i].signature);
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
      var swarm_hash = "";
      const certDBContract2 = CertContract.getCertContract();
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

                let tx = callCert2.get_swarm_hash(body.certID);
                

          return tx
        })

        .then(entry => {
          let r = {
            req: body,
            contract2,
            addressIssuer2,
            addressSubject,
            swarmhash: entry
          };
          swarm_hash  =entry;
        })
        .catch(err => {
          throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
        });

        //測試用 目前沒有push_swarm_hash，所以無法使用get_swarm_hash
        //swarm_hash = body.owneraddr;
        var certFilePath = './cert/'+swarm_hash+body.certID+'.pdf';
        var data = fs.readFileSync(certFilePath);
        var base64_data = new Buffer(data).toString('base64');
        var code = base64_data.slice(1,11);
        var qrcode_url = 'q'+body.certID+code+swarm_hash;
        res.status(HttpStatus.OK).json(qrcode_url);

  }

  @Post('verify_qrcode_1')
  async fetch_qrcode_info(@Body() body: any, @Response() res: any) {

    var certID = body.verifycode.slice(0+1,8+1);
    var code = body.verifycode.slice(8+1,18+1);
    var swarmhash = body.verifycode.slice(18+1);
    res.status(HttpStatus.OK).json(true);
  }

  @Post('verify_qrcode_2')
  async download_json_from_swarm(@Body() body: any, @Response() res: any) {
    res.status(HttpStatus.OK).json(true);
  }

  @Post('verify_qrcode_3')
  async combine_code(@Body() body: any, @Response() res: any) {
    var certID = body.verifycode.slice(0+1,8+1);
    var code = body.verifycode.slice(8+1,18+1);
    var swarmhash = body.verifycode.slice(18+1);
    const jwspath = './sJWS/'+swarmhash+certID+'.json';
    var data = fs.readFileSync(jwspath);
    var jwsfile = JSON.parse(data);
    var json_file_cert = jwsfile.cert;
    var combined_cert = jwsfile.cert.slice(0,1)+code+jwsfile.cert.slice(1);
    res.status(HttpStatus.OK).json(combined_cert);
  }

  @Post('verify_qrcode_4')
  async hash_cert(@Body() body: any, @Response() res: any) {
    var combined_cert_hash =  md5(body.combined_cert);
    res.status(HttpStatus.OK).json(combined_cert_hash);
  }

  @Post('verify_qrcode_5')
  async compare_hash(@Body() body: any, @Response() res: any) {
    var certID = body.verifycode.slice(0+1,8+1);
    var combined_cert_hash =  body.combined_cert_hash;
    var blockchain_certhash = "";
    const cert2Contract = CertContract.getCertContract();
    const hdProviderIssuer2 = GetHdProvider(body.idIssuer, body.providerUrl);
    const addressIssuer2 = hdProviderIssuer2.address;
    const hdProviderSubject2 = GetHdProvider(body.idSubject, body.providerUrl);
    const addressSubject = hdProviderSubject2.address;
    cert2Contract.setProvider(hdProviderIssuer2);
    const contract = body.contractname2;
    if (!contract) {
      throw new HttpException('contract address (req.contract) not found', HttpStatus.BAD_REQUEST);
    }
    let callCert = null;

    await cert2Contract
      .at(contract)
      .then(c => {
        callCert = c;

        let tx = callCert.get_CertHash(certID);

        return tx
      })

      .then(entry => {
        let r = {
          req: body,
          contract,
          addressIssuer2,
          addressSubject,
          blockchain_certhash: entry
        };
        blockchain_certhash = Buffer.from(entry.substr(2), 'hex').toString('utf8').replace(/\0/g, '');
      })
      .catch(err => {
        throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
      });
      if (blockchain_certhash == combined_cert_hash){
        res.status(HttpStatus.OK).json(true);
      }
      else{
        res.status(HttpStatus.OK).json(false);
      }
  }



  @Post('getjwsfile')
  async getjwsfile(@Body() body: any, @Response() res: any) {
    //const jws = Createsjws.signJson(body.mnemonic,body.jsonstring)
    const jwspath = body.jwspath;
    var data = fs.readFileSync(jwspath);
    var jwsfile = JSON.parse(data);
    res.status(HttpStatus.OK).json(jwsfile);
  }

  @Post('verifysjws')
  async verifysjws(@Body() body: any, @Response() res: any) {
    var result = createjws.verifyByKjur(body.publickey, body.sjws);
    res.status(HttpStatus.OK).json(result);
  }

  @Post('get-pdf')async getpdf( @Body() body: any, @Response() res: any) {
    //const jws = Createsjws.signJson(body.mnemonic,body.jsonstring)
    const pdfpath = body.pdfpath;
    var data = fs.readFileSync(pdfpath);
    var base64_data = new Buffer(data).toString('base64');
    res.status(HttpStatus.OK).json(base64_data);
  }

  @Post('get-json')
  async getjson(@Body() body: any, @Response() res: any) {
    //const jws = Createsjws.signJson(body.mnemonic,body.jsonstring)
    const jsonpath = body.jsonpath;
    var data = fs.readFileSync(jsonpath);
    var jsonfile = JSON.parse(data);
    res.status(HttpStatus.OK).json(jsonfile);
  }




}