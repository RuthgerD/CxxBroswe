<template>
  <div>
    <div class="sidebar-backdrop d-xl-none" @click="$store.commit('toggleNav')" v-show="isNavOpen"/>
    <!-- <MenuIcon /> -->

    <transition name="slide">
      <div v-show="isNavOpen" class="sidebar-panel">
          <div class="sidebar-body p-3">
            <!-- Menu items -->
            <slot></slot>
          </div>
      </div>
    </transition>
  </div>
</template>
<script>

import { mapState } from 'vuex'

export default {
  name: 'MenuBar',
  computed: {
    ...mapState(['isNavOpen'])
  }
}
</script>
<style>
  .slide-enter-active,
  .slide-leave-active {
    transition: opacity 100ms ease-in 0s;
    opacity: 1;
  }

  .slide-enter,
  .slide-leave-to {
    opacity: 0;
    transition: opacity 100ms ease-out 0s;
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
    top: 15vh;
    bottom: 15vh;
    background-color: #00000016;
    box-shadow: 0px 0px 35px rgba(0, 0, 0, 0.25);
    left: 50px;
    border-radius: 8px;
  }

  @media only screen and (max-height: 600px) {
    .sidebar-panel {
      top: 5px;
      bottom: 5px;
      left: 5px;
    }
  }

  @media only screen and (min-height: 950px) {
    .sidebar-panel {
      max-height: 700px;
    }
  }

  .sidebar-body {
    overflow-y: auto;
    background-color: #ffffffff;
    height: 100%;
    width: 100%;
  }

  @media only screen and (min-width: 992px) {

    .sidebar-panel {
      width: 25em;
    }
  }

  @media only screen and (max-width: 992px) {
    .sidebar-panel {
      width: 100%;
      height: 100%;
      max-height: 100%;
      top: 0px;
      bottom: 0px;
      left: 0px;
      border-radius: 0px;
    }
  }
</style>
