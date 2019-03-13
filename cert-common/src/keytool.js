const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')
const bitcoinSecp256r1 = require('./bitcoinjs-lib-secp256r1')
const ethUtil = require('ethereumjs-util')
const sha3_256 = require('js-sha3').sha3_256
const bech32 = require('bech32')
const _ = require('lodash')
const Ajv = require('ajv')
const crypto = require('crypto');
const SCHEMA_TCEDU = require('./schema.tcedu.didoc.json')
var ajv = new Ajv()
var ajvTcEduDIDocValidate = ajv.compile(SCHEMA_TCEDU)

function GenerateMnemonic(isChineseTraditional) {
  // Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits of entropy
  return bip39.generateMnemonic(128,
    void 0, // fallback to default 'randombytes' function
    isChineseTraditional ? bip39.wordlists.chinese_traditional : bip39.wordlists.english)
}

function deriveMasterKeyPairFromMnemonic(mnemonic) {
  const seed = bip39.mnemonicToSeed(mnemonic)
  return bitcoin.HDNode.fromSeedBuffer(seed)
}

function GetEthereumAddress(privkeyHex) {
  const privKeyBuffer = Buffer.from(privkeyHex, 'hex')
  const addressBuffer = ethUtil.privateToAddress(privKeyBuffer)
  const hexAddress = addressBuffer.toString('hex')
  const checksumAddress = ethUtil.toChecksumAddress(hexAddress)
  return checksumAddress
}

function getFullPub(prvKey) {
  pub = ""
  return pub
}
/**type: secp256k1/secp256r1 */
function DeriveKey(mnemonic, derivePath, type) {
  var masterKeyPair
  var privateKeyHex
  var r

  switch (type) {
    case "secp256k1":
      masterKeyPair = deriveMasterKeyPairFromMnemonic()
      const kp = masterKeyPair.derivePath(derivePath).keyPair
      privateKeyHex = kp.d.toBuffer(32).toString('hex')
      r = {
        pub_buf: kp.getPublicKeyBuffer(),
        wif: kp.toWIF(),
        publicKey: kp.getPublicKeyBuffer().toString('hex'),
        privateKey: privateKeyHex,
        ethAddress: GetEthereumAddress(privateKeyHex),
        path: derivePath
      }
      return r
      break;
    case "secp256r1":

      const actualSeed = bip39.mnemonicToSeed(mnemonic)
      const rootNode = bitcoinSecp256r1.HDNode.fromSeedBuffer(actualSeed, bitcoinSecp256r1.bitcoin)
      const actualPathNode = rootNode.derivePath(derivePath)
      const actualPathNodeChild0 = actualPathNode.derive(0)
      const keypair = actualPathNodeChild0.keyPair
      const actualPrivateKey = actualPathNodeChild0.keyPair.d.toBuffer(32).toString('hex')
      // console.log(actualPrivateKey);
      const actualPublicKey = actualPathNodeChild0.keyPair.getPublicKeyBuffer().toString('hex')
      // console.log(actualPublicKey);
      /*
      masterKeyPair = deriveMasterKeyPairFromMnemonic_r1()
      const actualPathNode = masterKeyPair.derivePath(derivePath)
      const actualPathNodeChild0 = actualPathNode.derive(0)
      const keypair = actualPathNodeChild0.keyPair
      privateKeyHex = keypair.d.toBuffer(32).toString('hex')*/

      r = {
        pub_buf: keypair.getPublicKeyBuffer(),
        wif: keypair.toWIF(),
        publicKey: actualPublicKey,
        privateKey: actualPrivateKey,
        ethAddress: GetEthereumAddress(actualPrivateKey),
        path: derivePath
      }
      return r
      break;
    default:
      throw "type should be secp256k1 or secp256r1";

  }
}

function DeriveEthereumKeyPair(mnemonic) {
  const masterKeyPair = deriveMasterKeyPairFromMnemonic()
  const bitcoinNodeKeyPair = masterKeyPair.derivePath("m/44'/60'/0'/0/0")
    .keyPair
  return bitcoinNodeKeyPair.toWIF()
}

// Decentralization Identifiers(DIDs)
// https://w3c-ccg.github.io/did-spec/
//  did  = "did:" method ":" specific-idstring
// "did:tcedu:nchc123456789abcdefghi"
// method = tcedu
// 
// DEPRECATEE
// id = bech32('hca', addressOrPublicKeyHash) = nchc123456789abcdefghi
// DEPRECATED https://www.npmjs.com/package/bstring
// 

