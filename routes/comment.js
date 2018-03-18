const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');

// load models
const Comment = mongoose.model('Comment');
const Photo = mongoose.model('Photo');

router.post('/:photoId/comment', passport.authenticate('jwt', {session: false}), (req, res) => {
    let photoId = req.params.photoId;
    new Comment({
        from: req.user._id,
        body: req.body.comment
    }).save().then(createdComment => {
        Photo
            .findOne({_id: photoId})
            .then(foundPhoto => {
                if (foundPhoto) {
                    foundPhoto.comments.push(createdComment._id);
                    foundPhoto.markModified('comments');
                    foundPhoto.save().then(()=> res.send({message: 'Comment added successfully'}));
                }
            })
    })
});

module.exports = router;