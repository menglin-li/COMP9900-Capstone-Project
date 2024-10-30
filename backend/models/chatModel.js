const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }],
    name: {
        type: String,
        required: true
    },
    creator:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    }
    
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
