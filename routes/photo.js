const mongoose = require('mongoose');
const router = require('express').Router();
const passport = require('passport');
const multer = require('multer');

// load models
const Photo = mongoose.model('Photo');
const User = mongoose.model('User');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/photos')
    },
    filename: function (req, file, cb) {
        // let extension = file.originalname.split('.').slice(-1)[0];
        cb(null, Date.now() + '-' + file.originalname);
    }
})
const upload = multer({storage});

// upload new file
router.post('/photo', passport.authenticate('jwt', {session: false}), upload.single('avatar'), (req, res) => {
    new Photo({
        url: req.file.filename,
        owner: req.user._id,
        comments: []
    }).save().then(photo => {
        res.send({message: 'photo uploaded successfully'});
    });
});

router.delete('/photos/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    let id = req.params.id;
    User
        .findById(req.user._id)
        .then(foundUser => {
            let photoIndex = foundUser.photos.indexOf(id);
            foundUser.photos.splice(photoIndex, 1);
            foundUser.markModified('photos');
            foundUser
                .save()
                .then(() => {
                    Photo
                        .findByIdAndRemove(id)
                        .then(() => res.send({message: 'Photo was deleted successfully'}))
                });
        })
});

router.get('/photos/:userId', (req, res) => {
    let userId = req.params.userId;
    Photo
        .find({
            owner: userId
        })
        .select('url createdAt')
        .then(photos => {
            res.send(photos);
        })
});


module.exports = router;