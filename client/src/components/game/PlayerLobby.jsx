// src/components/game/PlayerLobby.jsx

import React from 'react';
import { useRecoilValue } from 'recoil';
import { playersAtom, userNicknameAtom } from '../../state/gameState';
import { Container, Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, CircularProgress, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function PlayerLobby() {
  const players = useRecoilValue(playersAtom);
  const myNickname = useRecoilValue(userNicknameAtom);

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          You're In!
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 3 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Waiting for the host to start the game...
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Players in Lobby ({players.length}):
        </Typography>
        
        <Box sx={{ 
            maxHeight: 300, 
            overflow: 'auto', 
            border: '1px solid', 
            borderColor: 'divider', 
            borderRadius: 1 
        }}>
          <List>
            {players.map((player) => (
              // --- THIS IS THE KEY CHANGE ---
              // Use player._id, which is guaranteed to be unique by MongoDB for each
              // element in the sub-array. This resolves the React key warning.
              <ListItem 
                key={player._id} 
                sx={{ 
                  bgcolor: player.nickname === myNickname ? 'action.hover' : 'transparent',
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: player.nickname === myNickname ? 'primary.main' : 'secondary.main' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="h6">{player.nickname}</Typography>}
                  secondary={player.nickname === myNickname ? 'This is you!' : ''}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Container>
  );
}

export default PlayerLobby;