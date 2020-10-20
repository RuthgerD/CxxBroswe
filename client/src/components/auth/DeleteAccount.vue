<template>
  <b-button
    @click="$store.dispatch('deleteAccount')"
    class="btn-outline-danger delete-account-btn">Delete Account
  </b-button>
</template>

<script>

export default {
  name: 'delete_account'
}
</script>

<style>
  .delete-account-btn{
    background-color: white !important;
    width: 10em;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .delete-account-btn:hover{
    background-color: red !important;
  }
</style>
