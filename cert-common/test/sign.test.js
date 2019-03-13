const sign = require("../src/sign");
const keytool = require("../src/keytool");
test("sign_verify", () => {

const TEST_PATH = "m/2018'/5'/1'/0"; //
const TEST_MNEMONIC = "雛 張 壞 施 防 勵 鋼 廣 伸 弟 插 酒";
const TEST_ECDSA_CURVE = "secp256r1"
//const pkPath = path + "/" + 1
//console.log(path)

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



var didinfo=keytool.CreateTcEduNchcV0DIDoc(TEST_MNEMONIC, TEST_PATH, TEST_ECDSA_CURVE);
console.log("[didinfo] "+ JSON.stringify(didinfo))      
 
//var key = keytool.DeriveKey(TEST_MNEMONIC, TEST_PATH, TEST_ECDSA_CURVE);

var pubx = didinfo.publicKey[0].publicKeyHex
expect(pubx).toBe("027d11913d9fac2c66518e03aa86c1c110980895ac879657c0b5de925c988a2423");
var fullpub = sign.pubxtofull(pubx)
console.log("fullkey ="+fullpub)
expect(fullpub).toBe("047d11913d9fac2c66518e03aa86c1c110980895ac879657c0b5de925c988a24235d0657c2ee1ad8a7b594384dcbfb6debbb7ab89abf3c74ce66fe0094c3206396");

var sJWS = sign.signJson(TEST_MNEMONIC, TEST_PATH, TEST_ECDSA_CURVE, testjson);
console.log("sJWS=" + sJWS);
var result = sign.verifyByKjur(pubx, sJWS) 
expect(result).toBeTruthy()

})


test("Diff pub everytime", () => {
    const mnemonic = keytool.GenerateMnemonic(true);
    console.log("###MNEMONIC: "+mnemonic)    
   
    expect(mnemonic).toHaveLength(12 + 11);
    const TEST_PATH = "m/2018'/5'/1'/0"; //
    const TEST_ECDSA_CURVE = "secp256r1"
    var DIDinfo = keytool.CreateTcEduNchcV0DIDoc(mnemonic,TEST_PATH, TEST_ECDSA_CURVE);

    const mnemonic2 = keytool.GenerateMnemonic(true);
    console.log("###MNEMONIC: "+mnemonic2)    
    expect(mnemonic).toBe(mnemonic2);
    
    var DIDinfo2 = keytool.CreateTcEduNchcV0DIDoc(mnemonic2,TEST_PATH, TEST_ECDSA_CURVE);
    
    var pub1 = DIDinfo.publicKey[0].publicKeyHex;
    var pub2 = DIDinfo2.publicKey[0].publicKeyHex;

    console.log("### PUB1: "+pub1)  
   // expect(pub1).toBe("pub1");
    console.log("### PUB2: "+pub2)  
    expect(pub2).toBe(pub2);
  });