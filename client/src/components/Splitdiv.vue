<template>
  <div>
    <div class="line"></div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'splitdiv'
}
</script>

<style>
.line {
  height: 1px;
  background-color: var(--primary);
  box-shadow: 0px 0px 4px var(--primary);
  margin-bottom: 0.5em;
}
</style>
