<template>
  <div id="settingsView">
    <account-preview v-show="hasValidToken && controlView==='settings'" style="flex: 0 1 auto;" />
    <splitdiv class="pt-2" />
    <div v-if="settings">
      <div v-for="section in settings.sections" :key="section.title">
          <h5>{{ section.title }}:</h5>
          <div v-for="setting in section.settings" :key="setting.settingId">
            <h6>{{ setting.name }}:</h6>
            <TextArea :setting='setting' v-if="setting.type=='textArea'"/>
            <Select :setting='setting' v-else-if="setting.type=='select'"/>
            <RightJust v-else-if="setting.type=='colour'" style="position: absolute; transform: translate(-10%, -120%);" ><Colour :setting='setting' /></RightJust>
            <hr />
        </div>
      </div>
    </div>
    <b-row>
      <div class="col-12">
        <p class="text-right"><b-button
          class="btn btn-success"
          @click="$store.dispatch('saveSettings')">Save
        </b-button></p>
      </div>
    </b-row>
    <div style="flex: 1 1 auto;"></div>
    <splitdiv />
    <b-row class="pt-2">
      <div class="col-6"><DeleteAccountButton v-if="hasValidToken" style="align: left" /></div>
      <div class="col-6"><p class="text-right"><LogoutButton v-if="hasValidToken" style="align: right" /></p></div>
    </b-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import LogoutButton from '../auth/Logout'
import DeleteAccountButton from '../auth/DeleteAccount'
import AccountPreview from '@/components/AccountPreview.vue'
import Splitdiv from '../Splitdiv.vue'
import Colour from './item/Colour'
import Select from './item/Select'
import TextArea from './item/TextArea'
import RightJust from '../RightJust'

export default {
  name: 'settings',
  components: {
    LogoutButton,
    DeleteAccountButton,
    Splitdiv,
    AccountPreview,
    Colour,
    Select,
    TextArea,
    RightJust
  },
  computed: {
    ...mapState(['hasValidToken', 'controlView', 'settings'])
  }
}
</script>

<style>
.btn-social {
  position: relative;
}

.btn-social > :first-child {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 32px;
  line-height: 34px;
  font-size: 1.6em;
  text-align: center;
  border-right: 1px solid rgba(0, 0, 0, 0.2);
}

 /* Hide scrollbar for various browsers */
#settingsView::-webkit-scrollbar {
  display: none;
}

#settingsView {
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
