require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const Tutor = require('../../models/tutorModel');
const tutorRoutes = require('../../routes/tutor');  
const requireAuth = require('../../middleware/requireAuth'); // 确保路径正确

jest.mock('../../models/userModel');
jest.mock('../../models/tutorModel');
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
app.use('/tutor/', tutorRoutes);

beforeAll(() => {
    process.env.SECRET = 'testsecret'; // 配置环境变量
});


describe('GET /tutor', () => {
    it('should return all tutors sorted by createdAt in descending order', async () => {
        const userId1 = '123';
        const userId2 = '1234';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: userId1 });
        jwt.verify.mockReturnValue({ _id: userId2 });
        // const date1 = new Date('2024-01-02');
        const mockTutors = [
            { _id: userId1, firstName: 'Tutor One'  },
            { _id: userId2, firstName: 'Tutor Two' }
        ];
        Tutor.find = jest.fn().mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue(mockTutors)
        }));
        const res = await request(app).get('/tutor').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockTutors);
        expect(Tutor.find).toHaveBeenCalled();
    });

    it('should return 400 if there is a database error', async () => {
        const userId = '123';
        const token = 'validtoken';
        jwt.verify.mockReturnValue({ _id: userId });
        Tutor.find = jest.fn().mockImplementation(() => ({
            sort: jest.fn().mockRejectedValue(new Error('Database error'))
        }));
        const res = await request(app).get('/tutor').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Database error');
    });
});
