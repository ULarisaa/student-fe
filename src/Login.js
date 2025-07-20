import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from "../src/assets/logo.png"

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setFeedback('');

  if (!email || !password) {
    setError('Both fields are required');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log(data);
    console.log('firstLogin:', data.firstLogin);


    if (data.success) {
      localStorage.setItem('accessToken', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      localStorage.setItem('Name', `${data.firstName} ${data.lastName}`);

      if (data.firstLogin) {

        navigate(`/reset-password?firstTime=true&token=${encodeURIComponent(data.token)}`);
      } else if (data.role === 'Student') {
        navigate('/StudentDashboard');
      } else if (data.role === 'Teacher') {
        navigate('/TeacherDashboard');
      } else {
        console.error('Unknown user role:', data.role);
      }
    } else {
      setError(data.message || 'Login failed');
    }
  } catch (err) {
    setError('Error logging in');
  }
};

 const handleResetPassword = async () => {
  setError('');
  setFeedback('');

  if (!email) {
    setError('Please enter your email before resetting your password.');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/user/reset-password-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.success) {
      setFeedback(' Reset link sent! Check your email.');
    } else if (data.message === 'User not found') {
      setError(
        ' Email not found. If you do not have an account yet, please speak to your institution administration.'
      );
    } else {
      setError('Something went wrong. Please try again later.');
    }
  } catch {
    setError('Server error. Please try again later.');
  }
};


 return (
  <Box display="flex" minHeight="100vh">
 
    <Box
      flex={1}
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: 'linear-gradient(135deg, #bbdefb, #e3f2fd)',
        flexDirection: 'column',
        padding: 4,
      }}
    >
      <img
        src={logo}
        alt="ZeroCheating Logo"
        style={{ width: '400px', marginBottom: '1.5rem' }}
      />
   
    </Box>


    <Box
  flex={1}
  display="flex"
  alignItems="center"
  justifyContent="center"
  sx={{
    backgroundColor: '#ffffff',
    minHeight: '100vh',
  }}
>
  <Paper
    elevation={3}
    sx={{
      p: 5,
      width: '100%',
      maxWidth: 400,
      borderRadius: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', 
    }}
  >

    {feedback && (
      <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
        {feedback}
      </Alert>
    )}
    {error && (
      <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
        {error}
      </Alert>
    )}

    <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}>
      Login to your account
    </Typography>

    <form onSubmit={handleLogin} style={{ width: '100%' }}>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        label="Password"
        variant="outlined"
        fullWidth
        margin="normal"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Box display="flex" justifyContent="flex-end" mt={1} mb={2}>
  <Typography
    variant="body2"
    onClick={handleResetPassword}
    sx={{
      cursor: 'pointer',
      color: '#1976d2',
      textDecoration: 'underline',
      fontSize: '0.85rem',
      '&:hover': {
        color: '#115293',
      },
    }}
  >
    Forgot password?
  </Typography>
</Box>

      <Button
        variant="contained"
        fullWidth
        type="submit"
        sx={{
          mt: 1,
          py: 1.2,
          backgroundColor: '#1976d2',
          fontWeight: 500,
          borderRadius: 2,
          ':hover': {
            backgroundColor: '#115293',
          },
        }}
      >
        Login
      </Button>
    </form>

    <Typography
      variant="body2"
      sx={{ mt: 3, color: 'text.secondary', fontSize: '0.85rem' }}
    >
      Don’t have an account? Contact your institution administration.
    </Typography>
  </Paper>
</Box>

  </Box>
);


}

