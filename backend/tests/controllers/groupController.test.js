require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const Admin = require('../../models/adminModel');
const User = require('../../models/userModel');
const Coordinator = require('../../models/coordinatorModel');
const Notification = require('../../models/notificationModel');
const Client = require('../../models/clientModel');
const Group = require('../../models/groupModel');
const Student = require('../../models/studentModel');
const Project = require('../../models/projectModel');
const groupRoutes = require('../../routes/group');
const requireAuth = require('../../middleware/requireAuth'); // 确保路径正确

jest.mock('../../models/userModel');
jest.mock('../../models/adminModel');
jest.mock('../../models/tutorModel');
jest.mock('../../models/coordinatorModel');
jest.mock('../../models/clientModel');
jest.mock('../../models/projectModel');
jest.mock('../../models/notificationModel');
jest.mock('../../models/groupModel');
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(() => 'hashedPassword')
}));

jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        startSession: () => ({
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        })
    };
});
jest.mock('jsonwebtoken');
jest.mock('../../models/userModel', () => ({
    findOne: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue({ _id: '123' }), // 确保返回值与你的业务逻辑一致
    findById: jest.fn().mockResolvedValue({ _id: '123' }),
}));

const app = express();
app.use(express.json());
app.use(requireAuth); // 应用中间件
app.use('/group/', groupRoutes);

beforeAll(() => {
    process.env.SECRET = 'testsecret'; // 配置环境变量
});


