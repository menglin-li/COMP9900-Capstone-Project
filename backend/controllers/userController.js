const User = require('../models/userModel')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Student = require('../models/studentModel')
const multer = require('multer');
const processImage = require('../utils/processImage');
const Notification = require('../models/notificationModel');
const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '2h' })
}

const getUsers = async (req,res)=>{
    try{
        const users = await User.find({}).sort({createdAt:-1})
        res.status(200).json(users)
    }catch(err){
        res.status(400).json({error:err.message})
    }
};


const createUser = async (req, res) => {
    const { email, firstName, lastName, password, role_type } = req.body;
    try {
        const user = await User.signup({ email, firstName, lastName, password, role_type });
        const token = createToken(user._id);
        if (role_type === 'student') {
            const newStudent = new Student({ _id: user._id, email, firstName, lastName });
            await newStudent.save();
        }

        res.status(200).json({token,user});


    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
const deleteUser = async (req, res) => {
    const { id } = req.params;  // 获取用户ID
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        const deletedUser = await User.findByIdAndDelete(id, { session });
        if (!deletedUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'User not found' });
        }

        // 检查用户角色并删除对应的学生信息，因为用户ID和学生ID是相同的
        if (deletedUser.role_type === 'student') {
            const deletedStudent = await Student.findByIdAndDelete(id, { session });
            if (!deletedStudent) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ error: 'Student not found' });
            }
        }

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: 'User and all related data deleted successfully' });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: err.message });
    }
};


// 上传头像
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 限制为50MB
}).single('avatar');

const updateUser = async (req, res) => {
    upload(req, res, async (err) => {
        // if (err) {
        //     return res.status(500).json({ message: 'Error uploading file', error: err });
        // }
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'User not found' });
        }

        try {
            let updateData = { ...req.body };
            if (req.file) {
                const avatar = await processImage(req.file.buffer);
                updateData.avatar = avatar; // Only include avatar in the update if there's a file uploaded
            }

            const updatedUser = await User.findByIdAndUpdate(
                id,
                updateData,
                { new: true } // Return the updated document
            );

            // if (!updatedUser) {
            //     return res.status(404).json({ message: 'User not found' });
            // }

            res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
};
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login({ email, password });
        const token = createToken(user._id);
        res.status(200).json({ token, user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role_type: user.role_type, status: user.status } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    loginUser
}