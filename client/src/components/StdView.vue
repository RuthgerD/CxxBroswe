<template>
  <b-container class="html-holder pt-5">
    <b-col v-html="stdHtml.src" />
  </b-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'StdView',
  computed: {
    ...mapState(['stdHtml'])
  }
}
</script>

<style scoped>
@media only screen and (max-width: 2000px) and (min-width: 1600px) {
  .html-holder {
    padding-left: 200px;
  }
}
@media only screen and (max-width: 1600px) and (min-width: 1400px) {
  .html-holder {
    padding-left: 400px;
  }
}
</style>
