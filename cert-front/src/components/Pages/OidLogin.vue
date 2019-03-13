<template>
  <div>
    <p>學生、教師，請點選 "教育雲端帳號登入" 按鈕登入，謝謝！</p>
    <button @click="openid" variant="primary" class="btn btn-info btn-fill btn-wd">教育雲端帳號登入</button>
    <br><br><br>
    <!-- <p>管理者登入</p>
    <button @click="adminlogin" variant="primary" class="btn btn-info btn-fill btn-wd">管理者登入</button> -->
  </div>
</template>
<script>
  import { APISRV, GetAPIURL } from 'src/axios'
  let APIURL
  export default {
    //name: 'Login',
    created: async function () {
      APIURL = await GetAPIURL();
      const body = {
        response_type: 'code'
      }
      const resp = await APISRV.post( APIURL + '/auth/oid-tcsso-authurl', body)
      console.log(resp.data.result)
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
      },
      adminlogin() {
        this.$router.push({ path: 'admin' });
      }
    }
  }
</script>
<style>

</style>
