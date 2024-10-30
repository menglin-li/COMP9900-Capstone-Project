const express = require('express');
const {
    getClients
} = require('../controllers/clientController');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.use(requireAuth);
router.get('/', getClients)

module.exports = router;