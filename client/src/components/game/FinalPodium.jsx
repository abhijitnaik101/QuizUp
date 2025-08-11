import React from 'react';
import { useRecoilValue } from 'recoil';
import { Box, Typography, Paper, Button, Grid, Avatar } from '@mui/material';
import { resultsAtom, isHostAtom } from '../../state/gameState'; 
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Leaderboard from './Leaderboard';

const podiumStyles = {
  1: { size: 120, color: '#FFD700', elevation: 12, order: 2 }, 
  2: { size: 100, color: '#C0C0C0', elevation: 8, order: 1 },  
  3: { size: 80,  color: '#CD7F32', elevation: 4, order: 3 }, 
};

function FinalPodium() {
  const navigate = useNavigate();
  
  const { leaderboard } = useRecoilValue(resultsAtom);
  const isHost = useRecoilValue(isHostAtom);

  const topThree = leaderboard.slice(0, 3);
  const everyoneElse = leaderboard.slice(3);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleFindAnotherGame = () => {
    navigate('/');
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center" 
      sx={{ p: { xs: 1, sm: 2 }, minHeight: '100vh', boxSizing: 'border-box' }}
    >
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2, width: '100%', maxWidth: '800px', textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Final Results!
        </Typography>

        <Grid container justifyContent="center" alignItems="flex-end" spacing={2} sx={{ mt: 3, mb: 4, minHeight: 200 }}>
          {topThree.map((player, index) => {
            const place = index + 1;
            const style = podiumStyles[place];
            return (
              <Grid item key={player._id || player.nickname} order={style.order}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar sx={{ width: style.size, height: style.size, bgcolor: style.color, mb: 1 }}>
                    <EmojiEventsIcon sx={{ fontSize: style.size / 2 }}/>
                  </Avatar>
                  <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>{player.nickname}</Typography>
                  <Typography variant="h6" color="text.secondary">{player.score} pts</Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {everyoneElse.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mt: 4 }}>Full Leaderboard</Typography>
            <Leaderboard players={leaderboard} />
          </>
        )}
        
        <Box sx={{ mt: 4, width: '100%' }}>
          {isHost ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleBackToDashboard}
              fullWidth
            >
              Back to Dashboard
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={handleFindAnotherGame}
              fullWidth
            >
              Find Another Game
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default FinalPodium;