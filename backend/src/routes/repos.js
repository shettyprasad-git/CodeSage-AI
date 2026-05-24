const express = require('express');
const router = express.Router();
const { importRepository, getRepositories } = require('../controllers/repoController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/import', importRepository);
router.get('/', getRepositories);

module.exports = router;
