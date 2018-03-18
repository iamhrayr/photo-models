const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
    messages: [{
        type: Schema.ObjectId,
        ref: 'Message',
        default: []
    }],
    participants: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    // lastMessage: {
    //     type: Schema.ObjectId,
    //     ref: 'Message',
    // }
},{
    timestamps: true,
    toObject: {virtuals: true},
    toJson: {virtuals: true}
});

// add last message property inside a conversation model
let lastMessageVirtual = ConversationSchema.virtual(
    'lastMessage', 
    // {
    //     ref: 'Message',
    //     localField: 'lastMessage',
    //     foreignField: '_id',
    //     justOne: true
    // }
);
lastMessageVirtual.get(function(){
    let len = this.messages.length;
    if (len > 0) {
        return this.messages[len - 1]
    }
    return '';
});
// ConversationSchema.pre('save', function(next){
//     let len = this.messages.length;
//     this.lastMessage = this.messages[len - 1];
//     next();
// })

const MessageSchema = new Schema({
    conversationId: {
        type: Schema.ObjectId,
        ref: 'Conversation'
    },
    sender: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    body: String
}, {timestamps: true});

mongoose.model('Message', MessageSchema);
mongoose.model('Conversation', ConversationSchema);
