const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = exports = (app, Model, path) => {
    app.use(`${path}/:id`, async (req, res) => {
        try {
            if(!ObjectId.isValid(req.params.id)
                && !(req.method === 'POST'
                    && req.params.id === 'auto'))
                return res.status(400).json({message: 'Invalid ID'});
            switch(req.method) {
                case 'GET': {
                    let obj = await Model.findById(req.params.id).exec();
                    if (!obj)
                        return res.status(404).json({message: 'Object does not exist'});
                    if(obj.passhash !== undefined)
                        delete (obj.passhash = undefined);
                    return res.status(200).json(obj);
                } break;
                case 'PUT': {
                    let obj = await Model.findByIdAndUpdate(req.params.id, req.body);
                    if (!obj)
                        return res.status(404).json({message: 'Object does not exist'});
                    if(obj.passhash !== undefined)
                        delete (obj.passhash = undefined);
                    return res.status(200).json(obj);
                } break;
                case 'DELETE': {
                    await Model.findByIdAndRemove(req.params.id);
                    return res.status(200).json(req.params.id);
                } break;
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
                    req.body._id = ObjectId();
                    const obj = await new Model(req.body).save();
                    return res.status(200).send(obj._id);
                } break;
                case 'GET': {
                    const objs = await Model.find({}, '_id').exec();
                    return res.status(200).json(objs);
                } break;
                case 'DELETE': {
                    await Model.deleteMany({});
                    return res.status(200).json({message: 'Success'});
                } break;
                default:
                    return res.status(405).json({message: 'Unsupported method'});
            }
        } catch(err) {
            console.log('Error: ', err);
            return res.status(400).send(err);
        }
    });
};
