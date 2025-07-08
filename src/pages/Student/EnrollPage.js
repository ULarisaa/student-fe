import { useState, useEffect } from "react";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  TextField,
  MenuItem,
  Tooltip, 
  Alert, Snackbar
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate } from "react-router-dom";
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";

export default function EnrollPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }; 


const fetchEnrollments = async () => {
  try {
   const response = await fetchWithRefresh("http://localhost:5000/enroll/status", {
  method: "GET",
});

    const responseText = await response.text();
    if (response.ok) {
      const data = JSON.parse(responseText);
      setEnrollments(data);
      setFilteredCourses(data);
    } else {
      throw new Error("Failed to fetch courses");
    }
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  fetchEnrollments();
}, []);


  const filterCourses = (searchTerm, semesterFilter) => {
    let filtered = enrollments;

    if (searchTerm) {
      filtered = filtered.filter((course) =>
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (semesterFilter) {
      filtered = filtered.filter((course) => course.semester === semesterFilter);
    }

    setFilteredCourses(filtered);
  };

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

const enrollInCourse = async (courseId) => {
  try {
    const response = await fetchWithRefresh("http://localhost:5000/enroll", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ courseId }),
});

    const data = await response.json();

    if (response.ok) {
      setSnackbar({
        open: true,
        message: "Request successfully sent!",
        severity: "success",
      });

      // 🔁 Reîncarcă statusul de înscriere (fără reload pagină)
      await fetchEnrollments(); // sau fetchCourses(), fetchStatus(), etc.
    } else {
      setSnackbar({
        open: true,
        message: data.message || "Enrollment failed",
        severity: "error",
      });
    }
  } catch (error) {
    setSnackbar({
      open: true,
      message: error.message || "Something went wrong",
      severity: "error",
    });
  }
};



  // Extract unique semesters for filter dropdown
  const uniqueSemesters = Array.from(
    new Set(enrollments.map((c) => c.semester))
  ).sort();

  return (
    <Box sx={{ p: 3, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Available Courses
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2, fontWeight: "bold" }}>
          {error}
        </Typography>
      )}

      {/* Search and Semester Filter */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 4 }}
        alignItems="center"
      >
        <TextField
          label="Search by course name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />

        <TextField
          select
          label="Filter by semester"
          value={semesterFilter}
          onChange={handleSemesterFilterChange}
          size="small"
          sx={{ width: 180 }}
        >
          <MenuItem value="">All semesters</MenuItem>
          {uniqueSemesters.map((semester) => (
            <MenuItem key={semester} value={semester}>
              {semester}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredCourses.length === 0 ? (
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mt: 6, textAlign: "center" }}
        >
          No courses available matching your filters.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
            gap: 2,
          }}
        >
          {filteredCourses.map((course) => {
            const status = course.status;

            return (
              <Box
                key={course.course_id}
                sx={{
                  p: 2,
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: 180, // fixed height
                  transition: "transform 0.15s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    gutterBottom
                    sx={{ color: "primary.main" }}
                  >
                    {course.course_name}
                  </Typography>

                  <Divider sx={{ mb: 1 }} />

                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Teacher:
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 600,
                          ml: 0.5,
                          color: "text.primary",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "calc(100% - 60px)",
                          display: "inline-block",
                          verticalAlign: "bottom",
                        }}
                      >
                        {course.teacher_first_name} {course.teacher_last_name}
                      </Box>
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Semester:
                      <Box
                        component="span"
                        sx={{ fontWeight: 600, ml: 0.5, color: "text.primary" }}
                      >
                        {course.semester}
                      </Box>
                    </Typography>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {(() => {
                    // Multiline chip labels
                    const baseChipProps = {
                      variant: "outlined",
                      sx: {
                        fontWeight: "bold",
                        maxWidth: 220,
                        "& .MuiChip-label": {
                          whiteSpace: "normal",
                          lineHeight: 1.2,
                          textAlign: "left",
                        },
                      },
                    };

                    switch (status) {
                      case "approved":
                        return (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Already enrolled"
                            color="success"
                            {...baseChipProps}
                          />
                        );

                      case "pending":
                        return (
                           <Tooltip title="Please contact your supervisor or institution administration if needed.">
                            <Chip
                              icon={<HourglassEmptyIcon />}
                              label="Your request is pending."
                              color="info"
                              {...baseChipProps}
                              sx={{ cursor: "help" }} // show pointer to hint hover
                            />
                          </Tooltip>
                        );

                      case "denied":
                        return (
                          <Chip
                            icon={<CancelIcon />}
                            label="Enrollment denied — contact administration"
                            color="error"
                            {...baseChipProps}
                          />
                        );

                      default:
                        return (
                          <Chip
                            icon={<HelpOutlineIcon />}
                            label="Not enrolled"
                            color="default"
                            {...baseChipProps}
                          />
                        );
                    }
                  })()}

                 {(status === null || status === "denied") && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => enrollInCourse(course.course_id)}
                    sx={{ borderRadius: 2 }}
                  >
                    Request Enroll
                  </Button>
                )}

                </Box>
              </Box>
            );
          })}
        </Box>
      )}
      <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
              </Alert>
            </Snackbar>
    </Box>
    
  );
}
