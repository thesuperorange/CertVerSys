const rs = require('jsrsasign');
const keytool = require("../../cert-common/src/keytool");
const ecurve = require('ecurve');
var BigInteger = require('bigi')
const util = require('ethereumjs-util');

function signJson(mnemonic, jsonStr, path, type) {

    //get private key
    //const path = "m/2018'/5'/1'/0" + '/' + 1; //
    path = path + '/' + 1;
    const dkey = keytool.DeriveKey(mnemonic, path, type);
    var prvKey = dkey.privateKey;
    var pubKey = dkey.publicKey;
    //console.log(prvKey);
    //sign
    var sJWS = signByKjur(prvKey, jsonStr)

    //console.log(sJWS);
    //call API
    return sJWS
}
export {
    signJson,
    verifyByKjur,
    getAddr,
    SignString,
    getPubKey
}
function signByKjur(prvhex, json) {
    var ecKeypair = rs.KEYUTIL.generateKeypair("EC", "secp256r1");
    var prvobj = ecKeypair.prvKeyObj
    prvobj.prvKeyHex = prvhex
    //var pubobj=ecKeypair.pubKeyObj
    //pubobj.pubKeyHex=btcr1pub_full
    //console.log(prvobj)
    //console.log(pubobj)
    var pemprv = rs.KEYUTIL.getPEM(prvobj, "PKCS8PRV")
    //var pempub = rs.KEYUTIL.getPEM(pubobj, "PKCS8PUB")

    //console.log(pemprv)
    //console.log(pempub)


    var sJWS = rs.KJUR.jws.JWS.sign(null, '{"alg":"ES256", "cty":"JWT"}', json, pemprv);
    return sJWS

}
function verifyByKjur(pubx, sJWS) {

    var fullpubkey =  pubxtofull(pubx)

    var ecKeypair = rs.KEYUTIL.generateKeypair("EC", "secp256r1");
    // var prvobj=ecKeypair.prvKeyObj
    // prvobj.prvKeyHex=prvhex
    var pubobj = ecKeypair.pubKeyObj
    pubobj.pubKeyHex = fullpubkey
    //console.log(prvobj)
    //console.log(pubobj)
    // var pemprv = rs.KEYUTIL.getPEM(prvobj, "PKCS8PRV")
    var pempub = rs.KEYUTIL.getPEM(pubobj, "PKCS8PUB")


    console.log(pempub)


    var result = rs.KJUR.jws.JWS.verify(sJWS, pempub);

    return result

}
function pubxtofull(pubx) {

    var ecparams = ecurve.getCurveByName('secp256r1')
    //console.log(ecparams)
    //new Point (curve, x, y, z) ;
    //var bufStr = "0x02729f590ca219cd8e206d710bd976acecd5bfff6bc3f3af4e90828f628692caad"
    var buffer  = new Buffer(pubx, 'hex');
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

async function getAddr(mnemonic){
    const path = "m/2018'/5'/1'/0";
    const type = "secp256r1";
    const result2 = await keytool.CreateTcEduNchcV0DIDoc(mnemonic, path, type);
     var fullpublickey = pubxtofull(result2.publicKey[1].publicKeyHex);
    var upk_buf = new Buffer(fullpublickey, 'hex');
    var addr_buf = util.pubToAddress(upk_buf.slice(1, 65), true);
    var addr = addr_buf.toString('hex');
    return "0x" + addr;
}

function FrontEndDeriveKey(mnemonic){
     const path = "m/2018'/5'/1'/0";
    const dkey = keytool.DeriveKey(mnemonic, path, 'secp256r1');
}


function SignString(Str,StringtoSign){
  const path = "m/2018'/5'/1'/0" + '/' + 1;
  const dkey = keytool.DeriveKey(Str, path, 'secp256r1');    // retrieve key from mnemonic
  var prvKey = dkey.privateKey;
  var pubKey = dkey.publicKey;
 
  var ecKeypair = rs.KEYUTIL.generateKeypair("EC", "secp256r1");  //generate keypair
  var prvobj = ecKeypair.prvKeyObj
  prvobj.prvKeyHex = prvKey;    // replace private key
  var pemprv = rs.KEYUTIL.getPEM(prvobj, "PKCS8PRV");

  //signature
  var sig = new rs.crypto.Signature({'alg':'SHA1withECDSA'});    // Signature create
  sig.init(pemprv)
  sig.updateString(StringtoSign);
  var hSigValue = sig.sign();
  // var hSigValue = sig.signString("nchc");
  return hSigValue.toString('hex');
}

function getPubKey(Str){
    const path = "m/2018'/5'/1'/0" + '/' + 1;
  const dkey = keytool.DeriveKey(Str, path, 'secp256r1');    // retrieve key from mnemonic
    return dkey.publicKey;
}

function test() {
    var testjson = {

        "certID": 38,
        "version": "1.0.0",
        "cert_name": "Elementary School",
        "revocation": false,
        "description": "this is a test",
        "timestamp": "1400000000000",
        "org_contract": "0x1af474233df79e0cab2fa04c3ae1af0f75e3ba3e",
        "issuer_address": "0x00",
        "owner_addr": "0xaabb01ffee0100000000aabb01ffee0100000000",
        "certhash": "0x49e8a1698ee5a5f184f6a867d17b6c8def70de216445a7d26df0b765287683bf",
        "json_hash": "",
        "json_hash2": "",
        "signer": [
            {
                "address": "0xeddd3c6b1b40fc235bb67c8fd24fd156ceda8913",
                "signature": ""
            },
            {
                "address": "0x4d7480393bf869b5ce7afc64c3e735d874f5d1c2",
                "signature": ""
            }],
        "cert": "",
        "qrcode": ""
    }
    var testmnemonic = "雛 張 壞 施 防 勵 鋼 廣 伸 弟 插 酒";
    //ee8b39b901defb915fcbfa4e12094bad712fa95d39ae4b8cf97dbed532078547
    //027ff8a795c3d6a505c9be89bb40e4b10319b377ba361357183fb4fa56d3201c56
    var pubx = "027ff8a795c3d6a505c9be89bb40e4b10319b377ba361357183fb4fa56d3201c56"

    var fullpub = pubxtofull(pubx)
    console.log("fullkey ="+fullpub)
    var sJWS = signJson(testmnemonic, testjson);
    console.log("sJWS=" + sJWS);
    var result = verifyByKjur(pubx, sJWS) 
    console.log(result)
}


