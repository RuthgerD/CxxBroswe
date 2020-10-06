<template>
  <div id="burger" :class="{ 'active' : isMenuOpen }" @click.prevent="toggle">
    <button type="button" class="btn btn-light outline-primary burger-button m-lg-5 m-md-3" :class="{'burger-button-close m-0': isMenuOpen, 'm-5': !isMenuOpen}" title="Menu">
      <span class="burger-bar burger-bar--1"></span>
      <span class="burger-bar burger-bar--2"></span>
      <span class="burger-bar burger-bar--3"></span>
    </button>
  </div>
</template>
<script>
import { store, mutations } from '@/store.js'

export default {
  computed: {
    isMenuOpen() {
      return store.state.isNavOpen
    }
  },
  methods: {
    toggle() {
      mutations.toggleNav()
    }
  }
}
</script>
<style>
.burger-button {
  position: fixed;
  width: 2em;
  height: 2em;
  z-index: 999;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

 @media only screen and (min-width: 992px) {
  .burger-button {
    top: 0;
    left: 0;
  }
 }

 @media only screen and (max-width: 991px) {
  .burger-button-close {
    top: 0 !important;
    left: 0 !important;
  }
  .burger-button {
    bottom: 0;
    right: 0;
  }
 }

.burger-bar {
  background-color: #130f40;
  position: absolute;
  top: 50%;
  right: 6px;
  left: 6px;
  height: 2px;
  width: auto;
  margin-top: -1px;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1),
    opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1),
    background-color 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.burger-bar--1 {
  -webkit-transform: translateY(-6px);
  transform: translateY(-6px);
}

.burger-bar--2 {
  transform-origin: 100% 50%;
  transform: scaleX(0.8);
}

.burger-button:hover .burger-bar--2 {
  transform: scaleX(1);
}

.no-touchevents .burger-bar--2:hover {
  transform: scaleX(1);
}

.burger-bar--3 {
  transform: translateY(6px);
}

#burger.active .burger-button {
  transform: rotate(-180deg);
}

#burger.active .burger-bar {
  background-color: #000;
}

#burger.active .burger-bar--1 {
  transform: rotate(45deg);
}

#burger.active .burger-bar--2 {
  opacity: 0;
}

#burger.active .burger-bar--3 {
  transform: rotate(-45deg);
}
</style>
