const express = require('express');
const { getPendingTutors, approveTutor, deleteTutor } = require('../controllers/coordinatorController');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.use(requireAuth);

// 路由来获取所有未批准的 Tutors
router.get('/pendingTutors', getPendingTutors);

// 路由来批准 Tutor
router.put('/approveTutor/:id', approveTutor);
router.delete('/deleteTutor/:id', deleteTutor);

module.exports = router;