function CreateDID(method, prefix, version, buffer) {
  const ripemd160 = bitcoin.crypto.ripemd160(buffer)

  // https://github.com/bitcoinjs/bech32
  // let words = bech32.toWords(Buffer.from('foobar', 'utf8'))
  // bech32.encode('foo', words)
  // => 'foo1vehk7cnpwgry9h96'
  let words = bech32.toWords(ripemd160);
  const b32 = bech32.encode(prefix + version, words);
  return `did:${method}:${b32}`;
}

function CreateTcEduNchcV0DID(mnemonic, path, type) {
  const dkey = DeriveKey(mnemonic, path, type)
  const buf = Buffer.from(dkey.publicKey, 'hex');
  const version = 0
  const did = CreateDID('tcedu', 'nchc', version, buf)
  return {
    did: did,
    publicKey: dkey.publicKey
  };
}

function aesEncryptNew(data, key, iv) {
  let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  return cipher.update(data, '', 'hex') + cipher.final('hex');
}

function aesDecryptNew(data, key, iv) {
  let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  var decoded = decipher.update(data, '', 'hex');
  decoded += decipher.final('hex');
  return decoded;
}

// 
// https://github.com/uport-project/ethr-did-registry
// 
// https://github.com/uport-project/secp256k1-did-resolver
// https://w3c-ccg.github.io/did-spec/#dfn-did-method
function CreateTcEduNchcV0DIDoc(mnemonic, path, type) {
  const didPath = path + "/0"
  const didResult = CreateTcEduNchcV0DID(mnemonic, path, type)
  const did = didResult.did
  const publicKey = didResult.publicKey
  const didoc = {
    'context': "https://w3id.org/did/v1",
    'id': did
  }

  didoc.publicKey = []

  _.range(2).forEach((v) => {
    const kid = v + 1
    const pkPath = path + "/" + kid
    const pkDerive = DeriveKey(mnemonic, pkPath, type)
    const pk = {
      id: `${did}#keys-${kid}`,
      type: 'Secp256r1VerificationKey2018',
      owner: did,
      publicKeyHex: pkDerive.publicKey
    }
    didoc.publicKey.push(pk)
  })
  const kid2 = 3
  const pkPath2 = path + "/" + kid2
  const pkDerive2 = DeriveKey(mnemonic, pkPath2, 'secp256k1')
  const k1pk = {
    id: `${did}#keys-${kid2}`,
    type: 'Secp256k1VerificationKey2018',
    owner: did,
    publicKeyHex: pkDerive2.publicKey
  }
  didoc.publicKey.push(k1pk)
  didoc.authentication = []
  didoc.service = []
  didoc.proof = {
    "type": "LinkedDataSignature2015",
    "created": "2016-02-08T16:02:20Z",
    "creator": "did:example:8uQhQMGzWxR8vw5P3UWH1ja#keys-1",
    "signatureValue": "QNB13Y7Q9...1tzjn4w=="
  }

  return didoc
}

function ValidateTcEduNchcDIDoc(didoc) {
  const valid = ajvTcEduDIDocValidate(didoc)
  if (!valid) console.log(ajvTcEduDIDocValidate.errors);
  return valid
}

// SHA3-256
Sha3HashMessage = function (header, message) {
  // Bitcoin Header : \u0018Bitcoin Signed Message
  // Why does the standard Bitcoin message signature include a "magic prefix?" - Bitcoin Stack Exchange https://bitcoin.stackexchange.com/questions/36838/why-does-the-standard-bitcoin-message-signature-include-a-magic-prefix
  // Ethereum Header : \u0019Ethereum Signed Message

  // RFC4880
  // https://tools.ietf.org/html/rfc4880#section-5.2.1

  // UTF-8 1 chinese word = 3 bytes 
  // "\u0019NCHC 國網中心 Signed Message:\n16HELLO NCHC國網"

  const prefix = Buffer.from(`\u0019${header}:\n` + message.length.toString(), 'utf-8')
  // Bitcoin: sha256(Buffer.concat([prefix, message]))
  // Ethereum: keccak256(Buffer.concat([prefix, message]))
  console.log(message, message.length)
  return sha3_256(Buffer.concat([prefix, message]))
}

