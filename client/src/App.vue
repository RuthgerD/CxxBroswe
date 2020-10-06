<template>
  <div id="app">
    <MenuBar v-show="true">
      <Login v-if="!isLoggedIn" />
      <Container v-if="isLoggedIn" />
      <!-- <ul>
        <li>
          <router-link to="/">Home</router-link>
        </li>
        <li>
          <router-link to="/login">Login</router-link>
        </li>
        <li>
          <router-link to="/register">Register</router-link>
        </li>
        <li>
          <router-link to="/logout">Logout</router-link>
        </li>
      </ul> -->
    </MenuBar>
    <MenuIcon />
    <!-- Render the content of the current page view -->
    <router-view />
  </div>
</template>

<script>
import { mutations, store } from './store'
import MenuIcon from './components/menu/MenuIcon.vue'
import MenuBar from './components/menu/MenuBar.vue'
import Container from './components/Container.vue'
import Login from './components/auth/Login.vue'

mutations.checkIsLoggedIn()

export default {
  name: 'app',
  components: {
    MenuIcon,
    MenuBar,
    Container,
    Login
  },
  computed: {
    currentAuthToken() {
      return store.state.token
    },
    isLoggedIn() {
      return store.state.hasValidToken
    }
  },
  methods: {
  }
}
</script>
