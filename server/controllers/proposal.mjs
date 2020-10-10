import default_metacontroller from './default-meta.mjs';
import ProposalService from '../services/proposal.mjs';

const ProposalController = default_metacontroller(ProposalService);
export default ProposalController;
