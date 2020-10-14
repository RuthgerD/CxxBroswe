<template>
  <b-button
    @click="$store.dispatch('logout')"
    class="btn-danger logout-btn">Logout
  </b-button>
</template>

<script>

export default {
  name: 'logout'
}
</script>

<style>
  .logout-btn{
    width: 16em !important;
  }
</style>
