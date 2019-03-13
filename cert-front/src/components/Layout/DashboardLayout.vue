<template>
  <div class="wrapper">
    <side-bar 
      type="sidebar" 
      :sidebar-links="!islogin?$sidebar.sidebarLinks_logout:(role==='教師'?$sidebar.sidebarLinks_Tc:$sidebar.sidebarLinks_St)"
      :islogin="islogin" 
      :role="role">
    </side-bar>
    <!-- <notifications>

    </notifications> -->
    <div class="main-panel">
      <top-navbar v-on:nowlogin="nowlogin" :islogin="islogin"></top-navbar>

      <dashboard-content 
        @click.native="toggleSidebar" 
        v-on:nowlogin="nowlogin" 
        v-on:updaterole="updateRole" >
      </dashboard-content>

      <content-footer></content-footer>
    </div>
  </div>
</template>
<style lang="scss">

</style>
<script>
  import TopNavbar from './TopNavbar.vue'
  import ContentFooter from './ContentFooter.vue'
  import DashboardContent from './DashboardContent.vue'
  export default {
    props: {
      islogin: Boolean,
      role: String,
    },
    components: {
      TopNavbar,
      ContentFooter,
      DashboardContent
    },
    methods: {
      toggleSidebar () {
        if (this.$sidebar.showSidebar) {
          this.$sidebar.displaySidebar(false)
        }
      },
      nowlogin (islogin) {
        if(islogin === false) {
          console.log('logout!!');
          sessionStorage.clear();
        }
        this.$emit('nowlogin', islogin);
      },
      updateRole(role) {
        this.$emit('updaterole', role);
      }
    }
  }

</script>