// SHA256withECDSA = sha256 and 256r1
function Ec256k1Sign() {
  // https://github.com/ethereumjs/ethereumjs-util/blob/master/index.js#L355
}

function Ec256k1Recover() {
  // https://github.com/ethereumjs/ethereumjs-util/blob/master/index.js#L386
}

function SHA384WithECDSA() {

  // RFC 7515 - JSON Web Signature (JWS) https://tools.ietf.org/html/rfc7515#section-3.1

  // digitalbazaar/jsonld-signatures: An implementation of the Linked Data Signatures specification for JSON-LD. Works in the browser and node.js. https://github.com/digitalbazaar/jsonld-signatures

  // https://ordina-jworks.github.io/security/2016/03/12/Digitally-signing-your-JSON-documents.html

  // 用ecrecover來驗簽名 – Taipei Ethereum Meetup – Medium https://medium.com/taipei-ethereum-meetup/%E7%94%A8ecrecover%E4%BE%86%E9%A9%97%E7%B0%BD%E5%90%8D-694fa8ae3638

  // https://github.com/kjur/jsrsasign/blob/master/src/ecdsa-modified-1.0.js#L203
  //  var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
  //  var sigValue = ec.signHex(hash, prvKey);

  // https://kjur.github.io/jsrsasign/api/symbols/KJUR.crypto.Signature.html#constructor
  // ECDSA signing

  // openssl test
  // openssl dgst -sha1 -sign private.pem < test.pdf > signature.bin
  // openssl dgst -sha1 -verify public.pem -signature signature.bin < test.pdf

  //
  // https://kjur.github.io/jsrsasign/sample/sample-ecdsa.html
  // privatekey dbadc9801fcd087e595a8f9bf48dacd1a5c876c1fef47d55b16fc19c043a122d
  // publickey 049df4172e5c061c11d1692cff9b9cd4b999a1cfb752db3f6b5aca4d53609c525064ef4b9bae8017394842e7c32ff5deb8bef760576b25119d54f4af0a9085d7f1
  // sign message (SHA256WithECDSA)
  // 'HELLO NCHC'
  // 30440220410e14c66f6780dd90ba15923ac5796279b4e7c3598c66a944aeb61b45f68cd6022044f0a9855281777b778b57e5635187b69ccfbe0894f85cee8dd77b41ea0aad7e
  // 

  // 第四代CA金鑰簽發之憑證與CRL (金鑰為ECC金鑰，簽章演算法為SHA384WithECDSA)
  // http://gtestca.nat.gov.tw/02-02.html

  // SHA256withECDSA
  // https://github.com/warner/python-ecdsa
  // prime256v1
  // Openssl 
  // 

  // https://www.npmjs.com/package/json-signatures

}

module.exports = {
  GenerateMnemonic: GenerateMnemonic,
  DeriveKey: DeriveKey,
  CreateDID: CreateDID,
  CreateTcEduNchcV0DID: CreateTcEduNchcV0DID,
  CreateTcEduNchcV0DIDoc: CreateTcEduNchcV0DIDoc,
  ValidateTcEduNchcDIDoc: ValidateTcEduNchcDIDoc,
  GetEthereumAddress: GetEthereumAddress,
  HashMessage: Sha3HashMessage,
  aesEncryptNew:aesEncryptNew,
  aesDecryptNew:aesDecryptNew
};



function test() {
  const mnemonic = "蒙 般 展 爛 資 旦 七 經 債 肥 否 駛"
  const mnemonic2 = "怒 徽 祥 蝕 擦 溝 棚 芳 給 天 座 害"
  const TEST_PATH = "m/2018'/5'/1'/0"; //
  const TEST_ECDSA_CURVE = "secp256r1"
  var pkDerive =DeriveKey(mnemonic, TEST_PATH, TEST_ECDSA_CURVE)
  // console.log("public"+pkDerive.publicKey);
  var pkDerive2 =DeriveKey(mnemonic2, TEST_PATH, TEST_ECDSA_CURVE)
  // console.log("public2"+pkDerive2.publicKey);

  var DID1 = CreateTcEduNchcV0DIDoc(mnemonic,TEST_PATH, TEST_ECDSA_CURVE);
  var DID2 = CreateTcEduNchcV0DIDoc(mnemonic2,TEST_PATH, TEST_ECDSA_CURVE);

  // console.log("public1 "+DID1.publicKey[0].publicKeyHex);
  // console.log("public2 "+DID2.publicKey[0].publicKeyHex);

}
