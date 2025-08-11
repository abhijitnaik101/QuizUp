// src/components/game/Leaderboard.jsx

import React from 'react';
import { Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Box } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const getTrophyColor = (index) => {
  if (index === 0) return '#FFD700'; 
  if (index === 1) return '#C0C0C0'; 
  if (index === 2) return '#CD7F32'; 
  return 'inherit';
};

function Leaderboard({ players }) {
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Leaderboard
      </Typography>
      <List>
        {players.map((player, index) => (
          <ListItem key={player._id} secondaryAction={
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {player.score}
            </Typography>
          }>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: getTrophyColor(index) }}>
                {index < 3 ? <EmojiEventsIcon /> : index + 1}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={player.nickname}
              primaryTypographyProps={{ variant: 'h6' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Leaderboard;