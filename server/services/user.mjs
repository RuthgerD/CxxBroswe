import default_metaservice from './default-meta.mjs';
import User from '../models/User.mjs';

export default class UserService extends default_metaservice(User) {
    static async list(cond, proj, population) {
        const res = await super.list(cond, proj, population);
        for(const el of res)
            delete (el.passhash = undefined);
        return res;
    }
    static async one(cond, proj) {
        const res = await super.one(cond, proj);
        if(res)
            delete (res.passhash = undefined);
        return res;
    }
    static async get(id, proj) {
        const res = await super.get(id, proj);
        if(res)
            delete (res.passhash = undefined);
        return res;
    }
}
