const express = require('express');
const {
    createGroup,
    joinGroup,
    // inviteToPrivateGroup,
    removeStudentFromGroup,
    getGroups,
    updateGroup,
    getGroupById,
    submitPreferences,
    assignGroupToProject

} = require('../controllers/groupController');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.use(requireAuth);
router.get('/', getGroups)
router.post('/', createGroup);
router.post('/join', joinGroup);
// router.post('/invite', inviteToPrivateGroup);
router.delete('/:groupId/:studentId', removeStudentFromGroup);
router.patch('/:groupId', updateGroup);
router.get('/:id', getGroupById);
router.patch('/:groupId/preferences', submitPreferences);
router.patch('/:groupId/assignGroupToProject',assignGroupToProject);
module.exports = router;