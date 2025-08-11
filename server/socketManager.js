const gameHandlers = require("./handlers/gameHandler");

module.exports = function (io) {
  return (socket) => {
    console.log(`New client connected: ${socket.id}`);
    socket.on("player:joinGame", (payload) => {
      gameHandlers.playerJoinGame(io, socket, payload);
    });

    socket.on("host:startGame", (payload) => {
      gameHandlers.hostStartGame(io, socket, payload);
    });

    socket.on("player:submitAnswer", (payload) => {
      gameHandlers.playerSubmitAnswer(io, socket, payload);
    });

    socket.on("host:showResults", (payload) => {
      gameHandlers.hostShowResults(io, socket, payload);
    });

    socket.on("host:nextQuestion", (payload) => {
      gameHandlers.hostNextQuestion(io, socket, payload);
    });
    socket.on("host:joinGame", (payload) => {
      gameHandlers.hostJoinGame(io, socket, payload);
    });
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      gameHandlers.handleDisconnect(io, socket);
    });
  };
};
