const express = require('express')
const {
    getTutors
} = require('../controllers/tutorController')

const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.use(requireAuth);

router.get('/', getTutors);
// router.patch('/:id', updateTutor);
// router.get('/:id', getTutorById);

module.exports = router


