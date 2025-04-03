import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

export default function CourseDetails() {
  const { courseId } = useParams(); // Get courseId from the URL
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/courses/${courseId}`);
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (!course) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold">{course.name}</Typography>
      <Typography variant="body1" color="textSecondary" mt={2}>Teacher: {course.teacher}</Typography>
      <Typography variant="body1" color="textSecondary" mt={1}>Semester: {course.semester}</Typography>
      <Typography variant="body1" color="textSecondary" mt={2}>{course.description}</Typography>
    </Box>
  );
}
