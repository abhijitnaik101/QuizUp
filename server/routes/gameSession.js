const express = require('express');
const router = express.Router();

const { createGameSession } = require('../controllers/gameSession');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createGameSession);

module.exports = router;