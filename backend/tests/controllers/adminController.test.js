require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const Admin = require('../../models/adminModel');
const User = require('../../models/userModel');
const Tutor = require('../../models/tutorModel');
const Coordinator = require('../../models/coordinatorModel');
const Notification = require('../../models/notificationModel');
const Client = require('../../models/clientModel');
const Group = require('../../models/groupModel');
const Project = require('../../models/projectModel');
const adminRoutes = require('../../routes/admin');
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
app.use('/admin/', adminRoutes);

beforeAll(() => {
    process.env.SECRET = 'testsecret'; // 配置环境变量
});

describe('GET /pendingUser', () => {
    it('should return all pending users with roles tutor, coordinator, or client', async () => {
        const userId1 = '123';
        const userId2 = '1234';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: userId1 });
        jwt.verify.mockReturnValue({ _id: userId2 });
        const mockPendingUsers = [
            { _id: userId1, firstName: 'User One', role_type: 'tutor', status: false },
            { _id: userId2, firstName: 'User Two', role_type: 'client', status: false }
        ];
        User.find = jest.fn().mockResolvedValue(mockPendingUsers);
        const res = await request(app).get('/admin/pendingUsers/').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockPendingUsers);
        expect(User.find).toHaveBeenCalledWith({
            role_type: { $in: ['tutor', 'coordinator', 'client'] },
            status: false
        });
    });

    it('should return 400 if there is a database error', async () => {
        const userId = '123';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: userId });
        User.find = jest.fn().mockRejectedValue(new Error('Database error'));
        const res = await request(app).get('/admin/pendingUsers/').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('PUT /approveUser/:id', () => {
    it('should return 404 if user not found', async () => {
        const nonExistentId = '123';
        User.findById = jest.fn().mockResolvedValue(null);
        const token = 'validtoken';
        const res = await request(app)
            .put(`/admin/approveUser/${nonExistentId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'User not found' });
    });

    it('should approve the user and migrate tutor data', async () => {
        const tutorId = '123';
        const token = 'validtoken';
        const mockUser = { _id: tutorId, email: 'tutor@example.com', firstName: 'John', lastName: 'Doe', role_type: 'tutor', status: false, save: jest.fn() };
        User.findById = jest.fn().mockResolvedValue(mockUser);
        Tutor.prototype.save = jest.fn();

        const res = await request(app).put(`/admin/approveUser/${tutorId}`).set('Authorization', `Bearer ${token}`);

        const expectedUserData = {
            _id: tutorId,
            email: 'tutor@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role_type: 'tutor',
            status: true
        };
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'User approved and data migrated', userData: expectedUserData });
        expect(mockUser.status).toBe(true);
        expect(mockUser.save).toHaveBeenCalled();
        expect(Tutor.prototype.save).toHaveBeenCalled();
    });

    it('should approve the user and migrate coordinator data', async () => {
        const coordinatorId = '123';
        const token = 'validtoken';
        const mockUser = { _id: coordinatorId, email: 'coordinator@example.com', firstName: 'John', lastName: 'Doe', role_type: 'coordinator', status: false, save: jest.fn() };
        User.findById = jest.fn().mockResolvedValue(mockUser);
        Coordinator.prototype.save = jest.fn();

        const res = await request(app).put(`/admin/approveUser/${coordinatorId}`).set('Authorization', `Bearer ${token}`);

        const expectedUserData = {
            _id: coordinatorId,
            email: 'coordinator@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role_type: 'coordinator',
            status: true
        };
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'User approved and data migrated', userData: expectedUserData });
        expect(mockUser.status).toBe(true);
        expect(mockUser.save).toHaveBeenCalled();
        expect(Coordinator.prototype.save).toHaveBeenCalled();

    });

    it('should approve the user and migrate client data', async () => {
        const clientId = '123';
        const token = 'validtoken';
        const mockUser = { _id: clientId, email: 'client@example.com', firstName: 'John', lastName: 'Doe', role_type: 'client', status: false, save: jest.fn() };
        User.findById = jest.fn().mockResolvedValue(mockUser);
        Client.prototype.save = jest.fn();

        const res = await request(app).put(`/admin/approveUser/${clientId}`).set('Authorization', `Bearer ${token}`);

        const expectedUserData = {
            _id: clientId,
            email: 'client@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role_type: 'client',
            status: true
        };
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'User approved and data migrated', userData: expectedUserData });
        expect(mockUser.status).toBe(true);
        expect(mockUser.save).toHaveBeenCalled();
        expect(Client.prototype.save).toHaveBeenCalled();
    });

    it('should return 400 if there is a database error during approval', async () => {
        const userId = 'user123';
        const token = 'validtoken';
        User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .put(`/admin/approveUser/${userId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('DELETE /deleteUser/:id', () => {
    it('should return 404 if user not found', async () => {
        const nonExistentId = '123';
        const token = 'validtoken';
        User.findById = jest.fn().mockResolvedValue(null);

        const res = await request(app)
            .delete(`/admin/deleteUser/${nonExistentId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'User not found' });
    });

    it('should delete tutor and user record', async () => {
        const tutorId = 'tutor123';
        const token = 'validtoken';
        const mockUser = { _id: tutorId, role_type: 'tutor' };
        User.findById = jest.fn().mockResolvedValue(mockUser);
        Tutor.findByIdAndDelete = jest.fn().mockResolvedValue({});
        User.findByIdAndDelete = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .delete(`/admin/deleteUser/${tutorId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'User successfully deleted' });
        expect(Tutor.findByIdAndDelete).toHaveBeenCalledWith(tutorId);
        expect(User.findByIdAndDelete).toHaveBeenCalledWith(tutorId);
    });

    it('should delete coordinator and user record', async () => {
        const coordinatorId = 'coordinator123';
        const token = 'validtoken';
        const mockUser = { _id: coordinatorId, role_type: 'coordinator' };
        User.findById = jest.fn().mockResolvedValue(mockUser);
        Coordinator.findByIdAndDelete = jest.fn().mockResolvedValue({});
        User.findByIdAndDelete = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .delete(`/admin/deleteUser/${coordinatorId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'User successfully deleted' });
        expect(Coordinator.findByIdAndDelete).toHaveBeenCalledWith(coordinatorId);
        expect(User.findByIdAndDelete).toHaveBeenCalledWith(coordinatorId);
    });

    it('should delete client and user record', async () => {
        const clientId = 'client123';
        const token = 'validtoken';
        const mockUser = { _id: clientId, role_type: 'client' };
        User.findById = jest.fn().mockResolvedValue(mockUser);
        Client.findByIdAndDelete = jest.fn().mockResolvedValue({});
        User.findByIdAndDelete = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .delete(`/admin/deleteUser/${clientId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'User successfully deleted' });
        expect(Client.findByIdAndDelete).toHaveBeenCalledWith(clientId);
        expect(User.findByIdAndDelete).toHaveBeenCalledWith(clientId);
    });

    it('should return 400 if there is a database error', async () => {
        const userId = 'user123';
        const token = 'validtoken';
        User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .delete(`/admin/deleteUser/${userId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('PATCH /admin/signSupervisor', () => {
    it('should return 404 if user or project not found', async () => {
        const id = 'user123';
        const projectId = 'proj123';
        const token = 'validtoken';
        User.findById = jest.fn().mockResolvedValue(null);  // 模拟未找到用户
        Project.findById = jest.fn().mockResolvedValue(null);  // 模拟未找到项目

        const res = await request(app)
            .patch('/admin/signSupervisor')
            .send({ id, projectId }).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'User or Project not found' });
    });

    it('should assign a supervisor and send notification', async () => {
        const id = 'user123';
        const projectId = 'proj123';
        const token = 'validtoken';
        const mockUser = { _id: id, firstName: 'John', lastName: 'Doe' };
        const mockProject = {
            _id: projectId,
            number: '001',
            title: 'AI Project',
            supervisor: '',
            save: jest.fn() // 模拟保存方法
        };
        User.findById = jest.fn().mockResolvedValue(mockUser);
        Project.findById = jest.fn().mockResolvedValue(mockProject);
        Notification.sendNotification = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .patch('/admin/signSupervisor')
            .send({ id, projectId }).set('Authorization', `Bearer ${token}`);

        // 创建一个没有 'save' 方法的对象用于比较
        const expectedProject = {
            _id: projectId,
            number: '001',
            title: 'AI Project',
            supervisor: id  // 确认 supervisor 已被正确分配
        };

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Supervisor assigned successfully', project: expectedProject });
        expect(mockProject.supervisor).toBe(id);
        expect(Notification.sendNotification).toHaveBeenCalled();
    });


    it('should return 400 if there is a database error', async () => {
        const id = 'user123';
        const projectId = 'proj123';
        const token = 'validtoken';
        User.findById = jest.fn().mockRejectedValue(new Error('Database error'));  // 模拟数据库错误

        const res = await request(app)
            .patch('/admin/signSupervisor')
            .send({ id, projectId }).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('PUT /admin/approveProject/:id', () => {
    it('should return 404 if user not found', async () => {
        const nonExistentId = '123';
        Project.findById = jest.fn().mockResolvedValue(null);
        const token = 'validtoken';
        const res = await request(app)
            .put(`/admin/approveProject/${nonExistentId}`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Project not found' });
    });

    it('should approve the project and send a notification', async () => {
        const projectId = 'proj123';
        const mockProject = {
            _id: projectId,
            number: '001',
            title: 'AI Project',
            creator: 'user123',
            status: 'false',
            save: jest.fn()  // 模拟保存方法
        };
        const token = 'validtoken';
        Project.findById = jest.fn().mockResolvedValue(mockProject);
        Notification.sendNotification = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .put(`/admin/approveProject/${projectId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Project approved successful' });
        expect(mockProject.status).toBe('true');
        expect(Notification.sendNotification).toHaveBeenCalledWith(
            'project Approved',
            'project Approved',
            `your project P${mockProject.number} ${mockProject.title} has been approved by the admin!`,
            [mockProject.creator]
        );
    });

    it('should return 400 if there is a database error', async () => {
        const projectId = 'proj123';
        const token = 'validtoken';
        Project.findById = jest.fn().mockRejectedValue(new Error('Database error'));  // 模拟数据库错误

        const res = await request(app)
            .put(`/admin/approveProject/${projectId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('PUT /admin/dismissProject/:id', () => {
    it('should return 404 if project not found', async () => {
        const projectId = 'proj123';
        const token = 'validtoken';
        Project.findById = jest.fn().mockResolvedValue(null);  // 模拟未找到项目

        const res = await request(app)
            .put(`/admin/dismissProject/${projectId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Project not found' });  // 注意：错误消息应为 'Project not found'
    });

    it('should dismiss the project and send a notification', async () => {
        const projectId = 'proj123';
        const token = 'validtoken';
        const mockProject = {
            _id: projectId,
            title: 'Advanced AI',
            creator: 'user123',
            status: 'approved',
            save: jest.fn()  // 模拟保存方法
        };
        Project.findById = jest.fn().mockResolvedValue(mockProject);
        Notification.sendNotification = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .put(`/admin/dismissProject/${projectId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Project dismiss successful' });
        expect(mockProject.status).toBe('pending');
        expect(Notification.sendNotification).toHaveBeenCalledWith(
            'project create declined',
            'project needs ajust',
            `your project ${mockProject.title} need ajustment to be pubished publicly`,
            [mockProject.creator]
        );
    });

    it('should return 400 if there is a database error', async () => {
        const projectId = 'proj123';
        const token = 'validtoken';
        Project.findById = jest.fn().mockRejectedValue(new Error('Database error'));  // 模拟数据库错误

        const res = await request(app)
            .put(`/admin/dismissProject/${projectId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('GET /admin/reports/project-allocation', () => {
    // 定义变量在describe块的顶部，确保它们在整个describe块中可用
    const mockUnallocatedGroups = [
        { leader: 'John Doe', members: ['Jane Doe', 'Mike Ross'] }
    ];
    const mockTagsProjectCount = [
        { _id: 'Machine Learning', count: 3 }
    ];
    const mockGroupsPerProject = [
        { title: 'AI Development', numberOfGroups: 2 }
    ];
    const mockProjectCreationComparison = [
        { _id: 'Client', count: 5 },
        { _id: 'Coordinator', count: 3 }
    ];

    it('should fetch all project allocation related data', async () => {
        const token = 'validtoken';

        // 设置 Mock 返回值
        const mockPopulate = jest.fn().mockReturnThis();
        const mockPopulateFinal = jest.fn().mockResolvedValue(mockUnallocatedGroups);

        Group.find = jest.fn().mockReturnValue({
            populate: mockPopulate
        });
        mockPopulate.mockImplementationOnce(() => ({
            populate: mockPopulateFinal
        }));

        Project.aggregate = jest.fn()
            .mockResolvedValueOnce(mockTagsProjectCount)
            .mockResolvedValueOnce(mockGroupsPerProject)
            .mockResolvedValueOnce(mockProjectCreationComparison);

        const res = await request(app)
            .get('/admin/reports/project-allocation').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            unallocatedGroups: mockUnallocatedGroups,
            tagsProjectCount: mockTagsProjectCount,
            groupsPerProject: mockGroupsPerProject,
            projectCreationComparison: mockProjectCreationComparison
        });
    });

});

describe('GET /admin/reports/student-preferences', () => {
    // Mock data for groups without preferences
    const mockGroupsWithoutPreferences = [
        {
            leader: { firstName: 'John', lastName: 'Doe' },
            members: [
                { firstName: 'Jane', lastName: 'Doe' },
                { firstName: 'Mike', lastName: 'Ross' }
            ]
        }
    ];

    // Simulate the transformation function used in the populate
    const transformFunction = (doc) => doc ? `${doc.firstName} ${doc.lastName}` : '';

    beforeEach(() => {
        // Mock the chained populate calls
        const mockPopulate = jest.fn().mockImplementation(function (options) {
            if (options.path === 'leader' || options.path === 'members') {
                return this; // return the same mock to support further chaining
            }
            return Promise.resolve(mockGroupsWithoutPreferences.map(group => ({
                leader: transformFunction(group.leader),
                members: group.members.map(transformFunction)
            })));
        });

        Group.find = jest.fn().mockReturnValue({
            populate: mockPopulate
        });
    });

    it('should fetch all student preferences related data, applying transformations', async () => {
        const token = 'validtoken';
        const res = await request(app).get('/admin/reports/student-preferences').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Group.find).toHaveBeenCalledWith({ "preferences.projectNames": { $size: 0 } });
    });

});





