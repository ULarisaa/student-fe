import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
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
      console.log(data);
  
      if (data.success) {
        // Store the token in localStorage for future requests
        localStorage.setItem('token', data.token); // Save the JWT token in localStorage
        localStorage.setItem('teacherName', `${data.firstName} ${data.lastName}`);
  
  
        // Redirect based on role
        if (data.role === 'Student') {
          navigate('/StudentDashboard');
        } else if (data.role === 'Teacher') {
          navigate('/TeacherDashboard');
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error logging in');
    }
  };
  
  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button type="submit">Login</button>
      </form>

      <div>
        <p>Don't have an account? <a href="/register">Register here</a></p>
      </div>
    </div>
  );
};

export default Login;
