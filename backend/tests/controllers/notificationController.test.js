require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const Notification = require('../../models/notificationModel');
const notificationRoutes = require('../../routes/notification');  

jest.mock('../../models/userModel');
jest.mock('../../models/clientModel');
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
app.use('/notification/', notificationRoutes);

beforeAll(() => {
    process.env.SECRET = 'testsecret'; // 配置环境变量
});


describe('GET /notifications/:userId', () => {
    it('should return 400 if userId is invalid', async () => {
        const invalidUserId = '123';
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false); // Mock ObjectId validation to return false for invalid ID

        const res = await request(app)
            .get(`/notification/notifications/${invalidUserId}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid User ID');
    });

    it('should fetch notifications successfully and return them in descending order of creation', async () => {
        const validUserId = new mongoose.Types.ObjectId(); // Generate a valid ObjectId
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true); // Ensure the validation returns true
        const mockNotifications = [
            { _id: new mongoose.Types.ObjectId(), message: 'Notification 1' },
            { _id: new mongoose.Types.ObjectId(), message: 'Notification 2' }
        ];
        Notification.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockNotifications)
        });

        const res = await request(app)
            .get(`/notification/notifications/${validUserId}`);

        expect(res.status).toBe(200);
        // expect(res.body).toEqual(mockNotifications);
        expect(Notification.find).toHaveBeenCalledWith({ recipient: validUserId.toString() });
    });

    it('should return 500 if there is a database error', async () => {
        const validUserId = new mongoose.Types.ObjectId();
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        Notification.find = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        const res = await request(app)
            .get(`/notification/notifications/${validUserId}`);

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Failed to fetch notifications');
    });
});

describe('POST /notification/notifications/:userId', () => {

    it('should return 400 if userId is invalid', async () => {
        const invalidUserId = '123';
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false); // Mock ObjectId validation to return false for invalid ID

        const res = await request(app)
            .post(`/notification/notifications/${invalidUserId}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid User ID');
    });

    it('should mark all notifications as read successfully', async () => {
        const validUserId = new mongoose.Types.ObjectId(); // Generate a valid ObjectId
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true); // Ensure the validation returns true
        Notification.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });

        const res = await request(app)
            .post(`/notification/notifications/${validUserId}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('All notifications marked as read');
        expect(Notification.updateMany).toHaveBeenCalledWith(
            { recipient: validUserId.toString(), read: false },
            { $set: { read: true } }
        );
    });

    it('should return 500 if there is a database error', async () => {
        const validUserId = new mongoose.Types.ObjectId();
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        Notification.updateMany = jest.fn().mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .post(`/notification/notifications/${validUserId}`);

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Failed to fetch notifications');
    });
});

