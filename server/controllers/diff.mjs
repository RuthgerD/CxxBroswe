import default_metacontroller from './default-meta.mjs';
import DiffService from '../services/diff.mjs';

const DiffController = default_metacontroller(DiffService);
export default DiffController;
