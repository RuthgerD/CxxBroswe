<template>
  <div>
    <div class="html-holder">
      <b-container >
        <b-col v-html="page_html"/>
      </b-container>
    </div>
    <div v-if="seen" class="cxx-container">
      <h1 class="text-center">Cxx-broswe™</h1>
      <splitdiv />
      <div style="flex: 1 1 auto">
        <a class="inset">Base commit:</a><br />

        <b-form-select
          v-model="base_commit"
          :options="base_commits"
          size="sm"
          class="mt-1 cxx-select"
          v-bind:disabled="fetching"
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
          v-bind:disabled="fetching"
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
                v-model="file1"
                :state="Boolean(file1)"
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
          ><b-button variant="primary" @click="this.apply_settings" v-bind:disabled="fetching">apply</b-button></right-just
        >
      </div>
      <splitdiv />
      <account-preview style="flex: 0 1 auto" />
    </div>
  </div>
</template>

<script>
import Splitdiv from './Splitdiv.vue'
import RightJust from './RightJust.vue'
import AccountPreview from './AccountPreview.vue'
import { store /*, mutations */ } from '@/store.js'

export default {
  name: 'Container',
  data() {
    this.get_base()
    return {
      seen: false,
      page_html: '',
      fetching: false,
      base_commit: null,
      file1: null,
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

  methods: {
    get_base() {
      const ret = [{ value: null, text: 'HEAD' }]
      this.axios.get('http://localhost:3000/api/standards').then(res => res.data.forEach(el => ret.push({ value: el._id, text: `${el.cplusplus ? 'C++' + el.cplusplus : el.name}` }))) // formating TBD
        .catch(err => { console.log(err) })
        .then(() => { this.base_commits = ret })
    },

    toggle() {
      this.show = !this.show
      if (this.show) this.$refs.dropdown.show()
      else this.$refs.dropdown.hide()
    },

    apply_settings() {
      this.fetch_pages('index')
    },

    fetch_pages(page = 'index') {
      this.fetching = true
      this.axios.get(`http://localhost:3000/api/pages/${page}`).then(res => {
        console.log(res)
        this.page_html = res.data
      }).catch(err => {
        this.page_html = err
      }).finally(() => {
        this.fetching = false
      })
    }
  },
  computed: {
    isPanelOpen() {
      return store.state.isNavOpen
    }
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (to.params.page) {
        vm.fetch_pages(to.params.page.replace('.html', ''))
      }
    })
  },

  components: {
    Splitdiv,
    RightJust,
    AccountPreview
  }
}
</script>

<style>
  .cxx-select {
    border: 1px solid var(--primary) !important;
    box-shadow: 0px 0px 2px var(--primary) !important;
  }

  .inset {
    padding-left: 10px;
    color: var(--black);
  }

  .html-holder {
    width: 100%;
    padding-left: 0px;
    padding-top: 4em;
  }

  @media only screen and (max-width: 2000px) and (min-width: 1600px) {
    .html-holder {
      width: 100%;
      padding-left: 400px;
    }
  }

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
