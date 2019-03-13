<template>
  <div>
    <p>學生、教師，請點選 "教育雲端帳號登入" 按鈕登入，謝謝！</p>
    userid: <input type='text' v-model="userid"><br>
    schoolid: <input type='text' v-model="schooid"><br>
    
    <button @click="openid" variant="primary" class="btn btn-info btn-fill btn-wd">教育雲端帳號登入</button>
    <br><br><br>
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
    },
    data () {
      return {
        school: ''
      }
    },
    methods: {
    }
  }
</script>
<style>

</style>
