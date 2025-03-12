import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();  // Initialize navigate function
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
        // Set role and other user data
        setRole(data.role);
        
        // Check if firstName and lastName exist in the response
        if (data.firstName && data.lastName) {
          alert(`Login Successful. Welcome, ${data.firstName} ${data.lastName}. You are a ${data.role}`);
        } else {
          alert(`Login Successful. You are a ${data.role}`);
        }
  
        // Redirect based on role
        if (data.role === 'Student') {
          navigate('/ProblemSolvingPage');
        } else if (data.role === 'Teacher') {
          navigate('/TeacherDashboard');
        }
      } else {
        setError(data.message); // Display any error message from the backend
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

      {/* Add a link to the Register page */}
      <div>
        <p>Don't have an account? <a href="/register">Register here</a></p>
      </div>
    </div>
  );
};

export default Login;
