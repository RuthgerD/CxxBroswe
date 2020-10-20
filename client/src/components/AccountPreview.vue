<template>
  <div class="profileViewBody" v-if="currentUser">
    <b-img
      v-if="currentUser.avatar_url!=null"
      width="48"
      height="48"
      style="border: 1px solid var(--primary)"
      rounded="circle"
      alt="profile picture"
      v-bind:src="currentUser.avatar_url"
    />
    <div v-else>
      <b-avatar
      class="m-1"
      style="border: 1px solid var(--primary)"
      rounded="circle"
      />
    </div>
    <a class="profileText">{{ currentUser.name }}<br />
      <span style="color: grey;">
      <p v-if="currentUser.email" class="m-0" >{{ currentUser.email }}</p>
      <p v-else class="m-0" >{{ currentUser.login }}</p>
      </span>
    </a>
    <div>
      <b-button @click="$store.commit('toggleControlView', 'settings')" variant="outline-primary" class="mt-2 mb-2"><b-icon-gear-fill /></b-button>
    </div>
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
