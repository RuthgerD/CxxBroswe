import mongoose from 'mongoose';
import ProposalService from '../services/proposal.mjs';
import UserService from '../services/user.mjs';

const { ObjectId } = mongoose.Types;

export default class UserProposalController {
    static async create(req, res) {
        let user = await UserService.get(req.params.id);
        if (!user)
            return res.status(404).json({message: 'Object does not exist'});

        if(req.body._id !== undefined)
            return res.status(400).json({message: 'POST requests may not set "_id"'});

        req.body._id = ObjectId();
        req.body.author = req.params.id;
        const obj = await ProposalService.create(req.body);

        user.proposals.push(obj._id);
        await user.save();

        return res.status(200).send(obj._id);
    }
    static async list(req, res) {
        let options = {
            limit: parseInt(req.query.limit) || 16,
            skip: parseInt(req.query.skip) || 0
        };
        if(req.query.sort)
            options.sort = req.query.sort;
        const obj = await ProposalService.list({author: req.params.id}, '', [], options);
        return res.status(200).json(obj);
    }
    static async prune(req, res) {
        await ProposalService.prune({author: req.params.id});
        return res.status(200).json({message: 'Success'});
    }

    static async verify_id(req, res, next) {
        if(!ObjectId.isValid(req.params.pid))
            return res.status(400).json({message: 'Invalid ID'});
        next();
    }

    static async get(req, res) {
        const obj = await ProposalService.one({_id: req.params.pid, author: req.params.id});
        if(!obj)
            return res.status(404).json({message: 'Object does not exist'});
        return res.status(200).json(obj);
    }
    static async update(req, res) {
        return res.status(404).end();
    }
    static async remove(req, res) {
        let user = await UserService.get(req.params.id);
        if(!user)
            return res.status(404).json({message: 'Object does not exist'});
        await ProposalService.prune({_id: req.params.pid, author: req.params.id});
        user.proposals = user.proposals.filter(el => el != req.params.pid);
        await user.save();
        return res.status(200).json(req.params.pid);
    }
};
