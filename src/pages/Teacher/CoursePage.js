import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  Box,
  Modal, Snackbar, Alert
} from "@mui/material";
import { ExpandMore, Edit} from "@mui/icons-material";
import { Check, X, FileText, Edit2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AssignmentsWithSubmissions from "../../components/AssignmentsWithSubmissions ";
import TestsWithSubmissions from "../../components/TestsWithSubmissions";
import Materials from "../../components/Materials";
import Posts from "../../components/Posts";
import { Link as RouterLink } from "react-router-dom";
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";

const getStatusLabel = (event) => {
  const now = new Date();
  const start = new Date(event.start_time);
  const end = event.end_time ? new Date(event.end_time) : null;
  const due = event.due_date ? new Date(event.due_date) : null;

  if (event.grade !== null && event.grade !== undefined) {
    return { label: `Grade: ${event.grade}`, color: "#4caf50" };
  }

  if (event.status === "submitted") {
    return { label: "Submitted, waiting for grade", color: "#ff9800" };
  }

  if (event.status === "not_submitted") {
    if (event.type === "Test") {
      if (now < start) {
        return { label: "Upcoming", color: "#2196f3" };
      }
      if (now >= start && (!end || now <= end)) {
        return { label: "Available", color: "#1976d2" };
      }
      if (end && now > end) {
        return { label: "Missed", color: "#f44336" };
      }
    } else if (event.type === "Assignment") {
      if (due && now <= due) {
        return { label: "Available", color: "#1976d2" };
      } else {
        return { label: "Missed", color: "#f44336" };
      }
    }
  }

  return { label: "Unknown", color: "#9e9e9e" };
};

function StudentItem({ student, expandedGrades, toggleExpandGrades }) {
  
  return (
    <Paper
      key={student.id}
      sx={{
        p: 2,
        mb: 2,
        boxShadow: 3,
        borderRadius: 2,
        transition: "0.3s",
        ":hover": { boxShadow: 6, backgroundColor: "#f9fafb" },
        backgroundColor: "#fff",
      }}
    >
      <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
        <Grid item xs={8} sm={9} md={10}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "600",
              color: "#222",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              maxWidth: "100%",
            }}
            title={student.user_name}
          >
            {student.user_name}
          </Typography>
        </Grid>

        <Grid item>
          <IconButton
            color="primary"
            onClick={() => toggleExpandGrades(student.id)}
            aria-label={expandedGrades === student.id ? "Collapse grades" : "Expand grades"}
            size="small"
          >
            {expandedGrades === student.id ? <ExpandMore /> : <FileText />}
          </IconButton>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

    {expandedGrades === student.id && (
  <>
    <List dense>
      {student.submissions && student.submissions.length > 0 ? (
        student.submissions.map((sub) => {
          const { label, color } = getStatusLabel(sub);
          const gradeIsNull = sub.grade === null || sub.grade === undefined;
          const viewButtonText = sub.type === "test" ? "Show Report" : "Show Submission";
          const studentId = student.user?.id ?? student.user_id;

          const viewLink =
            sub.type === "test"
              ? `/TeacherDashboard/test/${sub.item_id}/student/${studentId}/report`
              : `/TeacherDashboard/assignment/${sub.item_id}/submission/${studentId}`;

          return (
            <ListItem
              key={sub.id}
              sx={{
                mb: 1,
                borderRadius: 1,
                bgcolor: "#fefefe",
                cursor: "default",
                pointerEvents: "none",
              }}
            >
              <ListItemText
                primary={sub.name}
                secondary={
                  <>
                    {gradeIsNull && (
                      <Typography component="span" sx={{ fontStyle: "italic", color: "gray", mr: 1 }}>
                        Not graded
                      </Typography>
                    )}
                    <Typography component="span" sx={{ color, fontWeight: "600", mr: 1 }}>
                      {label}
                    </Typography>
                    <Typography component="span" color="text.secondary">
                      | Submitted at: {new Date(sub.submitted_at).toLocaleString()}
                    </Typography>
                  </>
                }
                sx={{ pointerEvents: "none" }}
              />

              <Button
                variant="outlined"
                size="small"
                component={RouterLink}
                to={viewLink}
                sx={{
                  textTransform: "none",
                  pointerEvents: "auto",
                  ":hover": { boxShadow: 2 },
                }}
              >
                {viewButtonText}
              </Button>
            </ListItem>
          );
        })
      ) : (
        <Typography
          variant="body2"
          sx={{ color: "gray", fontStyle: "italic", p: 1 }}
        >
          No submissions found.
        </Typography>
      )}
    </List>
  </>
)}

    </Paper>
  );
}


function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [expandedGrades, setExpandedGrades] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
const [studentsWithGrades, setStudentsWithGrades] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

