import mongoose from 'mongoose';
const { Types } = mongoose;
const { ObjectId } = Types;

export default (app, Service, path) => {
    app.use(`${path}/:id`, async (req, res) => {
        try {
            if(!ObjectId.isValid(req.params.id))
                return res.status(400).json({message: 'Invalid ID'});
            switch(req.method) {
            case 'GET': {
                const obj = await Service.get(req.params.id);
                if(!obj)
                    return res.status(404).json({message: 'Object does not exist'});
                return res.status(200).json(obj);
            }
            case 'PUT': {
                const obj = await Service.update(req.params.id, req.body);
                if(!obj)
                    return res.status(404).json({message: 'Object does not exist'});
                return res.status(200).json(obj);
            }
            case 'DELETE': {
                await Service.remove(req.params.id);
                return res.status(200).json(req.params.id);
            }
            default:
                return res.status(405).json({message: 'Unsupported method'});
            }
        } catch(err) {
            console.log('Error: ', err);
            return res.status(400).send(err);
        }
    });
    app.use(path, async (req, res) => {
        try {
            switch(req.method) {
            case 'POST': {
                if(req.body._id !== undefined)
                    return res.status(400).json({message: 'POST requests may not set "_id"'});
                const obj = await Service.create(req.body);
                return res.status(200).send(obj._id);
            }
            case 'GET': {
                let options = {
                    limit: parseInt(req.query.limit) || 16,
                    skip: parseInt(req.query.skip) || 0
                };
                if(req.query.sort)
                    options.sort = req.query.sort;
                const objs = await Service.list({}, '', [], options);
                return res.status(200).json(objs);
            }
            case 'DELETE': {
                await Service.prune({});
                return res.status(200).json({message: 'Success'});
            }
            default:
                return res.status(405).json({message: 'Unsupported method'});
            }
        } catch(err) {
            console.log('Error: ', err);
            return res.status(400).send(err);
        }
    });
};
