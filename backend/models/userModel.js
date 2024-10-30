const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema
const validator = require('validator')

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
        // validate: [validator.isEmail, 'Please enter a valid email']
    },
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role_type: {
        type: String,
        required: [true, 'Role type is required']
    },
    status: {
        type: Boolean,
        default: false
    },
    skill: {
        type: String
    },
    resume: {
        type: String
    },
    background: {
        type: String
    },
    avatar:{
        type: String
    }
},{timestamps: true})


// Static method to sign up a new user
userSchema.statics.signup = async function({ email, firstName, lastName, password, role_type, skill, resume, background, avatar }) {
    if (!email || !password || !firstName || !lastName || !role_type) {
        throw new Error('All required fields must be filled');
    }

    if (!validator.isEmail(email.toLowerCase())) {
        throw new Error('Invalid email format');
    }

    const exists = await this.findOne({ email });
    if (exists) {
        throw new Error('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({
        email,
        firstName,
        lastName,
        password: hash,
        role_type,
        status: role_type === 'student',
        skill,
        resume,
        background,
        avatar
    });

    return user;
};

userSchema.pre('save', function(next) {
    if (this.email) {
        this.email = this.email.toLowerCase();
    }
    next();
});
// Static method to login a user
userSchema.statics.login = async function({ email, password }) {
    if (!email || !password) {
        throw new Error('All fields must be filled');
    }
    email = email.toLowerCase();

    const user = await this.findOne({ email });
    if (!user) {
        throw new Error('Incorrect email');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error('Incorrect password');
    }

    return user; // Returning user to be used for token generation in controller
};

module.exports = mongoose.model("User",userSchema)

