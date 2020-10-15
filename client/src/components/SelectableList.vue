<template>
  <div>
    <div class="file-holder">
      <div class="element-names">
        <list-item
          v-for="element in data"
          :key="data.indexOf(element)"
          :class="{
            selected: value.find((cm) => compare(cm, element)),
            disabled,
          }"
          @click="selectElement(element)"
          style="cursor: pointer"
        >
          <a> {{ formatter(element) }} </a>
        </list-item>
      </div>
    </div>
  </div>
</template>

<script>
import ListItem from './ListItem'

export default {
  name: 'SelectableList',
  components: {
    ListItem
  },
  props: {
    value: { default: () => [] },
    formatter: { default: (e) => e },
    disabled: { defaults: false },
    data: { default: () => [] },
    on: { default: null }
  },
  methods: {
    compare(a, b) {
      if (this.on) { return a[this.on] === b[this.on] }
      return a === b
    },
    selectElement(el) {
      if (!this.disabled) {
        let copy = this.value
        if (copy.find((cm) => this.compare(cm, el))) {
          copy = copy.filter((cm) => !this.compare(cm, el))
        } else {
          copy.push(el)
        }
        this.$emit('input', copy)
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

.element-names > div:hover {
  background-color: whitesmoke;
}

.selected {
  border: 1px solid var(--primary) !important;
  color: var(--primary);
}

.disabled:hover {
  background-color: white !important;
  cursor: default !important;
}
</style>
