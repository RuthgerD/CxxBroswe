<template>
  <b-container class="html-holder pt-5">
    <b-col v-html="html_content" />
  </b-container>
</template>

<script>
import { Api } from '@/Api.js'

export default {
  name: 'StdView',
  data() {
    return {
      fetching: false,
      html_content: '',
      commit: null,
      pr: null,
      proposal: null,
      diffs: [],
      page: 'index'
    }
  },
  methods: {
    set_showing(
      options = {
        page: 'index',
        commit: 'HEAD',
        diffs: []
      }
    ) {
      this.commit = options.commit || this.commit
      this.diffs = options.diffs || this.diffs
      this.page = options.page || this.page
      this.refresh()
    },
    refresh() {
      this.fetching = true
      Api.get(
        `/pages/${
          this.page || this.default_page
        }?diffs=[${this.diffs.toString()}]`
      )
        .then((res) => {
          this.html_content = res.data
        })
        .catch((err) => {
          this.html_content = err
        })
        .finally(() => {
          this.fetching = false
        })
    }
  },
  props: {
    default_page: {
      type: String,
      default: 'index'
    }
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
