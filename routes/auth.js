const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const secret = require('../config/keys').secret;

// Load models
const User = mongoose.model('User');
const Model = mongoose.model('Model');
const Photographer = mongoose.model('Photographer');

router.post('/register', (req, res) => {
    // check if user does not exists
    User
        .findOne({email: req.body.email})
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).send({message: 'The user with the email is already exists'});
            } else {
                // Create a user if it does not exists
                const newUser = req.body;
                switch (req.body.userType) {
                    case 'model':
                        new Model(newUser).save().then(() => {
                            res.send({message: 'You have successfully registered'})
                        });
                        break;
                    case 'photographer':
                        new Photographer(newUser).save().then(() => {
                            res.send({message: 'You have successfully registered'})
                        });
                        break;
                }
            }
        })
});

router.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    User
        .findOne({email})
        .then(user => {
            if (!user) {
                return res.status(400).send({message: 'Wrong credentials'});
            }
            user.comparePassword(password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    const payload = {
                        _id: user._id,
                        email: user.email
                    };
                    const token = jwt.sign(payload, secret);
                    return res.send({
                        // ...payload,
                        token: token,
                    });
                } else {
                    return res.status(400).send({message: 'Wrong credentials'});
                }
            })
        })
    
});


module.exports = router;
