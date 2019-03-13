
var jsonld = require('jsonld');
var jsig = require('jsonld-signatures');
jsig.use('jsonld', jsonld);
/*
const assert = require('chai').assert;
//const common = require('./test-common');
//const jsonld = require('../node_modules/jsonld');
const jsigs = require('..');

const options = {
    assert: assert,
    jsigs: jsigs,
    jsonld: jsonld,
    nodejs: true
  };*/
  

// to generate the next two lines, run the following command:
//
// openssl genrsa -out key.pem; cat key.pem; openssl rsa -in key.pem -pubout -out pubkey.pem; cat pubkey.pem; rm key.pem pubkey.pem
//
// for an example of how to specify these keys, look at [key-example]:
var testPublicKeyPem =
  '-----BEGIN PUBLIC KEY-----\n' +
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4R1AmYYyE47FMZgo708NhFU+t\n' +
  '+VWn133PYGt/WYmD5BnKj679YiUmyrC3hX6oZfo4eVpOkycxZvGgXCLQGuDp45Xf\n' +
  'Zkdsjqs3o62En4YjlHWxgeGmkiRqGfZ3sJ3u5WZ2xwapdZY3/2T/oOV5ri8SktTv\n' +
  'mVGCyhwFuJC/NbJMEwIDAQAB\n' +
  '-----END PUBLIC KEY-----';
var testPrivateKeyPem = '-----BEGIN RSA PRIVATE KEY-----\n' +
  'MIICWwIBAAKBgQC4R1AmYYyE47FMZgo708NhFU+t+VWn133PYGt/WYmD5BnKj679\n' +
  'YiUmyrC3hX6oZfo4eVpOkycxZvGgXCLQGuDp45XfZkdsjqs3o62En4YjlHWxgeGm\n' +
  'kiRqGfZ3sJ3u5WZ2xwapdZY3/2T/oOV5ri8SktTvmVGCyhwFuJC/NbJMEwIDAQAB\n' +
  'AoGAZXNdPMQXiFGSGm1S1P0QYzJIW48ZCP4p1TFP/RxeCK5bRJk1zWlq6qBMCb0E\n' +
  'rdD2oICupvN8cEYsYAxZXhhuGWZ60vggbqTTa+4LXB+SGCbKMX711ZoQHdY7rnaF\n' +
  'b/Udf4wTLD1yAslx1TrHkV56OfuJcEdWC7JWqyNXQoxedwECQQDZvcEmBT/Sol/S\n' +
  'AT5ZSsgXm6xCrEl4K26Vyw3M5UShRSlgk12gfqqSpdeP5Z7jdV/t5+vD89OJVfaa\n' +
  'Tw4h9BibAkEA2Khe03oYQzqP1V4YyV3QeC4yl5fCBr8HRyOMC4qHHKQqBp2VDUyu\n' +
  'RBJhTqqf1ErzUBkXseawNxtyuPmPrMSl6QJAQOgfu4W1EMT2a1OTkmqIWwE8yGMz\n' +
  'Q28u99gftQRjAO/s9az4K++WSUDGkU6RnpxOjEymKzNzy2ykpjsKq3RoIQJAA+XL\n' +
  'huxsYVE9Yy5FLeI1LORP3rBJOkvXeq0mCNMeKSK+6s2M7+dQP0NBYuPo6i3LAMbi\n' +
  'yT2IMAWbY76Bmi8TeQJAfdLJGwiDNIhTVYHxvDz79ANzgRAd1kPKPddJZ/w7Gfhm\n' +
  '8Mezti8HCizDxPb+H8HlJMSkfoHx1veWkdLaPWRFrA==\n' +
'-----END RSA PRIVATE KEY-----';


var testPublicKeyPem2 =
  '-----BEGIN PUBLIC KEY-----\n' +
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwlsOUSgEA9NZdtxFmra5\n' +
  'tbdQQkcLcOTqLNBjXm275/Vdoz5Bcwfipty3As2b2nxJt8I9co4lmE4wsDHp5dyu\n' +
  '34SFKn4/Y9SQzQWAvmkSBkgcRXCBS91cakW7Wx3O9/Yr66hSO7pAbt2TEW3Jf3Xl\n' +
  '3NZcnCDpNCYc40UOWRh0pmMMeyKMedHki6rWD6fgT/0Qm+LeN7E9Aelqy/5OwW38\n' +
  'aKXCuf6J9J2bBzGTc9nof7Ordnllz/XS7dLm6qNT3lkx+VMFOa9L1JXo77p7DI+L\n' +
  'z7CnswIQ8Yq9ukZZzjLvX6RN1pEB9CW9rvU9r2k2VPN8bTY3yXjolo1s6bG69lc3\n' +
  'vQIDAQAB\n' +
  '-----END PUBLIC KEY-----';
