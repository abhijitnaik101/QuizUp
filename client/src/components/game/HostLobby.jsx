import React from 'react';
import { useRecoilValue } from 'recoil';
import { Box, Typography, Paper, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, Grid } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { playersAtom } from '../../state/gameState';
import { socket } from '../../services/SocketManager';

function HostLobby({ gameCode }) {
  const players = useRecoilValue(playersAtom);

  const handleStartGame = () => {
    socket.emit('host:startGame', { gameCode });
  };

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ minHeight: '80vh', textAlign: 'center' }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Your Game Lobby is Live!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Share this code with your players to have them join:
          </Typography>
          <Box
            sx={{
              display: 'inline-block',
              p: 2,
              mb: 3,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 1,
              letterSpacing: 4,
            }}
          >
            <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
              {gameCode}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartGame}
            disabled={players.length === 0} 
            sx={{ width: '100%', mb: 3 }}
          >
            Start Game ({players.length} Players)
          </Button>
          <Typography variant="h6">Players in Lobby:</Typography>
          <List>
            {players.length > 0 ? (
              players.map((player) => (
                <ListItem key={player.socketId}>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={player.nickname} />
                </ListItem>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2 }}>Waiting for players to join...</Typography>
            )}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default HostLobby;