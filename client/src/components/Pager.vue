<template>
  <div>
    <b-button-group style="width: 100%" class="mt-2">
      <b-button
        variant="outline-primary"
        size="sm"
        @click="$emit('input', value - 1)"
        :disabled="disabled || value === llim"
        >back
      </b-button>
      <b-button variant="outline-primary" disabled size="sm" />
      <b-button
        variant="outline-primary"
        size="sm"
        @click="$emit('input', value + 1)"
        :disabled="disabled || value === rlim"
        >next</b-button
      >
    </b-button-group>
  </div>
</template>

<script>

export default {
  name: 'Pager',
  props: {
    value: {
      default: 0,
      type: Number
    },
    disabled: {
      default: false,
      type: Boolean
    },
    llim: {
      type: Number
    },
    rlim: {
      type: Number
    }
  }
}
</script>

<style scoped>
</style>
