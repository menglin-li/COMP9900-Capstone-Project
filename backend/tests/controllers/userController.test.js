require('dotenv').config();
const request = require('supertest');
const multer = require('multer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const User = require('../../models/userModel');
const Student = require('../../models/studentModel');
const userRoutes = require('../../routes/user');

jest.mock('../../models/userModel');
jest.mock('../../models/studentModel');
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'testtoken'),
    verify: jest.fn()
}));
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(() => 'hashedPassword')
}));
// 在你的测试文件顶部
jest.mock('multer', () => {
    const multer = () => ({
        single: jest.fn().mockImplementation(() => jest.fn((req, res, next) => {
            req.file = req.body.file; // 假设测试中文件数据放在 req.body.file
            next();
        }))
    });
    multer.memoryStorage = jest.fn();
    return multer;
});


const mockUpload = multer({
    storage: multer.memoryStorage()
}).single('avatar');
jest.mocked(mockUpload).mockImplementation((req, res, next) => req.body.file ? next(new Error('Mock upload error')) : next());
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

const app = express();
app.use(express.json());
app.use('/user/', userRoutes);

beforeAll(() => {
    process.env.SECRET = 'testsecret'; // 配置环境变量
});

describe('User Controller', () => {
    it('should create a user and return token and user info', async () => {
        User.signup.mockResolvedValue({
            _id: '1',
            email: 'test@ad.unsw.edu.au',
            firstName: 'Test',
            lastName: 'User',
            role_type: 'student',
        });
        const res = await request(app).post('/user/').send({
            email: 'test@ad.unsw.edu.au',
            firstName: 'Test',
            lastName: 'User',
            password: 'password123',
            role_type: 'student'
        });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toEqual({
            _id: '1',
            email: 'test@ad.unsw.edu.au',
            firstName: 'Test',
            lastName: 'User',
            role_type: 'student'
        });
    });

    it('should create a user if the email is not existing', async () => {
        User.signup.mockRejectedValue(new Error('Email not available'));
        const res = await request(app).post('/user/').send({
            email: '',
            firstName: 'Test',});
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email not available');
    });

    it('should login a user successfully and return a token and user info', async () => {
        User.login.mockResolvedValue({
            _id: '1',
            email: 'test@ad.unsw.edu.au',
            firstName: 'Test',
            lastName: 'User',
            role_type: 'student',
            status: true
        });
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app).post('/user/login').send({
            email: 'test@ad.unsw.edu.au',
            password: 'password123'
        });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toEqual({
            id: '1',
            email: 'test@ad.unsw.edu.au',
            firstName: 'Test',
            lastName: 'User',
            role_type: 'student',
            status: true
        });
    });

    it('should return an error if the email does not exist', async () => {
        User.login.mockRejectedValue(new Error('Incorrect email'));

        const res = await request(app).post('/user/login').send({
            email: 'wrong@ad.unsw.edu.au',
            password: 'password123'
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Incorrect email');
    });

    it('should return an error if the password is incorrect', async () => {
        User.login.mockRejectedValue(new Error('Incorrect password'));

        const res = await request(app).post('/user/login').send({
            email: 'test@ad.unsw.edu.au',
            password: 'wrongpassword'
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Incorrect password');
    });

    it('should return an error if required fields are missing', async () => {
        User.login.mockRejectedValue(new Error('All fields must be filled'));

        const res = await request(app).post('/user/login').send({
            email: 'test@ad.unsw.edu.au'
            // missing password
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('All fields must be filled');
    });

    describe('GET /user', () => {
        it('should return all users', async () => {
            User.find = jest.fn(() => ({
                sort: jest.fn().mockResolvedValue([
                    { _id: '1', email: 'test@ad.unsw.edu.au', firstName: 'Test', lastName: 'User' }
                ])
            }));
            const res = await request(app).get('/user');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([{ _id: '1', email: 'test@ad.unsw.edu.au', firstName: 'Test', lastName: 'User' }]);
        });

        it('should return an error if there is a database error', async () => {
            //new Error('Database error')
            User.find = jest.fn().mockImplementation(() => ({
                sort: jest.fn().mockRejectedValue(new Error('Database error'))
            }));
            const res = await request(app).get('/user');
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('GET /user/:id', () => {
        it('should return a user when given a valid ID', async () => {
            const mockUser = { _id: '1', email: 'test@ad.unsw.edu.au', firstName: 'Test', lastName: 'User' };
            User.findById = jest.fn().mockResolvedValue(mockUser);

            const res = await request(app).get('/user/1');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUser);
        });

        it('should return 404 if no user is found', async () => {
            User.findById = jest.fn().mockResolvedValue(null);

            const res = await request(app).get('/user/1');
            expect(res.status).toBe(404);
            expect(res.body.error).toBe('User not found');
        });

        it('should return 400 on a database error', async () => {
            User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/user/1');
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('updateUser', () => {
        it('should update user successfully without a file', async () => {
            const mockUser = { _id: '667b938324ef2e202c5e9c8e', email: 'test@ad.unsw.edu.au', firstName: 'User Updated', lastName: 'User', role_type: 'student', password: '123' };
            User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);
            const res = await request(app)
                .patch('/user/667b938324ef2e202c5e9c8e')
                .send({ firstName: 'User Updated11' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'User updated successfully', user: mockUser });
        });

        // it('should update user successfully with a file', async () => {
        //     const mockUser = { _id: '1', email: 'user@ad.unsw.edu.au', name: 'User Updated', avatar: 'newAvatarPath' };
        //     User.findByIdAndUpdate.mockResolvedValue(mockUser);
        //     processImage.mockResolvedValue('newAvatarPath');

        //     const res = await request(app)
        //         .post('/user/1')
        //         .field('name', 'User Updated')
        //         .attach('avatar', Buffer.from('fake_img_data'), 'avatar.jpg');

        //     expect(res.status).toBe(200);
        //     expect(res.body).toEqual({ message: 'User updated successfully', user: mockUser });
        // });

        it('should return 404 if user id is invalid', async () => {
            const res = await request(app).patch('/user/invalidId').send({ name: 'User Updated' });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('User not found');
        });

        // it('should handle file upload error', async () => {
        //     const res = await request(app)
        //         .post('/user/1')
        //         .field('file', 'This is supposed to fail');

        //     expect(res.status).toBe(500);
        //     expect(res.body).toEqual({ message: 'Error uploading file', error: new Error('Mock upload error').toString() });
        // });

        it('should handle database update errors', async () => {
            User.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .patch('/user//667b938324ef2e202c5e9c8e')
                .send({ name: 'User Updated' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Database error');
        });
    });

    describe('DELETE /user/:id', () => {
        it('should successfully delete a user and associated student data', async () => {
            User.findByIdAndDelete = jest.fn().mockResolvedValue({
                _id: '1',
                role_type: 'student'
            });
            Student.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: '1' });

            const res = await request(app).delete('/user/1');
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('User and all related data deleted successfully');
        });

        it('should return 404 if the user is not found', async () => {
            User.findByIdAndDelete = jest.fn().mockResolvedValue(null);

            const res = await request(app).delete('/user/1');
            expect(res.status).toBe(404);
            expect(res.body.error).toBe('User not found');
        });

        it('should return 404 if the user is a student and the student data is not found', async () => {
            User.findByIdAndDelete = jest.fn().mockResolvedValue({
                _id: '1',
                role_type: 'student'
            });
            Student.findByIdAndDelete = jest.fn().mockResolvedValue(null);

            const res = await request(app).delete('/user/1');
            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Student not found');
        });
    });




});
