const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    tutor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    visibility: {
        type: String,
        enum: ['Public', 'Private'],
        default: 'Public'
    },
    status: {
        type: String,
        enum: ['Open', 'Full'],
        default: 'Open'
    },
    capacity: {
        type: Number,
        default: 6  
    },
    project_id: {  // 添加用户ID作为引用
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    project_grade:{
        type: Number
    },
    grade_comment:{
        type: String
    },
    
    preferences: {
        name: {
            type: String,
        },
        members: {
            type: String,
        },
        projectNames: {
            type: [String],
        },
        projectDes: {
            type: [String],
        },
        skills: {
            Programming: {
                type: Number,
            },
            frontend: {
                type: Number,
            },
            database: {
                type: Number,
            },
            cybersecurity: {
                type: Number,
            },
            AI: {
                type: Number,
            }
        },
        comments: {
            type: String,
        }
    },
    tags: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);