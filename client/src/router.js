import Vue from 'vue'
import Router from 'vue-router'
import Container from './components/Container.vue'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'container',
    component: Container
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
