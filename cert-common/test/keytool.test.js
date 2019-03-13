const bech32 = require('bech32')
const keytool = require("../src/keytool");
const bitcoin = require("bitcoinjs-lib");
const bip39 = require('bip39')

test("GenerateMnemonic", () => {
  const mnemonic = keytool.GenerateMnemonic(true);
  // console.log(mnemonic)
  // 雛 張 壞 施 防 勵 鋼 廣 伸 弟 插 酒
  expect(mnemonic).toHaveLength(12 + 11);
});

test("DeriveKey", () => {
  ECDSA_TYPE = "secp256k1"
  const mnemonic = "雛 張 壞 施 防 勵 鋼 廣 伸 弟 插 酒";
  const path = "m/2018'/5'/1'/0";

  const dkey = keytool.DeriveKey(mnemonic, path, ECDSA_TYPE);
  const seed = bip39.mnemonicToSeed(mnemonic)
  console.log("SEED" + seed)
  expect(dkey).toBeTruthy();
  expect(dkey.privateKey).toBe(
    "1b837c4975e2d9f5f12768c571f34c466101cceb5d803278a1a33f6fca9a0521"

  );
  expect(dkey.publicKey).toBe(
    "0337f2d30c7bc7eb5ac121f561e032cb4a92f9544552d3457a821be767dcb7e84a"
  );
});

test("DeriveKey_r1", () => {
  ECDSA_TYPE = "secp256r1"
  const mnemonic = "雛 張 壞 施 防 勵 鋼 廣 伸 弟 插 酒";
  const path = "m/2018'/5'/1'/0";

  const dkey = keytool.DeriveKey(mnemonic, path, ECDSA_TYPE);
  //const seed = bip39.mnemonicToSeed(mnemonic)
  //console.log("SEED"+seed)
  expect(dkey).toBeTruthy();
  expect(dkey.privateKey).toBe(
    "ee8b39b901defb915fcbfa4e12094bad712fa95d39ae4b8cf97dbed532078547"

  );
  expect(dkey.publicKey).toBe(
    "027ff8a795c3d6a505c9be89bb40e4b10319b377ba361357183fb4fa56d3201c56"
  );
});

test("CreateDID", () => {

  const buf = Buffer.alloc(20, 0x10);
  const version = 3;
  const did = keytool.CreateDID("tcedu", "nchc", version, buf);
  expect(did).toBe("did:tcedu:nchc31kwy2dgxa023wcdh90gmy3g0uzc0hwfnpj56e6w");
  // bstring bench32 is deprecated
  // const b32id = did.split(":")[2];
  // const decode = bech32.decode(b32id);
  // expect(decode.hrp).toBe("nchc");
  // expect(decode.version).toBe(version);
  // expect(decode.hash).toEqual(bitcoin.crypto.ripemd160(buf));
});

test("CreateDID with mnemonic", () => {
  const mnemonic = "雛 張 壞 施 防 勵 鋼 廣 伸 弟 插 酒";
  const path = "m/2018'/5'/1'/0";
  const dkey = keytool.DeriveKey(mnemonic, path, ECDSA_TYPE);
  expect(dkey).toBeTruthy();
  if (ECDSA_TYPE == "secp256k1") {
    expect(dkey.publicKey).toBe(
      "0337f2d30c7bc7eb5ac121f561e032cb4a92f9544552d3457a821be767dcb7e84a"
    );
  } else if (ECDSA_TYPE == "secp256r1") {
    expect(dkey.publicKey).toBe(
      "027ff8a795c3d6a505c9be89bb40e4b10319b377ba361357183fb4fa56d3201c56"
    );
  }

  const buf = Buffer.from(dkey.publicKey, "hex");
  const version = 0;
  const did = keytool.CreateDID("tcedu", "nchc", version, buf);
  if (ECDSA_TYPE == "secp256k1") {
    expect(did).toBe("did:tcedu:nchc1qqxmkyf4zeujavd53adycve76tld7tus85jnhnw");
  } else if (ECDSA_TYPE == "secp256r1") {
    expect(did).toBe("did:tcedu:nchc01lnjcy4spl58e8ujqulqj5ze4aw84xm2lrwv4d2");
  }

});

test("CreateDIDoc with mnemonic", () => {
  const mnemonic = "雛 張 壞 施 防 勵 鋼 廣 伸 弟 插 酒";
  const path = "m/2018'/5'/1'";
  const didocResult = keytool.CreateTcEduNchcV0DIDoc(mnemonic, path, ECDSA_TYPE);

  if (ECDSA_TYPE == "secp256k1") {
    expect(didocResult.id).toBe("did:tcedu:nchc1qqxmkyf4zeujavd53adycve76tld7tus85jnhnw");
  } else if (ECDSA_TYPE == "secp256r1") {
    expect(didocResult.id).toBe("did:tcedu:nchc01m502nkd3z3wlhhfkzwtnm7s4mxvud2xrdd4y4e");
  }

  expect(didocResult.publicKey).toHaveLength(3);
  console.log(JSON.stringify(didocResult, null, 4));
  // TODO
  // expect(keytool.ValidateTcEduNchcDIDoc(didocResult)).toBeTruthy();
});

test("validate TcEduDIDoc", () => {
  const didocOk = require("./didoc.ok.json");
  expect(keytool.ValidateTcEduNchcDIDoc(didocOk)).toBeTruthy();
  const didocError = require("./didoc.error.json");
  expect(keytool.ValidateTcEduNchcDIDoc(didocError)).toBeFalsy();
});

test("Hash Message", () => {
  const hashedMsg = keytool.HashMessage(
    "TcEdu Signed Message",
    Buffer.from("BODY", "utf8")
  );
  // final buffer hex = 195463456475205369676e6564204d6573736167653a0a34424f4459
  // \u0019TcEdu Signed Message:
  // 4BODY
  // python .\test\hashmsg.py
  expect(hashedMsg).toBe(
    "bf59ff1dbd6a947a4383ca31ea8849d5101e063e1df5b67f7cfa4e60d9a5589c"
  );
  expect(
    keytool.HashMessage(
      "NCHC Blockchain Signed Message",
      Buffer.from("HELLO NCHC", "utf8")
    )
  ).toBe("5e9bf76f69dfb1c64149636af52fff0ca0cb4176d6f1274153697a8267c95e93");
  expect(
    keytool.HashMessage(
      "NCHC 國網中心 Signed Message",
      Buffer.from("HELLO NCHC", "utf8")
    )
  ).toBe("41c29bb815eb65b5ab0b5ad71997f1945c1b1db2d786537607db7382666dec27");
  expect(
    keytool.HashMessage(
      "NCHC 國網中心 Signed Message",
      Buffer.from("HELLO NCHC國網", "utf8")
    )
  ).toBe("92f13b10f5702a669106bd02d86c8fb915f7363a9573e1be6a49e62768aa71f7");
});