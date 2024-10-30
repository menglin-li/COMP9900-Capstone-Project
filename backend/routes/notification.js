const express = require('express');
const router = express.Router();

const { getNotifications,markRead } = require('../controllers/notificationController');

router.get('/notifications/:userId', getNotifications);
router.post('/notifications/:userId', markRead);
module.exports = router;