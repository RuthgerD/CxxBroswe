import Vue from 'vue'
import Router from 'vue-router'
import Container from './components/Container.vue'
import Login from './components/auth/Login'
import Logout from './components/auth/Logout'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'container',
    component: Container
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/logout',
    name: 'logout',
    component: Logout
  },
  {
    path: '/:page',
    name: 'container with page',
    component: Container
  }
]

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: routes
})
