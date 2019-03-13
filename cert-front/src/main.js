import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios' //0425 add
import VueAxios from 'vue-axios' //0425 add
import VModal from 'vue-js-modal'

// Plugins
import GlobalComponents from './globalComponents'
import GlobalDirectives from './globalDirectives'
import Notifications from './components/UIComponents/NotificationPlugin'
import SideBar from './components/UIComponents/SidebarPlugin'
import Spinner from 'vue-simple-spinner'

import App from './App'

// router setup
import routes from './routes/routes'

// library imports
import Chartist from 'chartist'
import 'bootstrap/dist/css/bootstrap.css'
import './assets/sass/paper-dashboard.scss'
import 'es6-promise/auto'

// plugin setup
Vue.use(VueRouter)
Vue.use(GlobalComponents)
Vue.use(GlobalDirectives)
Vue.use(Notifications)
Vue.use(SideBar)
Vue.use(VueAxios, axios) //0425 add
//window.$http = Vue.prototype.$http = http
Vue.use(VModal, {
  dialog: true
})


// configure router
const router = new VueRouter({
  mode: 'hash', // mode: 'history',
  routes, // short for routes: routes
  linkActiveClass: 'active'
})

// global library setup
Object.defineProperty(Vue.prototype, '$Chartist', {
  get() {
    return this.$root.Chartist
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  data: {
    Chartist: Chartist
  },
  components: {
    Spinner
  }

})
