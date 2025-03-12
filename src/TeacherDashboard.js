
import React from 'react';

const TeacherDashboard = () => {
  return (
    <div>
      <h2>Welcome to the Teacher Dashboard</h2>
      <p>Here you can manage your classes, view student progress, and more.</p>
      
      <div>
        <h3>Upcoming Classes</h3>
        <ul>
          <li>Math 101 - Monday, 9 AM</li>
          <li>Science 102 - Wednesday, 11 AM</li>
        </ul>
      </div>

      <div>
        <h3>Recent Activities</h3>
        <ul>
          <li>Graded 5 assignments for Math 101</li>
          <li>Updated syllabus for Science 102</li>
        </ul>
      </div>

      <button onClick={() => alert("Navigating to Class Management")}>Manage Classes</button>
      <button onClick={() => alert("Navigating to Student Progress")}>View Student Progress</button>
    </div>
  );
};

export default TeacherDashboard;
