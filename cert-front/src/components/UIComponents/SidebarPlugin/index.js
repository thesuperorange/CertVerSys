import Sidebar from './SideBar.vue'

const SidebarStore = {
  showSidebar: false,
  sidebarLinks: [
    {
      name: '關於平台',
      icon: 'ti-panel',
      path: '/overview'
    },
    {
      name: '平台登入',
      icon: 'ti-user',
      path: '/oidlogin'
    },
    {
      name: '個人資訊',
      icon: 'ti-info', //ti-id-badge
      path: '/userinfo'
    },
    {
      name: '發行/簽署證書',
      icon: 'ti-rocket',
      path: '/issue'
    },
    {
      name: '查詢個人證書',
      icon: 'ti-medall-alt', //ti-view-list-alt
      path: '/certlist'
    },
    {
      name: '查看簽署狀態',
      icon: 'ti-view-list-alt', //ti-bell
      path: '/signinfo'
    },
    {
      name: '申請時效性驗證證書',
      icon: 'ti-timer',
      path: '/ipfsapply'
    },
    {
      name: '驗證時效性證書',
      icon: 'ti-key',
      path: '/ipfsverify'
    },
    {
      name: '申請證書撤銷',
      icon: 'ti-trash',
      path: '/revokeapply'
    },
    {
      name: '待簽章證書列表',
      icon: 'ti-arrow-circle-right',
      path: '/revoketrace'
    },
    {
      name: '撤銷證書一覽',
      icon: 'ti-menu-alt',
      path: '/revokedump'
    }
  ],
  sidebarLinks_Tc: [
    {
      name: '關於平台',
      icon: 'ti-panel',
      path: '/overview'
    },
    {
      name: '個人資訊',
      icon: 'ti-info', //ti-id-badge
      path: '/userinfo'
    },
    {
      name: '發行證書',
      icon: 'ti-rocket',
      path: '/issue'
    },
    {
      name: '查看簽署狀態',
      icon: 'ti-view-list-alt', //ti-bell
      path: '/signinfo'
    },
    {
      name: '驗證時效性證書',
      icon: 'ti-key',
      path: '/ipfsverify'
    },
    {
      name: '申請證書撤銷',
      icon: 'ti-trash',
      path: '/revokeapply'
    },
    {
      name: '待簽章證書列表',
      icon: 'ti-arrow-circle-right',
      path: '/revoketrace'
    },
    {
      name: '撤銷證書一覽',
      icon: 'ti-menu-alt',
      path: '/revokedump'
    }
  ],
  sidebarLinks_St: [
    {
      name: '關於平台',
      icon: 'ti-panel',
      path: '/overview'
    },
    {
      name: '個人資訊',
      icon: 'ti-info', //ti-id-badge
      path: '/userinfo'
    },
    {
      name: '發行證書',
      icon: 'ti-rocket',
      path: '/issuestud'
    },
    {
      name: '查詢個人證書',
      icon: 'ti-medall-alt', //ti-view-list-alt
      path: '/certlist'
    },
    {
      name: '申請時效性驗證證書',
      icon: 'ti-timer',
      path: '/ipfsapply'
    },
    {
      name: '驗證時效性證書',
      icon: 'ti-key',
      path: '/ipfsverify'
    },
    {
      name: '申請證書撤銷',
      icon: 'ti-trash',
      path: '/revokeapply'
    },
    {
      name: '撤銷證書一覽',
      icon: 'ti-menu-alt',
      path: '/revokedump'
    }
  ],
  sidebarLinks_logout: [
    {
      name: '關於平台',
      icon: 'ti-panel',
      path: '/overview'
    },
    {
      name: '平台登入',
      icon: 'ti-user',
      path: '/oidlogin'
    },
    {
      name: '驗證時效性證書',
      icon: 'ti-key',
      path: '/ipfsverify'
    },
    {
      name: '撤銷證書一覽',
      icon: 'ti-menu-alt',
      path: '/revokedump'
    }
  ],
  displaySidebar (value) {
    this.showSidebar = value
  }
}

const SidebarPlugin = {

  install (Vue) {
    Vue.mixin({
      data () {
        return {
          sidebarStore: SidebarStore
        }
      }
    })

    Object.defineProperty(Vue.prototype, '$sidebar', {
      get () {
        return this.$root.sidebarStore
      }
    })
    Vue.component('side-bar', Sidebar)
  }
}

export default SidebarPlugin
