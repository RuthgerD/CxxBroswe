<template>
  <div
    class="d-flex justify-content-between align-items-center"
    @click="$emit('click')"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ListItem'
}
</script>

<style scoped>
div {
  max-height: 2.2em;
  margin-bottom: 0.2em;
  border-radius: 4px;
  padding: 0.3em 0.5em;
  border: 1px solid rgba(0, 0, 0, 0.125);
  user-select: none;
  transition: 0.15s;
}

a {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-right: 10px;
}
</style>
