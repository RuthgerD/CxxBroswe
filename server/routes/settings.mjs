import default_metaroute from './default-meta.mjs';
import SettingsController from '../controllers/settings.mjs';

const SettingsRoute = default_metaroute(SettingsController);

SettingsRoute
    .get('/:id', SettingsController.get)
    .patch('/:id', SettingsController.patch);

export default SettingsRoute;
