import Vue from 'vue'
import { Api } from '@/Api'
import VueAuthenticate from 'vue-authenticate'
import axios from 'axios'

import Vuex from 'vuex'

const auth = VueAuthenticate.factory(axios, {
  baseUrl: process.env.VUE_OAUTH_BASE_URL || 'http://dev.cxxbroswe.xyz:3000',
  providers: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || 'c2ff54cacaccb53954dd',
      redirectUri: process.env.AUTH_GH_redirectUri || 'http://dev.cxxbroswe.xyz:8080/auth/callback' // Client app URL
    }
  }
})

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    isNavOpen: true,
    token: localStorage.getItem('auth_token') || null,
    hasValidToken: false
  },
  mutations: {
    setLoggedIn(state, logged) {
      state.hasValidToken = logged
    },
    setToken(state, token) {
      state.token = token
      localStorage.setItem('auth_token', token)
    },
    destroyToken(state) {
      state.token = null
      localStorage.removeItem('auth_token')
    },
    toggleNav(state) {
      state.isNavOpen = !state.isNavOpen
    }
  },
  actions: {
    checkLoggedIn(context) {
      if (context.state.token) {
        // TODO: delegate this to Api.js
        Api.post('../auth/verify_token', { token: context.state.token })
          .then(res => {
            console.log('currently logged in')
            context.commit('setLoggedIn', res.status === 200)
          })
          .catch(err => console.log(err))
      } else {
        context.commit('setLoggedIn', false)
      }
    },
    authenticateUser(context, provider) {
      auth.authenticate(provider)
        .then((res) => {
          context.commit('setToken', res.data.access_token)
          context.dispatch('checkLoggedIn')
        })
        .catch((err) => console.log(err))
    }
  }
})
