import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Paper, Button, Stack, CircularProgress, Alert, Grid, IconButton, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Skeleton 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import axios from 'axios';

const deleteQuizAPI = async (quizId, token) => {
    return axios.delete(`http://localhost:3000/api/quiz/${quizId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
    });
};

function QuizList() {
  const navigate = useNavigate();

  // --- Simplified State Management ---
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [actionInProgress, setActionInProgress] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, quizId: null });

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not authenticated. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3000/api/quiz/my-quizzes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(response.data);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      setError(err.response?.data?.message || 'Failed to load your quizzes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch quizzes when the component mounts
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);


  // --- Action Handlers ---

  const handleHostGame = async (quizId) => {
    setActionInProgress(quizId); // Set loading state for this specific card
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('http://localhost:3000/api/games/create', 
        { quizId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
       navigate(`/game/${response.data.gameCode}`, { 
        state: { isHost: true } 
      });
    } catch (err) {
      console.error("Failed to create game session:", err);
      alert(err.response?.data?.message || 'Could not start a new game.');
    } finally {
      setActionInProgress(null); 
    }
  };
  
  const handleDeleteQuiz = async () => {
    const quizIdToDelete = deleteConfirm.quizId;
    setActionInProgress(quizIdToDelete);
    const token = localStorage.getItem('token');

    try {
      await deleteQuizAPI(quizIdToDelete, token);
      setQuizzes(prevQuizzes => prevQuizzes.filter(q => q._id !== quizIdToDelete));
    } catch (err) {
      console.error("Failed to delete quiz:", err);
      alert('Failed to delete the quiz.');
    } finally {
      closeDeleteDialog(); 
      setActionInProgress(null);
    }
  };

  const openDeleteDialog = (quizId) => setDeleteConfirm({ open: true, quizId });
  const closeDeleteDialog = () => setDeleteConfirm({ open: false, quizId: null });

  if (isLoading) {
    return (
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {Array.from(new Array(3)).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Skeleton variant="rectangular" height={155} sx={{ borderRadius: 2 }}/>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }} action={
        <Button color="inherit" size="small" onClick={fetchQuizzes}>
          RETRY
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <>
      {quizzes.length === 0 ? (
        <Paper sx={{ textAlign: 'center', p: 4, mt: 4 }}>
          <Typography variant="h6" gutterBottom>No Quizzes Found</Typography>
          <Typography color="text.secondary">
            You haven't created any quizzes yet. Click "Create New Quiz" to get started!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {quizzes.map((quiz) => {
            const isActionOnThisCard = actionInProgress === quiz._id;
            return (
              <Grid item xs={12} sm={6} md={4} key={quiz._id}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom noWrap title={quiz.title}>
                      {quiz.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {quiz.questions.length} Questions
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                    <IconButton size="small" disabled={isActionOnThisCard}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => openDeleteDialog(quiz._id)} disabled={isActionOnThisCard}>
                      {isActionOnThisCard && deleteConfirm.quizId === quiz._id ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                    </IconButton>
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={isActionOnThisCard && !deleteConfirm.quizId ? <CircularProgress size={16} color="inherit"/> : <PlayArrowIcon />}
                      onClick={() => handleHostGame(quiz._id)}
                      disabled={!!actionInProgress}
                    >
                      Host
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      )}

      <Dialog open={deleteConfirm.open} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Quiz?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this quiz? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteQuiz} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default QuizList;