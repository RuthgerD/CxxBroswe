<template>
  <div style="display: flex; align-items: center">
    <b-img
      width="48"
      height="48"
      class="m1"
      style="border: 1px solid var(--primary)"
      blank="true"
      rounded="circle"
      alt="profile picture"
    />
    <a style="padding-left: 1em">{{ name }}</a>
    <right-just
      ><b-button variant="outline-primary"><b-icon-gear-fill /></b-button
    ></right-just>
  </div>
</template>

<script>
import { BIconGearFill } from 'bootstrap-vue'
import RightJust from './RightJust.vue'

export default {
  name: 'AccountPreview',
  data() {
    return {
      name: 'TBD'
    }
  },
  components: {
    BIconGearFill,
    RightJust
  }
}
</script>

<style>
</style>
