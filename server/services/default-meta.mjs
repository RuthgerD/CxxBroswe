'use strict';
import mongoose from 'mongoose';
const { Types } = mongoose;

const populate = (query, population) => {
    if(population) {
        for (const pop of population)
            query.populate(pop);
    }
};

export default function(Model) {
    return class {
        static async create(content) {
            content._id = Types.ObjectId();
            const obj = new Model(content);
            if(obj.validateSync())
                return null;
            return await obj.save();
        }
        static async list(cond, proj, population, options) {
            const query = Model.find(cond, proj, options);
            populate(query, population);
            return await query.exec();
        }
        static async one(cond, proj, population) {
            const query = Model.findOne(cond, proj);
            populate(query, population);
            return await query.exec();
        }
        static async get(id, proj, population) {
            if(!Types.ObjectId.isValid(id))
                return null;
            const query = Model.findById(id, proj);
            populate(query, population);
            return await query.exec();
        }
        static async update(id, content) {
            if(!Types.ObjectId.isValid(id))
                return null;
            return await Model.findByIdAndUpdate(id, content, {'new': true}).exec();
        }
        static async remove(id) {
            if(!Types.ObjectId.isValid(id))
                return null;
            return await Model.findByIdAndRemove(id).exec();
        }
        static async prune(cond) {
            return await Model.deleteMany(cond).exec();
        }
    };
}
