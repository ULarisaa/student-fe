import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import StudentDashboard from "./pages/Student/StudentDashboard";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import Register from "./Register";
import TestPage from "./pages/Student/TestPage";

console.log(TeacherDashboard);
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/StudentDashboard/*" element={<StudentDashboard />} />
        <Route path="/TeacherDashboard/*" element={<TeacherDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test/:testId" element={<TestPage />} />
      </Routes>
    </Router>
  );
};

export default App;
