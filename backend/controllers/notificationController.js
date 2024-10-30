const Notification = require('../models/notificationModel');
const User = require('../models/userModel')
const mongoose = require('mongoose');
const getNotifications = async (req, res) => {
    try {
        const {userId} = req.params; 
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid User ID' });
        }
        const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

const markRead = async (req,res) => {
    try{
        const {userId} = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid User ID' });
        }
        await Notification.updateMany(
            { recipient: userId, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

module.exports = {
    getNotifications,
    markRead
};
