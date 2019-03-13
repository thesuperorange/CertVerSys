import { Controller, Get, Res, Post, FileInterceptor, FilesInterceptor, UseInterceptors, UploadedFile, UploadedFiles, Request, Response, Param, Next, HttpException, HttpStatus, Body, Patch, Delete, RequestMapping } from '@nestjs/common';
import { EthDTO } from '../dev/eth.dto';
import { UsersEthDTO, OrgsEthDTO, DidEthDTO } from './usersEth.dto'
import { GetHdProvider } from '../dev/eth.common';
// import { UploadDbDTO } from './uploadDb.dto';

const CertContract: any = require("cert-contract");            // use to deploy revocation contract
const rs = require('jsrsasign');                              // use to verify signature
const keytool = require("../../../cert-common/src/keytool");  // get keytool to generate key from memonic
const ipfstool = require("../../../cert-common/src/ipfstool");  // get keytool to generate key from memonic

const ecurve = require('ecurve');
var BigInteger = require('bigi');

// var config = require('../../config/config');                  // read ipfs server ip、port
var fs = require('fs')
// var ipfsAPI = require('ipfs-api')
var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256")
const CONFIG_FILE = 'config/setting.js'
const SECRETKEY = "nchc";

// const mnemonic = "tell sibling misery still crew globe flip leopard mosquito silk west gesture";
// const path = "m/2018'/5'/1'/0" + '/' + 1;

// test address : 0xCc2E0914a108215a8941734460a01f6502f926Ed


@Controller('datasrc/db')

export class DsDbController {
  @Get()
  root() {
    const message = 'Hello Cert Api : ' + new Date();
    const time = new Date();
    return { message, time };
  }

