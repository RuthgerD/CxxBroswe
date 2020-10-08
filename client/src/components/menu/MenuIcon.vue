<template>
  <div id="burger" :class="{ 'active' : isNavOpen }" @click.prevent="$store.commit('toggleNav')">
    <button type="button" class="btn btn-light outline-primary burger-button" :class="{'burger-button-close': isNavOpen}" title="Menu">
      <span class="burger-bar burger-bar--1"></span>
      <span class="burger-bar burger-bar--2"></span>
      <span class="burger-bar burger-bar--3"></span>
    </button>
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'MenuIcon',
  computed: {
    ...mapState(['isNavOpen'])
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

 @media only screen and (min-width: 992px), screen and (max-height: 600px) {
  .burger-button {
    top: 10px;
    left: 10px;
  }
  .burger-button-close {
    top: 10px;
    left: 10px;
  }
 }

 @media only screen and (max-width: 991px) {
  .burger-button {
    bottom: 10px;
    right: 10px;
  }
  .burger-button-close {
    top: 10px;
    left: 10px;
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
