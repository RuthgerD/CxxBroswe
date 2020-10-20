<template>
  <div>
    <std-view ref="stdview" />

    <!-- Netork Error Modal -->
    <div>
      <b-modal @hide="$store.commit('showNetworkError', false)" v-model="showErrorModal" id="modal-network-error" title="An error has occured!" header-bg-variant='danger' headerTextVariant='light'>
        <p class="my-4">Please try reloading the page!</p>
        <template v-slot:modal-footer="{ ok }">
          <b-button size="sm" variant="warning" @click="ok()">
            OK
          </b-button>
        </template>
      </b-modal>
    </div>

    <MenuBar>
      <div id="menu">
        <control class="menuItem" v-show="controlView==='main'"/>
        <settings class="menuItem" v-show="controlView==='settings'" />
      </div>
    </MenuBar>
    <MenuIcon />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Control from '@/components/Control'
import StdView from '@/components/StdView/StdView'
import MenuBar from '@/components/menu/MenuBar'
import MenuIcon from '@/components/menu/MenuIcon'
import Settings from '@/components/settings/Settings.vue'

export default {
  name: 'Main',
  components: {
    Control,
    StdView,
    MenuBar,
    MenuIcon,
    Settings
  },
  computed: {
    ...mapState(['hasValidToken', 'controlView']),
    showErrorModal: {
      get() { return this.$store.state.showErrorModal },
      set(value) { this.$store.state.showErrorModal = value }
    }
  }
}
</script>

<style>
#menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
.menuItem {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
</style>
