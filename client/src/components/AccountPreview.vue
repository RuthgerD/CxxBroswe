<template>
  <div class="profileViewBody">
    <b-img
      width="48"
      height="48"
      class="m1"
      style="border: 1px solid var(--primary)"
      rounded="circle"
      alt="profile picture"
      v-bind:src="currentUser.avatar_url"
    />
    <a class="profileText">{{ currentUser.name }}<br />
      <span style="color: grey;">
      <p v-if="currentUser.email" class="m-0" >{{ currentUser.email }}</p>
      <p v-else class="m-0" >{{ currentUser.login }}</p>
      </span>
    </a>
      <b-button variant="outline-primary"><b-icon-gear-fill /></b-button>
  </div>
</template>

<script>
import { BIconGearFill } from 'bootstrap-vue'
import { mapState } from 'vuex'

export default {
  name: 'AccountPreview',
  computed: {
    ...mapState(['currentUser'])
  },
  components: {
    BIconGearFill
  }
}
</script>

<style>
.profileViewBody{
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.profileText{
  color: black;
  padding-left: 1em;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
