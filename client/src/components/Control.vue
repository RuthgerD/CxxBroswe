<template>
  <div>
    <h1 class="text-center">Cxx-broswe™</h1>
    <splitdiv />
    <div style="flex: 1 1 auto">
      <a class="inset">Base commit:</a><br />

      <b-form-select
        v-model="$store.state.stdHtmlDetails.base"
        :options="standardValName"
        size="sm"
        class="mt-1 cxx-select"
        :disabled="stdHtml.fetching"
      >
        <template v-slot:first>
          <b-form-select-option value="" disabled
            >Select a base commit</b-form-select-option
          >
        </template>
      </b-form-select>

      <a class="inset">Patch type:</a><br />

    <b-form-select
      v-model="$store.state.patch_type"
      :options="patch_types"
      size="sm"
      class="mt-1 cxx-select"
      :disabled="stdHtml.fetching"
    >
      <template v-slot:first>
        <b-form-select-option value="" disabled
          >Select a patch type</b-form-select-option
        >
      </template>
    </b-form-select>

      <b-collapse class="mt-2" :visible="$store.state.patch_type === 'diff'">
        <b-tabs content-class="mt-3">
          <b-tab title="Upload">
            <diff-uploader
              @data="(val) => ($store.state.pendingDiffs = val)"
              :disabled="stdHtml.fetching"
            />
          </b-tab>
          <b-tab title="Profile" :disabled="!hasValidToken">
            <template v-slot:title>
              Profile {{ currentUser ? ' - ' + currentUser.diffs.length : '' }}
            </template>
            <div v-if="currentUser">
              <selectable-list
                v-model="$store.state.selectedProfileDiffs"
                :data="currentUser.diffs.slice(usrPage * 4, usrPage * 4 + 4)"
                :formatter="(el) => el.name"
                :on="'_id'"
                :disabled="stdHtml.fetching"
              />
              <pager
                v-model="usrPage"
                :llim="0"
                :rlim="
                  currentUser
                    ? Math.floor((currentUser.diffs.length - 1) / 4)
                    : 0
                "
                :disabled="stdHtml.fetching"
              />
            </div>
            <a v-else class="danger"> No diffs found!</a>
          </b-tab>
        </b-tabs>
      </b-collapse>

    <b-collapse class="mt-2" :visible="$store.state.patch_type === 'pr'">
      <cpp-pull-list :disabled="stdHtml.fetching" />
    </b-collapse>

      <b-collapse
        class="mt-2"
        :visible="$store.state.patch_type === 'proposal'"
      >
        <proposal-creator ref="proposalCreator" />
        <b-button @click="$refs.proposalCreator.toggle()" style="width: 100%" size="sm" variant="outline-primary" v-show="hasValidToken"> Create new proposal </b-button>
        <selectable-list
          v-model="$store.state.selectedProposal"
          :data="proposals.slice(proposalsPage * 4, proposalsPage * 4 + 4)"
          :formatter="(el) => `${el.number} - ${el.name}`"
          :on="'_id'"
          :disabled="stdHtml.fetching"
        />
        <pager
          v-model="proposalsPage"
          :llim="0"
          :rlim="proposals ? Math.floor((proposals.length - 1) / 4) : 0"
          :disabled="stdHtml.fetching"
        />
      </b-collapse>

    <right-just class="mt-2"
      ><b-button
        variant="primary"
        @click="$store.dispatch('fetchPages')"
        :disabled="stdHtml.fetching"
        >apply</b-button
      ></right-just
      >
    </div>
    <splitdiv class="pt-2"/>
    <LoginButton v-if="!hasValidToken" />
    <account-preview v-else style="flex: 0 1 auto" />
  </div>
</template>

<script>
import Splitdiv from './Splitdiv.vue'
import RightJust from './RightJust.vue'
import { mapGetters, mapState } from 'vuex'
import DiffUploader from './DiffUploader'
import CppPullList from './CppPullList'
import Pager from './Pager'
import SelectableList from './SelectableList'
import LoginButton from '@/components/auth/Login'
import AccountPreview from '@/components/AccountPreview.vue'
import ProposalCreator from './ProposalCreator'

export default {
  name: 'Control',
  components: {
    Splitdiv,
    RightJust,
    DiffUploader,
    CppPullList,
    Pager,
    AccountPreview,
    LoginButton,
    SelectableList,
    ProposalCreator
  },
  data() {
    return {
      base_commit: null,
      disabled: false,
      usrPage: 0,
      proposalsPage: 0,
      proposalCreatorOpen: false,
      patch_types: [
        { value: null, text: 'None' },
        { value: 'diff', text: 'diff' },
        { value: 'pr', text: 'PR' },
        { value: 'proposal', text: 'Proposal' }
      ]
    }
  },
  computed: {
    ...mapState(['hasValidToken', 'stdHtml', 'controlView', 'currentUser', 'proposals']),
    ...mapGetters(['standardValName'])
  }
}
</script>

<style>
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
