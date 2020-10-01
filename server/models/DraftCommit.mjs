import mongoose from 'mongoose';
const { model, Types } = mongoose;
const { ObjectId } = Types;

const DraftCommit = model('DraftCommit', {
    hash: {type: String, required: true, unique: true},
    content: {type: {type: ObjectId, ref: 'Diff'}}
});

export default DraftCommit;
