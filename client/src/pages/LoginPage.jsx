// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button, Grid, Link, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios

function LoginPage() {
  const navigate = useNavigate();

  // State for form data - only email and password needed for login
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // State for loading indicator
  const [loading, setLoading] = useState(false);

  // State for the "toaster" notification (Snackbar)
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // The main submit logic, now async
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Make the API call to your login endpoint
      const response = await axios.post('http://localhost:3000/api/users/login', formData);

      console.log("Login successful:", response.data);

      // --- CRUCIAL STEP FOR LOGIN ---
      // The backend should send back a token. Store it in localStorage.
      // This token will be used to authenticate future requests.
      localStorage.setItem('token', response.data.token);

      // Show a success message
      setNotification({
        open: true,
        message: 'Login successful! Redirecting to your dashboard...',
        severity: 'success',
      });
      
      // Wait a moment for the user to see the success message, then navigate
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500); // 1.5 seconds delay

    } catch (error) {
      console.error("Login error:", error.response?.data);
      
      // Determine the error message from the backend response, or show a generic one
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      
      // Show an error message
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false); // Hide the loading spinner regardless of outcome
    }
  };

  // Handler to close the snackbar
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ minWidth: 400, boxShadow: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Sign In
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link component={RouterLink} to="/register" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* The Toaster (Snackbar) component for notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default LoginPage;