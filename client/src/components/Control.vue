<template>
  <div class="control">
    <h1 class="text-center">Cxx-broswe™</h1>
    <splitdiv />
    <div style="flex: 1 1 auto">
      <a class="inset">Base commit:</a><br />

      <b-form-select
        v-model="base_commit"
        :options="base_commits"
        size="sm"
        class="mt-1 cxx-select"
        v-bind:disabled="disabled"
      >
        <template v-slot:first>
          <b-form-select-option value="" disabled
            >Select a base commit</b-form-select-option
          >
        </template>
      </b-form-select>

      <a class="inset">Patch type:</a><br />

      <b-form-select
        v-model="patch_type"
        :options="patch_types"
        size="sm"
        class="mt-1 cxx-select"
        v-bind:disabled="disabled"
      >
        <template v-slot:first>
          <b-form-select-option value="" disabled
            >Select a patch type</b-form-select-option
          >
        </template>
      </b-form-select>

      <b-collapse class="mt-2" v-bind:visible="patch_type === 'diff'">
        <b-tabs content-class="mt-3">
          <b-tab title="Upload" active>
            <b-form-file
              v-model="diff_file"
              :state="Boolean(diff_file)"
              placeholder="Choose a file or drop it here..."
            ></b-form-file>
          </b-tab>
          <b-tab title="Profile"> <p>I'm the second tab</p></b-tab>
        </b-tabs>
      </b-collapse>

      <b-collapse class="mt-2" v-bind:visible="patch_type === 'pr'">
        pr
      </b-collapse>

      <b-collapse class="mt-2" v-bind:visible="patch_type === 'proposal'">
        proposal
      </b-collapse>

      <right-just class="mt-2"
        ><b-button
          variant="primary"
          @click="emit_apply()"
          v-bind:disabled="disabled"
          >apply</b-button
        ></right-just
      >
    </div>
    <splitdiv />
    <LoginButton v-if="!hasValidToken" />
    <account-preview v-else style="flex: 0 1 auto" />
  </div>
</template>

<script>
import Splitdiv from './Splitdiv.vue'
import RightJust from './RightJust.vue'
import AccountPreview from './AccountPreview.vue'
import LoginButton from './auth/Login'
import { mapState } from 'vuex'
import { Api } from '@/Api.js'

export default {
  name: 'Control',
  components: {
    Splitdiv,
    RightJust,
    AccountPreview,
    LoginButton
  },
  data() {
    this.get_base()
    return {
      disabled: false,
      base_commit: null,
      diff_file: null,
      base_commits: [],
      patch_type: null,
      patch_types: [
        { value: null, text: 'None' },
        { value: 'diff', text: 'diff' },
        { value: 'pr', text: 'PR' },
        { value: 'proposal', text: 'Proposal' }
      ]
    }
  },
  computed: {
    ...mapState(['hasValidToken'])
  },
  methods: {
    get_base() {
      const ret = [{ value: null, text: 'HEAD' }]
      Api.get('/standards')
        .then((res) =>
          res.data.forEach((el) =>
            ret.push({
              value: el._id,
              text: `${el.cplusplus ? 'C++' + el.cplusplus : el.name}`
            })
          )
        ) // formating TBD
        .catch((err) => {
          console.log(err)
        })
        .then(() => {
          this.base_commits = ret
        })
    },

    emit_apply() {
      this.$emit('settings-applied', { commit: this.base_commit, diffs: [] })
    }
  }
}
</script>

<style scoped>
.control {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.cxx-select {
  border: 1px solid var(--primary) !important;
  box-shadow: 0px 0px 2px var(--primary) !important;
}

.inset {
  padding-left: 10px;
  color: var(--black);
}
</style>
