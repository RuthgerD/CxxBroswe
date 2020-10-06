<template>
  <b-button
    @click="logout()"
    class="btn-danger logout-btn">Logout
  </b-button>
</template>

<script>
import { mutations } from '../../store'

export default {
  methods: {
    logout() {
      mutations.destroyToken()
    }
  }
}
</script>

<style>
  .logout-btn{
    width: 16em !important;
  }
</style>
