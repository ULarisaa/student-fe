import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  Paper,
  Divider,
  Tooltip,
  Button,
  Grid,
  Box
} from "@mui/material";
import {
  ClipboardCheck,
  FileText,
  CheckCircle,
  PlayCircle,
  StopCircle,
  Eye,
  Check,
  X
} from "lucide-react";

// Student Item Component
const StudentItem = ({ student, expandedGrades, toggleExpandGrades }) => (
  <Paper sx={{ mb: 2, p: 3, boxShadow: 4, borderRadius: 3, transition: "0.3s", ":hover": { boxShadow: 6 } }}>
    <Grid container spacing={2} alignItems="center">
      {/* Student's Name */}
      <Grid item xs={12} sm={9}>
        <Typography variant="h6" fontWeight="bold" noWrap>
          {student.first_name} {student.last_name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Year {student.year} - {student.specialization}
        </Typography>
      </Grid>

      {/* Button for expanding grades */}
      <Grid item xs={12} sm={3} container justifyContent="flex-end">
        <Tooltip title="View Grades & Reports">
          <IconButton onClick={() => toggleExpandGrades(student.id)} sx={{ p: 0.5 }}>
            <ClipboardCheck size={22} />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>

    <Collapse in={expandedGrades === student.id} timeout="auto" unmountOnExit>
      <List sx={{ pl: 4 }}>
        {student.tests && student.tests.length > 0 ? (
          student.tests.map((test, index) => (
            <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <ListItemText primary={test.name} sx={{ flex: 2 }} />
              {test.graded ? (
                <Typography variant="body2" fontWeight="bold" color="#2ECC71" sx={{ flex: 1, textAlign: "center" }}>
                  {test.grade}/10
                </Typography>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ flex: 1, textAlign: "center" }}>No Grade</Typography>
              )}
              <IconButton sx={{ flex: 1, textAlign: "center", p: 0.5 }}>
                <CheckCircle size={22} />
              </IconButton>
              <IconButton
                sx={{ flex: 1, textAlign: "center", p: 0.5 }}
                component={Link}
                to={`/TeacherDashboard/courses/${student.courseId}/test/${test.name}/student/${student.id}/report`}
              >
                <FileText size={22} />
              </IconButton>
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">No Tests Available</Typography>
        )}
      </List>
    </Collapse>
  </Paper>
);

export default function CoursePage() {
  const { courseId } = useParams();
  const [expandedGrades, setExpandedGrades] = useState(null);
  const [testStatus, setTestStatus] = useState({});
  const [reportVisibility, setReportVisibility] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);

  // Fetch course data and pending enrollments in useEffect
  useEffect(() => {
    const fetchCourseData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`http://localhost:5000/course/${courseId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch course data");
        }
        const data = await response.json();
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching course data", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingEnrollments = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`http://localhost:5000/enroll/pending?courseId=${courseId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch pending enrollments");
        }
        const data = await response.json();
        // Enrich the data with first_name and last_name
        const enrichedData = data.map((enrollment) => ({
          ...enrollment,
          first_name: enrollment.first_name,
          last_name: enrollment.last_name,
        }));
        setEnrollmentRequests(enrichedData);
      } catch (error) {
        console.error("Error fetching pending enrollments", error);
      }
    };

    fetchCourseData();
    fetchPendingEnrollments();
  }, [courseId]);

  const toggleExpandGrades = (id) => {
    setExpandedGrades((prev) => (prev === id ? null : id));
  };

  const toggleTestStatus = (test) => {
    setTestStatus((prev) => ({
      ...prev,
      [test]: prev[test] === "running" ? "ended" : "running",
    }));
  };

  const toggleReportVisibility = (testName) => {
    setReportVisibility((prev) => (prev === testName ? null : testName));
  };

  const handleEnrollmentRequest = async (enrollmentId, action) => {
    const token = localStorage.getItem("token");
  
    // Optimistically update the UI before API call (for faster response)
    setEnrollmentRequests((prev) => prev.filter((request) => request.id !== enrollmentId));
  
    try {
      const response = await fetch(`http://localhost:5000/enroll/${enrollmentId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action }), // action can be 'approved' or 'denied'
      });
  
      if (!response.ok) {
        throw new Error("Failed to update enrollment request");
      }
  
      // Fetch updated enrollment requests
      const enrollmentResponse = await fetch(`http://localhost:5000/enroll/pending?courseId=${courseId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!enrollmentResponse.ok) {
        throw new Error("Failed to fetch updated pending enrollments");
      }
  
      const updatedEnrollmentRequests = await enrollmentResponse.json();
      setEnrollmentRequests(updatedEnrollmentRequests);
    } catch (error) {
      console.error("Error handling enrollment request", error);
  
      // If error occurs, you can revert the optimistic UI update
      setEnrollmentRequests((prev) => [
        ...prev, // Re-include the enrollment request that was removed optimistically
        { id: enrollmentId, first_name: 'Unknown', last_name: 'Unknown' }, // Ideally, you would refetch the specific request data
      ]);
    }
  };
  

  if (loading) {
    return <Typography variant="h6" color="textSecondary">Loading...</Typography>;
  }

  if (!courseData) {
    return <Typography variant="h6" color="textSecondary">Error: Course data not found</Typography>;
  }

  return (
    <>
      <Typography variant="h4" fontWeight="bold" color="#333" mb={2}>{courseData.name}</Typography>
      <Typography variant="body1" color="textSecondary">Enrolled Students: {courseData.students?.length || 0}</Typography>

      <Typography variant="h5" fontWeight="bold" color="#333" mt={3}>Students</Typography>
      <List>
        {courseData.students?.length > 0 ? (
          courseData.students.map((student) => (
            <StudentItem
              key={student.id}
              student={student}
              expandedGrades={expandedGrades}
              toggleExpandGrades={toggleExpandGrades}
            />
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">No students enrolled yet</Typography>
        )}
      </List>

      <Typography variant="h5" fontWeight="bold" mt={5}>Manage Enrollment Requests</Typography>
      <Divider sx={{ my: 2 }} />

      {enrollmentRequests.length > 0 ? (
        <List>
          {enrollmentRequests.map((request) => (
            <ListItem key={request.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingY: 1, borderRadius: 2, boxShadow: 2, transition: "0.3s", ":hover": { boxShadow: 6, backgroundColor: "#f5f5f5" } }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={8}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
                    {`${request.first_name} ${request.last_name}`}
                  </Typography>
                </Grid>
                <Grid item xs={4} container justifyContent="flex-end" spacing={1}>
                  <Grid item>
                    <IconButton
                      color="primary"
                      onClick={() => handleEnrollmentRequest(request.id, "approved")}
                      sx={{
                        p: 1,
                        transition: "0.3s",
                        ":hover": {
                          backgroundColor: "rgba(41, 128, 185, 0.1)",
                        },
                      }}
                    >
                      <Check size={20} />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton
                      color="error"
                      onClick={() => handleEnrollmentRequest(request.id, "denied")}
                      sx={{
                        p: 1,
                        transition: "0.3s",
                        ":hover": {
                          backgroundColor: "rgba(231, 76, 60, 0.1)",
                        },
                      }}
                    >
                      <X size={20} />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="textSecondary">No pending enrollment requests</Typography>
      )}

      <Typography variant="h5" fontWeight="bold" mt={5}>Manage Tests</Typography>
      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4, mb: 2 }}
        component={Link}
        to={`/TeacherDashboard/courses/${courseId}/create-test`} 
      >
        Create New Test
      </Button>

      <Typography variant="h6" mt={3}>Upcoming Tests</Typography>
      <List>
        {courseData.tests?.upcoming?.length > 0 ? (
          courseData.tests.upcoming.map((test, index) => (
            <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <ListItemText primary={test} />
              <IconButton onClick={() => toggleTestStatus(test)} sx={{ p: 0.5 }}>
                {testStatus[test] === "running" ? (
                  <StopCircle size={22} color="#E74C3C" />
                ) : (
                  <PlayCircle size={22} color="#333" />
                )}
              </IconButton>
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">No upcoming tests</Typography>
        )}
      </List>

      <Typography variant="h6" mt={3}>Completed Tests</Typography>
      <List>
        {courseData.tests?.completed?.length > 0 ? (
          courseData.tests.completed.map((test, index) => (
            <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <ListItemText primary={test} />
              <IconButton sx={{ p: 0.5 }} onClick={() => toggleReportVisibility(test)}>
                <Eye size={22} />
              </IconButton>
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">No completed tests</Typography>
        )}
      </List>

      {reportVisibility && (
        <Paper sx={{ p: 3, mt: 3, boxShadow: 4, borderRadius: 3 }}>
          <List>
            {courseData.students.map((student) => (
              <ListItem key={student.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <ListItemText primary={`${student.first_name} ${student.last_name}`} sx={{ flex: 2 }} />
                {student.tests?.find(test => test.name === reportVisibility)?.graded ? (
                  <Typography variant="body2" fontWeight="bold" sx={{ flex: 1, textAlign: "center", color: "#2ECC71" }}>
                    {student.tests.find(test => test.name === reportVisibility).grade}/10
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ flex: 1, textAlign: "center", color: "gray" }}>
                    No Grade
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </>
  );
}
