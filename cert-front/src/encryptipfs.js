const rs = require('jsrsasign');
const keytool = require("../../cert-common/src/keytool");
const ecurve = require('ecurve');
var BigInteger = require('bigi')
var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");

// get date format of yyymmdd
// use to generate path
function getDate(){
  	Date.prototype.yyyymmdd = function() {
	  var minute = this.getMinutes()
	  var sec = this.getSeconds();
	  var msec = this.getMilliseconds();
	  return {"minute":minute,
	           "sec":sec,
	           "msec":msec
	         };
	};
	var date = new Date();
	return date.yyyymmdd();
}

// 回傳buffer,key
function aes_ipfsencrypt(fileContent,mnemonic){
	var date = getDate();
	var path = "m/"+date.minute+"'/"+date.sec+"'/"+date.msec+"'/"+"0"+ '/' + 1;
	const dkey = keytool.DeriveKey(mnemonic, path, "secp256r1");
	var prvKey = dkey.privateKey;
	var ciphertext = CryptoJS.AES.encrypt(fileContent, prvKey);
	return {"cipher":ciphertext.toString(),"key":prvKey};
}


// normal encrypt
function aes_encrypt(fileContent,key){
	var ciphertext = CryptoJS.AES.encrypt(fileContent, key);
	return {"cipher":ciphertext.toString(),"key":key};
}

function aes_decrypt(ciphertext,prvKey){
	var bytes  = CryptoJS.AES.decrypt(ciphertext, prvKey);
	try {
	  var plaintext = bytes.toString(CryptoJS.enc.Utf8);
	} catch (e) {
	  var plaintext = "wrong";
	}
	return plaintext
}

function HASH_SHA256(text){
	return SHA256(text).toString(CryptoJS.enc.Hex);
}

// function test(filepath="/Users/jimmy/Desktop/test.pdf",mnemonic="障 敬 華 吳 姓 協 聲 站 售 寶 吃 廠"){
// 	var cipher = aes_encrypt(base64_encode(filepath));
// 	var plain = base64_decode(aes_decrypt(cipher));
// 	// fs.writeFileSync("/Users/jimmy/Desktop/test_dec.pdf",plain)
// }

// test()

export{
	aes_ipfsencrypt,
	aes_encrypt,
	aes_decrypt,
	HASH_SHA256
}