import default_metaroute from './default-meta.mjs';
import StandardController from '../controllers/standard.mjs';

const StandardRoute = default_metaroute(StandardController);
export default StandardRoute;
