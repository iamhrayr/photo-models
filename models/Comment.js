const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    from: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    body: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Comment', CommentSchema);
