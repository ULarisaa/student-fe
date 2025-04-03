import { useState, useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function EnrollPage() {
  const [availableCourses, setAvailableCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/course/available", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const responseText = await response.text();
        console.log(responseText);
        if (response.ok) {
          const data = JSON.parse(responseText);
          setAvailableCourses(data);
        }
      } catch (error) {
        console.error("Error fetching available courses:", error);
      }
    };

    fetchAvailableCourses();
  }, []);

  const enrollInCourse = async (courseId) => {
    try {
      const response = await fetch("http://localhost:5000/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Successfully enrolled in the course!");
        navigate("/StudentDashboard"); // Redirect back to dashboard
      } else {
        alert("Error enrolling in course: " + data.message);
      }
    } catch (error) {
      alert("Error enrolling in course: " + error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold">Available Courses</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3, mt: 2 }}>
        {availableCourses.map((course) => (
          <Box key={course.id} sx={{ p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "white" }}>
            <Typography variant="h6" fontWeight="bold">{course.name}</Typography>
            <Typography variant="body2" color="textSecondary">Teacher: {course.teacher}</Typography>
            <Typography variant="body2" color="textSecondary">Semester: {course.semester}</Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              fullWidth
              onClick={() => enrollInCourse(course.id)}
            >
              Enroll
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
