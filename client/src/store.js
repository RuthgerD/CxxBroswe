import Vue from 'vue'
import { getStandards, authenticateUser, getUserDetails, getPageHtml, getAvailablePages } from '@/Api'

import Vuex from 'vuex'

Vue.use(Vuex)

const linkRe = /(?<=<[^>]*? [^>]*?)(?<full_href>href=["'](?<page>[^"']+)\.html(?:#(?<goto>.*?)|(?:.*?))["'])(?=[^>]*>)/gm
const gotoRe = /(?<=<[^>]*? [^>]*?)(?<full_href>href=["'](?:#(?<goto>.*?))["'])(?=[^>]*>)/gm

export const store = new Vuex.Store({
  state: {
    isNavOpen: true,
    token: localStorage.getItem('auth_token') || null,
    userId: localStorage.getItem('user_id') || null,
    currentUser: null,
    hasValidToken: false,
    standards: [],
    stdHtmlDetails: {
      base: null,
      diffs: [],
      page: null,
      hash: null
    },
    stdHtml: {
      err_pages: null,
      availablePages: [],
      err_src: null,
      src: '',
      hash: null,
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
    setUserId(state, userId) {
      state.userId = userId
      localStorage.setItem('user_id', userId)
    },
    setCurrentUser(state, user) {
      state.currentUser = user
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
    async getUserDetails(context) {
      console.log('getUserDetails')
      if (context.state.token && context.state.userId) {
        try {
          const res = await getUserDetails(context.state.token, context.state.userId)
          const loggedIn = res.status === 200
          context.commit('setLoggedIn', loggedIn)
          context.commit('setCurrentUser', res.data.user)
        } catch (error) {
          context.commit('setLoggedIn', false)
        }
      } else {
        context.commit('setLoggedIn', false)
      }
    },
    logout(context) {
      context.commit('setToken', null)
      context.dispatch('getUserDetails')
    },
    fetchAll(context) {
      context.dispatch('getUserDetails')
      context.dispatch('fetchStandards')
    },

    async authenticateUser(context, provider) {
      const res = await authenticateUser(provider)
      context.commit('setToken', res.access_token)
      context.commit('setUserId', res.userId)
      context.dispatch('getUserDetails')
    },

    async fetchStandards(context) {
      context.state.standards = await getStandards()
    },

    async fetchHtml(context, hash = null) {
      const res = await getPageHtml(
        context.state.stdHtmlDetails.base,
        context.state.stdHtmlDetails.diffs,
        context.state.stdHtmlDetails.page || 'index'
      )
      context.state.stdHtml.err_src = !res ? 'Could not find page' : null

      if (res) {
        const linkPass = await res.replaceAll(linkRe, 'cxx-page="$2" cxx-goto="$3" style="cursor: pointer;" class="cxx-test" title="$2 #$3"')
        const gotoPass = await linkPass.replaceAll(gotoRe, 'cxx-goto="$2" style="cursor: pointer;" class="cxx-test" title="#$2"')

        context.state.stdHtml.src = gotoPass
        context.state.stdHtml.hash = hash
      } else { context.state.stdHtml.src = '' }
    },

    setPage(context, page, hash = null) {
      context.state.stdHtmlDetails.page = page
      context.dispatch('fetchHtml', hash)
    },

    setPageHash(context, hash) {
      context.state.stdHtmlDetails.hash = hash
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
