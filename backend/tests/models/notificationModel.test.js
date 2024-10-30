const mongoose = require('mongoose');
const Notification = require('../../models/notificationModel'); // 修改为正确的导入路径

// jest.mock('mongoose', () => {
//   const originalMongoose = jest.requireActual('mongoose');
//   const mockSchema = originalMongoose.Schema;
//   mockSchema.statics.insertMany = jest.fn();
//   return {
//     ...originalMongoose,
//     model: jest.fn().mockReturnThis(),
//     Schema: mockSchema
//   };
// });

describe('Notification.sendNotification', () => {
  beforeEach(() => {
    // Reset the mock before each test
    Notification.insertMany = jest.fn();
  });

  it('should create notifications for all recipients', async () => {
    const type = 'Info';
    const title = 'New Update';
    const message = 'There is a new update available';
    const recipients = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
    
    Notification.insertMany.mockResolvedValue([]); // Set the mock to resolve with an empty array

    await Notification.sendNotification(type, title, message, recipients);

    expect(Notification.insertMany).toHaveBeenCalledTimes(1);
    expect(Notification.insertMany).toHaveBeenCalledWith(recipients.map(recipientId => ({
      type,
      title,
      message,
      recipient: recipientId
    })));
  });

//   it('should handle errors when sending notifications', async () => {
//     const type = 'Error';
//     const title = 'Failure Notice';
//     const message = 'Failed to process your request';
//     const recipients = [new mongoose.Types.ObjectId()];
    
//     const errorMessage = 'Database error';
//     Notification.insertMany.mockRejectedValue(new Error(errorMessage)); // Set the mock to reject with an error

//     await expect(Notification.sendNotification(type, title, message, recipients))
//       .rejects.toThrow('Failed to process image');

//     // This expects that the function properly throws an error, which you should ensure is part of your function's behavior
//   });
});
