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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('teacherName', `${data.firstName} ${data.lastName}`);

        if (data.role === 'Student') {
          navigate('/StudentDashboard');
        } else if (data.role === 'Teacher') {
          navigate('/TeacherDashboard');
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
      const res = await fetch('http://localhost:5000/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback('✅ Reset link sent! Check your email.');
      } else if (data.message === 'EMAIL_NOT_FOUND') {
        setError(
          '❗ Email not found. If you do not have an account yet, please speak to your institution administration.'
        );
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } catch {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
        <Typography variant="h5" align="center" gutterBottom color="#1976d2">
          ZeroCheating Classroom
        </Typography>

        {feedback && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {feedback}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            variant="text"
            size="small"
            sx={{ mt: -1, mb: 2 }}
            onClick={handleResetPassword}
          >
            Forgot password?
          </Button>

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            sx={{ mt: 2, bgcolor: '#1976d2' }}
          >
            Login
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
          Don't have an account yet? Please address to your institution administration.
        </Typography>
      </Paper>
    </Box>
  );
}
