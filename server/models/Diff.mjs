import mongoose from 'mongoose';
const { model, Types } = mongoose;
const { ObjectId } = Types;

const Diff = model('Diff', {
    author: {type: ObjectId, ref: 'User'},
    content: {type: String, required: true},
    name: String
});

export default Diff;