  @Post('get-temp-cert')
  async getTempCert(@Body() body: any, @Res() res:any) {
    const provider = GetHdProvider(0, "http://localhost:8545");
    const RevokeContract = CertContract.getRevokeContract();
    RevokeContract.setProvider(provider);
    RevokeContract.defaults({ from: provider.address });
    var output = checkContractDeploy();
    if (output === "Contract not yet deployed") {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Contract not yet deployed");
    }
    else {
      RevokeContract.at(output).then(Revoke => {
        Revoke.getTempCert(body.useraddr).then( tempCertAddr => {  //check if cert is revoked
          console.log("tempCertAddr = ", tempCertAddr)
          res.status(HttpStatus.OK).json(tempCertAddr);
        })
        .catch(err => {
          console.log(err.toString());
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err.toString());
        })
      })
      .catch(err => {
        console.log(err.toString());
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err.toString());
      })
    }
  }

  @Post('update-temp-cert')
  async updateTempCert(@Body() body: any, @Res() res: any) {
    console.log(body.file)
    function setStringToIPFSPromise(content) {
      return new Promise(resolve => { ipfstool.setStringToIPFS(content, 5, hash => resolve(hash)) })
    }
    
    var tempIPFS = await setStringToIPFSPromise(body.file);
    console.log(tempIPFS);
    const provider = GetHdProvider(0, "http://localhost:8545");
    const RevokeContract = CertContract.getRevokeContract();
    RevokeContract.setProvider(provider);
    RevokeContract.defaults({ from: provider.address });
    var output = checkContractDeploy();
    if (output === "Contract not yet deployed") {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Contract not yet deployed");
    }
    else {
      RevokeContract.at(output).then(Revoke => {
        Revoke.updateTempCert(body.useraddr, tempIPFS).then( tx => {  //check if cert is revoked
          res.status(HttpStatus.OK).json(tx);
        })
        .catch(err => {
          console.log(err.toString());
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err.toString());
        })
      })
      .catch(err => {
        console.log(err.toString());
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err.toString());
      })
    }
  }

  @Post('get-string-ipfs')
  async getStringIpfs(@Body() body: any, @Res() res: any) {
    var hash = body.hash.trim();
    console.log("ipfs hash = ", hash);
    ipfstool.getStringFromIPFS(hash, function (ret) {
      res.status(HttpStatus.OK).json(ret)
    })
  }

  // upload file get ipfshash
  @Post('ipfsupload')
  async sendtoipfs(@Body() body: any, @Res() res: any) {
    // console.log("file = ",body.file);
    console.log("expire = ", body.expire)
    var expireday = parseInt(body.expire, 10) * 1000 * 86400

    function UploadtoIPFSPromise(content, tryCount, expireday) {
      return new Promise(resolve => { ipfstool.UploadtoIPFS(content.toString(), tryCount, expireday, hash => resolve(hash)) })
    }
    var hash = await UploadtoIPFSPromise(body.file, 3, expireday);

    res.status(HttpStatus.OK).json(hash);
    // const hash = await ipfstool.UploadtoIPFS(body.file, 3, expireday, (hash) => {
    //   res.status(HttpStatus.OK).json(hash);
    // })

  }

  @Post('uploads')
  @UseInterceptors(FilesInterceptor('uploadfile', 60, { limits: { fileSize: 1000000 } }))
  async uploads(@UploadedFiles() uploadfile: Express.Request, @Body() payload: any, ) {
    var ownerObj = JSON.parse(payload.owner);
    var possible = "0123456789";
    var rexStudentID = new RegExp('^[0-9]+');
    var certid_list = {};
    var cert_Hash_list = {};
    var IPFS_hash_list = {}
    for (let index in uploadfile) {
      //console.log(uploadfile[index].originalname);
      //console.log(uploadfile[index].size);
      var certID = '';
      var studentID = uploadfile[index].originalname.match(rexStudentID)[0];  //check filename = student id
      for (var i = 0; i < 8; i++) {
        certID += possible.charAt(Math.floor(Math.random() * possible.length));   //random certID
      }
      const certpath = './cert/' + ownerObj[studentID] + certID + '.pdf';
      certid_list[ownerObj[studentID]] = certID;
      var cert_file_data = new Buffer(uploadfile[index].buffer);
      fs.writeFile(certpath, cert_file_data, function (err) {    // write file to local
        if (err) {
          return console.error(err);
        }
      });
      // ========= get cert_hash ===========
      var file = cert_file_data.toString('base64');
      var certHash = '0x' + SHA256(file).toString(CryptoJS.enc.Hex);
      cert_Hash_list[ownerObj[studentID]] = certHash;

      // ============ IPFS =================
      var key = SHA256(SECRETKEY).toString(CryptoJS.enc.Hex);
      var ciphertext = CryptoJS.AES.encrypt(file, key);
      //console.log("file encrypt base64:", file);
      function UploadtoIPFSPromise(content) {
        return new Promise(resolve => { ipfstool.UploadtoIPFS(content.toString(), 5, 0, hash => resolve(hash)) })
      }
      var hash = await UploadtoIPFSPromise(ciphertext);
      if (hash == "files add to ipfs error") {
        console.log("!! files add to ipfs error !!")
      } else {
        IPFS_hash_list[ownerObj[studentID]] = hash.split(',')[2];
        console.log("add to IPFS and Smart Contract Success: ", hash);
      }
    }

    return { certid_list: certid_list, IPFS_hash_list: IPFS_hash_list, cert_Hash_list:cert_Hash_list };
  }

  // upload hash get file
  @Post('ipfshash')
  async getipfshash(@Body() payload: any, @Res() res: any) {
    var hash = payload.hash.trim();
    console.log("ipfs hash = ", hash);
    const provider = GetHdProvider(0, "http://localhost:8545");
    const RevokeContract = CertContract.getRevokeContract();
    RevokeContract.setProvider(provider);
    RevokeContract.defaults({ from: provider.address });
    var output = checkContractDeploy();
    if (output === "Contract not yet deployed") {
      res.status(HttpStatus.OK).json("Contract not yet deployed");
    }
    else {
      RevokeContract.at(output).then(Revoke => {
        Revoke.checkList(hash).then(test => {  //check if cert is revoked
          console.log("isRevoc = ", test)
          if (test === false) {  // ipfshash is not revoked
            ipfstool.getFileFromIPFS(hash, parseInt(payload.role, 10), function (ret) {
              console.log("get FIle Data from ipfs ")
              if (ret === "file expired" || ret === "file got from ipfs is wrong,wrong format" || ret === "hash not found") {
                res.status(HttpStatus.OK).json(ret)
              }
              else {
                res.status(HttpStatus.OK).json(ret.toString('base64'))
              }
            })
          } else {  // ipfshahs in revocation list
            ipfstool.rmIPFSFile(hash, function (ret) {
              res.status(HttpStatus.OK).json("remove IPFS:"+ret);
            })
          }
        })
      })
    }
  }

  // deploy smart contract
  @Get('deployRevoke')
  async RevokeContractDeploy(@Body() payload: any, @Res() res: any) {

    var data = fs.readFileSync(CONFIG_FILE).toString();
    data = JSON.parse(data);
    if (data["RevokeContractAddr"] === "") {
      const provider = GetHdProvider(0, "http://localhost:8545");
      const RevokeContract = CertContract.getRevokeContract();
      RevokeContract.setProvider(provider);
      RevokeContract.defaults({ from: provider.address });  //設定合約

      let instance = await RevokeContract.new();  //部署合約
      console.log("Revoke Contract address = ", instance.address);
      data["RevokeContractAddr"] = instance.address;
      // write file
      var buf = Buffer.from(JSON.stringify(data));
      fs.writeFileSync(CONFIG_FILE, buf)

      res.status(HttpStatus.OK).json("true");
    }
    else {
      console.log("Contract already exist ", data["RevokeContractAddr"])
      res.status(HttpStatus.OK).json("Contract already exist " + data["RevokeContractAddr"]);
    }
  }

  @Post('dumpRevokeList')
  async DumpRevokeList(@Body() payload: any, @Res() res: any) {
    var TeacherAddr = payload.TeacherAddr;  //TeacherAddress
    console.log("TeacherAddr = ", TeacherAddr);
    const provider = GetHdProvider(0, "http://localhost:8545");
    const RevokeContract = CertContract.getRevokeContract();
    RevokeContract.setProvider(provider);
    RevokeContract.defaults({ from: provider.address });
    var revokeContAddr = checkContractDeploy();
    if (revokeContAddr === "Contract not yet deployed") {
      res.status(HttpStatus.OK).json("Contract not yet deployed");
    }
    else {
      RevokeContract.at(revokeContAddr).then(contract => {
        contract.DumpRevokeList(TeacherAddr).then(revokeList => {
          contract.DumpRevokeName(TeacherAddr).then(revokeName => {
            var result = []
            for (var i = 0; i < revokeList[1].length; i++) {
              result.push(BytestoIPFSHash(revokeList[1][i][0], revokeList[1][i][1]));
            }
            console.log("result = ", result);
            let revokeListjson = {
              "certID": revokeList[0],
              "certName": BytesToUTF8(revokeName[0]),
              "isRevoc": revokeName[1]
            }
            res.status(HttpStatus.OK).json(revokeListjson);
          })
        })
      })
    }
  }

  // applier add revocation application to Smart Contract
  @Post('addRevokeList')
  async addRevokeList(@Body() payload: any, @Res() res: any) {
    var certHash = payload.filehash;
    var RevokeCertID = payload.RevokeCertID;
    ipfstool.getFileFromIPFS(certHash, 1, function (ret) {
      console.log("type of ret = ", typeof (ret));
      if (typeof (ret) !== "object") {         // file not exist so should not revocate
        console.log("File not exist");
        res.status(HttpStatus.OK).json("File not exist");
      }
      else {
        var ApplierAddress = payload.ApplierAddr;
        var TeacherAddr = payload.TeacherAddr;
        console.log("TeacherAddr = ", TeacherAddr)
        var PlainString = IPFSHashtoBytes(certHash);    // hexstring of certHash
        var hexAddr = IPFSHashtoBytes(ApplierAddress.split('0x')[1]);  // hex string of hexAddr
        PlainString.push.apply(PlainString, hexAddr);  // plain string = ipfshash+applieraddress without 0x

        var Reason = payload.reason;
        var CertName = UTF8ToBytes(payload.CertName);   //certificate name

        // connect to SC
        const provider = GetHdProvider(0, "http://localhost:8545");
        const RevokeContract = CertContract.getRevokeContract();
        RevokeContract.setProvider(provider);
        RevokeContract.defaults({ from: provider.address });
        var output = checkContractDeploy();

        var bytehash = IPFSHashtoBytes(certHash);
        console.log("Bytes hash = ", bytehash);
        RevokeContract.at(output).then(Revoke => {
          Revoke.checkList(certHash).then(ISREVOC => {
            if (ISREVOC === false) {
              RevokeAddList(Revoke, certHash, ApplierAddress, TeacherAddr, PlainString, CertName, Date.now(), Reason, bytehash, RevokeCertID, function (ret) {
                res.status(HttpStatus.OK).json(ret);
              })
            }
            else {
              console.log("Cert is revoked");
              ipfstool.rmIPFSFile(certHash, function (ret) {
                res.status(HttpStatus.OK).json("Certificate is revoked");
              })
            }
          })
        })
      }
    })
  }

  @Post('DumpRevokeData')
  async DumpData(@Body() body: any, @Res() res: any) {
    console.log("DumpRevokeData")
    console.log(body)
    var queryHash = body.revokehash;
    // connect to SC
    const provider = GetHdProvider(0, "http://localhost:8545");
    const RevokeContract = CertContract.getRevokeContract();
    RevokeContract.setProvider(provider);
    var output = checkContractDeploy();
    if (output === "Contract not yet deployed") {
      res.status(HttpStatus.OK).json("Contract not yet deployed");
    }
    else {
      RevokeContract.at(output).then(Revoke => {
        getDumpData(Revoke, queryHash, function (ret) {
          res.status(HttpStatus.OK).json(ret);
        })
      })
    }
  }

  // Teacher Signature
  @Post('TeacherSig')
  async TeacherSig(@Body() payload: any, @Res() res: any) {
    var FileHash = payload.signfile.trim();
    var SignedString = payload.SignedString;
    var TeacerAddr = payload.Addr.toString();
    var PlainString = payload.plain.toString()
    var pubKey = payload.pubkey;
    if (VerifySignString(pubKey, PlainString, SignedString) === false) {
      console.log("verify fail");
      res.status(HttpStatus.OK).json("verify error");
    }
    else {
      // turn plain string to hexstring array
      var output = checkContractDeploy();
      if (output === "Contract not yet deployed") {
        res.status(HttpStatus.OK).json("Contract not yet deployed");
      }
      else {
        console.log("Signature success");
        const path = "m/2018'/5'/1'/0" + '/' + 1;
        console.log("Teacher Address = ", TeacerAddr.toLowerCase());
        // console.log("plain string = ",PlainString);

        const provider = GetHdProvider(0, "http://localhost:8545");
        const RevokeContract = CertContract.getRevokeContract();
        RevokeContract.setProvider(provider);
        RevokeContract.defaults({ from: provider.address });
        console.log("Signed String = ", SignedString);
        RevokeContract.at(output).then(Revoke => {
          Revoke.checkSig(FileHash, TeacerAddr.toLowerCase()).then(test => {
            console.log("checkSig = ", test);
            if (test === "ok") {
              var SignedStringArray = ['0x' + SignedString.substring(0, 64), '0x' + SignedString.substring(64, 128), '0x' + SignedString.substring(128)];  // change SignedString to bytes32[3]
              console.log("signedstring length = ", SignedString.length);
              Revoke.getSignString(FileHash, TeacerAddr.toLowerCase(), SignedStringArray).then(async a => {
                await Revoke.addAllRevokeList(FileHash);
                res.status(HttpStatus.OK).json(a);
              }).catch(err => {
                throw new HttpException(err.toString(), HttpStatus.BAD_REQUEST);
              })
            }
            else {
              res.status(HttpStatus.OK).json("OK");
            }
          });
        });
      }
    }
  }

  @Get('AllRevokeList')
  async allRevokeList (@Request() req, @Response() res) {
    const provider = GetHdProvider(0, "http://localhost:8545");
    const RevokeContract = CertContract.getRevokeContract();
    RevokeContract.setProvider(provider);
    RevokeContract.defaults({ from: provider.address });
    var output = checkContractDeploy();
    if (output === "Contract not yet deployed") {
      res.status(HttpStatus.OK).json("Contract not yet deployed");
    }
    else {
      await RevokeContract.at(output).then(Revoke => {
        Revoke.dumpAllRevokeList().then(list => {
          var revokeList = [];
          for(var i=0; i<list.length; i++) {
            revokeList.push(String.fromCharCode(...list[i]));
          }     
          res.status(HttpStatus.OK).json(revokeList);
        })
      });
    }
  }
}

