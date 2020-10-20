<template>
  <div>
    <textarea v-model="setting.value" placeholder="Your bio" style="width:100%" />
  </div>
</template>

<script>
export default {
  name: 'text-area-setting',
  props: ['setting']
}
</script>
