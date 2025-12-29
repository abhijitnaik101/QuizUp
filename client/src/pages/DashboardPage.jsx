import React from 'react';
import { Container, Box, Typography, Button, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import QuizList from '../components/QuizList'; 
import Header from '../components/Header'; 

function DashboardPage() {
  const username = "Host"; 

  return (
    <>
      <Container component="main" maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Grid item>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome, {username}!
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage your quizzes or start a new game session.
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                component={RouterLink}
                to="/create-quiz"
                size="large"
              >
                Create New Quiz
              </Button>
            </Grid>
          </Grid>
          <QuizList />
        </Box>
      </Container>
    </>
  );
}

export default DashboardPage;