<template>
  <div>
    <std-view ref="stdview" />
    <MenuBar>
      <control v-on:settings-applied="val => $refs.stdview.set_showing(val)" />
    </MenuBar>
    <MenuIcon />
  </div>
</template>

<script>
import Control from '@/components/Control'
import StdView from '@/components/StdView'
import MenuBar from '@/components/menu/MenuBar'
import MenuIcon from '@/components/menu/MenuIcon'

export default {
  name: 'Main',
  components: {
    Control,
    StdView,
    MenuBar,
    MenuIcon
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (to.params.page) {
        vm.$refs.stdview.set_showing({
          page: to.params.page.replace('.html', '')
        })
      }
    })
  }
}
</script>
