const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const mongoose = require('mongoose')
// 创建新的聊天会话

const createChat = async (req, res) => {
    const userId = req.user._id.toString(); 
    const { name, visibility } = req.body; 
    let { members } = req.body;
    // 确保members是一个数组，如果未定义或不是数组，则默认为空数组
    if (!Array.isArray(members)) {
        members = [];
    }

    try {
        // 验证名称是否提供
        if (!name) {
            return res.status(400).json({ message: 'Chat name is required' });
        }

        // 创建聊天室
        const newChat = new Chat({
            name,
            visibility,
            creator: userId, // 设置聊天室的创建者为当前用户
            members: [userId, ...members] // 确保创建者也是成员之一
        });

        await newChat.save(); // 保存聊天室到数据库

        // 返回创建成功的消息和聊天室详情
        res.status(201).json({
            message: 'Chat created successfully',
            chat: newChat
        });
    } catch (error) {
        // 处理可能发生的错误
        res.status(500).json({ message: 'Failed to create chat', error: error.message });
    }
};

const getUserChats = async (req, res) => {
    const userId = req.user._id; // 假设用户已通过身份验证，并且用户的ID已经附加到req.user对象

    try {
        // 使用 MongoDB 的查询来获取所有公开聊天室和包含当前用户的私人聊天室
        const chats = await Chat.find({
            $or: [
                { visibility: 'public' }, // 查找所有公开的聊天室
                { members: userId, visibility: 'private' } // 查找当前用户参与的私人聊天室
            ]
        });

        // 返回查询到的聊天室
        res.status(200).json({
            message: 'Chats retrieved successfully',
            chats
        });
    } catch (error) {
        // 处理可能发生的错误
        res.status(500).json({ message: 'Failed to retrieve chats', error: error.message });
    }
};

const inviteMembersToChat = async (req, res) => {
    const userId = req.user._id; // 当前登录用户ID
    const { chatId, newMembers } = req.body; // 从请求体获取聊天室ID和新成员列表

    try {
        // 首先，找到聊天室
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // 检查当前用户是否是聊天室的创建者
        // if (!chat.creator.equals(userId)) {
        //     return res.status(403).json({ message: 'Only the creator can invite members' });
        // }

        // 添加新成员到聊天室的成员列表中，使用 `$addToSet` 防止重复添加同一成员
        await Chat.findByIdAndUpdate(chatId, {
            $addToSet: { members: { $each: newMembers } }
        });

        res.status(200).json({
            message: 'Members added successfully',
            newMembers
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to invite members', error: error.message });
    }
};

const leaveChat = async (req, res) => {
    const userId = req.user._id; // 当前登录用户ID
    const { chatId } = req.body; // 从请求体获取聊天室ID

    try {
        // 首先，找到聊天室
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // 检查当前用户是否是聊天室的创建者
        if (chat.creator.equals(userId)) {
            return res.status(403).json({ message: 'Chat creator cannot leave the chat' });
        }

        // 从聊天室成员列表中移除当前用户
        const updatedChat = await Chat.findByIdAndUpdate(chatId, {
            $pull: { members: userId }
        }, { new: true });

        // 返回成功消息和更新后的聊天室信息
        res.status(200).json({
            message: 'You have left the chat successfully',
            chat: updatedChat
        });
    } catch (error) {
        // 处理可能发生的错误
        res.status(500).json({ message: 'Failed to leave chat', error: error.message });
    }
};

const getUsersNotInChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findById(chatId).populate('members'); // 获取聊天的成员

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const chatMemberIds = chat.members.map(member => member._id);
        const usersNotInChat = await User.find({ 
            _id: { $nin: chatMemberIds },
            status: true //只查找状态为 true 的用户
        });

        res.status(200).json(usersNotInChat);
    } catch (error) {
        console.error('Error fetching users not in chat:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /chats/:chatId
// 只有creator可以解散
// 对应的message也要删掉
const dismissChat = async (req, res) => {
    const userId = req.user._id; // 当前登录用户ID
    const { chatId } = req.body; // 从请求体获取聊天室ID

    try {
        // 首先，找到聊天室
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // 检查当前用户是否是聊天室的创建者
        if (!chat.creator.equals(userId)) {
            return res.status(403).json({ message: 'Only the creator can dismiss the chat' });
        }

        // 删除所有相关的消息
        await Message.deleteMany({ chat: chatId });

        // 删除聊天室
        await Chat.findByIdAndDelete(chatId);

        // 返回成功消息
        res.status(200).json({
            message: 'Chat dismissed successfully'
        });
    } catch (error) {
        // 处理可能发生的错误
        res.status(500).json({ message: 'Failed to dismiss chat', error: error.message });
    }
};

const getChatById = async (req, res)=>{
    const { chatId } = req.params
    if (!mongoose.Types.ObjectId.isValid(chatId)){
        return res.status(404).json({message:'Chat not found'})
    }
    const chat = await Chat.findById(chatId);
    res.status(200).json(chat);
}

module.exports = {
    createChat,
    getUserChats,
    inviteMembersToChat,
    leaveChat,
    dismissChat,
    getUsersNotInChat,
    getChatById
};
