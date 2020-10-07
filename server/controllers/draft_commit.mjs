import default_metacontroller from './default-meta.mjs';
import DraftCommitService from '../services/draft_commit.mjs';

const DraftCommitController = default_metacontroller(DraftCommitService);
export default DraftCommitController;
