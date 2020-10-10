import bcrypt from 'bcrypt';
import default_metacontroller from './default-meta.mjs';
import UserService from '../services/user.mjs';

export default class UserController extends default_metacontroller(UserService) {
    static async change_password(req, res) {
        const user = await UserService.get(req.params.id);
        if (!user)
            return res.status(404).json({message: 'Object does not exist'});
        user.passhash = await bcrypt.hash(req.body.password.toString(), 10);
        await UserService.update(user._id, user);
        return res.status(200).json({message: 'Success'});
    }
};
