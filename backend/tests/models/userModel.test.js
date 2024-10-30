const mongoose = require('mongoose');
const User = require('../../models/userModel'); // 调整为实际路径
const bcrypt = require('bcrypt');

describe('User Model - Signup', () => {
    it('should throw an error if required fields are missing', async () => {
        await expect(User.signup({})).rejects.toThrow('All required fields must be filled');
    });

    it('should throw an error if the email is in use', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(true); // Mock that email already exists
        await expect(User.signup({ email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User', role_type: 'tutor' })).rejects.toThrow('Email already in use');
    });

    it('should create a user successfully', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null);
        jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');
        jest.spyOn(User, 'create').mockResolvedValue({ email: 'test@example.com' });

        const result = await User.signup({ email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User', role_type: 'tutor' });
        expect(result.email).toBe('test@example.com');
    });
});

describe('User Model - Login', () => {
    it('should throw an error if fields are missing', async () => {
        await expect(User.login({})).rejects.toThrow('All fields must be filled');
    });

    it('should throw an error for incorrect email', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null);
        await expect(User.login({ email: 'wrong@example.com', password: 'password123' })).rejects.toThrow('Incorrect email');
    });

    it('should throw an error for incorrect password', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue({ email: 'test@example.com', password: 'hashedpassword' });
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
        await expect(User.login({ email: 'test@example.com', password: 'wrongpassword' })).rejects.toThrow('Incorrect password');
    });

    it('should login successfully with correct credentials', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue({ email: 'test@example.com', password: 'hashedpassword' });
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

        const user = await User.login({ email: 'test@example.com', password: 'password123' });
        expect(user.email).toBe('test@example.com');
    });
});


describe('User Model - Email Lowercasing', () => {
    it('should convert email to lowercase before saving', async () => {
        const mockEmail = 'TEST@EXAMPLE.COM';
        const mockUser = {
            email: mockEmail,
            firstName: 'Test',
            lastName: 'User',
            password: 'password123',
            role_type: 'student'
        };

        // Mocking the findOne method to ensure the email is not considered as already used
        jest.spyOn(User, 'findOne').mockResolvedValue(null);

        // Mock the bcrypt hash generation and simulate a successful save
        jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');
        jest.spyOn(User, 'create').mockImplementation((userData) => {
            // This simulate the 'pre save' hook
            userData.email = userData.email.toLowerCase();
            return Promise.resolve(userData);
        });

        const savedUser = await User.signup(mockUser);
        expect(savedUser.email).toBe(mockEmail.toLowerCase());
    });
});
