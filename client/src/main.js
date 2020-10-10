import Vue from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue from 'bootstrap-vue'

import './style.scss'
import { store } from '@/store.js'

Vue.use(BootstrapVue)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  created() {
    this.$store.dispatch('fetchAll')
  },
  render: r => r(App)
}).$mount('#app')
