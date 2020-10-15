import Vue from 'vue'
import { getStandards, authenticateUser, getUserDetails, getPageHtml, getAvailablePages, createDiff, getCPPPulls, getCPPDiff, putUser, getDiff } from '@/Api'

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
    patch_type: null,
    githubPulls: {
      page: 1,
      amount: 5,
      data: [],
      selected: [],
      fetching: false
    },
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
    },
    pendingDiffs: [],
    selectedProfileDiffs: []
  },
  mutations: {
    setToken(state, token) {
      state.token = token
      localStorage.setItem('auth_token', token)
    },
    setUserId(state, userId) {
      state.userId = userId
      localStorage.setItem('user_id', userId)
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
      context.state.hasValidToken = false
      if (!context.state.token || !context.state.userId) { return }

      const res = await getUserDetails(context.state.token, context.state.userId)

      if (res) {
        context.state.hasValidToken = true
        const wait = []
        for (const diffId of res.user.diffs) {
          wait.push(getDiff(diffId))
        }
        const diffs = await Promise.all(wait)
        res.user.diffs = diffs.filter(el => el !== null)
        context.state.currentUser = res.user
      }
    },

    logout(context) {
      context.commit('setToken', null)
      context.dispatch('getUserDetails')
    },

    fetchAll(context) {
      context.dispatch('getUserDetails')
      context.dispatch('fetchStandards')
      context.dispatch('fetchCPPPulls')
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

      let newDiff = false
      switch (context.state.patch_type) {
        case 'diff':
          for (const el of context.state.pendingDiffs) {
            if (!newDiff) { await context.dispatch('getUserDetails'); newDiff = true }
            const newDiffId = await createDiff(context.state.hasValidToken ? context.state.userId : null, await el.data, el.name)
            if (newDiffId) {
              if (context.state.hasValidToken) {
                context.state.currentUser.diffs.push(newDiffId)
              }
              context.state.stdHtmlDetails.diffs.push(newDiffId)
            }
          }
          if (newDiff) { await context.dispatch('syncUser') }
          break
        case 'pr':
          for (const el of context.state.githubPulls.selected) {
            const patchData = await getCPPDiff(el.number)
            if (!patchData) { continue }
            const newDiffId = await createDiff(null, patchData, el.title)
            if (newDiffId) { context.state.stdHtmlDetails.diffs.push(newDiffId) }
          }
          break
        case 'proposal':
          break
      }

      const res = await getAvailablePages(
        context.state.stdHtmlDetails.base,
        context.state.stdHtmlDetails.diffs.concat(context.state.selectedProfileDiffs.map(el => el._id))
      )
      context.state.stdHtml.fetching = false

      context.state.stdHtml.err_pages = !res ? 'Configuration could not be generated' : null
      context.state.stdHtml.availablePages = res || []
      if (res) { context.dispatch('fetchHtml') }
    },

    async fetchCPPPulls(context) {
      context.state.githubPulls.fetching = true
      const res = await getCPPPulls(context.state.githubPulls.page, context.state.githubPulls.amount)
      context.state.githubPulls.fetching = false

      if (res) {
        context.state.githubPulls.data = res.filter(el => el.base.ref === 'master' && el.state === 'open').map(el => ({ name: el.title, number: el.number, base: el.base.sha }))
      } else { context.state.githubPulls.data = [] }
    },

    movePRPage(context, next) {
      if (next) {
        context.state.githubPulls.page += 1
      } else if (context.state.githubPulls.page > 0 && !next) {
        context.state.githubPulls.page -= 1
      } else { return }
      context.dispatch('fetchCPPPulls')
    },

    async syncUser(context) {
      const res = await putUser(context.state.token, context.state.userId, context.state.currentUser)
      if (res) { await context.dispatch('getUserDetails') }
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
