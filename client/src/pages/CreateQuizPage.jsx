import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import CreateQuizForm from '../components/forms/CreateQuizForm'; // We will create this next
import Header from '../components/Header';

function CreateQuizPage() {
    console.log("Hello Quiz")
  return (
    <>
      <Container component="main" maxWidth="md">
        <Paper elevation={3} sx={{ mt: 4, p: { xs: 2, sm: 3, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Create a New Quiz
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Build your quiz by adding a title, questions, and options. Select the correct answer for each question.
            </Typography>
            <CreateQuizForm />
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default CreateQuizPage;