const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');


// Load models
const Message = mongoose.model('Message');
const Conversation = mongoose.model('Conversation');

router.post('/message/:userId', passport.authenticate('jwt', {session: false}), (req, res) => {
    const userId = req.params.userId;
    const senderId = req.user._id;
    const msgBody = req.body.msgBody;

    // check if conversation is already made between these users
    Conversation
        .findOne({
            participants: {
                $all: [userId, senderId]
            }
        })
        .then(foundConv => {
            if (!foundConv) {
                // If conversation does not exists, create it and then create a message
                new Conversation({
                    participants: [userId, senderId],
                }).save().then(createdConv => {
                    new Message({
                        conversationId: createdConv._id,
                        sender: senderId,
                        body: msgBody
                    }).save().then(createdMsg => {
                        createdConv.messages.push(createdMsg._id);
                        createdConv.markModified('messages');
                        createdConv.save().then(() => res.send(createdMsg));
                    }).catch(error => res.send(error));
                }).catch(error => res.send(error));
            } else {
                // if conversation exists, just create a message and push it into conversation
                new Message({
                    conversationId: foundConv._id,
                    sender: senderId,
                    body: msgBody
                }).save().then(createdMsg => {
                    foundConv.messages.push(createdMsg._id);
                    foundConv.markModified('messages');
                    foundConv.save().then(() => res.send(createdMsg));
                }).catch(error => res.send(error));
            }
        })
        .catch(error => res.send(error));
});

router.get('/conversations', passport.authenticate('jwt', {session: false}), (req, res) => {
    Conversation
        .find({
            participants: req.user._id
        })
        // .select('-messages')
        // .populate({
        //     path: 'lastMessage',
        //     select: 'body sender createdAt'
        // })
        .then(conversations => res.send(conversations))
        .catch(error => res.send(error));
});

router.get('/conversation/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    let id = req.params.id;
    Conversation
        .findById(id)
        .populate({
            path: 'messages', 
            select: 'createdAt sender body', 
            populate: {
                path: 'sender', 
                select:'email firstName lastName kind'
            }
        })
        .then(conversation => res.send(conversation))
        .catch(error => res.send(error));
});

module.exports = router;