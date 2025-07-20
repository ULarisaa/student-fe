import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Tooltip, Snackbar, Alert,   Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { fetchWithRefresh } from "../utils/fetchWithRefresh";

export default function TestsWithSubmissions({ courseId, goToTestEdit }) {
  const [tests, setTests] = useState([]);
  const [testStudents, setTestStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedTestIds, setExpandedTestIds] = useState({});
  const navigate = useNavigate();  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmModal, setConfirmModal] = useState({ open: false, testId: null });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
useEffect(() => {
  async function fetchData() {
    setLoading(true);
    try {
      const testsRes = await fetchWithRefresh(`http://localhost:5000/test/${courseId}/tests`);
      const testsData = await testsRes.json();

      const studentsRes = await fetchWithRefresh(`http://localhost:5000/course/${courseId}/students-with-test-submissions`);
      const studentsData = await studentsRes.json();

      setTests(testsData);

      const map = {};
      testsData.forEach((test) => {
        map[test.id] = {
          students: (studentsData.students ?? []).map((student) => {
            const testStatus = Array.isArray(student.testStatuses)
              ? student.testStatuses.find((s) => s.testId === test.id)
              : null;

            let status = "not started";
            let grade = null;
            let submittedAt = null;
            let hasSnapshots = false;

            if (testStatus) {
              if (testStatus.submission) {
                status = testStatus.submission.status;
                grade = testStatus.submission.grade ?? null;
                submittedAt = testStatus.submission.submittedAt ?? null;
              }
              hasSnapshots = !!testStatus.hasAnySnapshots;
            }

            return {
              id: student.id,
              first_name: student.firstName,
              last_name: student.lastName,
              status,
              grade,
              submittedAt,
              hasSnapshots,
            };
          }),
        };
      });

      setTestStudents(map);
    } catch (error) {
      console.error("Error fetching tests or student submissions:", error);
    } finally {
      setLoading(false);
    }
  }

  if (courseId) fetchData();
}, [courseId]);



  const toggleDropdown = (testId) => {
    setExpandedTestIds((prev) => ({
      ...prev,
      [testId]: !prev[testId],
    }));
  };

  const goToReportPage = (testId, studentId) => {
    navigate(`/TeacherDashboard/test/${testId}/student/${studentId}/report`);
  };

const handleDeleteAllSnapshots = async (testId) => {
  setConfirmModal({ open: true, testId }); 
};
const confirmDeleteSnapshots = async () => {
  const testId = confirmModal.testId;
  setConfirmModal({ open: false, testId: null });

  try {
  const res = await fetchWithRefresh(
  `http://localhost:5000/testSubmissions/${testId}/delete-all-snapshots`,
  {
    method: "DELETE",
  }
);


    if (res.ok) {
      setSnackbar({
        open: true,
        message: "All coding replays deleted!",
        severity: "success",
      });

    } else {
      setSnackbar({
        open: true,
        message: "Failed to delete coding replays.",
        severity: "error",
      });
    }
  } catch (err) {
    console.error("Delete error:", err);
    setSnackbar({
      open: true,
      message: "An error occurred.",
      severity: "error",
    });
  }
};


  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography mt={2}>Loading tests and submissions...</Typography>
      </Box>
    );
  }

return (
  <>
    {tests.length ? (
      tests.map((test) => {
        const allGraded =
          testStudents[test.id]?.students?.length &&
          testStudents[test.id].students.every(
            (s) => s.status === "graded"
          );
const hasAnySnapshots = testStudents[test.id]?.students?.some(
  (s) => s.hasSnapshots
);

        return (
          
          <Paper
            key={test.id}
            sx={{
              p: 2,
              mb: 2,
              boxShadow: 3,
              borderRadius: 2,
              transition: "0.3s",
              ":hover": { boxShadow: 6, backgroundColor: "#f5f5f5" },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold">
                {test.name}
              </Typography>

              <Box display="flex" gap={1} alignItems="center">
               {hasAnySnapshots && (
  <Tooltip
    title={
      allGraded
        ? "Delete all coding replays for this test"
        : "All submissions must be graded before deleting coding replays."
    }
  >
    <span>
      <Button
        variant="outlined"
        size="small"
        color="error"
        onClick={() => handleDeleteAllSnapshots(test.id)}
        sx={{ textTransform: "none" }}
        disabled={!allGraded}
      >
        Delete All Coding Replay
      </Button>
    </span>
  </Tooltip>
)}

                <IconButton
                  color="primary"
                  aria-label="Edit test"
                  onClick={() => goToTestEdit(test.id)}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Box>

            <Typography color="text.secondary" mt={1}>
              Start Time: {new Date(test.start_time).toLocaleString()}
            </Typography>
            <Typography mt={1}>{test.description}</Typography>

            <Button
              size="small"
              variant="text"
              onClick={() => toggleDropdown(test.id)}
              sx={{ mt: 1 }}
            >
              {expandedTestIds[test.id]
                ? "Hide student submissions"
                : "Show student submissions"}
            </Button>

            {expandedTestIds[test.id] && (
              <Box mt={1} ml={1}>
                {testStudents[test.id]?.students?.length ? (
                  testStudents[test.id].students.map((student) => (
                    <Box
                      key={student.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        p: 1,
                        backgroundColor:
                          student.status === "graded"
                            ? "#e8f5e9"
                            : student.status === "submitted"
                            ? "#e0f7fa"
                            : "#fff3e0",
                        borderRadius: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography>
                        {student.first_name} {student.last_name}
                      </Typography>

                      <Box display="flex" gap={2} alignItems="center">
                        {student.status !== "not started" ? (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() =>
                                goToReportPage(test.id, student.id)
                              }
                              sx={{
                                textTransform: "none",
                                fontWeight: "bold",
                                borderRadius: 2,
                                borderColor: "#0288d1",
                                color: "#0288d1",
                                "&:hover": {
                                  backgroundColor: "#e1f5fe",
                                  borderColor: "#0288d1",
                                },
                              }}
                            >
                              View Report
                            </Button>
                            <Typography fontStyle="italic">
                              {student.status === "graded" &&
                              student.grade != null
                                ? `Grade: ${student.grade}`
                                : "Not graded"}
                            </Typography>
                          </>
                        ) : (
                          <Typography color="text.secondary">
                            No submission
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">
                    No students enrolled.
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        );
      })
    ) : (
      <Typography>No tests available.</Typography>
    )}
     <Box sx={{ height: 20 }} />
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
                 <Dialog open={confirmModal.open} onClose={() => setConfirmModal({ open: false, testId: null })}>
  <DialogTitle>Confirm Deletion</DialogTitle>
  <DialogContent>
    Are you sure you want to delete all coding replay's data for this test?
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmModal({ open: false, testId: null })}>
      Cancel
    </Button>
    <Button color="error" onClick={confirmDeleteSnapshots}>
      Delete
    </Button>
  </DialogActions>
</Dialog>

  </>
);

}
