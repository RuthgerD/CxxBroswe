<template>
  <div>
    <b-form-file
      multiple
      @input="onNewFiles"
      placeholder="Choose a file or drop it here..."
      :file-name-formatter="(_) => 'Choose a file or drop it here...'"
      accept=".patch, .diff"
      :disabled="disabled"
    >
    </b-form-file>
    <erasable-list
      v-model="mappedFiles"
      @input="
        (files) => {
          fileList = fileList.filter(
            (el) => files.filter((e) => el.name === e.name).length > 0
          )
          onNewFiles([])
        }
      "
      :formatter="(el) => el.name"
      :disabled="disabled"
    />
    <span v-show="error" style="color: var(--danger); padding-left: 0.5em">
      {{ error }}
    </span>
  </div>
</template>

<script>
import ErasableList from './ErasableList'

export default {
  name: 'DiffUploader',
  components: {
    ErasableList
  },
  props: {
    disabled: { default: false },
    maxFiles: { default: null }
  },
  data() {
    return { fileList: [], error: false, mappedFiles: [] }
  },
  methods: {
    onNewFiles(files) {
      const filtered = files.filter(
        (el) => el.type && el.size < 5 * Math.pow(10, 6) && el.name
      )

      const rejected = files.filter((el) => !filtered.includes(el))
      if (rejected.length > 0) {
        this.error = `* Rejected '${rejected[0].name}' ${
          rejected.length > 1 ? `and ${rejected.length - 1} more.` : ''
        }`
      }

      const dedup = (arr) =>
        arr.filter((el, i) => arr.findIndex((e, j) => e.name === el.name) === i)

      this.fileList = dedup(this.fileList.concat(filtered))
      if (this.maxFiles) {
        if (this.maxFiles < this.fileList.length) {
          this.error = `* File limit is ${this.maxFiles}`
        }
        this.fileList = this.fileList.slice(0, this.maxFiles)
      }
      this.mappedFiles = this.fileList.map((el) => ({
        name: el.name,
        data: el.text()
      }))

      this.$emit('data', this.mappedFiles)
    }
  }
}
</script>

<style scoped>
.diff-names {
  margin: 15px 5px 0px 5px;
  border-radius: 4px;
}

.diff-names > div {
  max-height: 2.2em;
  margin-bottom: 0.2em;
  border-radius: 4px;
  padding: 0.3em 0.5em;
  border: 1px solid rgba(0, 0, 0, 0.125);
}

label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

a {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-right: 10px;
}
</style>
