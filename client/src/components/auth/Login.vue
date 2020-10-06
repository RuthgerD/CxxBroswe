<template>
  <b-button
    @click="authenticate('github')"
    class="btn btn-block btn-social btn-github github-login"
  >
    <img src="/github.png" alt="GH" class="ml-1 mt-1 p-1"> Sign in with Github
  </b-button>
</template>

<script>
import { store, mutations } from '@/store.js'
import Vue from 'vue'
import VueAxios from 'vue-axios'
import VueAuthenticate from 'vue-authenticate'
import axios from 'axios'

Vue.use(VueAxios, axios)
Vue.use(VueAuthenticate, {
  baseUrl: 'http://localhost:3000', // API domain
  providers: {
    github: {
      clientId: 'c2ff54cacaccb53954dd',
      redirectUri: 'http://localhost:8080/auth/callback' // Client app URL
    }
  }
})
export default {
  name: 'login',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  computed: {
    isLoggedIn() {
      return store.getters.isLoggedIn()
    },
    currentAuthToken() {
      return store.state.token
    },
    verifyCurrentToken: () => {
      return store.getters.isLoggedIn
    }
  },
  methods: {
    async authenticate(provider) {
      try {
        const result = await this.$auth.authenticate(provider)
        console.log('Login succesful')
        mutations.storeToken(result.data.access_token)
      } catch (error) {
        console.log('Login failed')
        alert('Login failed')
      }
    }
  }
}
</script>

<style>
.github-login {
  left: 50%;
  -ms-transform: translateX(-50%);
  transform: translateX(-50%);
  color: #fff !important;
  background-color: #444 !important;
  border-color: rgba(0, 0, 0, 0.2) !important;
  width: 16em !important;
}
.btn-social {
  position: relative;
}
.btn-social > :first-child {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 32px;
  line-height: 34px;
  font-size: 1.6em;
  text-align: center;
  border-right: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
