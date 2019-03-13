<template>
  <div class="animated fadeIn">
     <b-row>
      <b-col sm="6" md="4">
        <b-card header="DEMO: JWT Token API">
           <p>Check console at browser's dev tool</p>
           <b-button @click="jwtToken" variant="success" block>Post /auth/jwt-token</b-button>
           <b-button @click="jwtWhoami" variant="primary" block>Get /auth/jwt-whoami</b-button>
        </b-card>
      </b-col>
      <b-col sm="6" md="4">
        <b-card header="DEMO: Mnemonic Codes">
           <h4>mnemonic</h4>
           <p>{{mnemonic}}</p>
           <h4>Path</h4>
           <p>{{key.path}}</p>
           <h4>ethereum address</h4>
           <p>{{key.ethAddress}}</p>
           <h4>WIF</h4>
           <p>{{key.wif}}</p>
           <b-button @click="createMnemonic" variant="success" block>Creaate mnemonic(CHT) and address</b-button>
           <b-button @click="createMnemonicEn" variant="danger" block>Creaate mnemonic(EN) and address</b-button>
        </b-card>
      </b-col>
     </b-row>
  </div>
</template>

<script>
import { APISRV } from '../axios'
import { SetIdToken } from '../auth'
import { keytool } from 'cert-common'
export default {
  name: 'dashboard-dev',
  data () {
    return {
      title: 'NCHC BLOCKCHAIN TEAM',
      mnemonic: 'NOT_READY',
      ethereumAddress: '0x00',
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
    },

    createMnemonicEn () {
      this.mnemonic = keytool.GenerateMnemonic(false)
      this.key = keytool.DeriveKey(this.mnemonic, "m/1999'/60'/0'/0/0")
    },

    async jwtWhoami () {
      try {
        const resp = await APISRV.get('auth/jwt-whoami')
        console.log(resp.data)
      } catch (e) {
        console.log(e)
      }
    },
    async jwtToken () {
      let user = { id: 1001, username: 'bob', roles: ['USER'] }
      try {
        const resp = await APISRV.post('auth/jwt-token', user)
        console.log(resp.data)
        let token = resp.data.token.access_token
        SetIdToken(token)
      } catch (e) {
        console.log(e)
      }
    }
  }

}
</script>
