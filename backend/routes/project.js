const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.use(requireAuth);
const { getProjects, getProjectById, getProjectByNumber,createProject, updateProject, deleteProject } = require('../controllers/projectController');

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/number/:number', getProjectByNumber);
router.post('/', createProject);
router.put('/:number', updateProject);
router.delete('/:number', deleteProject);

module.exports = router;
