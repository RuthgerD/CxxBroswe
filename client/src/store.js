import Vue from 'vue'
import { Api } from '@/Api'

// save our state (isPanel open or not)
export const store = Vue.observable({
  state: {
    isNavOpen: !(window.matchMedia('(max-width: 1199px)').matches), // false,
    token: localStorage.getItem('auth_token') || null,
    hasValidToken: false
  },
  getters: {

  },
  actions: {

  }
})

// We call mutations anywhere we need it in our app
export const mutations = {
  toggleNav() {
    store.state.isNavOpen = !store.state.isNavOpen
  },
  storeToken(token) {
    store.state.token = token
    this.setIsLoggedIn(true)
    localStorage.setItem('auth_token', token)
  },
  setIsLoggedIn(val) {
    store.state.hasValidToken = val
  },
  destroyToken() {
    store.state.token = null
    store.state.hasValidToken = false
    localStorage.removeItem('auth_token')
  },
  async checkIsLoggedIn() {
    try {
      if (store.state.token) {
        const result = await Api.post('../auth/verify_token', { token: store.state.token })
        this.setIsLoggedIn(result.status === 200)
      } else {
        this.setIsLoggedIn(false)
      }
    } catch (error) {
      console.log('Login failed')
    }
  }
}
