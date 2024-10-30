require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const User = require('../../models/userModel');
const Tutor = require('../../models/tutorModel');
const Coordinator = require('../../models/coordinatorModel');
const Notification = require('../../models/notificationModel');
const coordinatorRoutes = require('../../routes/coordinator');

const requireAuth = require('../../middleware/requireAuth'); // 确保路径正确

jest.mock('../../models/userModel');
jest.mock('../../models/tutorModel');
jest.mock('../../models/coordinatorModel');
jest.mock('../../models/notificationModel');
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
app.use('/coordinator/', coordinatorRoutes);

beforeAll(() => {
    process.env.SECRET = 'testsecret'; // 配置环境变量
});

describe('GET /coordinator/pendingTutors', () => {
    it('should return all pending users with roles tutor', async () => {
        const userId1 = '123';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: userId1 });
        const mockPendingUsers = [
            { _id: userId1, firstName: 'User One', role_type: 'tutor', status: false }
        ];
        User.find = jest.fn().mockResolvedValue(mockPendingUsers);
        const res = await request(app).get('/coordinator/pendingTutors').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockPendingUsers);
        expect(User.find).toHaveBeenCalledWith({
            role_type: 'tutor',
            status: false
        });
    });

    it('should return 400 if there is a database error', async () => {
        const userId = '123';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: userId });
        User.find = jest.fn().mockRejectedValue(new Error('Database error'));
        const res = await request(app).get('/coordinator/pendingTutors').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('PUT /coordinator/approveTutor/:id', () => {
    it('should return 404 if user not found', async () => {
        const nonExistentId = '123';
        User.findById = jest.fn().mockResolvedValue(null);
        const token = 'validtoken';
        const res = await request(app)
            .put(`/coordinator/approveTutor/${nonExistentId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Tutor not found' });
    });
    it('should return 400 if the user is not a tutor', async () => {
        const userId = new mongoose.Types.ObjectId();
        const user = { _id: userId, role_type: 'student' };
        const token = 'validtoken';
        User.findById = jest.fn().mockResolvedValue(user);

        const res = await request(app)
            .put(`/coordinator/approveTutor/${userId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Specified user is not a tutor' });
    });

    it('should approve the tutor and migrate data successfully', async () => {
        const tutorId = new mongoose.Types.ObjectId();
        const token = 'validtoken';
        const user = { _id: tutorId, role_type: 'tutor', status: false, email: 'test@example.com', firstName: 'John', lastName: 'Doe', save: jest.fn() };
        User.findById = jest.fn().mockResolvedValue(user);
        Tutor.prototype.save = jest.fn(); // Mock the save method on the Tutor model

        const res = await request(app)
            .put(`/coordinator/approveTutor/${tutorId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Tutor approved and data migrated' });
        expect(user.status).toBe(true);
        expect(Tutor.prototype.save).toHaveBeenCalled();
    });


    it('should return 400 if there is a database error during approval', async () => {
        const userId = 'user123';
        const token = 'validtoken';
        User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .put(`/coordinator/approveTutor/${userId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('DELETE /coordinator/deleteTutor/:id', () => {
    it('should return 404 if no tutor found with the given id', async () => {
        const tutorId = new mongoose.Types.ObjectId();
        User.findById = jest.fn().mockResolvedValue(null);
        const token = 'validtoken';

        const res = await request(app)
            .delete(`/coordinator/deleteTutor/${tutorId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Tutor not found' });
    });

    it('should return 400 if the user is not a tutor', async () => {
        const userId = new mongoose.Types.ObjectId();
        const user = { _id: userId, role_type: 'student' };
        const token = 'validtoken';
        User.findById = jest.fn().mockResolvedValue(user);

        const res = await request(app)
            .delete(`/coordinator/deleteTutor/${userId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: 'Specified user is not a tutor' });
    });

    it('should delete the tutor and user records successfully', async () => {
        const tutorId = new mongoose.Types.ObjectId();
        const token = 'validtoken';
        const user = { _id: tutorId, role_type: 'tutor', status: false };
        User.findById = jest.fn().mockResolvedValue(user);
        Tutor.findByIdAndDelete = jest.fn().mockResolvedValue({});
        User.findByIdAndDelete = jest.fn().mockResolvedValue({});

        const res = await request(app)
            .delete(`/coordinator/deleteTutor/${tutorId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Tutor successfully deleted' });
    });

    it('should return 400 if there is a database error during the deletion process', async () => {
        const tutorId = new mongoose.Types.ObjectId();
        User.findById = jest.fn().mockRejectedValue(new Error('Database error'));
        const token = 'validtoken';
        const res = await request(app)
            .delete(`/coordinator/deleteTutor/${tutorId}`).set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});
