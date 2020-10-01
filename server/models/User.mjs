import mongoose from 'mongoose';
const { model, Types } = mongoose;
const { ObjectId } = Types;

const User = model('User', {
    name: {type: String, required: true, unique: true},
    passhash: String, // not required, since system users are loginless
    diffs: [{type: ObjectId, ref: 'Diff'}],
    proposals: [{type: ObjectId, ref: 'Proposal'}]
});

export default User;
