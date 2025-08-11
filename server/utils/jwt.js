const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const generateToken = (id) => {
    console.log("SIgned")
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

const verifyToken = (token) => {
    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
};

module.exports = { generateToken, verifyToken };