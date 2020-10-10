import {default as default_metacontroller, list_options} from './default-meta.mjs';
import StandardService from '../services/standard.mjs';

export default class StandardController extends default_metacontroller(StandardService) {
    static async list(req, res) {
        const objs = await StandardService.list({}, '', ['aliasof'], list_options(req));
        return res.status(200).json(objs);
    }
    static async get(req, res) {
        const obj = await StandardService.get(req.params.id, '', ['aliasof']);
        if(!obj)
            return res.status(404).json({message: 'Object does not exist'});
        return res.status(200).json(obj);
    }
};
