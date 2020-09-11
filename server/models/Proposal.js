const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = exports = mongoose.model('Proposal', {
    number: {type: String, required: true}, // P0000 or Q00000
    name: {type: String, required: true},
    author: {type: ObjectId, ref: 'User', required: true},
    versions: {type: [{type: ObjectId, ref: 'Diff'}], required: true}
});
