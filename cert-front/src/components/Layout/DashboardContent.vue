<template>
  <div class="content">
    <div class="container-fluid">
        <transition name="fade" mode="out-in">
          <!-- your content here -->
          <router-view 
            v-on:nowlogin="nowlogin" 
            v-bind:userInfo.sync="userInfo" 
            v-on:apiUserinfo="updateUserInfo" 
            v-bind:contractAddr="contractAddr"
            v-on:accesstoken="parseAccessToken"
            v-on:sendOrgAddr="setOrgAddr"
            v-on:sendCERTDBADDR="setCERTDB_ADDR"
          >
          </router-view>
        </transition>
    </div>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        userInfo: { 
          role: '',
          schoolID: '',
          classTitle: '',
          userName: '',
          userID: '',
          address: '',
          studentID: '',
          schoolName: '',
          userIDOri: ''
          },
        contractAddr: {
          certDB: '',
          cert2: ''
        },
        accessToken: ''
      }
    },
    created: async function () {
      const thispath = this.$route.path;
      
      const sessUserInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const sessContAddr = JSON.parse(sessionStorage.getItem('contAddr'));
      console.log(sessUserInfo);
      if(sessUserInfo != null) {
        this.userInfo = sessUserInfo;
        this.$emit('updaterole', this.userInfo.role);
        this.nowlogin(true);
      }
      if(sessContAddr != null) {
        this.contractAddr = sessContAddr;
      }
      console.log(this.contractAddr);
      console.log(this.userInfo);
    },
    methods: {
      nowlogin (islogin) {
        console.log('dashboardContent: ' + islogin);
        this.$emit('nowlogin', islogin);
      },
      updateUserInfo(apiUserinfo) {
        console.log('======= apiUserinfo ========')
        console.log(apiUserinfo);
        if(apiUserinfo === null) {
          console.log()
        } else {
          this.userInfo = apiUserinfo;
          sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo));
          console.log(this.userInfo);
        }
        this.$emit('updaterole', this.userInfo.role);
      },
      parseAccessToken(accessToken) {
        console.log('got access token: ' + accessToken);
        this.accessToken = accessToken;
      },
      setOrgAddr(orgAddr) {
        console.log("got orgAddr: " + orgAddr);
        this.contractAddr.cert2 = orgAddr;
        sessionStorage.setItem('contAddr', JSON.stringify(this.contractAddr));
      },
      setCERTDB_ADDR(certDBAddr) {
        console.log("got certDBAddr: " + certDBAddr);
        this.contractAddr.certDB = certDBAddr;
        sessionStorage.setItem('contAddr', JSON.stringify(this.contractAddr));
      }
    }
  }
</script>
<style>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity .1s
  }

  .fade-enter,
  .fade-leave-to
  /* .fade-leave-active in <2.1.8 */

  {
    opacity: 0
  }
</style>
