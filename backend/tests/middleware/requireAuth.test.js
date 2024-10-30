require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const express = require('express');

jest.mock('jsonwebtoken');
jest.mock('../../models/userModel', () => ({
  findOne: jest.fn().mockReturnThis(),
  select: jest.fn().mockResolvedValue({ _id: '123' }), // 确保返回值与你的业务逻辑一致
}));

const requireAuth = require('../../middleware/requireAuth');

const app = express();
app.use(requireAuth);
app.get('/', (req, res) => res.status(200).json({ message: 'Success' }));

describe('requireAuth middleware', () => {
  it('should require an authorization token', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authorization token required');
  });

  it('should validate token and call next on success', async () => {
    const userId = '123';
    const token = 'validtoken';
    jwt.verify.mockReturnValue({ _id: userId });

    const res = await request(app)
      .get('/')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.SECRET);
    expect(User.findOne).toHaveBeenCalled();  // 验证是否调用了 findOne
    expect(User.select).toHaveBeenCalledWith('_id');  // 验证是否调用了 select
  });

  it('should return 401 if token is invalid', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const res = await request(app)
      .get('/')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Request is not authorized');
  });
  
});
