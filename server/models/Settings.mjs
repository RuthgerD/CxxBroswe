import mongoose from 'mongoose';
const { model } = mongoose;

export const Settings = model('Settings', {
  sections: {
    type: Object, required: true, default: {
      profile: {
        title: 'Profile',
        settings: [
          {name: 'Bio', settingId: 100, type: 'textArea', value: '' }
        ]
      },
      interface: {
        title: 'Interface',
        settings: [
          {name: 'Primary Colour', settingId: 101, type: 'colour', value: '#3584e4' }
        ]
      },
      general: {
        title: 'General',
        settings: [
          { name: 'Some Setting', settingId: 110, type: 'select', value: '1', options: { 1: 'Yes', 2: 'Maybe', 3: 'No' } }
        ]
      }
    }
  }
});

export default Settings;
