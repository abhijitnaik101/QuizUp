// server/models/GameSession.js

const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema(
    {
        gameCode: { type: String, required: true, unique: true },
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
        hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        hostSocketId: { type: String, required: false },
        currentState: { type: String, enum: ['Lobby', 'Question', 'Results', 'Finished'], default: 'Lobby' },
        currentQuestionIndex: { type: Number, default: 0 },
        questionStartTime: { type: Date }, // This field is used for scoring
        players: [{
            socketId: { type: String, required: true },
            nickname: { type: String, required: true },
            score: { type: Number, default: 0 },
            answers: [{
                questionIndex: { type: Number, required: true },
                answerText: { type: String, required: true },
                // --- ADD THIS FIELD ---
                timeTaken: {
                    type: Number, // Stored in milliseconds
                },
                // --- END OF ADDITION ---
            }]
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('GameSession', gameSessionSchema);