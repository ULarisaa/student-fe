import { useState, useEffect } from "react";
import { Button, Box, Typography, CircularProgress, Alert, TextField, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function EnrollPage() {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
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
        if (response.ok) {
          const data = JSON.parse(responseText);
          setAvailableCourses(data);
          setFilteredCourses(data); // Set all courses initially
        } else {
          throw new Error("Failed to fetch courses");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCourses();
  }, []);

  // Filter courses based on search term and semester filter
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterCourses(value, semesterFilter);
  };

  const handleSemesterFilterChange = (event) => {
    const value = event.target.value;
    setSemesterFilter(value);
    filterCourses(searchTerm, value);
  };

  // Filter function that applies both search and semester filter
  const filterCourses = (searchTerm, semesterFilter) => {
    let filtered = availableCourses;

    // Filter by search term (course name)
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by semester
    if (semesterFilter) {
      filtered = filtered.filter(course =>
        course.semester === semesterFilter
      );
    }

    setFilteredCourses(filtered);
  };

  const enrollInCourse = async (courseId) => {
    try {
      // Show a loading indicator or disable the button during enrollment
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
        // Enrollment success
        alert("Successfully enrolled in the course!");
        navigate("/StudentDashboard"); // Redirect to student dashboard after successful enrollment
      } else {
        // Handle server-side errors (e.g., already enrolled in the course, invalid courseId, etc.)
        alert("Error enrolling in course: " + data.message);
      }
    } catch (error) {
      // Catch any other unexpected errors
      alert("Error enrolling in course: " + error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        Available Courses
      </Typography>

      {/* Error handling */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Search bar */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search by Course Name"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': { borderColor: '#1976d2' },
              '&.Mui-focused fieldset': { borderColor: '#1976d2' },
            },
          }}
        />
        
        {/* Semester Filter */}
        <FormControl fullWidth variant="outlined">
          <InputLabel>Filter by Semester</InputLabel>
          <Select
            value={semesterFilter}
            onChange={handleSemesterFilterChange}
            label="Filter by Semester"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#1976d2' },
                '&.Mui-focused fieldset': { borderColor: '#1976d2' },
              },
            }}
          >
            <MenuItem value="">All Semesters</MenuItem>
            <MenuItem value="First">First Semester</MenuItem>
            <MenuItem value="Second">Second Semester</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3, mt: 2 }}>
          {filteredCourses.length === 0 ? (
            <Typography variant="h6" color="textSecondary" sx={{ gridColumn: "span 3", textAlign: "center" }}>
              No courses available matching your filters.
            </Typography>
          ) : (
            filteredCourses.map((course) => (
              <Box key={course.id} sx={{ p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "white" }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {course.name}
                </Typography>
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
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
