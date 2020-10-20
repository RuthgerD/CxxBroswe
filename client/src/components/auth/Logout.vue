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
    width: 10em;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
