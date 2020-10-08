<template>
  <div class="cxx-container">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Container'
}
</script>

<style>
.cxx-container {
  box-shadow: 0px 0px 35px rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  margin: 0px 50px;
  padding: 20px;
  background-color: white;
  position: fixed;
  top: 150px;
  bottom: 150px;
  min-width: 400px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

@media only screen and (max-width: 768px) {
  .cxx-container {
    bottom: 0px;
    top: 0px;
    right: 0px;
    left: 0px;
    margin: 0px;
    border-radius: 0px;
    min-width: 0;
    min-height: 0;
  }
}
</style>
