import mongoose from 'mongoose';
const { model, Types } = mongoose;
const { ObjectId } = Types;

const Proposal = model('Proposal', {
    number: {type: String, required: true, unique: true}, // P0000 or Q00000
    name: {type: String, required: true, unique: true},
    author: {type: ObjectId, ref: 'User', required: true},
    versions: {type: [{type: ObjectId, ref: 'Diff'}], required: true}
});

export default Proposal;
