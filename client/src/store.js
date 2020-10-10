import Vue from 'vue'
import { getStandards, authenticateUser, checkLoggedIn, getPageHtml, getAvailablePages } from '@/Api'

import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    isNavOpen: true,
    token: localStorage.getItem('auth_token') || null,
    hasValidToken: false,
    standards: [],
    stdHtmlDetails: {
      base: null,
      diffs: [],
      page: null
    },
    stdHtml: {
      err_pages: null,
      availablePages: [],
      err_src: null,
      src: '',
      fetching: false
    }
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
    fetchAll(context) {
      context.dispatch('checkLoggedIn')
      context.dispatch('fetchStandards')
    },

    // TODO: really not needed since we should just put the token in the Auth header for our requests
    async checkLoggedIn(context) {
      context.commit('setLoggedIn', await checkLoggedIn(context.state.token))
    },

    async authenticateUser(context, provider) {
      context.commit('setToken', await authenticateUser(provider))
      context.dispatch('checkLoggedIn') // TODO: not needed
    },

    async fetchStandards(context) {
      context.state.standards = await getStandards()
    },

    async fetchHtml(context) {
      const res = await getPageHtml(
        context.state.stdHtmlDetails.base,
        context.state.stdHtmlDetails.diffs,
        context.state.stdHtmlDetails.page || 'index'
      )
      context.state.stdHtml.err_src = !res ? 'Could not find page' : null
      context.state.stdHtml.src = res || ''
    },

    setPage(context, page) {
      context.state.stdHtmlDetails.page = page
      context.dispatch('fetchHtml')
    },

    async fetchPages(context) {
      context.state.stdHtml.fetching = true
      const res = await getAvailablePages(
        context.state.stdHtmlDetails.base,
        context.state.stdHtmlDetails.diffs
      )
      context.state.stdHtml.fetching = false

      context.state.stdHtml.err_pages = !res ? 'Configuration could not be generated' : null
      context.state.stdHtml.availablePages = res || []
      if (res) { context.dispatch('fetchHtml') }
    }
  },
  getters: {
    standardValName: state => state.standards.filter(val => val.aliasof && val.aliasof.hash).map(val => ({
      value: val.aliasof.hash,
      text: `${val.cplusplus ? 'C++' + val.cplusplus : val.name}` // TODO: have nicer formatting
    })
    )
  }
})
