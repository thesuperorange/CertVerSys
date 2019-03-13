<template>
  <q-page class="flex flex-center">
    <div class="column">
    <h3>台中市區塊鏈技術</h3>
    <div>
       <q-btn>國小畢業證書手機版</q-btn>
    </div>
    <q-card>
  <q-card-title>
    mnemonic codes
  </q-card-title>
  <q-card-separator />
  <q-card-main>
   <h4>mnemonic</h4>
           <p>{{mnemonic}}</p>
           <h4>Path</h4>
           <p>{{key.path}}</p>
           <h4>ethereum address</h4>
           <p>{{key.ethAddress}}</p>
           <q-btn @click="createMnemonic">Creaate mnemonic(CHT) and address</q-btn>
  </q-card-main>
</q-card>
    </div>
  </q-page>
</template>

<style>

</style>

<script>
// ISSUE Module build failed:   Error: No ESLint configuration found.
// import { keytool } from 'cert-common'
export default {
  data () {
    return {
      mnemonic: 'NOT_READY',
      key: {}
    }
  },
  methods: {

    createMnemonic () {
      this.mnemonic = keytool.GenerateMnemonic(true)
      this.key = keytool.DeriveKey(this.mnemonic, "m/1999'/60'/0'/0/0")
      console.log(this.key)
      // example
      // ethAddress : "0xED5A3FF02F49ef130C55d94ACf7fa2c1E05F5E68"
      // path : "m/1999'/60'/0'/0/0"
      // privateKey : "1718f09c35b962ee7b83d1d68ce862489a2291080fb4b669fa10fe1152cef82e"
      // publickey : "03fe167bddc9522354d6a187984ec35656da6e391ced37843dd3c18fff3d907d7c"
      // wif :"KwzcHmhMji9xiiFYrbtSCZRj196SiurwWPLbCepqumug7Cyu5ZmM"
    }
  }
}
</script>
