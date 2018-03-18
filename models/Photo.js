const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhotoSchema = new Schema({
    url: {
        type: String,
        required: true,
        default: ''
    },
    owner: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    comments: [{
        type: Schema.ObjectId,
        ref: 'Comment'
    }]
}, {timestamps: true});

mongoose.model('Photo', PhotoSchema);
