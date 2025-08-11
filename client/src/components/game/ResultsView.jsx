import React from 'react';
import { useRecoilValue } from 'recoil';
import { Box, Typography, Paper, Button, List, ListItem, ListItemText, Avatar, Divider } from '@mui/material';
import { isHostAtom, resultsAtom } from '../../state/gameState';
import { socket } from '../../services/SocketManager';
import { useParams } from 'react-router-dom';
import Leaderboard from './Leaderboard'; 

function ResultsView() {
  const { gameCode } = useParams();
  const isHost = useRecoilValue(isHostAtom);
  const { correctAnswer, leaderboard } = useRecoilValue(resultsAtom);

  const handleNextQuestion = () => {
    socket.emit('host:nextQuestion', { gameCode });
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{ p: 2, minHeight: '80vh' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: '100%', maxWidth: '800px', textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          The correct answer was:
        </Typography>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
          {correctAnswer}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Leaderboard players={leaderboard} />

        {isHost && (
          <Button
            variant="contained"
            size="large"
            onClick={handleNextQuestion}
            sx={{ mt: 4, width: '100%' }}
          >
            Next Question
          </Button>
        )}
      </Paper>
    </Box>
  );
}

export default ResultsView;