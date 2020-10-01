'use strict';
import default_metaservice from './default-meta.mjs';
import User from '../models/User.mjs';

const UserDefaultedService = default_metaservice(User);

export default class UserService {
    static create = UserDefaultedService.create;
    static async list(cond, proj, population) {
        const res = await UserDefaultedService.list(cond, proj, population);
        for(const el of res)
            delete (el.passhash = undefined);
        return res;
    }
    static async one(cond, proj) {
        const res = await UserDefaultedService.one(cond, proj);
        if(res)
            delete (res.passhash = undefined);
        return res;
    }
    static async get(id, proj) {
        const res = await UserDefaultedService.get(id, proj);
        if(res)
            delete (res.passhash = undefined);
        return res;
    }
    static update = UserDefaultedService.update;
    static remove = UserDefaultedService.remove;
    static prune = UserDefaultedService.prune;
}
