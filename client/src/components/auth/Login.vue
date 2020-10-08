<template>
  <b-button
    @click="$store.dispatch('authenticateUser', 'github')"
    variant="primary"
    class="btn btn-block btn-social"
  >
    <img src="/github.png" alt="GH" class="ml-1 mt-1 p-1" />
    Sign in with Github
  </b-button>
</template>

<script>

export default {
  name: 'login'
}
</script>

<style>
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
