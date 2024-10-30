const mongoose = require('mongoose')

const Schema = mongoose.Schema

const studentSchema = new Schema({
    user_id: {  // 添加用户ID作为引用
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
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
    group_id: {
        type: String,
        required: false
    },
    student_avatar: {
        type: String,
        required: false
    },

},{timestamps: true})

module.exports = mongoose.model("Student",studentSchema)
