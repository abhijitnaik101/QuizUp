const Quiz = require('../models/quiz');

const createQuiz = async (req, res) => {
    try {
        const { title, questions } = req.body;

        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({ message: 'Title and at least one question are required' });
        }
        
        const createdBy = req.user._id;

        const newQuiz = await Quiz.create({
            title,
            questions,
            createdBy,
        });

        res.status(201).json(newQuiz);
    } catch (error) {
        res.status(400).json({ message: 'Error creating quiz', error: error.message });
    }
};

const getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ createdBy: req.user._id });
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (quiz) {
            if (quiz.createdBy.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to view this quiz' });
            }
            res.status(200).json(quiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createQuiz,
    getMyQuizzes,
    getQuizById
};