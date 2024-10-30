const express = require('express');
const { getPendingUsers, approveUser, deleteUser, signSupervisor, approveProject 
, dismissProject, fetchProjectAllocation, fetchStudentPreferences

} = require('../controllers/adminController');

const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.use(requireAuth);
// 更新用户角色的路由
router.get('/pendingUsers', getPendingUsers);
router.put('/approveUser/:id', approveUser);
router.delete('/deleteUser/:id', deleteUser);
router.patch('/signSupervisor',signSupervisor );
router.put('/approveProject/:id', approveProject);
router.put('/dismissProject/:id', dismissProject);
router.get('/reports/project-allocation', fetchProjectAllocation);
router.get('/reports/student-preferences', fetchStudentPreferences);
module.exports = router;

