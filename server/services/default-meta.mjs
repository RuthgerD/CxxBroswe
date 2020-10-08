'use strict';
import mongoose from 'mongoose';
const { Types } = mongoose;

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
            if(population) {
                for (const pop of population)
                    query.populate(pop);
            }
            return await query.exec();
        }
        static async one(cond, proj) {
            return await Model.findOne(cond, proj).exec();
        }
        static async get(id, proj) {
            return await Model.findById(id, proj).exec();
        }
        static async update(id, content) {
            return await Model.findByIdAndUpdate(id, content, {'new': true}).exec();
        }
        static async remove(id) {
            return await Model.findByIdAndRemove(id).exec();
        }
        static async prune(cond) {
            return await Model.deleteMany(cond).exec();
        }
    };
}
