const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;
const options = {discriminatorKey: 'kind'};
// const Feedback = mongoose.model('Feedback');
// const Photo = mongoose.model('Photo');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    feedbacks: [{
        type: Schema.ObjectId,
        ref: 'Feedback'
    }],
    // photos: [Photo.schema],
    location: {
        city: String,
        country: String
    }
}, {timestamps: true, ...options});

// hash password before saving it in DB
UserSchema.pre('save', function(next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

// Method to compare password with hashed one
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


const User = mongoose.model('User', UserSchema);

// Models schema inherits from User
const Model = User.discriminator(
    'Model',
    new Schema({
        details: {
            height: {type: String, required: false, default: ''},
            weight: {type: String, required: false, default: ''},
            hairColor: {type: String, required: false, default: ''},
            eyeColor: {type: String, required: false, default: ''},
        },
        photos: [{ type: Schema.Types.ObjectId, ref: 'Photo' }]
    }, options)
);

// Photographer schema inherits from User
const Photographer = User.discriminator(
    'Photographer',
    new Schema({
        details: {
            camera: String,
        },
        photos: [{ type: Schema.Types.ObjectId, ref: 'Photo' }]
    }, options)
);
