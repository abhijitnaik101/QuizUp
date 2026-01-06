const GameSession = require('../models/GameSession');
const Quiz = require('../models/Quiz'); 
const generateUniqueGameCode = async () => {
    let gameCode;
    let isUnique = false;
    while (!isUnique) {
        gameCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existingGame = await GameSession.findOne({ gameCode });
        if (!existingGame) {
            isUnique = true;
        }
    }
    return gameCode;
};

const createGameSession = async (req, res) => {
    try {
        const { quizId } = req.body;
        const hostUserId = req.user.id; 

        if (!quizId) {
            return res.status(400).json({ message: 'Quiz ID is required.' });
        }
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz || quiz.createdBy.toString() !== hostUserId) {
            return res.status(403).json({ message: 'Not authorized to host this quiz.' });
        }

        const newGameCode = await generateUniqueGameCode();
        
        const newGame = new GameSession({
            gameCode: newGameCode,
            quiz: quizId,
            hostId: hostUserId,
            players: [], 
        });
        
        await newGame.save();

        res.status(201).json({ gameCode: newGame.gameCode });

    } catch (error) {
        console.error("Error in createGameSession controller:", error);
        res.status(500).json({ message: 'Server error while creating the game session.' });
    }
};

module.exports = { createGameSession };