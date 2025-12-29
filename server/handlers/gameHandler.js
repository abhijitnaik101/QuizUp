const GameSession = require('../models/GameSession');

const activeTimers = {};
const gameHandlers = {};

const startQuestionTimer = (io, game) => {
    const gameCode = game.gameCode;
    const currentQuestion = game.quiz.questions[game.currentQuestionIndex];
    const timeLimit = currentQuestion.timeLimit;

    if (activeTimers[gameCode]) clearInterval(activeTimers[gameCode]);
    
    io.to(gameCode).emit('game:timerStart', { timeLimit });

    const intervalId = setInterval(async () => {
        const updatedGame = await GameSession.findOne({ gameCode });
        
        if (!updatedGame || updatedGame.currentState !== 'Question') {
            clearInterval(intervalId);
            delete activeTimers[gameCode];
            return;
        }

        console.log(`Timer expired for game ${gameCode}. Forcing results.`);
        clearInterval(intervalId);
        delete activeTimers[gameCode];
        
        const mockSocket = { id: updatedGame.hostSocketId, emit: () => {} };
        gameHandlers.hostShowResults(io, mockSocket, { gameCode });
    }, timeLimit * 1000);

    activeTimers[gameCode] = intervalId;
};

gameHandlers.sendQuestion = async function (io, game) {
    if (game.currentQuestionIndex >= game.quiz.questions.length) {
        const finalLeaderboard = game.players.sort((a, b) => b.score - a.score);
        io.to(game.gameCode).emit('game:finished', { leaderboard: finalLeaderboard });
        await GameSession.updateOne({ _id: game._id }, { $set: { currentState: 'Finished' } });
        return;
    }
    
    await GameSession.updateOne({ _id: game._id }, { $set: { questionStartTime: new Date() } });

    const currentQuestion = game.quiz.questions[game.currentQuestionIndex];
    const questionForClients = {
        questionIndex: game.currentQuestionIndex,
        questionText: currentQuestion.questionText,
        options: currentQuestion.options.map(o => ({ text: o.text })),
        timeLimit: currentQuestion.timeLimit,
    };

    io.to(game.gameCode).emit('game:newQuestion', { question: questionForClients });
    startQuestionTimer(io, game);
};

gameHandlers.playerJoinGame = async function (io, socket, { gameCode, nickname }) {
    try {
        const game = await GameSession.findOne({ gameCode, currentState: 'Lobby' });
        if (!game) return socket.emit('error', { message: 'Game not found or has already started.' });
        if (game.players.some(p => p.nickname.toLowerCase() === nickname.toLowerCase())) {
            return socket.emit('error', { message: `Nickname '${nickname}' is already taken.` });
        }
        const updatedGame = await GameSession.findOneAndUpdate(
            { gameCode, currentState: 'Lobby' },
            { $push: { players: { socketId: socket.id, nickname, score: 0, answers: [] } } },
            { new: true }
        );
        if (!updatedGame) return socket.emit('error', { message: 'Lobby is now closed.' });
        socket.join(gameCode);
        io.to(gameCode).emit('update:lobby', { players: updatedGame.players });
    } catch (error) { console.error("Error in playerJoinGame:", error); }
};

gameHandlers.hostJoinGame = async function (io, socket, { gameCode }) {
    try {
        const game = await GameSession.findOneAndUpdate({ gameCode }, { $set: { hostSocketId: socket.id } }, { new: true });
        if (!game) return socket.emit('error', { message: 'Game session not found.' });
        socket.join(gameCode);
        socket.emit('update:lobby', { players: game.players });
    } catch (error) { console.error("Error in hostJoinGame:", error); }
};

gameHandlers.hostStartGame = async function (io, socket, { gameCode }) {
    try {
        const game = await GameSession.findOneAndUpdate(
            { gameCode, hostSocketId: socket.id, currentState: 'Lobby' },
            { $set: { currentState: 'Question' } },
            { new: true }
        ).populate('quiz');
        if (!game) return socket.emit('error', { message: 'Cannot start game.' });
        io.to(gameCode).emit('game:started');
        gameHandlers.sendQuestion(io, game);
    } catch (error) { console.error("Error in hostStartGame:", error); }
};

gameHandlers.playerSubmitAnswer = async function (io, socket, { gameCode, answer }) {
    try {
        const game = await GameSession.findOne({ gameCode, currentState: 'Question' });
        if (!game) return;

        const playerIndex = game.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex === -1 || game.players[playerIndex].answers.some(a => a.questionIndex === game.currentQuestionIndex)) {
            return;
        }
        
        const timeTaken = new Date().getTime() - new Date(game.questionStartTime).getTime();

        await GameSession.updateOne(
            { _id: game._id, "players.socketId": socket.id },
            { $push: { "players.$.answers": { questionIndex: game.currentQuestionIndex, answerText: answer, timeTaken } } }
        );

        const updatedGame = await GameSession.findOne({ gameCode });
        const answeredCount = updatedGame.players.filter(p => p.answers.some(a => a.questionIndex === updatedGame.currentQuestionIndex)).length;
        io.to(updatedGame.hostSocketId).emit('host:updateAnswerCount', { answeredCount, totalPlayers: updatedGame.players.length });
        socket.emit('player:answerSubmitted');
    } catch (error) { console.error("Error in playerSubmitAnswer:", error); }
};

gameHandlers.hostShowResults = async function (io, socket, { gameCode }) {
    try {
        if (activeTimers[gameCode]) {
            clearInterval(activeTimers[gameCode]);
            delete activeTimers[gameCode];
        }
        
        let game = await GameSession.findOne({ gameCode, hostSocketId: socket.id, currentState: 'Question' }).populate('quiz');
        if (!game) return;

        const currentQuestion = game.quiz.questions[game.currentQuestionIndex];
        const correctAnswer = currentQuestion.options.find(opt => opt.isCorrect).text;
        const timeLimit = currentQuestion.timeLimit * 1000;

        game.players.forEach(player => {
            const playerAnswer = player.answers.find(ans => ans.questionIndex === game.currentQuestionIndex);
            if (playerAnswer && playerAnswer.answerText === correctAnswer) {
                const timeFactor = 1 - ((playerAnswer.timeTaken / timeLimit) / 2);
                const points = Math.round(1000 * timeFactor);
                player.score += points > 0 ? points : 0;
            }
        });

        await GameSession.updateOne({ _id: game._id }, { $set: { players: game.players, currentState: 'Results' } });

        const leaderboard = game.players.sort((a, b) => b.score - a.score);
        io.to(gameCode).emit('game:results', { correctAnswer, leaderboard });
    } catch (error) { console.error("Error in hostShowResults:", error); }
};

gameHandlers.hostNextQuestion = async function (io, socket, { gameCode }) {
    try {
        const game = await GameSession.findOneAndUpdate(
            { gameCode, hostSocketId: socket.id, currentState: 'Results' },
            { $inc: { currentQuestionIndex: 1 } },
            { new: true }
        ).populate('quiz');
        if (!game) return socket.emit('error', { message: 'Cannot proceed.' });
        gameHandlers.sendQuestion(io, game);
    } catch (error) { console.error("Error in hostNextQuestion:", error); }
};

gameHandlers.handleDisconnect = async function (io, socket) {
    try {
        const game = await GameSession.findOneAndUpdate({ "players.socketId": socket.id }, { $pull: { players: { socketId: socket.id } } }, { new: true });
        if (game) io.to(game.gameCode).emit('update:lobby', { players: game.players });
    } catch (error) { console.error(`Error handling disconnect:`, error); }
};

module.exports = gameHandlers;