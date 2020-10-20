import axios from 'axios'
import VueAuthenticate from 'vue-authenticate'
import qs from 'qs'

const cxxURL = 'http://dev.cxxbroswe.xyz'

export const Api = axios.create({
  baseURL: process.env.VUE_APP_API_ENDPOINT || `${cxxURL}:3000/api`
})

Api.defaults.paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'brackets', encode: false })

const auth = VueAuthenticate.factory(axios.create({ baseURL: process.env.VUE_APP_OAUTH_BASE_URL || `${cxxURL}:3000` }), {
  providers: {
    github: {
      clientId: process.env.VUE_APP_GITHUB_CLIENT_ID || 'c2ff54cacaccb53954dd',
      redirectUri: process.env.VUE_APP_AUTH_GH_REDIRECT_URI || `${cxxURL}:8080/auth/callback` // Client app URL
    }
  }
})

async function defaultGet(url, defaultReturn = null, options = {}) {
  return Api.get(url, options).then(res => res.data).catch(_ => defaultReturn)
}

async function defaultDelete(url, defaultReturn = null, options = {}) {
  return Api.delete(url, options).then(res => res.data).catch(_ => defaultReturn)
}

async function defaultPost(url, body, options = {}) {
  return Api.post(url, body, options).then(res => res.data).catch(_ => null)
}

async function defaultPatch(url, body, options = {}) {
  return Api.patch(url, body, options).then(res => res.data).catch(_ => null)
}

export function getStandards() {
  return defaultGet('/standards', [])
}

export function getDiff(id) {
  return defaultGet(`/diffs/${id}`, null)
}

export function getProposals() {
  return defaultGet('/proposals', null)
}

export async function getAvailablePages(base, diffs, maxLoops = 100, timeout = 4000) {
  const isAvailable = async () => Api.get('/pages', { params: { base, diffs } }).catch(_ => null)

  for (let i = 0; i < maxLoops; ++i) {
    const res = await isAvailable()
    if (!res || res.status === 204) { return null }
    if (res.status === 200) { return res.data }

    await new Promise(resolve => setTimeout(resolve, timeout))
  }
}

export function getPageHtml(base, diffs, page) {
  return defaultGet(`/pages/${page}`, null, { params: { base, diffs } })
}

export function authenticateUser(provider) {
  return auth.authenticate(provider)
    .then((res) => res.data)
    .catch(_ => null)
}

export async function getUserDetails(token, userId) {
  return await defaultGet(`/users/${userId}`, null, { headers: { authorization: 'Bearer ' + token } })
}

export async function getSettings(token, settingsId) {
  return await defaultGet(`/settings/${settingsId}`, null, { headers: { authorization: 'Bearer ' + token } })
}

export async function patchSettings(token, settingsId, settingsPatch) {
  return await defaultPatch(`/settings/${settingsId}`, { ...settingsPatch }, { headers: { authorization: 'Bearer ' + token } })
}

export async function deleteUserAccount(token, userId) {
  return await defaultDelete('/users/' + userId, { headers: { authorization: 'Bearer ' + token } })
}

export function createDiff(author, content, name) {
  return defaultPost('/diffs', { author, content, name })
}

export async function getCPPPulls(page, amount) {
  return axios.get('https://api.github.com/repos/cplusplus/draft/pulls', { params: { page, per_page: amount } }).then(res => res.data).catch(_ => null)
}

export async function getCPPDiff(number) {
  return defaultGet(`/gh_patch/${number}`, null)
}

export async function putUser(token, userId, newUserData, oldUserData = {}) {
  return Api.put(`/users/${userId}`, { ...oldUserData, ...newUserData }, { headers: { authorization: 'Bearer ' + token } }).catch(_ => null)
}

export async function postProposal(token, userId, proposal) {
  return defaultPost(`/users/${userId}/proposals`, proposal, { headers: { authorization: 'Bearer ' + token } }).catch(_ => null)
}
