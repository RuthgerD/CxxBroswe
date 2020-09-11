const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = exports = mongoose.model('User', {
    name: {type: String, required: true},
    passhash: String, // not required, since system users are loginless
    diffs: [{type: ObjectId, ref: 'Diff'}],
    proposals: [{type: ObjectId, ref: 'Proposal'}]
});
