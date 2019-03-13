<template>
  <div :class="{'nav-open': $sidebar.showSidebar}">
    <router-view
      @nowlogin="nowlogin" 
      @updaterole="updateRole"
      :islogin="islogin"
      :role="role"
    ></router-view>
    <!--This sidebar appears only for screens smaller than 992px-->
    <side-bar type="navbar" 
      :sidebar-links="!islogin?$sidebar.sidebarLinks_logout:(role==='教師'?$sidebar.sidebarLinks_Tc:$sidebar.sidebarLinks_St)" 
      :islogin="islogin" :role="role">
      <ul class="nav navbar-nav">
        <li>
          <a href="#" class="btn-rotate" @click="gotoverify"> 
              <i class="ti-settings" ></i> <!-- ti-settings-->
              <p>
                電子檔驗証
              </p>
            </a>
        </li>
        <!-- <drop-down title="其他" icon="ti-view-list-alt">

          <li><a>業主電子檔驗証(Verify)</a></li>
          <li><a>區塊鏈監控(Explorer)</a></li>

        </drop-down> -->
        <li>
          <a href="#" class="btn-rotate" @click="loginout"> 
            <i :class="islogin?'fas fa-sign-out-alt':'fas fa-sign-in-alt'"></i> <!-- ti-settings-->
            <p>
              {{ islogin ? "登出" : "登入" }}
            </p>
          </a>
        </li>
        <li class="divider"></li>
      </ul>
    </side-bar>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        islogin: false,
        role: '學生',
      }
    },
    methods: {
      nowlogin(islogin) {
        if(islogin === false) {
          console.log('logout!!');
          sessionStorage.clear();
        }
        this.islogin = islogin;
      },
      updateRole(role) {
        this.role = role;
      },
      loginout () {
        if(this.islogin) {
          sessionStorage.clear();
          this.islogin = false;
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

<style lang="scss">
  #app {
    font-family:"Microsoft JhengHei", "Arial", sans-serif; 
    font-size:19px; 
    line-height:28px;
  }
</style>
