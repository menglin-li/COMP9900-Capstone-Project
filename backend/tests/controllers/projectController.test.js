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
const Tutor = require('../../models/tutorModel');
const Client = require('../../models/clientModel');
const Group = require('../../models/groupModel');
const Student = require('../../models/studentModel');
const Project = require('../../models/projectModel');
const projectRoutes = require('../../routes/project');
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
app.use('/project/', projectRoutes);

beforeAll(() => {
    process.env.SECRET = 'testsecret'; // 配置环境变量
});


describe('GET /project', () => {
    it('should retrieve all projects sorted by project number in ascending order', async () => {
        const mockProjects = [
            { _id: new mongoose.Types.ObjectId(), title: 'Project A', number: 2 },
            { _id: new mongoose.Types.ObjectId(), title: 'Project B', number: 1 }
        ];
        Project.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockProjects) // Mock the sort method to return sorted projects
        });
        const token = 'validtoken';
        const userId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: userId });

        const res = await request(app)
            .get('/project')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Project.find).toHaveBeenCalled(); // Ensure Project.find was called
        expect(Project.find().sort).toHaveBeenCalledWith({ number: 1 }); // Check if sorting was called with correct parameter
    });

    it('should return 400 if there is a database error', async () => {
        Project.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error('Database error')) // Mock the sort method to simulate a database error
        });
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });

        const res = await request(app)
            .get('/project')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('GET /project/:projectId', () => {
    it('should return 404 if the project ID is invalid', async () => {
        const invalidId = 'invalid-id';
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false); // Mock ObjectId validation to return false for invalid ID
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });
        const res = await request(app)
            .get(`/project/${invalidId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Project not found');
    });

    it('should return 404 if no project is found with the given id', async () => {
        const validId = new mongoose.Types.ObjectId();
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true); // Mock ObjectId validation to return true
        Project.findById = jest.fn().mockResolvedValue(null); // Mock findById to simulate no project found
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });
        const res = await request(app)
            .get(`/project/${validId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('No such project');
    });

    it('should retrieve the project successfully when a valid ID is provided', async () => {
        const projectId = new mongoose.Types.ObjectId();
        const mockProject = {
            _id: projectId,
            title: 'Project X',
            description: 'Detailed description of Project X'
        };
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        Project.findById = jest.fn().mockResolvedValue(mockProject);

        const res = await request(app)
            .get(`/project/${projectId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            _id: projectId.toString(),
            title: mockProject.title,
            description: mockProject.description
        });
    });


});

describe('GET /project/number/:number', () => {

    it('should return 404 if no project is found with the given number', async () => {
        const projectNumber = '001';
        Project.findOne = jest.fn().mockResolvedValue(null); // 模拟没有找到项目
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });
        const res = await request(app)
            .get(`/project/number/${projectNumber}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('No such project');
    });

    it('should retrieve the project successfully when a valid number is provided', async () => {
        const projectNumber = '001';
        const projectId = new mongoose.Types.ObjectId();
        const mockProject = {
            _id: projectId,
            number: projectNumber,
            title: 'Project X',
            description: 'Detailed description of Project X'
        };
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });
        Project.findOne = jest.fn().mockResolvedValue(mockProject);

        const res = await request(app)
            .get(`/project/number/${projectNumber}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            _id: projectId.toString(),
            number: projectNumber,
            title: mockProject.title,
            description: mockProject.description
        });
    });

});

describe('DELETE /project/:number', () => {

    it('should return 404 if no project is found with the given number', async () => {
        const projectNumber = '001';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });
        Project.findOneAndDelete = jest.fn().mockResolvedValue(null); // 模拟没有找到项目

        const res = await request(app)
            .delete(`/project/${projectNumber}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('No such project');
    });

    it('should delete the project successfully when a valid number is provided', async () => {
        const projectNumber = '001';
        const projectId = new mongoose.Types.ObjectId
        const mockProject = {
            _id: projectId,
            number: projectNumber,
            title: 'Project X'
        };
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });
        Project.findOneAndDelete = jest.fn().mockResolvedValue(mockProject); // 模拟成功删除项目

        const res = await request(app)
            .delete(`/project/${projectNumber}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            _id: projectId.toString(),
            number: projectNumber,
            title: mockProject.title
        });
    });

});

describe('POST /project', () => {

    it('should return 404 if creator is not found', async () => {
        const creatorId = new mongoose.Types.ObjectId();
        User.findById = jest.fn().mockResolvedValue(null);
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });

        const res = await request(app)
            .post('/project')
            .send({
                title: 'New Project',
                creator: creatorId,
                tags: [],
                capacity: 10
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Creator not found');
    });

    it('should return 400 if creator is neither a Client nor a Coordinator', async () => {
        const creatorId = new mongoose.Types.ObjectId();
        User.findById = jest.fn().mockResolvedValue({ role_type: 'student' });
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });
        const res = await request(app)
            .post('/project')
            .send({
                title: 'New Project',
                creator: creatorId,
                tags: [],
                capacity: 10
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Creator must be either a Client or a Coordinator');
    });

    it('should create a project successfully and update the creator\'s project list for coordinator', async () => {
        const creatorId = new mongoose.Types.ObjectId();
        const mockUser = {
            _id: creatorId,
            role_type: 'coordinator'
        };
        const token = 'validtoken';
        projectId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });
        const mockProject = {
            _id: projectId,
            title: 'New Project',
            creator: creatorId,
            onModel: 'Coordinator'
        };
        User.findById = jest.fn().mockResolvedValue(mockUser);
        Project.create = jest.fn().mockResolvedValue(mockProject);
        mongoose.model = jest.fn().mockReturnValue({
            findByIdAndUpdate: jest.fn().mockResolvedValue({})
        });

        const res = await request(app)
            .post('/project')
            .send({
                title: 'New Project',
                creator: creatorId,
                tags: [],
                capacity: 10
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            _id: projectId.toString(),
            title: 'New Project',
            creator: creatorId.toString(),
            onModel: 'Coordinator'
        });
    });
    it('should create a project successfully and update the creator\'s project list for client', async () => {
        const creatorId = new mongoose.Types.ObjectId();
        const mockUser = {
            _id: creatorId,
            role_type: 'client'
        };
        const token = 'validtoken';
        projectId = new mongoose.Types.ObjectId();
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });
        const mockProject = {
            _id: projectId,
            title: 'New Project',
            creator: creatorId,
            onModel: 'Client'
        };
        User.findById = jest.fn().mockResolvedValue(mockUser);
        Project.create = jest.fn().mockResolvedValue(mockProject);
        mongoose.model = jest.fn().mockReturnValue({
            findByIdAndUpdate: jest.fn().mockResolvedValue({})
        });

        const res = await request(app)
            .post('/project')
            .send({
                title: 'New Project',
                creator: creatorId,
                tags: [],
                capacity: 10
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            _id: projectId.toString(),
            title: 'New Project',
            creator: creatorId.toString(),
            onModel: 'Client'
        });
    });

    it('should return 400 if there is a database error', async () => {
        User.findById = jest.fn().mockRejectedValue(new Error('Database error'));
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });
        const res = await request(app)
            .post('/project')
            .send({
                title: 'New Project',
                creator: new mongoose.Types.ObjectId(),
                tags: [],
                capacity: 10
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('PUT /project/:number', () => {
    it('should return 404 if no project is found with the given number', async () => {
        const projectNumber = '001';
        // Mock `findOne` to return an object that includes a `populate` method
        Project.findOne = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)  // Now `populate` returns `null` after being called
        });
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: new mongoose.Types.ObjectId() });

        const res = await request(app)
            .put(`/project/${projectNumber}`)
            .send({ tags: ['new tag'] })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('No such project');
    });

    it('should return 403 if the user is not authorized to update the project', async () => {
        const projectNumber = '001';
        const mockProject = {
            number: projectNumber,
            creator: new mongoose.Types.ObjectId().toString(),
            supervisor: new mongoose.Types.ObjectId().toString(),
            save: jest.fn()
        };
        // 确保在模拟findOne后能正确链式调用populate
        Project.findOne = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockProject)  // 模拟populate返回mockProject
        });
        const userId = new mongoose.Types.ObjectId().toString(); // 既不是创建者也不是监督者
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: userId });

        const res = await request(app)
            .put(`/project/${projectNumber}`)
            .send({ title: 'Updated Project' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Not authorized to update this project');
    });


    // it('should return 403 if a non-creator tries to update fields other than tags', async () => {
    //     const projectNumber = '001';
    //     const creatorId = new mongoose.Types.ObjectId().toString();
    //     const mockProject = {
    //         number: projectNumber,
    //         creator: creatorId,
    //         save: jest.fn(),
    //         populate: jest.fn().mockReturnThis()
    //     };
    //     Project.findOne = jest.fn().mockReturnValue({
    //         populate: jest.fn().mockResolvedValue(mockProject)
    //     });
    //     const nonCreatorId = new mongoose.Types.ObjectId().toString(); // Not the creator
    //     jwt.verify.mockReturnValue({ _id: nonCreatorId });

    //     const updates = { title: 'Updated Project' }; // Trying to update more than just tags
    //     const res = await request(app)
    //         .put(`/project/${projectNumber}`)
    //         .send(updates)
    //         .set('Authorization', `Bearer validtoken`);

    //     expect(res.status).toBe(403);
    //     expect(res.body.message).toBe('Only tags can be updated');
    // });


    // it('should successfully update the project and notify all recipients', async () => {
    //     const projectNumber = '1';
    //     const creatorId = new mongoose.Types.ObjectId();
    //     const supervisorId = new mongoose.Types.ObjectId();
    //     const mockProject = {
    //         number: projectNumber,
    //         creator: creatorId.toString(),
    //         supervisor: supervisorId.toString(),
    //         tags: ['old tag'],
    //         save: jest.fn(),
    //         populate: jest.fn().mockReturnThis()
    //     };
    //     Project.findOne = jest.fn().mockReturnValue({
    //         populate: jest.fn().mockResolvedValue({
    //             number: projectNumber,
    //             creator: creatorId.toString(),
    //             supervisor: supervisorId.toString(),
    //             tags: ['old tag'],
    //             save: jest.fn(),
    //             populate: jest.fn().mockReturnThis()
    //         })
    //     });
    //     const token = 'validtoken';
    //     jwt.verify.mockReturnValue({ _id: creatorId.toString() });

    //     const res = await request(app)
    //     .use(setUserMiddleware)
    //         .put(`/project/${projectNumber}`)
    //         .send({ tags: ['new tag'] })
    //         .set('Authorization', `Bearer ${token}`);
    //     console.log("Project Creator:", mockProject.creator);
    //     console.log("Supervisor:", mockProject.supervisor);
    //     console.log("JWT User ID:", creatorId.toString());
    //     console.log("Response Status:", res.status);
    //     console.log("Response Body:", res.body);
    //     expect(res.status).toBe(200);
    //     expect(mockProject.tags).toContain('new tag');
    // });

    // it('should return 400 if there is a database error', async () => {
    //     const projectNumber = '001';
    //     Project.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

    //     const res = await request(app)
    //         .put(`/project/${projectNumber}`)
    //         .send({ tags: ['new tag'] });

    //     expect(res.status).toBe(400);
    //     expect(res.body.error).toBe('Database error');
    // });
});
