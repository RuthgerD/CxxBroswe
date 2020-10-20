<template>
  <div>
    <b-form-select
      v-model="setting.value"
      :options="setting.options"
      size="sm"
      class="mt-1 cxx-select"
    >
      <template v-slot:first>
        <b-form-select-option value="" disabled >Please select an option</b-form-select-option
        >
      </template>
    </b-form-select>
  </div>
</template>

<script>
export default {
  name: 'select-setting',
  props: ['setting']
}
</script>
