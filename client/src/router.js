import Vue from 'vue'
import Router from 'vue-router'
import Main from './views/Main.vue'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'main',
    component: Main
  },
  {
    path: '/:page',
    name: 'main with page',
    component: Main
  }
]

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: routes
})
