import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { fetchWithRefresh } from "../utils/fetchWithRefresh";

export default function AssignmentsWithSubmissions({
  courseId,
  goToAssignmentEdit,
}) {
  const [assignments, setAssignments] = useState([]);
  const [assignmentStudents, setAssignmentStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedAssignmentIds, setExpandedAssignmentIds] = useState({});
  const navigate = useNavigate();

 useEffect(() => {
  async function fetchData() {
  setLoading(true);
  try {
    const assignmentsRes = await fetchWithRefresh(`http://localhost:5000/assignments/${courseId}`);
    const assignmentsData = await assignmentsRes.json();

    const studentsRes = await fetchWithRefresh(`http://localhost:5000/course/${courseId}/students-with-submissions`);
    const studentsData = await studentsRes.json();

    setAssignments(assignmentsData);

    // Construim un map: assignmentId => lista de studenti cu info submit (sau fara)
    const assignmentMap = {};

    assignmentsData.forEach((assignment) => {
      assignmentMap[assignment.id] = { students: [] };

      studentsData.students.forEach((student) => {
        // cautam submissia studentului pentru assignment-ul curent
        const submission = student.submissions.find(sub => sub.assignmentId === assignment.id);

        assignmentMap[assignment.id].students.push({
          id: student.id,
          first_name: student.firstName,
          last_name: student.lastName,
          status: submission ? submission.status : "No submission",
          grade: submission ? submission.grade : null,
          submittedAt: submission ? submission.submittedAt : null,
        });
      });
    });

    setAssignmentStudents(assignmentMap);
  } catch (error) {
    console.error("Error loading assignments or students:", error);
  } finally {
    setLoading(false);
  }
}

  if (courseId) {
    fetchData();
  }
}, [courseId]);

const goToSubmissionPage = (assignmentId, studentId) => {
   navigate(`/TeacherDashboard/assignment/${assignmentId}/submission/${studentId}`);
};
  const toggleDropdown = (assignmentId) => {
    setExpandedAssignmentIds((prev) => ({
      ...prev,
      [assignmentId]: !prev[assignmentId],
    }));
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography mt={2}>Loading assignments and submissions...</Typography>
      </Box>
    );
  }

  return (
    <>
      {assignments.length ? (
        assignments.map((assignment) => (
          <Paper
            key={assignment.id}
            sx={{
              p: 2,
              mb: 2,
              boxShadow: 3,
              borderRadius: 2,
              transition: "0.3s",
              ":hover": { boxShadow: 6, backgroundColor: "#f5f5f5" },
            }}
          >
            {/* Header: Title + Edit */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold">
                {assignment.title}
              </Typography>
              <IconButton
                color="primary"
                aria-label="Edit assignment"
                onClick={() => goToAssignmentEdit(assignment.id)}
                size="small"
              >
                <EditIcon />
              </IconButton>
            </Box>

            {/* Description and Due Date */}
            <Typography color="text.secondary">
              Due Date: {new Date(assignment.due_date).toLocaleString()}
            </Typography>
            <Typography mt={1}>{assignment.description}</Typography>

            {/* Toggle submissions button */}
            <Button
              size="small"
              variant="text"
              onClick={() => toggleDropdown(assignment.id)}
              sx={{ mt: 1 }}
            >
              {expandedAssignmentIds[assignment.id]
                ? "Hide student submissions"
                : "Show student submissions"}
            </Button>

            {/* Students submissions list */}
           {expandedAssignmentIds[assignment.id] && (
  <Box mt={1} ml={1}>
    {assignmentStudents[assignment.id]?.students?.length ? (
      assignmentStudents[assignment.id].students.map((student) => (
        <Box
          key={student.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            backgroundColor:
              student.status.toLowerCase() === "submitted"
        ? "#e0f7fa" // albastru deschis pentru "submitted"
        : student.status.toLowerCase() === "graded"
        ? "#e8f5e9" // verde deschis pentru "graded"
        : "#fff3e0", 
            borderRadius: 1,
            mb: 0.5,
          }}
        >
          <Typography>
            {student.first_name} {student.last_name}
          </Typography>
     <Box display="flex" gap={2} alignItems="center">
  {(student.status === "submitted" || student.status === "graded") && (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<VisibilityIcon />}
        onClick={() => goToSubmissionPage(assignment.id, student.id)}
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
        Show Submission
      </Button>
      <Typography fontStyle="italic">
        {student.grade == null ? "Not graded" : `Grade: ${student.grade}`}
      </Typography>
    </>
  )}
  {(student.status !== "submitted" && student.status !== "graded") && (
    <Typography color="text.secondary">No submission</Typography>
  )}
</Box>



        </Box>
      ))
    ) : (
      <Typography variant="body2">No students enrolled.</Typography>
    )}
  </Box>
)}

          </Paper>
        ))
      ) : (
        <Typography>No assignments available.</Typography>
      )}

           <Box sx={{ height: 20 }} />
    </>
  );
}
