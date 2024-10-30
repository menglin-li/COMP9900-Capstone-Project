const mongoose = require('mongoose')

const Schema = mongoose.Schema

const tutorSchema = new Schema({
    email: {
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
    avatar:{
        type: String
    }
},{timestamps: true})

module.exports = mongoose.model("Tutor",tutorSchema)

