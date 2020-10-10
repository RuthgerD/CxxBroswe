import axios from 'axios'

export const Api = axios.create({
  baseURL: process.env.VUE_APP_API_ENDPOINT || 'http://dev.cxxbroswe.xyz:3000/api'
})
