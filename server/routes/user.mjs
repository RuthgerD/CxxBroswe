import default_metaroute from './default-meta.mjs';
import UserController from '../controllers/user.mjs';
import UserProposalController from '../controllers/user-proposal.mjs';

const UserRoute = default_metaroute(UserController);

UserRoute.patch('/:id/password', UserController.change_password);

UserRoute
    .route('/:id/proposals/:pid')
    .get(UserProposalController.get)
    .delete(UserProposalController.remove);
UserRoute
    .route('/:id/proposals')
    .post(UserProposalController.create)
    .get(UserProposalController.list)
    .delete(UserProposalController.prune);

export default UserRoute;
