import mongoose from 'mongoose';
const { model, Types } = mongoose;
const { ObjectId } = Types;

const Standard = model('Standard', {
    name: {type: String, required: true, unique: true},
    aliasof: {type: ObjectId, ref: 'DraftCommit', required: true},
    iso_name: String,
    cplusplus: Number,
});

export default Standard;
