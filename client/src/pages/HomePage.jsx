// src/pages/HomePage.jsx

import React, { useState } from 'react';
import { Container, Box, Typography, Paper, TextField, Button, Stack } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const [nickname, setNickname] = useState('');

  const handleJoinGame = (event) => {
    event.preventDefault();

    if (!gameCode.trim() || !nickname.trim()) {
      alert('Please enter both a game code and a nickname.');
      return;
    }
    navigate(`/game/${gameCode.trim()}`, { state: { nickname: nickname.trim() } });
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: '80vh', // Ensures content is centered on the viewport
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {/* Main Title */}
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Synapse
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          The Real-Time Quiz and Polling Platform
        </Typography>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mt: 4, 
            width: '100%', 
            maxWidth: '500px', 
            backgroundColor: 'background.paper' 
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Join a Game
          </Typography>
          <Box component="form" onSubmit={handleJoinGame} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="gameCode"
              label="Game Code"
              name="gameCode"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="nickname"
              label="Nickname"
              name="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
            >
              Enter
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default HomePage;