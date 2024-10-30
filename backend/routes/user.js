const express = require('express')
const {
    getUsers,
    updateUser,
    createUser,
    deleteUser,
    getUserById,
    loginUser
} = require('../controllers/userController')

const router = express.Router();

// router.use(requireAuth);

router.post('/', createUser);
router.get('/', getUsers);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/:id', getUserById);
router.post('/login', loginUser);

module.exports = router


