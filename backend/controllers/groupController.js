const Group = require('../models/groupModel');
const User = require('../models/userModel');
const Student = require('../models/studentModel');
const mongoose = require('mongoose')
const Notification = require('../models/notificationModel');
const Project = require('../models/projectModel');
const getGroups = async (req, res) => {
    try {
        const groups = await Group.find({}).sort({ createdAt: -1 })
        res.status(200).json(groups)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

const createGroup = async (req, res) => {
    try {
        const { name, leaderId, visibility, capacity } = req.body;
        const alreadyInGroup = await Group.findOne({ members: leaderId });
        if (alreadyInGroup) {
            return res.status(400).json({ message: 'Student is already in a group' });
        }
        const newGroup = new Group({
            name,
            leader: leaderId,
            visibility,
            capacity,
            members: [leaderId]  // 将创建者自动加为成员
        });

        const savedGroup = await newGroup.save();
        await Student.findByIdAndUpdate(leaderId, { group_id: savedGroup._id });
        res.status(201).json({ message: "Group created successfully", group: newGroup });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const joinGroup = async (req, res) => {
    const { groupId, studentId } = req.body;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (group.visibility === 'Private') {
            return res.status(403).json({ message: 'Cannot join private groups directly' });
        }
        if (group.status === 'Full') {
            return res.status(400).json({ message: 'Group is full' });
        }

        const alreadyInGroup = await Group.findOne({ members: studentId });
        if (alreadyInGroup) {
            return res.status(400).json({ message: 'Student is already in a group' });
        }
        group.members.push(studentId);
        if (group.members.length >= group.capacity) {
            group.status = 'Full';
        }
        await group.save();
        //更新学生group
        const student = await Student.findByIdAndUpdate(studentId, { group_id: groupId }, { new: true });

        const type = 'group_update';
        const title = 'Joined Group';
        const message = `${student.lastName} ${student.firstName} has joined your group.`;
        const recipients = group.members.filter(memberId => memberId.toString() !== studentId.toString());  // 通知组内所有成员
        await Notification.sendNotification(type, title, message, recipients);

        res.status(200).json({ message: 'Student joined the group', group });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// const inviteToPrivateGroup = async (req, res) => {
//     const { groupId, studentId, leaderId } = req.body;
//     try {
//         const group = await Group.findById(groupId);
//         if (!group) {
//             return res.status(404).json({ message: 'Group not found' });
//         }
//         // if (group.leader.toString() !== leaderId) {
//         //     return res.status(403).json({ message: 'Only the leader can invite members to this group' });
//         // }
//         if (group.status === 'Full') {
//             return res.status(400).json({ message: 'Group is full' });
//         }

//         const alreadyInGroup = await Group.findOne({ members: studentId });
//         if (alreadyInGroup) {
//             return res.status(400).json({ message: 'Student is already in a group' });
//         }
//         group.members.push(studentId);
//         if (group.members.length >= group.capacity) {
//             group.status = 'Full';
//         }

//         await group.save();
//         //更新学生group
//         await Student.findByIdAndUpdate(studentId, { group_id: groupId });
//         res.status(200).json({ message: 'Student invited to the group', group });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };

const removeStudentFromGroup = async (req, res) => {
    const { groupId, studentId } = req.params;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        // 检查学生是否在小组成员列表中
        if (!group.members.includes(studentId)) {
            return res.status(404).json({ message: 'Student not found in group' });
        }
        group.members.pull(studentId); // 从成员列表中移除学生
        let groupDeleted = false;
        if (studentId === group.leader.toString()) {
            if (group.members.length > 0) {
                group.leader = group.members[0]; // 新的小组领导
            } else {
                await Group.findByIdAndDelete(groupId); // 如果没有成员，则删除小组
                groupDeleted = true;
                await Project.updateOne(
                    { groups: groupId },
                    { $pull: { groups: groupId } }
                );
            }
        }
        if (!groupDeleted) {
            if (group.members.length < group.capacity) {
                group.status = 'Open'; // 如果成员数低于容量，更新小组状态为开放
            }
            await group.save();
        }
        const student = await Student.findByIdAndUpdate(studentId, { group_id: null }, { new: true });

        const type = 'group_update';
        const title = 'Group member leave';
        const message = `${student.lastName} ${student.firstName} has left your group.`;
        const recipients = group.members;  // 通知组内所有成员
        await Notification.sendNotification(type, title, message, recipients);

        res.status(200).json({ message: 'Student removed and leader updated if necessary', group });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// const updateGroupVisibility = async (req, res) => {
//     const { groupId } = req.params;
//     const { visibility } = req.body;

//     try {
//         const group = await Group.findById(groupId);
//         if (!group) {
//             return res.status(404).json({ message: 'Group not found' });
//         }

//         // 检查 visibility 是否为有效的值（假设只能是 'Public' 或 'Private'）
//         if (!['Public', 'Private'].includes(visibility)) {
//             return res.status(400).json({ message: 'Invalid visibility value' });
//         }

//         group.visibility = visibility;
//         await group.save();
//         res.status(200).json({ message: 'Group visibility updated', group });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };
const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ message: 'group not found' })
        }

        // 使用 findByIdAndUpdate 方法更新学生信息
        const updateGroup = await Group.findOneAndUpdate(
            { _id: groupId },
            { ...req.body },
            { new: true } // 返回更新后的文档，并应用验证
        );

        if (!updateGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json(updateGroup);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const getGroupById = async (req, res) => {
    try {
        const groupId = req.params.id;
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(group);  // 返回找到的小组
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const submitPreferences = async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(404).json({ message: 'group not found' });
        }

        const newPreferences = req.body.preferences;

        // 验证新偏好设置
        if (!newPreferences || !newPreferences.projectNames || !newPreferences.projectDes || !newPreferences.skills || !newPreferences.comments) {
            return res.status(400).json({ message: 'Invalid preferences data' });
        }
        if (newPreferences.name.length === 0) {
            return res.status(400).json({ message: 'team name cannot be empty.' });
        }
        if (newPreferences.members.length === 0) {
            return res.status(400).json({ message: 'Project members cannot be empty.' });
        }
        if (newPreferences.projectNames.length !== 7) {
            return res.status(400).json({ message: 'Project names missing.' });
        }
        if (newPreferences.projectDes.length !== 7) {
            return res.status(400).json({ message: 'Project descriptions missing.' });
        }
        // if (newPreferences.comments.length === 0) {
        //     return res.status(400).json({ message: 'Project descriptions cannot be empty.' });
        // }
        // 更新组的偏好设置
        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { preferences: newPreferences },
            { new: true, runValidators: true } // 返回更新后的文档，并应用验证
        );

        // 更新标签逻辑
        const tags = [];
        for (const [skill, value] of Object.entries(newPreferences.skills)) {
            if (value === undefined || value === null) {
                return res.status(400).json({ error: 'all blank should be filled' });
            }
            if (value > 2) {
                tags.push(skill);
            }
        }
        if (!updatedGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }
        updatedGroup.tags = [...new Set(tags)]; //qu chong
        await updatedGroup.save();

        const group = await Group.findById(groupId);
        const type = 'preference_submited';
        const title = 'preference_submited';
        const message = `you group ${group.name} has submmited a preference`;
        const recipients = group.members;  // 通知组内所有成员
        await Notification.sendNotification(type, title, message, recipients);

        res.status(200).json(updatedGroup);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const assignGroupToProject = async (req, res) => {
    const { projectId } = req.body;
    const { groupId } = req.params;
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        // 将组ID添加到项目的 groups 字段
        if (!project.groups.includes(groupId)) {
            project.groups.push(groupId);
            await project.save();
        }
        // 将项目ID分配给组
        group.project_id = projectId;
        await group.save();

        const type = 'Assigned project';
        const title = 'Assigned project';
        const message = `Group ${group.name} has been assigned to project P${project.number} ${project.title}`;
        const recipients = group.members;  // 通知组内所有成员
        recipients.push(project.creator);
        if (project.supervisor) {
            if (project.supervisor.toString() !== project.creator.toString()) {
                recipients.push(project.supervisor)
            }
        }
        await Notification.sendNotification(type, title, message, recipients);

        res.status(200).json({ message: 'Group assigned to project successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    joinGroup,
    // inviteToPrivateGroup,
    createGroup,
    removeStudentFromGroup,
    getGroups,
    updateGroup,
    getGroupById,
    submitPreferences,
    assignGroupToProject
};
