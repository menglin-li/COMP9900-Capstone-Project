const Project = require('../models/projectModel');
const Client = require('../models/clientModel');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Group = require('../models/groupModel');
const Notification = require('../models/notificationModel');
// Get all projects
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({}).sort({ number: 1 });
        res.status(200).json(projects);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get a single project
const getProjectById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Project not found' });
    }
    const project = await Project.findById(id);
    if (!project) {
        return res.status(404).json({ message: 'No such project' });
    }
    res.status(200).json(project);
};

const getProjectByNumber = async (req, res) => {
    const { number } = req.params;  // 使用 number 而不是 id
    const project = await Project.findOne({ number: number });
    if (!project) {
        return res.status(404).json({ message: 'No such project' });
    }
    res.status(200).json(project);
};

// Create a new project
const createProject = async (req, res) => {
    const { title, creator, tags, capacity, background, requirements, scope, requiredKnowledgeAndSkills, expectedOutcomesDeliverables } = req.body;
    try {
        // 验证 supervisor 是否是有效的 tutor 或 coordinator
        // let validSupervisor = null;  // 初始化 supervisor 为 null

        // // 检查是否提供了有效的 supervisor
        // if (supervisor && supervisor.trim() !== '') {
        //     const user = await User.findById(supervisor);
        //     if (!user || (user.role_type !== 'tutor' && user.role_type !== 'coordinator')) {
        //         return res.status(400).json({ message: 'Supervisor must be a valid tutor or coordinator' });
        //     }
        //     validSupervisor = supervisor;  // 设置有效的 supervisor
        // }
        // 首先获取 creator 的信息
        const user = await User.findById(creator);
        if (!user) {
            return res.status(404).json({ message: 'Creator not found' });
        }

        // 确定 onModel 值
        let onModel;
        if (user.role_type === 'client') {
            onModel = 'Client';
        } else if (user.role_type === 'coordinator') {
            onModel = 'Coordinator';
        } else {
            return res.status(400).json({ message: 'Creator must be either a Client or a Coordinator' });
        }
        const project = await Project.create({ title, creator, onModel, tags, capacity, background, requirements, scope, requiredKnowledgeAndSkills, expectedOutcomesDeliverables });

        // 更新创建者（Client 或 Coordinator）的项目列表
        const Model = mongoose.model(onModel);  // 动态决定模型
        await Model.findByIdAndUpdate(creator, {
            $push: { projects: project._id }
        }, { new: true });


        res.status(201).json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a project
const updateProject = async (req, res) => {
    const { number } = req.params;  // 使用 number 而不是 id
    const userId = req.user._id.toString();
    const updates = req.body;
    try {
        const project = await Project.findOne({ number: number })
        .populate({
            path: 'groups',
            populate: {
                path: 'members'
            }
        });
        if (!project) {
            return res.status(404).json({ message: 'No such project' });
        }
        // 检查当前用户是否为项目的 creator 或 supervisor
        if (project.creator.toString() !== userId && project.supervisor?.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }

        // 如果不是 creator，只允许更新 tags
        if (project.creator.toString() !== userId) {
            if (Object.keys(updates).length > 1 || !updates.tags) {
                return res.status(403).json({ message: 'Only tags can be updated' });
            }
        }

        // 更新项目，允许 creator 更新所有信息，supervisor 只更新 tags
        if (updates.tags && project.supervisor?.toString() === userId) {
            project.tags = updates.tags;
        }

        if (project.creator.toString() === userId) {
            // 允许更新除 tags 外的所有其他信息
            for (let key in updates) {
                if (key !== 'tags') {
                    project[key] = updates[key];
                }
            }
            project.tags = updates.tags; // creator 也可以更新 tags
        }

        await project.save();

        const recipients = [];
        recipients.push(project.creator);
        if (project.supervisor) {
            if (project.supervisor.toString() !== project.creator.toString())
            recipients.push(project.supervisor);
        };
        if (project.groups) {
            for (const group of project.groups) {
                for (const member of group.members) {
                    recipients.push(member);
                }
            }
        }
        
        console.log(recipients)
        const type = 'Project update';
        const title = 'Project update';
        const message = `P${project.number} ${project.title} has made some changes`;
          // 通知组内所有成员
        await Notification.sendNotification(type, title, message, recipients);

        res.status(200).json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
    
    
// Delete a project
const deleteProject = async (req, res) => {
    const { number } = req.params;  // 使用 number 而不是 id
    const project = await Project.findOneAndDelete({ number: number });  // 根据 number 删除
    if (!project) {
        return res.status(404).json({ message: 'No such project' });
    }
    res.status(200).json(project);
};

module.exports = {
    getProjects,
    getProjectById,
    getProjectByNumber,
    createProject,
    updateProject,
    deleteProject
};
