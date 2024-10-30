const User = require('../models/userModel');
const Tutor = require('../models/tutorModel');

// 获取所有未批准的 Tutors
const getPendingTutors = async (req, res) => {
    try {
        const pendingTutors = await User.find({
            role_type: 'tutor',
            status: false
        });
        res.status(200).json(pendingTutors);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 批准 Tutor
const approveTutor = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Tutor not found' });
        }
        
        // 确认该用户是 Tutor
        if (user.role_type !== 'tutor') {
            return res.status(400).json({ message: 'Specified user is not a tutor' });
        }

        // 更新用户状态为批准
        user.status = true;
        await user.save();

        // 迁移信息到Tutor表
        const newTutor = new Tutor({
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName // 假设用户模型中包含了名字
        });
        await newTutor.save();

        res.status(200).json({ message: 'Tutor approved and data migrated', tutorData: newTutor });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
// 删除未批准的 Tutor
const deleteTutor = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        // 确认该用户是 Tutor
        if (user.role_type !== 'tutor') {
            return res.status(400).json({ message: 'Specified user is not a tutor' });
        }

        // 删除相关的 Tutor 记录，如果已经迁移到 Tutor 表
        await Tutor.findByIdAndDelete(id);

        // 删除 User 表中的用户记录
        await User.findByIdAndDelete(id);

        res.status(200).json({ message: 'Tutor successfully deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getPendingTutors,
    approveTutor,
    deleteTutor
}
