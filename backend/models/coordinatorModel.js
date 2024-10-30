const mongoose = require('mongoose')

const Schema = mongoose.Schema

const coordinatorSchema = new Schema({
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
    },
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: false
    }]
},{timestamps: true})

module.exports = mongoose.model("Coordinator",coordinatorSchema)