describe('GET /group', () => {
    it('should fetch all groups sorted by creation date in descending order', async () => {
        const token = 'validtoken';
        const userId1 = new mongoose.Types.ObjectId();
        const userId2 = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: userId1 });
        jwt.verify.mockReturnValue({ _id: userId2 });
        const mockGroups = [
            { _id: userId1, name: 'Group 1' },
            { _id: userId2, name: 'Group 2' }
        ];
        Group.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockGroups)
        });

        const res = await request(app)
            .get('/group').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Group.find).toHaveBeenCalled();
    });

    it('should return 400 if there is a database error', async () => {
        Group.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error('Database error'))
        });
        const token = 'validtoken';

        const res = await request(app)
            .get('/group').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('POST /group', () => {
    it('should return 400 if the leader is already in a group', async () => {
        const mockLeaderId = new mongoose.Types.ObjectId();
        const token = 'validtoken';
        Group.findOne = jest.fn().mockResolvedValue({ name: 'Existing Group', members: [mockLeaderId] });
        jwt.verify.mockReturnValue({ _id: mockLeaderId });
        const res = await request(app)
            .post('/group')
            .send({ name: 'New Group', leaderId: mockLeaderId, visibility: 'public', capacity: 5 })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Student is already in a group' });
    });

    it('should create a group successfully and update the leader\'s group_id', async () => {
        const mockLeaderId = new mongoose.Types.ObjectId();
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: mockLeaderId });
        Group.findOne = jest.fn().mockResolvedValue(null);
        Group.prototype.save = jest.fn().mockResolvedValue({
            _id: new mongoose.Types.ObjectId(),
            name: 'New Group',
            members: [mockLeaderId]
        });
        Student.findByIdAndUpdate = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .post('/group')
            .send({ name: 'New Group', leaderId: mockLeaderId, visibility: 'public', capacity: 5 })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ message: "Group created successfully" });
        expect(Group.prototype.save).toHaveBeenCalled();
    });

    it('should return 400 if there is a database error during the creation', async () => {
        const mockLeaderId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: mockLeaderId });
        const token = 'validtoken';
        Group.findOne = jest.fn().mockResolvedValue(null);
        Group.prototype.save = jest.fn().mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .post('/group')
            .send({ name: 'New Group', leaderId: mockLeaderId, visibility: 'public', capacity: 5 })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('POST join group /group/join', () => {
    it('should return 404 if group is not found', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        Group.findById = jest.fn().mockResolvedValue(null);

        const res = await request(app)
            .post('/group/join')
            .send({ groupId, studentId })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Group not found' });
    });

    it('should return 403 if trying to join a private group directly', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        const group = { _id: groupId, visibility: 'Private' };
        Group.findById = jest.fn().mockResolvedValue(group);

        const res = await request(app)
            .post('/group/join')
            .send({ groupId: group._id, studentId: studentId })
            .set('Authorization', `Bearer ${token}`);


        expect(res.status).toBe(403);
        expect(res.body).toEqual({ message: 'Cannot join private groups directly' });
    });

    it('should return 400 if the group is full', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        const group = { _id: groupId, visibility: 'Public', status: 'Full' };
        Group.findById = jest.fn().mockResolvedValue(group);

        const res = await request(app)
            .post('/group/join')
            .send({ groupId: group._id, studentId: studentId })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Group is full' });
    });

    it('should return 400 if student is already in a group', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        const group = { _id: groupId, visibility: 'Public', status: 'Open', members: [] };
        Group.findById = jest.fn().mockResolvedValue(group);
        Group.findOne = jest.fn().mockResolvedValue({ name: 'Another Group' });

        const res = await request(app)
            .post('/group/join')
            .send({ groupId: group._id, studentId })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Student is already in a group' });
    });

    it('should allow student to join the group and notify others', async () => {
        const group = {
            _id: new mongoose.Types.ObjectId(),
            visibility: 'Public',
            status: 'Open',
            members: [],
            capacity: 5,
            save: jest.fn()
        };
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        Group.findById = jest.fn().mockResolvedValue(group);
        Group.findOne = jest.fn().mockResolvedValue(null);
        Group.prototype.save = jest.fn().mockResolvedValue({});
        Student.findByIdAndUpdate = jest.fn().mockResolvedValue({ lastName: 'Doe', firstName: 'John' });
        Notification.sendNotification = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .post('/group/join')
            .send({ groupId: group._id, studentId })
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Student joined the group');
        expect(Notification.sendNotification).toHaveBeenCalled();
    });
    it('should mark the group as full when the last spot is filled', async () => {
        const group = {
            _id: new mongoose.Types.ObjectId(),
            visibility: 'Public',
            status: 'Open',
            members: [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId() // 4 members already, capacity is 5
            ],
            capacity: 5,
            save: jest.fn()
        };
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId(); // This will be the 5th member
        jwt.verify.mockReturnValue({ _id: studentId });
        Group.findById = jest.fn().mockResolvedValue(group);
        Group.findOne = jest.fn().mockResolvedValue(null); // Ensure the student is not in another group
        Group.prototype.save = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .post('/group/join')
            .send({ groupId: group._id, studentId })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Student joined the group');
        expect(group.status).toBe('Full');
        expect(group.save).toHaveBeenCalled();
        expect(Notification.sendNotification).toHaveBeenCalled();
    });


    it('should return 400 if there is a database error', async () => {
        Group.findById = jest.fn().mockRejectedValue(new Error('Database error'));
        const token = 'validtoken';
        const res = await request(app)
            .post('/group/join')
            .send({ groupId: new mongoose.Types.ObjectId(), studentId: new mongoose.Types.ObjectId() })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('DELETE /group/:groupId/:studentId', () => {
    it('should return 404 if the group is not found', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const studentId = new mongoose.Types.ObjectId();
        Group.findById = jest.fn().mockResolvedValue(null);
        jwt.verify.mockReturnValue({ _id: studentId });
        const token = 'validtoken';

        const res = await request(app)
            .delete(`/group/${groupId}/${studentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Group not found' });
    });

    it('should return 404 if the student is not in the group', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        const token = 'validtoken';
        const group = { _id: groupId, members: [new mongoose.Types.ObjectId()], leader: new mongoose.Types.ObjectId() };
        Group.findById = jest.fn().mockResolvedValue(group);

        const res = await request(app)
            .delete(`/group/${groupId}/${studentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Student not found in group' });
    });

    it('should remove the student and update the group details', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const studentId = new mongoose.Types.ObjectId();
        const studentId2 = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        jwt.verify.mockReturnValue({ _id: studentId2 });
        const members = [studentId.toString(), studentId2.toString()];
        members.pull = jest.fn((id) => {
            const index = members.indexOf(id.toString());
            if (index > -1) {
                members.splice(index, 1);
            }
        });
        const token = 'validtoken';
        const group = { _id: groupId, members, leader: studentId.toString(), save: jest.fn(), capacity: 3, status: 'Full' };
        Group.findById = jest.fn().mockResolvedValue(group);
        Group.findByIdAndDelete = jest.fn().mockResolvedValue({});
        Student.findByIdAndUpdate = jest.fn().mockResolvedValue({ lastName: 'Doe', firstName: 'John' });
        Notification.sendNotification = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .delete(`/group/${groupId}/${studentId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Student removed and leader updated if necessary');
        expect(group.save).toHaveBeenCalled();
        expect(Notification.sendNotification).toHaveBeenCalled();
    });

    it('should delete the group if the removed student is the leader and the only member', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const studentId = new mongoose.Types.ObjectId();  // 这个学生同时是小组的领导和唯一成员
        jwt.verify.mockReturnValue({ _id: studentId });
        const token = 'validtoken';
        // 模拟一个小组，该小组只有这一个领导成员
        const members = [studentId.toString()]
        members.pull = jest.fn((id) => {
            const index = members.indexOf(id.toString());
            if (index > -1) {
                members.splice(index, 1);
            }
        });
        const group = {
            _id: groupId,
            members,
            leader: studentId.toString(),
            save: jest.fn(),
            capacity: 1,
            status: 'Full'
        };

        Group.findById = jest.fn().mockResolvedValue(group);
        Group.findByIdAndDelete = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .delete(`/group/${groupId}/${studentId}`)
            .set('Authorization', `Bearer ${token}`);  // 确保 token 被设置
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Student removed and leader updated if necessary');
    });


    it('should return 400 if there is a database error during the removal process', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        const token = 'validtoken';
        Group.findById = jest.fn().mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .delete(`/group/${groupId}/${studentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('PATCH update group information /group/:groupId', () => {
    it('should return 404 if the group ID is invalid', async () => {
        const invalidGroupId = 'invalid-id';
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false); // Mock ObjectId validation to return false for invalid ID
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        const res = await request(app)
            .patch(`/group/${invalidGroupId}`)
            .send({ name: 'Updated Group', visibility: 'public' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'group not found' });
    });

    it('should return 404 if no group found with the given id', async () => {
        const groupId = new mongoose.Types.ObjectId();
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        Group.findOneAndUpdate = jest.fn().mockResolvedValue(null); // Mock findOneAndUpdate to simulate no group found

        const res = await request(app)
            .patch(`/group/${groupId}`)
            .send({ name: 'Updated Group', visibility: 'public' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Group not found' });
    });

    it('should update the group successfully and return the updated document', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const updatedGroupData = {
            _id: groupId,
            name: 'Updated Group',
            visibility: 'public'
        };
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });

        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        Group.findOneAndUpdate = jest.fn().mockResolvedValue(updatedGroupData);

        const res = await request(app)
            .patch(`/group/${groupId}`)
            .send({ name: 'Updated Group', visibility: 'public' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
    });

    it('should return 400 if there is a database error during the update', async () => {
        const groupId = new mongoose.Types.ObjectId();
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        Group.findOneAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });

        const res = await request(app)
            .patch(`/group/${groupId}`)
            .send({ name: 'Updated Group', visibility: 'public' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('GET /group/:groupId', () => {
    it('should return 404 if no group is found with the given id', async () => {
        const groupId = new mongoose.Types.ObjectId(); // Generate a valid ObjectId for testing
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        Group.findById = jest.fn().mockResolvedValue(null); // Mock findById to simulate no group found

        const res = await request(app)
            .get(`/group/${groupId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Group not found' });
    });

    it('should retrieve the group successfully and return the group data', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const mockGroup = {
            _id: groupId,
            name: 'Sample Group',
            members: [],
            createdAt: new Date()
        };
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        Group.findById = jest.fn().mockResolvedValue(mockGroup); // Mock findById to return mock group data

        const res = await request(app)
            .get(`/group/${groupId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            _id: expect.any(String),
            name: 'Sample Group',
            members: [],
            createdAt: expect.any(String)
        });
    });

    it('should return 400 if there is a database error during the fetch', async () => {
        const groupId = new mongoose.Types.ObjectId();
        Group.findById = jest.fn().mockRejectedValue(new Error('Database error')); // Mock findById to simulate a database error
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        const res = await request(app)
            .get(`/group/${groupId}`)
            .set('Authorization', `Bearer ${token}`);


        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('PATCH submit preference /group/:groupId/preferences', () => {
    it('should return 404 if the group ID is invalid', async () => {
        const invalidGroupId = 'invalid-id';
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false); // Mock ObjectId validation to return false for invalid ID
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });

        const res = await request(app)
            .patch(`/group/${invalidGroupId}/preferences`)
            .send({ preferences: {} })
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'group not found' });
    });

    it('should return 404 if no group found with the given id', async () => {
        const groupId = new mongoose.Types.ObjectId();
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        const completePreferences = {
            "comments": "adada",
            "skills": {
                "Programming": 3,
                "frontend": 3,
                "database": 3,
                "cybersecurity": 3,
                "AI": 3
            },
            "projectNames": [1, 2, 3, 4, 5, 6, 7],
            "projectDes": [1, 2, 3, 4, 5, 6, 7],
            "name": "groupa",
            "members": "a"
        };
        jwt.verify.mockReturnValue({ _id: studentId });
        Group.findByIdAndUpdate = jest.fn().mockResolvedValue(null); // Mock findOneAndUpdate to simulate no group found

        const res = await request(app)
            .patch(`/group/${groupId}/preferences`)
            .send({ preferences: completePreferences })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Group not found' });
    });

    it('should return 400 if preferences data is invalid', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        const incompletePreferences = {
            projectNames: ["Project 1"],  // Missing other required fields
            projectDes: ["Description 1"],
            skills: {},
            comments: "Some comment"
        };

        const res = await request(app)
            .patch(`/group/${groupId}/preferences`)
            .send({ preferences: incompletePreferences })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
    });
    it('should return 400 if the team name is empty', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const preferences = {
            "comments": "adada",
            "skills": {
                "Programming": 3,
                "frontend": 3,
                "database": 3,
                "cybersecurity": 3,
                "AI": 3
            },
            "projectNames": [1, 2, 3, 4, 5, 6, 7],
            "projectDes": [1, 2, 3, 4, 5, 6, 7],
            "name": "",
            "members": "a"
        };
        const token = 'validtoken';
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        const res = await request(app)
            .patch(`/group/${groupId}/preferences`)
            .send({ preferences })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('team name cannot be empty.');
    });
    it('should return 400 if project members are empty', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const preferences = {
            "name": "sb",
            "members": "",
            "comments": "adada",
            "skills": {
                "Programming": 3,
                "frontend": 3,
                "database": 3,
                "cybersecurity": 3,
                "AI": 3
            },
            "projectNames": [1, 2, 3, 4, 5, 6, 7],
            "projectDes": [1, 2, 3, 4, 5, 6, 7],
        };
        const token = 'validtoken';
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        const res = await request(app)
            .patch(`/group/${groupId}/preferences`)
            .send({ preferences })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Project members cannot be empty.');
    });

    it('should return 400 if project names are missing', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const preferences = {
            "name": "sb",
            "members": "aaa",
            "comments": "adada",
            "skills": {
                "Programming": 3,
                "frontend": 3,
                "database": 3,
                "cybersecurity": 3,
                "AI": 3
            },
            "projectNames": [1, 2, 3, 4],
            "projectDes": [1, 2, 3, 4, 5, 6, 7],
        };
        const token = 'validtoken';
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        const res = await request(app)
            .patch(`/group/${groupId}/preferences`)
            .send({ preferences })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Project names missing.');
    });
    it('should return 400 if project descriptions are missing', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const preferences = {
            "name": "sb",
            "members": "aaa",
            "comments": "adada",
            "skills": {
                "Programming": 3,
                "frontend": 3,
                "database": 3,
                "cybersecurity": 3,
                "AI": 3
            },
            "projectNames": [1, 2, 3, 4, 5, 6, 7],
            "projectDes": [1, 2],
        };
        const token = 'validtoken';
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        const res = await request(app)
            .patch(`/group/${groupId}/preferences`)
            .send({ preferences })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Project descriptions missing.');
    });

    it('should return 400 if any skill value is undefined or null', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const preferences = {
            "name": "sb",
            "members": "aaa",
            "comments": "adada",
            "skills": {
                "Programming": 3,
                "frontend": null,
                "database": 3,
                "cybersecurity": 3,
                "AI": 3
            },
            "projectNames": [1, 2, 3, 4, 5, 6, 7],
            "projectDes": [1, 2, 3, 4, 5, 6, 7],
        };
        const token = 'validtoken';
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        const res = await request(app)
            .patch(`/group/${groupId}/preferences`)
            .send({ preferences })
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('all blank should be filled');
    });


    it('should update preferences and notify group members', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const completePreferences = {
            "comments": "adada",
            "skills": {
                "Programming": 3,
                "frontend": 3,
                "database": 3,
                "cybersecurity": 3,
                "AI": 3
            },
            "projectNames": [1, 2, 3, 4, 5, 6, 7],
            "projectDes": [1, 2, 3, 4, 5, 6, 7],
            "name": "groupa",
            "members": "a"
        };
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        const mockGroup = {
            _id: groupId,
            save: jest.fn(),
            name: "groupa",
            leader: studentId.toString(),
            members: [studentId.toString()]  // 确保是数组
        };
        Group.findById = jest.fn().mockResolvedValue(mockGroup);
        Group.findByIdAndUpdate = jest.fn().mockResolvedValue(mockGroup);
        Notification.sendNotification = jest.fn().mockResolvedValue({});
        const res = await request(app)
            .patch(`/group/${groupId}/preferences`)
            .send({ preferences: completePreferences })
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        // expect(Notification.sendNotification).toHaveBeenCalled();
        // expect(res.body).toEqual(expect.any(Object)); } catch (e) { }
    });

    it('should return 400 if there is a database error', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const token = 'validtoken';
        const studentId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: studentId });
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        Group.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .patch(`/group/${groupId}/preferences`)
            .send({ preferences: { name: "Team B" } })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
    });
});

describe('PATCH /group/:groupId/assignGroupToProject', () => {
    it('should return 404 if the project is not found', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const projectId = new mongoose.Types.ObjectId();
        Project.findById = jest.fn().mockResolvedValue(null);
        const token = 'validtoken';
        const res = await request(app)
            .patch(`/group/${groupId}/assignGroupToProject`)
            .send({ projectId })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Project not found');
    });

    it('should return 404 if the group is not found', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const projectId = new mongoose.Types.ObjectId();
        Project.findById = jest.fn().mockResolvedValue({}); // Mock finding the project successfully
        Group.findById = jest.fn().mockResolvedValue(null);
        const token = 'validtoken';

        const res = await request(app)
            .patch(`/group/${groupId}/assignGroupToProject`)
            .send({ projectId })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Group not found');
    });

    it('should assign the group to the project successfully and notify relevant members', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const projectId = new mongoose.Types.ObjectId();
        const group = {
            _id: groupId,
            name: 'Group A',
            members: [new mongoose.Types.ObjectId()],
            save: jest.fn()
        };
        const project = {
            _id: projectId,
            number: '001',
            title: 'Project X',
            groups: [],
            creator: new mongoose.Types.ObjectId(),
            supervisor: new mongoose.Types.ObjectId(),
            save: jest.fn()
        };
        Project.findById = jest.fn().mockResolvedValue(project);
        Group.findById = jest.fn().mockResolvedValue(group);
        Notification.sendNotification = jest.fn().mockResolvedValue({});
        const token = 'validtoken';
        const res = await request(app)
            .patch(`/group/${groupId}/assignGroupToProject`)
            .send({ projectId })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Group assigned to project successfully');
        expect(project.groups).toContain(groupId.toString());
        expect(group.project_id.toString()).toBe(projectId.toString());
        expect(Notification.sendNotification).toHaveBeenCalled();
    });

    it('should return 400 if there is a database error during the assignment', async () => {
        const groupId = new mongoose.Types.ObjectId();
        const projectId = new mongoose.Types.ObjectId();
        Project.findById = jest.fn().mockRejectedValue(new Error('Database error'));
        const token = 'validtoken';
        const res = await request(app)
            .patch(`/group/${groupId}/assignGroupToProject`)
            .send({ projectId })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});