const fetchCourseData = async () => {
    setLoading(true);
    try {
      const response = await fetchWithRefresh(`http://localhost:5000/course/${courseId}/full`);
      if (!response.ok) throw new Error("Failed to fetch course data");
      const data = await response.json();
      setCourseData(data);
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentRequests = async (selectedCourseId) => {
    try {
      const url = selectedCourseId 
        ? `http://localhost:5000/enroll/pending?courseId=${selectedCourseId}`
        : "http://localhost:5000/enroll/pending";

      const response = await fetchWithRefresh(url);
      if (!response.ok) throw new Error("Failed to fetch enrollment requests");
      const data = await response.json();
      setEnrollmentRequests(data);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudentsWithGrades = async (selectedCourseId) => {
    try {
      const response = await fetchWithRefresh(`http://localhost:5000/course/${selectedCourseId}/students-with-grades`);
      if (!response.ok) throw new Error("Failed to fetch students with grades");
      const data = await response.json();
      setStudentsWithGrades(data);
    } catch (error) {
      console.error(error);
    }
  };

  
  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchEnrollmentRequests(courseId);
      fetchStudentsWithGrades(courseId);
    }
  }, [courseId]);


  const toggleExpandGrades = (studentId) => {
    setExpandedGrades((prev) => (prev === studentId ? null : studentId));
  };
const handleEnrollmentRequest = async (enrollmentId, status) => {
  try {
    const response = await fetchWithRefresh(`http://localhost:5000/enroll/${enrollmentId}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      const result = await response.json();

      setSnackbar({
        open: true,
        message: `Enrollment ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
        severity: 'success',
      });

      setEnrollmentRequests((prev) => prev.filter((req) => req.id !== enrollmentId));


      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      const errorResult = await response.json();
      setSnackbar({
        open: true,
        message: `Failed to update enrollment: ${errorResult.error || 'Unknown error'}`,
        severity: 'error',
      });
    }
  } catch (error) {
    console.error('Error updating enrollment:', error);
    setSnackbar({
      open: true,
      message: 'Failed to update enrollment. Please try again later.',
      severity: 'error',
    });
  }
};


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenEditModal = () => setEditModalOpen(true);
  const handleCloseEditModal = () => setEditModalOpen(false);

  if (loading) return <Typography>Loading...</Typography>;
  if (!courseData) return <Typography>Course data not found</Typography>;




const goToTestEdit = (testId) => {
  navigate(`/course/${courseId}/tests/${testId}/edit`);
};

const goToAssignmentEdit = (assignmentId) => {
  navigate(`/course/${courseId}/assignments/${assignmentId}/edit`);
};




  return (
    <Box>
      <Grid container alignItems="center" spacing={1} mb={2}>
        <Grid item>
          <Typography variant="h4" fontWeight="bold" color="#333">
            {courseData.course.name}
          </Typography>
        </Grid>
        <Grid item>
          <IconButton aria-label="Edit course" onClick={handleOpenEditModal} size="small">
            <Edit />
          </IconButton>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" color="text.secondary" mb={2}>
        {courseData.course.description}
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="Course page tabs"
        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
      <Tab label={`Students (${courseData.enrolledStudents.length})`} />
<Tab label={`Enrollment Requests (${enrollmentRequests.length})`} />
<Tab label={`Assignments (${courseData.assignments.length})`} />
<Tab label={`Tests (${courseData.tests.length})`} />
<Tab label={`Materials (${courseData.materialsCount ?? 0})`} />
<Tab label={`Posts (${courseData.postsCount ?? 0})`} />

      </Tabs>

     <TabPanel value={tabValue} index={0}>
  {studentsWithGrades.length ? (
    studentsWithGrades.map((student) => (
      <StudentItem
        key={student.id}
        student={student}
        expandedGrades={expandedGrades}
        toggleExpandGrades={toggleExpandGrades}
      />
    ))
  ) : (
    <Typography>No students enrolled yet.</Typography>
  )}
</TabPanel>


      


      <TabPanel value={tabValue} index={1}>
        {enrollmentRequests.length ? (
          <List>
            {enrollmentRequests.map((request) => (
              <ListItem
                key={request.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingY: 1,
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: "0.3s",
                  ":hover": { boxShadow: 6, backgroundColor: "#f5f5f5" },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                  {request.first_name} {request.last_name}
                </Typography>
                <Box>
                  <IconButton
                    onClick={() => handleEnrollmentRequest(request.id, "approved")}
                    color="success"
                    aria-label="Approve enrollment"
                  >
                    <Check />
                  </IconButton>
                  <IconButton
                    onClick={() => handleEnrollmentRequest(request.id, "denied")}
                    color="error"
                    aria-label="Deny enrollment"
                  >
                    <X />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No enrollment requests pending.</Typography>
        )}
      </TabPanel>

<TabPanel value={tabValue} index={2}>
  <Button
  variant="contained"
  color="secondary"
  sx={{ mt: 2, mb: 2 }}
  component={Link}
  to={`/TeacherDashboard/courses/${courseId}/create-assignment`}
  state={{ courseName: courseData.course.name }}
>
  Create Assignment
</Button>


  <AssignmentsWithSubmissions
    courseId={courseId}
    goToAssignmentEdit={goToAssignmentEdit}
  />
</TabPanel>

<TabPanel value={tabValue} index={3}>
  <Button
    variant="contained"
    color="primary"
    sx={{ mt: 2, mb: 2 }}
    component={Link}
    to={`/TeacherDashboard/courses/${courseId}/create-test`}
    state={{ courseName: courseData.course.name }}
  >
    Create New Test
  </Button>
  <TestsWithSubmissions
    courseId={courseId}
    goToTestEdit={goToTestEdit}
  />
</TabPanel>
<TabPanel value={tabValue} index={4}>
  <Materials
    courseId={courseId}
    onRefreshCourseData={fetchCourseData} 
  />
</TabPanel>

<TabPanel value={tabValue} index={5}>
  <Posts
    courseId={courseId}
    onRefreshCourseData={fetchCourseData}  
  />
</TabPanel>


  <Modal open={editModalOpen} onClose={handleCloseEditModal} aria-labelledby="edit-course-modal-title">
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
      }}
    >
      <Typography id="edit-course-modal-title" variant="h6" component="h2" mb={2}>
        Edit Course 
      </Typography>

      <Button onClick={handleCloseEditModal} variant="contained" fullWidth>
        Close
      </Button>
    </Box>
  </Modal>
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