const User = require('../models/userModel');
const Tutor = require('../models/tutorModel');
const Coordinator = require('../models/coordinatorModel');
const Client = require('../models/clientModel');
const Project = require('../models/projectModel');
const Notification = require('../models/notificationModel');
const Group = require('../models/groupModel');
// 获取所有待批准的 tutors 和 coordinators
const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({
            role_type: { $in: ['tutor', 'coordinator', 'client'] }, //后续client记得加
            status: false
        });
        res.status(200).json(pendingUsers);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 批准 tutor 或 coordinator
const approveUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 更新用户状态为批准
        user.status = true;
        await user.save();

        // 如果用户是tutor，迁移信息到Tutor表
        if (user.role_type === 'tutor') {
            const newTutor = new Tutor({
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            });
            await newTutor.save();
        }

        // 如果用户是coordinator，迁移信息到Coordinator表
        if (user.role_type === 'coordinator') {
            const newCoordinator = new Coordinator({
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            });
            await newCoordinator.save();
        }
        // 如果用户是client，迁移信息到Client表
        if (user.role_type === 'client') {
            const newClient = new Client({
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            });
            await newClient.save();
        }
        res.status(200).json({ message: 'User approved and data migrated', userData: user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 删除用户
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 删除用户之前的额外清理工作
        if (user.role_type === 'tutor') {
            // 如果已迁移数据到Tutor表，这里也删除
            await Tutor.findByIdAndDelete(id);
        } else if (user.role_type === 'coordinator') {
            // 如果已迁移数据到Coordinator表，这里也删除
            await Coordinator.findByIdAndDelete(id);
        }
        //client处理后续记得加
        //
        else if (user.role_type === 'client') {
            // 如果已迁移数据到client表，这里也删除
            await Client.findByIdAndDelete(id);
        }
        // 删除User表中的用户记录
        await User.findByIdAndDelete(id);

        res.status(200).json({ message: 'User successfully deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const signSupervisor = async (req, res) => {
    try {
        const { id, projectId } = req.body;
        const user = await User.findById(id);
        const project = await Project.findById(projectId);

        if (!user || !project) {
            return res.status(404).json({ error: 'User or Project not found' });
        }
        project.supervisor = id;
        await project.save();

        const type = 'project_update';
        const title = 'Supervisor assigned';
        const message = `${user.firstName} ${user.lastName} are assigned as a supervisor of P${project.number} ${project.title}.`;
        const recipients = [project.supervisor, project.creator];
        await Notification.sendNotification(type, title, message, recipients);

        res.status(200).json({ message: 'Supervisor assigned successfully', project });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const approveProject = async (req, res) => {
    const { id } = req.params;
    try {
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // 更新用户状态为批准
        project.status = 'true';
        await project.save();
        const type = 'project Approved';
        const title = 'project Approved';
        const message = `your project P${project.number} ${project.title} has been approved by the admin!`;
        const recipients = [project.creator];
        await Notification.sendNotification(type, title, message, recipients);
        res.status(200).json({ message: 'Project approved successful' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const dismissProject = async (req, res) => {
    const { id } = req.params;
    try {
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // 更新用户状态为批准
        project.status = 'pending';

        await project.save();
        const type = 'project create declined';
        const title = 'project needs ajust';
        const message = `your project ${project.title} need ajustment to be pubished publicly`;
        const recipients = [project.creator];  // 通知组内所有成员
        await Notification.sendNotification(type, title, message, recipients);
        res.status(200).json({ message: 'Project dismiss successful' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const fetchProjectAllocation = async (req, res) => {
    // 1. 展示多少组没有被allocate （table）
    const unallocatedGroups = await Group.find({ project_id: null })
        .populate({
            path: 'leader',
            select: 'firstName lastName',
            transform: (doc) => doc ? `${doc.firstName} ${doc.lastName}` : ''
        })
        .populate({
            path: 'members',
            select: 'firstName lastName',
            transform: (doc) => doc ? `${doc.firstName} ${doc.lastName}` : ''
        });

    // 2. 展示每个tag下 proj的数量
    const tagsProjectCount = await Project.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } }
    ]);

    // 3. 展示每个project 下面的小组数量信息 （table）
    const groupsPerProject = await Project.aggregate([
        {
            $lookup: {
                from: "groups",
                localField: "_id",
                foreignField: "project_id",
                as: "assignedGroups"
            }
        },
        { $project: { title: 1, numberOfGroups: { $size: "$assignedGroups" } } }
    ]);

    // 4. 展示client 和 coor 创建的 proj 数量对比
    const projectCreationComparison = await Project.aggregate([
        {
            $group: {
                _id: "$onModel",
                count: { $sum: 1 }
            }
        }
    ]);

    res.json({
        unallocatedGroups,
        tagsProjectCount,
        groupsPerProject,
        projectCreationComparison
    });

};

const fetchStudentPreferences = async (req, res) => {
    // 1. 展示多少组还没做preference（table）
    const groupsWithoutPreferences = await Group.find({ "preferences.projectNames": { $size: 0 } })
        .populate({
            path: 'leader',
            select: 'firstName lastName',
            transform: (doc) => doc ? `${doc.firstName} ${doc.lastName}` : ''
        })
        .populate({
            path: 'members',
            select: 'firstName lastName',
            transform: (doc) => doc ? `${doc.firstName} ${doc.lastName}` : ''
        });

    // 2. 展示project 被 preference的次数
    const projectPreferenceCounts = await Group.aggregate([
        { $unwind: "$preferences.projectNames" },
        { $group: { _id: "$preferences.projectNames", count: { $sum: 1 } } },
        { $lookup: { from: "projects", localField: "_id", foreignField: "title", as: "project" } },
        { $unwind: "$project" },
        { $project: { projectName: "$project.title", count: 1 } }
    ]);

    // 3. 展示project 被 preference的（10 - rank）的平均数
    const projectPreferenceScores = await Group.aggregate([
        { $unwind: { path: "$preferences.projectNames", includeArrayIndex: "rank" } },
        {
            $group: {
                _id: "$preferences.projectNames",
                averageScore: { $avg: { $subtract: [10, "$rank"] } }
            }
        },
        { $lookup: { from: "projects", localField: "_id", foreignField: "title", as: "project" } },
        { $unwind: "$project" },
        { $project: { projectName: "$project.title", averageScore: 1 } }
    ]);

    // 4. 展示group 的 每个skill的数量
    const skillsCount = await Group.aggregate([
        {
            $group: {
                _id: null,
                programming: { $sum: "$preferences.skills.Programming" },
                frontend: { $sum: "$preferences.skills.frontend" },
                database: { $sum: "$preferences.skills.database" },
                cybersecurity: { $sum: "$preferences.skills.cybersecurity" },
                ai: { $sum: "$preferences.skills.AI" }
            }
        }
    ]);

    res.json({
        groupsWithoutPreferences,
        projectPreferenceCounts,
        projectPreferenceScores,
        skillsCount
    });
};


module.exports = {
    getPendingUsers,
    approveUser,
    deleteUser,
    signSupervisor,
    approveProject,
    dismissProject,
    fetchProjectAllocation,
    fetchStudentPreferences
};
