const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel"); // 确保引入了用户模型

// // 创建消息
// const createMessage = async (chatId, senderId, content) => {
//   try {
//     const newMessage = new Message({
//       chat: chatId,
//       sender: senderId,
//       content,
//     });

//     await newMessage.save();

//     // 将消息添加到聊天中
//     await Chat.findByIdAndUpdate(chatId, {
//       $push: { messages: newMessage._id },
//     });

//     return newMessage; // 返回新创建的消息对象
//   } catch (err) {
//     throw new Error(err.message); // 抛出错误，由调用者处理
//   }
// };

const createMessage = async (chatId, senderId, content) => {
  try {
    const newMessage = new Message({
      chat: chatId,
      sender: senderId,
      content,
    });

    await newMessage.save();

    // 将消息添加到聊天中
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: newMessage._id },
    });

    // 增加一个步骤以获取完整的发送者信息
    const sender = await User.findById(senderId);

    // 将新创建的消息对象与发送者信息组合
    return { ...newMessage.toObject(), sender };
  } catch (err) {
    throw new Error(err.message);
  }
};

// 获取特定聊天的所有消息
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId }).populate("sender");

    res.status(200).json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createMessage,
  getMessages,
};
