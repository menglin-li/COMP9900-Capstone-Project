const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    number: {
        type: Number,
        unique: true
    },
    status: {
        type: String,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        required: true,
        enum: ['Client', 'Coordinator']  // 允许的模型名称
    },
    tags: [{
        type: String
    }],
    capacity: {
        type: Number,
        required: true
    },
    background: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        required: true
    },
    requiredKnowledgeAndSkills: {
        type: String,
        required: true
    },
    expectedOutcomesDeliverables: {
        type: String,
        required: true
    },
    supervisor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    groups: [{
        type: Schema.Types.ObjectId,
        ref: 'Group'  
    }]
}, { timestamps: true });

// 自动递增
projectSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastProject = await mongoose.model('Project').findOne().sort({ number: -1 });
        this.number = lastProject ? lastProject.number + 1 : 1;
    }
    next();
});

module.exports = mongoose.model('Project', projectSchema);
