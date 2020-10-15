<template>
  <div>
    <selectable-list
      v-model="$store.state.githubPulls.selected"
      :data="$store.state.githubPulls.data"
      :formatter="(el) => `${el.number} - ${el.name}`"
      :disabled="disabled"
      :on="'number'"
    />
    <pager
      v-model="$store.state.githubPulls.page"
      @input="$store.dispatch('fetchCPPPulls')"
      :llim="1"
      :disabled="githubPulls.fetching || disabled"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import SelectableList from './SelectableList'
import Pager from './Pager'

export default {
  name: 'CppPullList',
  components: {
    SelectableList,
    Pager
  },
  props: {
    disabled: {
      default: false,
      type: Boolean
    }
  },
  computed: {
    ...mapState(['githubPulls'])
  }
}
</script>
