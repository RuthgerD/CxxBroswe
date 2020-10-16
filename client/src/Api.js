import axios from 'axios'
import VueAuthenticate from 'vue-authenticate'
import qs from 'qs'

export const Api = axios.create({
  baseURL: process.env.VUE_APP_API_ENDPOINT || 'http://dev.cxxbroswe.xyz:3000/api'
})

Api.defaults.paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'brackets', encode: false })

const auth = VueAuthenticate.factory(axios.create({ baseURL: Api.baseURL }), {
  baseUrl: `${Api.baseURL}/..`,
  providers: {
    github: {
      clientId: 'c2ff54cacaccb53954dd',
      redirectUri: 'http://dev.cxxbroswe.xyz:8080/auth/callback' // Client app URL
    }
  }
})

async function defaultGet(url, defaultReturn = null, options = {}) {
  return Api.get(url, options).then(res => res.data).catch(_ => defaultReturn)
}

async function defaultPost(url, body, options = {}) {
  return Api.post(url, body, options).then(res => res.data).catch(_ => null)
}

export function getStandards() {
  return defaultGet('/standards', [])
}

export function getDiff(id) {
  return defaultGet(`/diffs/${id}`, null)
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
  const res = Api.put(`/users/${userId}`, { ...oldUserData, ...newUserData }, { headers: { authorization: 'Bearer ' + token } }).catch(_ => null)
  return res
}
