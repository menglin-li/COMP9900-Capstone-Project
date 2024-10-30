const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// 静态方法：发送通知
notificationSchema.statics.sendNotification = async function (type, title, message, recipients) {
    const notifications = recipients.map(recipientId => ({
      type,
      title,
      message,
      recipient: recipientId
    }));

    await this.insertMany(notifications);
    // console.log('Notifications sent successfully');
  
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
