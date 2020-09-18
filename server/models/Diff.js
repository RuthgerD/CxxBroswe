const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = exports = mongoose.model('Diff', {
    author: {type: ObjectId, ref: 'User'},
    content: {type: String, required: true},
    name: String
});
