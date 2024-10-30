require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const User = require('../../models/userModel');
const Student = require('../../models/studentModel');
const userRoutes = require('../../routes/user');
const studentRoutes = require('../../routes/student');
const requireAuth = require('../../middleware/requireAuth'); // 确保路径正确

jest.mock('../../models/userModel');
jest.mock('../../models/studentModel');
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
}));

const app = express();
app.use(express.json());
app.use(requireAuth); // 应用中间件
app.use('/student/', studentRoutes);

beforeAll(() => {
    process.env.SECRET = 'testsecret'; // 配置环境变量
});

describe('GET /student', () => {
    it('should return all students when authorized', async () => {
        const userId1 = '123';
        const userId2 = '123';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: userId1 });
        jwt.verify.mockReturnValue({ _id: userId2 });
        const mockStudents = [
            { _id: userId1, firstName: 'John Doe' },
            { _id: userId2, firstName: 'Jane Doe' }
        ];
        Student.find = jest.fn().mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue(mockStudents)
        }));
        const res = await request(app)
            .get('/student')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockStudents);
    });
    it('it should return 400 if database error', async () => {
        const userId = '123';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: userId });
        Student.find = jest.fn().mockImplementation(() => ({
            sort: jest.fn().mockRejectedValue(new Error('Database error'))
        }));
        const res = await request(app).get('/student').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });

});

describe('PATCH /student/:id', () => {
    it('should return 404 if student ID is invalid', async () => {
        const invalidId = '123';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: invalidId });
        
        const res = await request(app)
            .patch(`/student/${invalidId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'student id is not valid' });
    });

    it('should update and return student data when provided valid ID and data', async () => {
        const userId = '667b938324ef2e202c5e9c8e';
        const token = 'validtoken';
        const studentData = { firstName: 'Updated Name' };
        jwt.verify.mockReturnValue({ _id: userId });
        Student.findOneAndUpdate = jest.fn().mockResolvedValue({ _id: userId, ...studentData });

        const res = await request(app)
            .patch(`/student/${userId}`)
            .send(studentData)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ _id: userId, ...studentData });
    });

    it('should return 404 if student not found during update', async () => {
        const userId = '667b938324ef2e202c5e9c8e';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: userId });
        Student.findOneAndUpdate = jest.fn().mockResolvedValue(null);

        const res = await request(app)
            .patch(`/student/${userId}`)
            .send({ firstName: 'Updated Name' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        // expect(res.body).toEqual({ error: 'Student not found' });
    });

    it('should return 400 if there is a database error', async () => {
        const userId = '667b938324ef2e202c5e9c8e';
        const token = 'validtoken';
        const studentData = { firstName: 'Updated Name' };
        jwt.verify.mockReturnValue({ _id: userId });
        Student.findOneAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .patch(`/student/${userId}`)
            .send(studentData)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});

describe('GET /student/:id', () => {
    it('should return 404 if student ID is invalid', async () => {
        const invalidId = '123';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: invalidId });
        
        const res = await request(app)
            .get(`/student/${invalidId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Student not found' });
    });

    it('should return student data when provided a valid ID', async () => {
        const validId = '667b938324ef2e202c5e9c8e';
        const token = 'validtoken';
        const studentData = { _id: validId, name: 'John Doe' };
        jwt.verify.mockReturnValue({ _id: validId });
        Student.findById = jest.fn().mockResolvedValue(studentData);

        const res = await request(app)
            .get(`/student/${validId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(studentData);
    });

    it('should return 200 with no data if student not found', async () => {
        const userId = '667b938324ef2e202c5e9c8e';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: userId });
        Student.findById = jest.fn().mockResolvedValue(null);

        const res = await request(app)
            .get(`/student/${userId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toBe(null);
    });
});


