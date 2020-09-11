const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = exports = mongoose.model('Standard', {
    name: {type: String, required: true},
    aliasof: {type: ObjectId, ref: 'Diff', required: true},
    iso_name: String,
    cplusplus: Number,
});
