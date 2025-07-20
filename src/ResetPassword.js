import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import logo from './assets/logo.png';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const firstTime = searchParams.get('firstTime');
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');


    if (firstTime && !newPassword) {
      setStatus('No password change requested. Redirecting...');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.message || 'Password reset successful!');
        setTimeout(() => navigate('/'), 3000); 
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !firstTime) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h6" color="error">
          Invalid or expired reset link.
        </Typography>
      </Box>
    );
  }

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
          <Typography
            variant="h6"
            sx={{ mb: 3, color: '#1976d2', fontWeight: 600 }}
          >
            Reset Your Password
          </Typography>

          {firstTime && (
            <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
              You are logged in for the first time. For your security, please consider changing your password.
            </Alert>
          )}

          {status && (
            <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
              {status}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              required={!firstTime}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
            />

            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.2,
                backgroundColor: '#1976d2',
                fontWeight: 500,
                borderRadius: 2,
                ':hover': {
                  backgroundColor: '#115293',
                },
              }}
            >
              {loading ? 'Submitting...' : 'Reset Password'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
