<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <h1>登入</h1>
                <p class="text-muted">請使用學校帳號</p>
                <b-row>
                  <b-col cols="6">
                    <b-button @click="openid" variant="primary" class="px-4">OPNEID</b-button>
                  </b-col>
                  <b-col cols="6" class="text-right">
                  </b-col>
                </b-row>
              </b-card-body>
            </b-card>
            <b-card no-body class="text-white bg-primary py-5 d-md-down-none" style="width:44%">
              <b-card-body class="text-center">
                <div>
                  <h2>畢業證書驗證系統</h2>
                  <div>
                    <b-img src="/static/img/tc-img.jpg" fluid alt="Responsive image" />
                    </div>
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import { APISRV } from '../../axios'
export default {

  name: 'Login',
  created: async function () {
    const body = {
      response_type: 'code'
    }
    const resp = await APISRV.post('/auth/oid-tcsso-authurl', body)
    // console.log(resp.data.result)
    this.tcssourl = resp.data.result
  },
  data () {
    return {
      tcssourl: ''
    }
  },

  methods: {
    async openid () {
      console.log(this.tcssourl)
      window.location = this.tcssourl
    }
  }
}
</script>
