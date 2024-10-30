const express = require('express');

const { createMessage,
    getMessages
} = require('../controllers/messageController');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.use(requireAuth);
router.get('/:chatId', getMessages)
router.post('/', createMessage);

module.exports = router;