import Vue from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue from 'bootstrap-vue'

import axios from 'axios'
import VueAxios from 'vue-axios'
import './style.scss'

Vue.use(VueAxios, axios)
Vue.use(BootstrapVue)

Vue.config.productionTip = false

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
