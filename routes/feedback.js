const express = require('express');
const passport = require('passport');
const router = express.Router();
const mongoose = require('mongoose');

// Load models
const Feedback = mongoose.model('Feedback');
const User = mongoose.model('User');

router.get('/:userId/feedbacks', passport.authenticate('jwt', {session: false}), (req, res) => {
    const userId = req.params.userId;
    User
        .findById(userId)
        .populate({
            path: 'feedbacks',
            populate: { 
                path: 'from to',
                select: 'kind firstName lastName email'
            }
        })
        .then(user => {
            res.send(user.feedbacks)
        })
        .catch(error => {
            res.status(400).send({error})
        })
});

router.post('/:userId/feedback', passport.authenticate('jwt', {session: false}), (req, res) => {
    const userId = req.params.userId;
    const newFeedback = {
        from: req.user._id,
        to: userId,
        text: req.body.text,
        rating: req.body.rating 
    };
    new Feedback(newFeedback)
        .save()
        .then(leftFeedback => {
            let id = leftFeedback._id;
            User.findById(userId)
                .then(user => {
                    if (user.kind == req.user.kind) {
                        return res.status(422).send({message: 'You can not leave a feedback to this user'});
                    } else {
                        user.feedbacks.push(id);
                        user.markModified('feedbacks');
                        user.save().then(() => {
                            res.status(200).send({message: 'Feedback successfully posted'});
                        });
                    }
                })
                .catch(error => {
                    res.status(400).send({error});
                })
        })
        .catch(error => {
            res.status(400).send({error});
        })
});



module.exports = router;