var testPrivateKeyPem2 = '-----BEGIN RSA PRIVATE KEY-----\r\n' +
  'MIIEpQIBAAKCAQEAwlsOUSgEA9NZdtxFmra5tbdQQkcLcOTqLNBjXm275/Vdoz5B\n' +
  'cwfipty3As2b2nxJt8I9co4lmE4wsDHp5dyu34SFKn4/Y9SQzQWAvmkSBkgcRXCB\n' +
  'S91cakW7Wx3O9/Yr66hSO7pAbt2TEW3Jf3Xl3NZcnCDpNCYc40UOWRh0pmMMeyKM\n' +
  'edHki6rWD6fgT/0Qm+LeN7E9Aelqy/5OwW38aKXCuf6J9J2bBzGTc9nof7Ordnll\n' +
  'z/XS7dLm6qNT3lkx+VMFOa9L1JXo77p7DI+Lz7CnswIQ8Yq9ukZZzjLvX6RN1pEB\n' +
  '9CW9rvU9r2k2VPN8bTY3yXjolo1s6bG69lc3vQIDAQABAoIBAC68FIpBVA3TcYza\n' +
  'VMZqL+fZR6xYRxEDiqfyCCL5whh58OVDIBvYBpFXO46qAFMeVd+hDoOQWMvx6VVE\n' +
  '+1hxo39N73OTXgzUXWlfbGDdBR+LkXjFH+ItPX60e+PiHBWWFWOaWwPPupSuJSIo\n' +
  'wy4qHHbo+OX2J/2JOKMRxOx5q/siI+vrzYKEdRU+P338vWpvlBK9GiodIY29t71Z\n' +  
  'qTV+2eA1v5rmDK/pa8+WXUNKyKrIZQ8qxdf8LbD/1QkspvCqcyQ+XTl+qkRM8hp8\n' +
  'ONfhLFPrIN0BOonwGNh9u9bsYGZGmoV8YzdgJoNJ1jWRyuKhO9Px5hQmnixuBdkO\n' +
  'XcdkOiECgYEA/y5vsNeUgwTkolYSIs2QqHuLqxZZ1U5JyPKVipuqgrSgAV20A3Ah\n' +
  'Bvnp+GpqrConLrvjoYKRCWf9IRI+MfxFiLTgKdWxc6PlDXAFpaSZAgYVBTRudgd/\n' +
  'CLpr7fC1w9rx5S/VHaDu89aLBTsSHjQBIKZaWhmFM00Y+tqkxtqrBjkCgYEAwvqq\n' +
  '3/MbOZHEOXjDzbwsZPg+8q8eyBE0bPzp4tjxBPvxnWqwhC3NoKhZP/E2gojVDgdH\n' +
  'ZvsEO+o8JXH2DKFBEXc80c77Gl8hhiRsFab1rIRl7vCUjgNksu1ChzXnvwJuRAB4\n' +
  'mFHsuxJi83kRQD8HqgIfuDnsS5kl6gpvAlel3aUCgYEAjBxjFyZHVOkK4FeB/boB\n' +
  'A4FSXs4W5RfnS35mvYRbSwkCEb3xaTHX8Iyn+s3zZDSA7xgbFEMsf42pXs81dxyc\n' +
  '0UL/EflTRbtnuMkZUKnfmUzdnc38GLJk/dXeDPdt1ewRhVWOHoaOrTPPgT+94veK\n' +
  '5vJwCaiZimF6pcIHV2gZH4ECgYEAmcq4b07FIaKdYSulXijX54h7tlZ09B/F91WC\n' +
  'ciDl8yV6zcyykH/EWr2PMEVl1o5xZtBM/KhwDYZTjMGX7xxeQ5WGjoMxQvrYaYNf\n' +
  'EbEQxNPlxxNSSbXZftxwBlB5jAsxyEeK17J/BIubKypKdh+BPxLPzDM78+FHq5Qx\n' +
  'PWq+9NUCgYEAqm0LdhkoqdKgbkU/rgNjX3CgINQ/OhbUGpqq78EAbw/90MCXGdOB\n' +
  '5pxB4HwKFtDPNtquIQ3UCIVVCJlDZfW7mJJQ9LkD21uqwxXOf1uPH2cb651yeLqd\n' +
  'TSz1b9F4+GFdKxjk8JKywWAD2fIamcx2W0Wfgfyvr6Kd+kJrkyWn+ZM=\n' +
