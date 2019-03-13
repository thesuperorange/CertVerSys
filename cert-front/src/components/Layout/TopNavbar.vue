<template>
  <nav class="navbar navbar-default">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" :class="{toggled: $sidebar.showSidebar}" @click="toggleSidebar">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar bar1"></span>
          <span class="icon-bar bar2"></span>
          <span class="icon-bar bar3"></span>
        </button>
        <a class="navbar-brand">{{routeName}}</a>
      </div>
      <div class="collapse navbar-collapse">
        <ul class="nav navbar-nav navbar-right">
          <!-- <li class="open">
            <a href="#" class="dropdown-toggle btn-magnify" data-toggle="dropdown">
              <i class="ti-bell"></i>
              <p>訊息</p>
            </a>
          </li> -->
             <!-- <drop-down title="其他" icon="ti-settings"> 
               <li><a href="#">業主電子檔驗証(Verify)</a></li>
               <li><a href="#">區塊鏈監控(Explorer)</a></li>
             </drop-down> -->
          <li>
            <a href="#" class="btn-rotate" @click="gotoverify"> 
              <i class="ti-settings" ></i> <!-- ti-settings-->
              <p>
                電子檔驗証(Verify)
              </p>
            </a>
          </li>
          <li>
            <a href="#" class="btn-rotate" @click="loginout"> 
              <i class="fa fa-lg" :class="[ islogin ? 'fa-sign-out-alt':'fa-sign-in-alt']"></i> <!-- ti-settings-->
              <p>
                {{ islogin ? "登出" : "登入" }}
              </p>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
  export default {
    props: {
      islogin: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      routeName () {
        const {name} = this.$route
        return this.capitalizeFirstLetter(name)
      }
    },
    data () {
      return {
        activeNotifications: false,
      }
    },
    methods: {
      capitalizeFirstLetter (string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
      },
      toggleNotificationDropDown () {
        this.activeNotifications = !this.activeNotifications
      },
      closeDropDown () {
        this.activeNotifications = false
      },
      toggleSidebar () {
        this.$sidebar.displaySidebar(!this.$sidebar.showSidebar)
      },
      hideSidebar () {
        this.$sidebar.displaySidebar(false)
      },
      loginout () {
        if(this.islogin) {
          this.$emit('nowlogin', false);
          this.$router.replace({path: '/'});
        } else {
          this.$router.replace({path: 'oidlogin'});
        }
      },
      gotoverify () {
        this.$router.replace({path: 'verify'});
      }
    }
  }

</script>
<style>

</style>
