const express = require('express');
const { createChat,
    getUserChats,
    inviteMembersToChat,
    leaveChat,
    getUsersNotInChat,
    getChatById,
    dismissChat } = require('../controllers/chatController');

const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.use(requireAuth);

router.post('/create', createChat);
router.get('/get-chats', getUserChats);
router.post('/invite-members', inviteMembersToChat);
router.post('/leave-chat', leaveChat);
router.delete('/dismiss-chat', dismissChat);
router.get('/:chatId/excluded-users', getUsersNotInChat);
router.get('/:chatId', getChatById);

module.exports = router;
