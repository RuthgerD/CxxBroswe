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
      redirectUri: 'http://localhost:8080/auth/callback' // Client app URL
    }
  }
})

async function defaultGet(url, errRet = null, options = {}) {
  return Api.get(url, options).then(res => res.data).catch(_ => errRet)
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
    .then((res) => res.data.access_token)
    .catch(_ => null)
}

export function checkLoggedIn(token) {
  if (!token) { return false }
  return Api.post('../auth/verify_token', { token })
    .then(res => res.status === 200)
    .catch(_ => false)
}
