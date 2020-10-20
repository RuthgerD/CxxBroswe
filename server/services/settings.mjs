import default_metaservice from "./default-meta.mjs";
import Settings from "../models/Settings.mjs";

export default class SettingsService extends default_metaservice(Settings) {
  static async list(cond, proj, population) {
    const res = await super.list(cond, proj, population);
    for (const el of res) delete (el.passhash = undefined);
    return res;
  }
  static async one(cond, proj) {
    const res = await super.one(cond, proj);
    return res;
  }
  static async get(id, proj) {
    const res = await super.get(id, proj);
    return res;
  }
  static async remove(id, proj) {
    const res = await super.remove(id, proj);
    return res;
  }

  static async update(oldSettings, newSections) {
    for (const sectionKey in newSections) {
      if (oldSettings.sections[sectionKey]) {
        const newSection = newSections[sectionKey];
        for (const newSettingKey in newSection.settings) {
          const newSetting = newSection.settings[newSettingKey];
          const oldSetting = oldSettings.sections[sectionKey].settings.find(
            (el) => el.id === newSection.settings[newSettingKey].id
          );
          if (!oldSettings.sections[sectionKey]) {
            oldSettings.sections[sectionKey] = { settings: [] };
          }
          oldSettings.sections[sectionKey].settings[newSettingKey].value =
            newSetting.value;
        }
      } else {
        oldSettings.sections.push(newSections[sectionKey]);
      }
    }
    await Settings.findByIdAndUpdate(oldSettings._id, oldSettings, null).exec();
    const res = await super.get(oldSettings._id);
    if (res) delete (res.passhash = undefined);
    return res;
  }
}
