<template>
  <div>
    <v-swatches
      v-model="setting.value"
      show-fallback
      fallback-input-type="color"
      popover-x="right"
      popover-y="bottom"
    ></v-swatches>
  </div>
</template>

<script>
import VSwatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.css'

export default {
  name: 'colour-setting',
  props: ['setting'],
  components: {
    VSwatches
  }
}
</script>
