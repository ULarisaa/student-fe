import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import StudentDashboard from "./pages/Student/StudentDashboard";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";

import TestPage from "./pages/Student/TestPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./ResetPassword";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
       <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/StudentDashboard/*"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/TeacherDashboard/*"
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/test/:testId" element={<TestPage />} />
      </Routes>
    </Router>
  );
};

export default App;
