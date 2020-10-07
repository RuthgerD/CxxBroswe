import default_metaroute from './default-meta.mjs';
import ProposalController from '../controllers/proposal.mjs';

const ProposalRoute = default_metaroute(ProposalController);
export default ProposalRoute;
