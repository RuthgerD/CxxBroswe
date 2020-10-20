<template>
  <b-container class="html-holder pt-5">
    <b-col v-html="stdHtml.src" @click="captureClick" />
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
        if (newv.hash) {
          this.handleGoto(newv.hash)
        }
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
      if (!ev.target) {
        return
      }

      const check = (el) => {
        return el
          ? {
            page: el.getAttribute('cxx-page'),
            goto: el.getAttribute('cxx-goto')
          }
          : {}
      }

      let target = ev.target
      let tags = check(target)
      for (
        ;
        target && !tags.page && !tags.goto;
        tags = check((target = target.parentElement))
      ) {}

      if (tags.page) {
        this.$store.dispatch('setPage', tags.page, tags.goto)
      } else if (tags.goto) {
        this.$store.dispatch('setPageHash', tags.goto)
      }
    },

    handleGoto(hash) {
      Array.from(document.getElementsByClassName('cxx-close')).forEach(
        (elem) => {
          elem.style.display = 'none'
          elem.classList.remove('cxx-close')
        }
      )

      const scrollTo = document.getElementById(hash)
      if (scrollTo) {
        Array.from(scrollTo.getElementsByClassName('tocChapter')).forEach(
          (elem) => {
            elem.style.display = 'block'
            elem.classList.add('cxx-close')
          }
        )
        scrollTo.scrollIntoView()
      }
    }
  }
}
</script>

<style>
@import './StdView.css';
</style>
