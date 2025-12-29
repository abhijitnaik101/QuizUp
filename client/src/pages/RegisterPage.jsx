import React, { useState, useEffect } from 'react'; // Import useEffect
import { Container, Box, Card, CardContent, Typography, TextField, Button, Grid, Link, Snackbar, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  useEffect(() => {
    localStorage.removeItem('token');
  }, []); 

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/users/signup', formData);

      console.log("Registration successful:", response.data);
      setNotification({
        open: true,
        message: 'Registration successful! Please log in.',
        severity: 'success',
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error("Registration error:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Registration unsuccessful. Please try again.';
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false); 
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ minWidth: 400, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                Sign Up
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField margin="normal" required fullWidth id="username" label="Username" name="username" value={formData.username} onChange={handleChange} disabled={loading} autoFocus />
                    <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" value={formData.email} onChange={handleChange} disabled={loading} />
                    <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" value={formData.password} onChange={handleChange} disabled={loading} />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                        <Link component={RouterLink} to="/login" variant="body2">
                            {"Already have an account? Sign In"}
                        </Link>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
      </Box>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default RegisterPage;