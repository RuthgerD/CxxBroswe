import mongoose from 'mongoose';
const { Types } = mongoose;
const { ObjectId } = Types;

export const list_options = (req) => {
    let options = {
        limit: parseInt(req.query.limit) || 16,
        skip: parseInt(req.query.skip) || 0
    };
    if(req.query.sort)
        options.sort = req.query.sort;
    return options;
};

export default function(Service){
    return class {
        static async create(req, res) {
                if (req.body._id !== undefined)
                    return res.status(400).json({message: 'POST requests may not set "_id"'});
                const obj = await Service.create(req.body);
                if(!obj)
                    return res.status(400).json({message: 'Malformed object'});
                return res.status(200).send(obj._id);
        }
        static async list(req, res) {
            const objs = await Service.list({}, '', [], list_options(req));
            return res.status(200).json(objs);
        }
        static async prune(req, res) {
            await Service.prune({});
            return res.status(200).json({message: 'Success'});
        }

        static async verify_id(req, res, next) {
            if(!ObjectId.isValid(req.params.id))
                return res.status(400).json({message: 'Invalid ID'});
            next();
        }

        static async get(req, res) {
            const obj = await Service.get(req.params.id);
            if(!obj)
                return res.status(404).json({message: 'Object does not exist'});
            return res.status(200).json(obj);
        }
        static async update(req, res) {
            const obj = await Service.update(req.params.id, req.body);
            if(!obj)
                return res.status(404).json({message: 'Object does not exist'});
            return res.status(200).json(obj);
        }
        static async remove(req, res) {
            await Service.remove(req.params.id);
            return res.status(200).json(req.params.id);
        }
    };
};
