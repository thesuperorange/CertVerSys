import * as bip39 from 'bip39'
import * as bitcoin from 'bitcoinjs-lib'
import ethUtil from 'ethereumjs-util'

export function GenerateMnemonic (isChineseTraditional) {
  // Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits of entropy
  return bip39.generateMnemonic(128,
    void 0, // fallback to default 'randombytes' function
    isChineseTraditional ? bip39.wordlists.chinese_traditional : bip39.wordlists.english)
}

function deriveMasterKeyPairFromMnemonic (mnemonic) {
  const seed = bip39.mnemonicToSeed(mnemonic)
  return bitcoin.HDNode.fromSeedBuffer(seed)
}

function getEthereumAddress (privkeyHex) {
  const privKeyBuffer = Buffer.from(privkeyHex, 'hex')
  const addressBuffer = ethUtil.privateToAddress(privKeyBuffer)
  const hexAddress = addressBuffer.toString('hex')
  const checksumAddress = ethUtil.toChecksumAddress(hexAddress)
  return checksumAddress
}

export function DeriveKey (mnemonic, derivePath) {
  const masterKeyPair = deriveMasterKeyPairFromMnemonic()
  const kp = masterKeyPair.derivePath(derivePath).keyPair
  const privateKeyHex = kp.d.toBuffer(32).toString('hex')
  const r = {
    wif: kp.toWIF(),
    publickey: kp.getPublicKeyBuffer().toString('hex'),
    privateKey: privateKeyHex,
    ethAddress: getEthereumAddress(privateKeyHex),
    path: derivePath
  }
  return r
}

export function DeriveEthereumKeyPair (mnemonic) {
  const masterKeyPair = deriveMasterKeyPairFromMnemonic()
  const bitcoinNodeKeyPair = masterKeyPair.derivePath("m/44'/60'/0'/0/0")
    .keyPair
  return bitcoinNodeKeyPair.toWIF()
}
