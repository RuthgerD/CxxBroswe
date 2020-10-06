<template>
  <div>
    <div class="sidebar-backdrop d-xl-none" @click="closeSidebarPanel" v-if="isPanelOpen"></div>
    <transition name="slide">
      <div v-if="isPanelOpen" class="sidebar-panel m-lg-5 m-0">
          <div class="sidebar-body p-3 pt-4 card">
            <!-- Menu items -->
            <slot></slot>
          </div>
      </div>
    </transition>
  </div>
</template>
<script>
import { store, mutations } from '@/store.js'

export default {
  name: 'MenuBar',
  methods: {
    closeSidebarPanel: mutations.toggleNav
  },
  computed: {
    isPanelOpen() {
      return store.state.isNavOpen
    }
  }
}
</script>
<style>
  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.1s ease;
  }

  .slide-enter,
  .slide-leave-to {
    transform: translateX(-100%);
    transition: all 100ms ease-in 0s;
  }

  .sidebar-backdrop {
    background-color: rgba(0, 0, 0, 0.25);
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    cursor: pointer;
  }

  .sidebar-panel {
    overflow-y: auto;
    position: fixed;
    left: 0;
    top: 0;
    background-color: #00000016;
    z-index: 999;
    box-shadow: 0px 0px 35px rgba(0, 0, 0, 0.25);
  }

  .sidebar-body {
    overflow-y: auto;
    background-color: #ffffffff;
    border-radius: 8px !important;
    min-height: 500px;
  }

  @media only screen and (min-width: 992px) {

    .sidebar-body {
      width: 25em;
    }
  }

  @media only screen and (max-width: 992px) {

    .sidebar-body {
      width: 100vw;
      height: 100vh;
      border-radius: 0px;
    }
  }

  .windowBody{
    min-height: 500px;
    border-color: transparent !important;
  }
</style>
