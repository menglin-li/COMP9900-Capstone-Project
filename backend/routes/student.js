const express = require('express');
const { updateStudent,
        getStudents,
        getStudentById
 } = require('../controllers/studentController');
 const requireAuth = require('../middleware/requireAuth');
 const router = express.Router();
 
router.use(requireAuth);
router.get('/', getStudents)
router.patch('/:id', updateStudent);
router.get('/:id', getStudentById);
module.exports = router;