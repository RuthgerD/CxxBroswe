import default_metacontroller from './default-meta.mjs';
import StandardService from '../services/standard.mjs';

const StandardController = default_metacontroller(StandardService);
export default StandardController;
