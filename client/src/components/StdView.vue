<template>
  <b-container class="html-holder pt-5" >
    <b-col v-html="stdHtml.src" @click="captureClick"/>
  </b-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'StdView',
  computed: {
    ...mapState(['stdHtml', 'stdHtmlDetails'])
  },
  watch: {
    stdHtml: {
      handler: function (oldv, newv) {
        window.scrollTo(0, 0)
        if (newv.hash) { this.handleGoto(newv.hash) }
      },
      deep: true
    },
    stdHtmlDetails: {
      handler: function (oldv, newv) {
        this.handleGoto(newv.hash)
      },
      deep: true
    }
  },
  methods: {
    captureClick(ev) {
      if (!ev.target) { return }

      const newPage = ev.target.getAttribute('cxx-page')
      const newGoto = ev.target.getAttribute('cxx-goto')

      if (newPage) {
        this.$store.dispatch('setPage', newPage, newGoto)
      } else if (newGoto) { this.$store.dispatch('setPageHash', newGoto) }
    },
    handleGoto(hash) {
      Array.from(document.getElementsByClassName('cxx-close')).forEach(elem => {
        elem.style.display = 'none'
        elem.classList.remove('cxx-close')
      })

      const scrollTo = document.getElementById(hash)
      if (scrollTo) {
        Array.from(scrollTo.getElementsByClassName('tocChapter')).forEach(elem => {
          elem.style.display = 'block'
          elem.classList.add('cxx-close')
        })
        scrollTo.scrollIntoView()
      }
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
