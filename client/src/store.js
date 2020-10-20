import Vue from 'vue'
import { getStandards, authenticateUser, getUserDetails, deleteUserAccount, getSettings, patchSettings, getPageHtml, getAvailablePages, createDiff, getCPPPulls, getCPPDiff, putUser, getDiff } from '@/Api'

import Vuex from 'vuex'

Vue.use(Vuex)

const linkRe = /(?<=<[^>]*? [^>]*?)(?<full_href>href=["'](?<page>[^"']+)\.html(?:#(?<goto>.*?)|(?:.*?))["'])(?=[^>]*>)/gm
const gotoRe = /(?<=<[^>]*? [^>]*?)(?<full_href>href=["'](?:#(?<goto>.*?))["'])(?=[^>]*>)/gm

export const store = new Vuex.Store({
  state: {
    isNavOpen: true,
    showErrorModal: false,
    token: localStorage.getItem('auth_token') || null,
    userId: localStorage.getItem('user_id') || null,
    currentUser: null,
    hasValidToken: false,
    controlView: 'main',
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
    settings: null,
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
    },
    showNetworkError(state, show) {
      state.showErrorModal = show
    },
    toggleControlView(state, alternative) {
      if (state.controlView === alternative) {
        state.controlView = 'main'
      } else {
        state.controlView = alternative
      }
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
        for (const diffId of res.diffs) {
          const diff = await getDiff(diffId)
          if (diff) {
            wait.push()
          } else {
            context.state.showErrorModal = true
          }
        }
        context.state.currentUser = res
        const r = await getSettings(context.state.token, context.state.currentUser.settings)
        if (!r) context.state.showErrorModal = true
        context.state.settings = r
        const diffs = await Promise.all(wait)
        res.diffs = diffs.filter(el => el !== null)
      } else {
        context.state.showErrorModal = true
      }
    },

    logout(context) {
      context.commit('destroyToken')
      context.commit('setUserId', null)
      context.dispatch('getUserDetails')
      context.state.controlView = 'main'
    },
    async deleteAccount(context) {
      if (confirm('Do you really want to delete your account?\nThis is NOT reversible!')) {
        const res = await deleteUserAccount(context.state.token, context.state.userId)
        if (res) {
          context.dispatch('logout')
        } else {
          context.state.showErrorModal = true
        }
      }
    },
    async saveSettings(context) {
      const settingsPatch = { sections: { } }
      const oldSettings = await getSettings(context.state.token, context.state.currentUser.settings)
      if (!oldSettings) { context.state.showErrorModal = true; return }
      for (const sectionKey in context.state.settings.sections) {
        if (oldSettings.sections[sectionKey]) {
          const newSection = context.state.settings.sections[sectionKey]
          for (const newSettingKey in newSection.settings) {
            const newSetting = newSection.settings[newSettingKey]
            const oldSetting = oldSettings.sections[sectionKey].settings.find(el => el.id === newSection.settings[newSettingKey].id)
            if ((!oldSetting) || (oldSetting && (newSetting.value !== oldSetting.value))) {
              if (!settingsPatch.sections[sectionKey]) {
                settingsPatch.sections[sectionKey] = { settings: [] }
              }
              settingsPatch.sections[sectionKey].settings.push(newSetting)
            }
          }
        } else {
          settingsPatch.sections.push(context.state.settings.sections[sectionKey])
        }
      }
      const res = await patchSettings(context.state.token, context.state.settings._id, settingsPatch)
      if (!res) context.state.showErrorModal = true
      context.state.settings = res
    },

    fetchAll(context) {
      context.dispatch('getUserDetails')
      context.dispatch('fetchStandards')
      context.dispatch('fetchCPPPulls')
    },

    async authenticateUser(context, provider) {
      const res = await authenticateUser(provider)
      if (!res) { context.state.showErrorModal = true; return }
      context.commit('setToken', res.access_token)
      context.commit('setUserId', res.userId)
      context.dispatch('getUserDetails')
    },

    async fetchStandards(context) {
      const standards = await getStandards()
      if (!standards) context.state.showErrorModal = true
      context.state.standards = standards
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
            } else {
              context.state.showErrorModal = true
            }
          }
          if (newDiff) { await context.dispatch('syncUser') }
          break
        case 'pr':
          for (const el of context.state.githubPulls.selected) {
            const patchData = await getCPPDiff(el.number)
            if (!patchData) { continue }
            const newDiffId = await createDiff(null, patchData, el.title)
            if (newDiffId) {
              context.state.stdHtmlDetails.diffs.push(newDiffId)
            } else {
              context.state.showErrorModal = true
            }
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
      if (res) {
        await context.dispatch('getUserDetails')
      } else {
        context.state.showErrorModal = true
      }
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