'-----END RSA PRIVATE KEY-----';

var SECURITY_CONTEXT_URL= 'https://w3id.org/security/v2';

var testPublicKeyUrl = 'https://example.com/i/alice/keys/1';
// specify the public key object
var testPublicKey = {
    '@context': SECURITY_CONTEXT_URL,
    id: testPublicKeyUrl,
    type: ['CryptographicKey', 'RsaVerificationKey2018'],
    owner: 'https://example.com/i/alice',
    publicKeyPem: testPublicKeyPem
  };
  var testPublicKeyOwner = {
    '@context': SECURITY_CONTEXT_URL,
    id: 'https://example.com/i/alice',
    publicKey: [testPublicKey],
    "https://example.org/special-authentication": {
      publicKey: testPublicKeyUrl
    }
  };

//------------------------------------

var testPrivateKeyWif ='L4mEi7eEdTNNFQEWaa7JhUKAbtHdVvByGAqvpJKC53mfiqunjBjw';
var testPublicKeyWif = '1LGpGhGK8whX23ZNdxrgtjKrek9rP4xWER';
var testPublicKeyFriendly = 'ecdsa-koblitz-pubkey:' + testPublicKeyWif;

var testPublicKeyBtc = {
'@context': SECURITY_CONTEXT_URL,
id: testPublicKeyFriendly,
type: 'CryptographicKey',
owner: 'https://example.com/i/alice',
publicKeyWif: testPublicKeyWif
};

var testPublicKeyBtcOwner = {
'@context': SECURITY_CONTEXT_URL,
id: 'https://example.com/i/alice',
publicKey: [testPublicKeyFriendly]
};

//------------------------------
const testPublicKeyEd25519Base58 =
  'GycSSui454dpYRKiFdsQ5uaE8Gy3ac6dSMPcAoQsk8yq';
const testPrivateKeyEd25519Base58 =
  '3Mmk4UzTRJTEtxaKk61LxtgUxAa2Dg36jF6VogPtRiKvfpsQWKPCLesKSV182RMmvM' +
'JKk6QErH3wgdHp8itkSSiF';



// create the JSON-LD document that should be signed
var testDocument = {
  "@context": SECURITY_CONTEXT_URL,
  name: 'Manu Sporny',
  homepage: 'https://manu.sporny.org/',
  image: 'https://manu.sporny.org/images/manu.png'
};

var testDocumentSigned = {};
      jsig.sign(testDocument, {
        algorithm: 'LinkedDataSignature2015',
        privateKeyPem: testPrivateKeyPem,
        creator: testPublicKeyUrl
      }, function(err, signedDocument) {
        console.log("sign document"+JSON.stringify(signedDocument))
        console.log("signature"+signedDocument.signature)
        console.log("abc");
      /*  assert.ifError(err);
        assert.notEqual(signedDocument.signature, undefined,
          'signature was not created');
        assert.equal(signedDocument.signature.creator, testPublicKeyUrl,
          'creator key for signature is wrong');
        testDocumentSigned = signedDocument;
        console.log("sig"+JSON.stringify(testDocumentSigned))
        done();*/
      });

//console.log("sig"+JSON.stringify(testDocumentSigned))
  /*
        jsig.verify(testDocumentSigned, {
          publicKey: testPublicKey,
          publicKeyOwner: testPublicKeyOwner
        }, function(err, result) {
          assert.ifError(err);
          assert.equal(
            result.verified, true, 'signature verification failed');
          done();
        });
  */

// sign the document and then verify the signed document
/*jsig.sign(testDocument, {
    algorithm: 'LinkedDataSignature2015',
  privateKeyPem: testPrivateKeyPem,
  creator: testPublicKeyUrl
}, function(err, signedDocument) {
  if(err) {
    return console.log('Signing error:', err);
  }
  console.log('Signed document:', signedDocument);

  // verify the signed document
  jsig.verify(signedDocument, {
    publicKey: testPublicKey,
    publicKeyOwner: testPublicKeyOwner,
  }, function(err, verified) {
    if(err) {
      return console.log('Signature verification error:', err);
    }
    console.log('Signature is valid:', verified);
  });
});*/

// verification
/*
var sign = jsig.promises.sign(testDocument, {
  privateKeyPem: testPrivateKeyPem,
  creator: 'https://example.com/i/alice/keys/1'
});
sign.then(function(signedDocument) {...}, function(err) {...});

var verify = jsig.promises.verify(signedDocument, {
  publicKey: testPublicKey,
  publicKeyOwner: testPublicKeyOwner
});
verify.then(function(verified) {...}, function(err) {...});
*/