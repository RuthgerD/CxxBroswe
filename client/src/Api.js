import axios from 'axios'
import VueAuthenticate from 'vue-authenticate'
import qs from 'qs'

export const Api = axios.create({
  baseURL: process.env.VUE_APP_API_ENDPOINT || 'http://dev.cxxbroswe.xyz:3000/api'
})

Api.defaults.paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'brackets', encode: false })

const auth = VueAuthenticate.factory(Api, {
  baseUrl: '..',
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

export function getStandards() {
  return defaultGet('/standards', [])
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
  return await Api.get('/users/' + userId, { headers: { authorization: 'Bearer ' + token } })
}
