import default_metacontroller from "./default-meta.mjs";
import SettingsService from "../services/settings.mjs";

export default class SettingsController extends default_metacontroller(
  SettingsService
) {
  static async get(req, res) {
    const user = req.requestUser;
    const settings = await SettingsService.get(req.params.id);
    if (
      !user ||
      (settings && settings._id.toString() != user.settings.toString())
    ) {
      //TODO: Implement role check (out of scope for current period)
      if (!process.env.SKIP_AUTH)
        return res.status(401).json({ message: "Unauthorised" });
    }
    return res.status(200).json(settings);
  }

  static async patch(req, res) {
    const user = req.requestUser;
    const oldSettings = await SettingsService.get(req.params.id);
    if (
      !user ||
      (oldSettings && oldSettings._id.toString() != user.settings.toString())
    ) {
      //TODO: Implement role check (out of scope for current period)
      if (!process.env.SKIP_AUTH)
        return res.status(401).json({ message: "Unauthorised" });
    }
    console.log(req.body)
    console.log(req.body.sections)
    const settings = await SettingsService.update(
      oldSettings,
      req.body.sections
    );
    return res.status(200).json(settings);
  }
}
