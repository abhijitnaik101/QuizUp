const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors')
dotenv.config();
const connectDB = require('./config/db.js');
connectDB();

const app = express();
const httpServer = http.createServer(app);
app.use(cors({
    origin: "http://localhost:5173" // Allow requests from your Vite client
}));
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const socketHandler = require('./socketManager.js');
io.on('connection', socketHandler(io)); 

const userRoutes = require('./routes/user');
const quizRoute = require('./routes/quiz');
const gameRoute = require('./routes/gameSession');
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoute);
app.use('/api/games', gameRoute)
app.get('/', (req, res) => {
    res.send('Hello from Synapse API!');
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT || PORT}`);
});