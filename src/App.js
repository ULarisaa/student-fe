import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import ProblemPage from './ProblemSolvingPage';
import TeacherDashboard from './TeacherDashboard';
import Register from './Register';  // Import the Register component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/ProblemSolvingPage" element={<ProblemPage />} />
        <Route path="/TeacherDashboard" element={<TeacherDashboard />} />
        <Route path="/register" element={<Register />} />  {/* Route for the Register page */}
      </Routes>
    </Router>
  );
};

export default App;