// change hexstring ot ascii
function Hex2Ascii(hexx) {
  var hex = hexx.toString();//force conversion
  var str = '';
  for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

function SignString(Str, StringtoSign) {
  const path = "m/2018'/5'/1'/0" + '/' + 1;
  const dkey = keytool.DeriveKey(Str, path, 'secp256r1');    // retrieve key from mnemonic
  var prvKey = dkey.privateKey;
  var pubKey = dkey.publicKey;

  var ecKeypair = rs.KEYUTIL.generateKeypair("EC", "secp256r1");  //generate keypair
  var prvobj = ecKeypair.prvKeyObj
  prvobj.prvKeyHex = prvKey;    // replace private key
  var pemprv = rs.KEYUTIL.getPEM(prvobj, "PKCS8PRV");

  //signature
  var sig = new rs.crypto.Signature({ 'alg': 'SHA1withECDSA' });    // Signature create
  sig.init(pemprv)
  sig.updateString(StringtoSign);
  var hSigValue = sig.sign();
  // var hSigValue = sig.signString("nchc");
  console.log("Signature of", StringtoSign, " = ", hSigValue);
  return hSigValue.toString('hex');
}

function pubxtofull(pubx) {
  var ecparams = ecurve.getCurveByName('secp256r1')
  //console.log(ecparams)
  //new Point (curve, x, y, z) ;
  //var bufStr = "0x02729f590ca219cd8e206d710bd976acecd5bfff6bc3f3af4e90828f628692caad"
  var buffer = new Buffer(pubx, 'hex');
  var byteLength = ecparams.pLength
  // console.log(byteLength)
  // console.log(buffer)
  var x = BigInteger.fromBuffer(buffer.slice(1, 1 + byteLength))
  var type = buffer.readUInt8(0)
  //console.log("type" + type)
  var isOdd = (type === 0x03)
  var Q = ecparams.pointFromX(isOdd, x) //isOdd  0x03
  //console.log(Q)
  //var encoded = Ecurve.getCurveByName.pointFromX.Point.getEncoded("02729f590ca219cd8e206d710bd976acecd5bfff6bc3f3af4e90828f628692caad");

  //console.log(Q.x)
  return Q.getEncoded(false).toString('hex');
}

// verify signature string
function VerifySignString(pubKey, plainString, StringtoVerify) {
  var fullpubkey = pubxtofull(pubKey)
  var ecKeypair = rs.KEYUTIL.generateKeypair("EC", "secp256r1");  //generate keypair
  var pubobj = ecKeypair.pubKeyObj
  pubobj.pubKeyHex = fullpubkey
  var pempub = rs.KEYUTIL.getPEM(pubobj, "PKCS8PUB")
  // signature
  var sig = new rs.crypto.Signature({ 'alg': 'SHA1withECDSA' });
  sig.init(pempub);
  sig.updateString(plainString);
  try {
    var isValid = sig.verify(StringtoVerify);
    return isValid;
  } catch (ex) {
    console.log("error = ", ex)
    return false;
  }
  console.log("should not be out")
  // var isValid = sig.verify(StringtoVerify);
  // console.log("isvalid = ",isValid);
  // return isValid;
}


// check if contract is deployed
function checkContractDeploy() {
  var data = fs.readFileSync(CONFIG_FILE).toString();
  data = JSON.parse(data);
  if (data["RevokeContractAddr"] === "") {
    console.log("Contract not yet deployed");
    return "Contract not yet deployed";
  }
  else {
    return data["RevokeContractAddr"];
  }
}

function IPFSHashtoBytes(ipfshash) {
  var str = []
  for (var i = 0; i < ipfshash.length; i += 32) {
    str.push('0x' + Buffer.from(ipfshash.substring(i, i + 32), 'ascii').toString('hex'));
  }
  return str;
}

function BytestoIPFSHash(hex1, hex2) {
  var hex1 = hex1.split('0x')[1].toString();
  var hex2 = hex2.split('0x')[1].toString();
  var str = '';

  for (var i = 0; (i < hex1.length && hex1.substr(i, 2) !== '00'); i += 2)
    str += String.fromCharCode(parseInt(hex1.substr(i, 2), 16));
  for (var i = 0; (i < hex2.length && hex2.substr(i, 2) !== '00'); i += 2)
    str += String.fromCharCode(parseInt(hex2.substr(i, 2), 16));
  return str;
}

function UTF8ToBytes(utf8string) {
  var byte = '0x' + Buffer.from(utf8string, 'utf8').toString('hex');
  return byte;
}

function BytesToUTF8(hexArray) {
  var strArray = [];
  var len = hexArray.length;
  for (var i = 0; i < len; i++) {
    var hex = hexArray[i].split('0x')[1].toString();
    var str = Buffer.from(hex, 'hex').toString('utf8');
    strArray.push(str.replace(/\0/g, ''));
  }
  return strArray;
}

// add revocation apply to smart contract and check if is valid(EX : revoke is ongoing)
async function RevokeAddList(Revoke, certHash, ApplierAddress, TeacherAddr, PlainString, CertName, Date, Reason, bytehash, RevokeCertID, cb) {
  Revoke.ISOngoing(ApplierAddress, certHash).then(ISONGOING => {

    if (ISONGOING[0] == false) {
      Revoke.addList(certHash, ApplierAddress, TeacherAddr, PlainString, CertName, Date, Reason, RevokeCertID).then(async success => {
        // teacher add ongoing revocation list
        for (var i = 0; i < TeacherAddr.length; i++) {
          Revoke.ISOngoing(TeacherAddr[i], certHash).then(ISONGOING => {
            if (ISONGOING[0] == false) {
              Revoke.addTeacherRevokeList(ISONGOING[1], bytehash, certHash, CertName, RevokeCertID);
            }
            else {
              console.log("Teacher Addr revoke list is ongoing");
            }
          })
        }
        await Revoke.addTeacherRevokeList(ISONGOING[1], bytehash, certHash, CertName, RevokeCertID);
        cb("success");
      })
    }
    else {
      cb("Cert Revoke already applied");
    }
  })
}
// dump all revocation related data of a cert
async function getDumpData(Revoke, queryHash, cb) {
  console.log("getDumpData")
  var output = await Revoke.dumpData(queryHash);
  console.log("dumpdata output = ", output)
  if (output[1] === "0x0000000000000000000000000000000000000000") {
    console.log("hash not in revocation list");
    cb("hash not in revocation list");
  }
  else {
    Revoke.dumpArray(queryHash).then(outputArray => {
      console.log("outputsign = ", outputArray[2]);
      console.log("outputArray = ", outputArray);
      //var str = BytestoIPFSHash(output[2][0], output[2][1]) + '0x' + BytestoIPFSHash(output[2][2], output[2][3]);
      var Signarray = [];
      for (var i = 0; i < outputArray[2].length; i++) {
        var tmpStr = outputArray[2][i][0].split('0x')[1] + outputArray[2][i][1].split('0x')[1] + outputArray[2][i][2].substring(2, 16).split('00')[0];
        Signarray.push(tmpStr);
      }
      const revokeObj = {
        "certID": output[4],
        "certificate_Name": BytesToUTF8([output[3]])[0],
        "Reason": output[2],
        "timestamp": output[5]
      }
      let revokejson = {
        "certificate_Name": BytesToUTF8([output[3]])[0],
        "Reason": output[2],
        "isRevoc": output[0],
        "Applier_Address": output[1],
        "Teacher_Address": outputArray[0],
        //"PlainString": str,
        "PlainString": JSON.stringify(revokeObj),
        "Teacher_Sign": Signarray,
        "confirm_Status": outputArray[1],
        "certID": output[4],
        "timestamp": output[5]

      }
      cb(revokejson);
    })
  }
}