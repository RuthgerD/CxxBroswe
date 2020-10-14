import default_metacontroller from './default-meta.mjs';
import UserService from '../services/user.mjs';

export default class UserController extends default_metacontroller(UserService) {

    static async isSameUser(req, user) {
        return req.requestUser === user
    }

    static async get(req, res) {
        const user = await UserService.get(req.params.id);
        if (!user)
            return res.status(404).json({ message: 'User does not exist' });
        if (!UserController.isSameUser(req, user)) {
            //TODO: Implement role check (out of scope for current period)
            return res.status(401).json({ 'message': 'Unauthorised' });
        }
        return res.status(200).json({ user });
    }

    static async isSameUser(req, user) {
        return req.requestUser === user
    }
};
