<template>
  <b-modal ref="modal" centered title="Create Proposal" hide-footer>
    <h5>Name</h5>
    <b-form-input
      id="proposal-name-form"
      :state="isCorrectName"
      v-model="name"
      placeholder="Enter new proposal name"
    ></b-form-input>

    <b-form-invalid-feedback id="proposal-name-form-feedback">
      Name has to be at least 3 characters long
    </b-form-invalid-feedback>

    <h5 class="mt-3">Number</h5>
    <b-form-input
      id="proposal-number-form"
      :state="isCorrectNumber"
      v-model="number"
      placeholder="Enter proposal number"
    ></b-form-input>

    <b-form-invalid-feedback id="proposal-number-form-feedback">
      Number has to follow: P0000 or Q00000
    </b-form-invalid-feedback>

    <h5 class="mt-3">Diff</h5>
    <diff-uploader ref="uploader" @data="newDiff" :maxFiles="1">
    </diff-uploader>
    <right-just class="mt-4">
      <b-button
        variant="primary"
        :disabled="!(isCorrectNumber && diff)"
        @click="submit"
      >
        submit</b-button
      >
    </right-just>
  </b-modal>
</template>

<script>
import DiffUploader from './DiffUploader'
import RightJust from './RightJust'

export default {
  name: 'ProposalCreator',
  components: {
    DiffUploader,
    RightJust
  },
  data() {
    return {
      name: '',
      number: '',
      diff: null
    }
  },
  computed: {
    isCorrectName() {
      return this.name.length >= 3
    },
    isCorrectNumber() {
      const first = this.number[0]
      if (first === 'P') {
        return this.number.length === 5
      } else if (first === 'Q') {
        return this.number.length >= 5 && this.number.length <= 9
      }
      return false
    }
  },
  methods: {
    toggle: function () {
      this.$refs.modal.toggle()
      // reset
      this.name = ''
      this.number = ''
      this.diff = null
    },
    newDiff(val) {
      this.diff = val[0]
    },
    submit() {
      this.$store.dispatch('createProposal', {
        number: this.number,
        name: this.name,
        diff: this.diff
      })
      this.toggle()
    }
  }
}
</script>
