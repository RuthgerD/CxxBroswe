<template>
  <div>
    <div class="file-holder">
      <div class="element-names">
        <list-item v-for="element in value" :key="value.indexOf(element)">
          <a> {{ formatter(element) }} </a>
          <span
            v-show="!disabled"
            @click="removeelement(element)"
            style="cursor: pointer"
            title="Remove"
          >
            <b-icon-x />
          </span>
        </list-item>
      </div>
    </div>
  </div>
</template>

<script>
import { BIconX } from 'bootstrap-vue'
import ListItem from './ListItem'

export default {
  name: 'ErasableList',
  components: {
    BIconX,
    ListItem
  },
  props: {
    value: { default: () => [] },
    formatter: { default: (e) => e },
    disabled: { default: false }
  },
  methods: {
    removeelement(del) {
      if (!this.disabled) {
        this.$emit(
          'input',
          this.value.filter((el) => el !== del)
        )
      }
    }
  }
}
</script>

<style scoped>
.element-names {
  margin: 15px 5px 0px 5px;
  border-radius: 4px;
}

.element-names > div {
  max-height: 2.2em;
  margin-bottom: 0.2em;
  border-radius: 4px;
  padding: 0.3em 0.5em;
  border: 1px solid rgba(0, 0, 0, 0.125);
}
</style>
