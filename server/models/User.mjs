import mongoose from 'mongoose';
const { model, Types } = mongoose;
const { ObjectId } = Types;

export const User = model('User', {
    name: { type: String, required: true },
    external_id: { type: Number },
    login: { type: String },
    avatar_url: { type: String, required: true },
    location: { type: String },
    email: { type: String },
    bio: { type: String },
    role: { type: String, required: true },
    created_at: { type: Date },
    updated_at: { type: Date },
    source: { type: String, required: true },

    settings: { type: ObjectId, ref: 'Settings' },
    diffs: [{ type: ObjectId, ref: 'Diff' }],
    proposals: [{ type: ObjectId, ref: 'Proposal' }]
});

export default User;
