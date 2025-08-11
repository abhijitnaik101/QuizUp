const express = require('express');
const router = express.Router();

const { 
    createQuiz, 
    getMyQuizzes, 
    getQuizById 
} = require('../controllers/quiz');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createQuiz);
router.get('/my-quizzes', protect, getMyQuizzes);
router.get('/:id', protect, getQuizById);

module.exports = router;