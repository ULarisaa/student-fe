import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Typography, List, ListItem, ListItemText, IconButton, Collapse, Paper, Divider, Tooltip } from "@mui/material";
import { ClipboardCheck, FileText, CheckCircle, PlayCircle, StopCircle, Eye } from "lucide-react";

const StudentItem = ({ student, expandedGrades, toggleExpandGrades }) => (
  <Paper sx={{ mb: 2, p: 3, boxShadow: 4, borderRadius: 3, transition: "0.3s", ":hover": { boxShadow: 6 } }}>
    <Typography variant="h6" fontWeight="bold" noWrap>{student.name}</Typography>
    <Typography variant="body2" color="textSecondary">Year {student.year} - {student.specialization}</Typography>
    <Tooltip title="View Grades & Reports">
      <IconButton onClick={() => toggleExpandGrades(student.id)} sx={{ p: 0.5 }}>
        <ClipboardCheck size={22} />
      </IconButton>
    </Tooltip>
    <Collapse in={expandedGrades === student.id} timeout="auto" unmountOnExit>
      <List sx={{ pl: 4 }}>
        {student.tests.map((test, index) => (
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
            {/* Navigate to the personal report for that student's test */}
            <IconButton
  sx={{ flex: 1, textAlign: "center", p: 0.5 }}
  component={Link}
  to={`TeacherDashboard/courses/${student.courseId}/test/${test.name}/student/${student.id}/report`}
>
  <FileText size={22} />
</IconButton>

          </ListItem>
        ))}
      </List>
    </Collapse>
  </Paper>
);

export default function CoursePage() {
  const { courseId } = useParams();
  const [expandedGrades, setExpandedGrades] = useState(null);
  const [testStatus, setTestStatus] = useState({});
  const [reportVisibility, setReportVisibility] = useState(null);

  const courseData = {
    id: courseId,
    name: "Mathematics 101",
    students: [
      { id: 1, name: "Alice Johnson", year: "1", specialization: "CS", courseId, tests: [{ name: "Midterm", graded: true, grade: 8 }, { name: "Final", graded: false }] },
      { id: 2, name: "Bob Smith", year: "2", specialization: "IT", courseId, tests: [{ name: "Midterm", graded: true, grade: 7 }] },
    ],
    tests: {
      upcoming: ["Quiz 1", "Final Exam"],
      completed: ["Midterm"],
    },
  };

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

  return (
    <>
      <Typography variant="h4" fontWeight="bold" color="#333" mb={2}>{courseData.name}</Typography>
      <Typography variant="body1" color="textSecondary">Enrolled Students: {courseData.students.length}</Typography>
      
      <Typography variant="h5" fontWeight="bold" color="#333" mt={3}>Students</Typography>
      <List>
        {courseData.students.map((student) => (
          <StudentItem key={student.id} student={student} expandedGrades={expandedGrades} toggleExpandGrades={toggleExpandGrades} />
        ))}
      </List>
      
      <Typography variant="h5" fontWeight="bold" mt={5}>Manage Tests</Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" mt={3}>Upcoming Tests</Typography>
      <List>
        {courseData.tests.upcoming.map((test, index) => (
          <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <ListItemText primary={test} />
            <IconButton onClick={() => toggleTestStatus(test)} sx={{ p: 0.5 }}>
              {testStatus[test] === "running" ? <StopCircle size={22} color="#E74C3C" /> : <PlayCircle size={22} color="#333" />}
            </IconButton>
          </ListItem>
        ))}
      </List>
      
      <Typography variant="h6" mt={3}>Completed Tests</Typography>
      <List>
        {courseData.tests.completed.map((test, index) => (
          <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <ListItemText primary={test} />
            <IconButton sx={{ p: 0.5 }} onClick={() => toggleReportVisibility(test)}>
              <Eye size={22} />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* If the report is visible, show the list of students for the completed test */}
      {reportVisibility && (
        <Paper sx={{ p: 3, mt: 3, boxShadow: 4, borderRadius: 3 }}>
          <List>
            {courseData.students.map((student) => (
              <ListItem key={student.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <ListItemText primary={student.name} sx={{ flex: 2 }} />
                {student.tests.find(test => test.name === reportVisibility)?.graded ? (
                  <Typography variant="body2" fontWeight="bold" color="#2ECC71" sx={{ flex: 1, textAlign: "center" }}>
                    {student.tests.find(test => test.name === reportVisibility).grade}/10
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
  to={`/courses/${student.courseId}/test/${test.name}/student/${student.id}/report`}
>
  <FileText size={22} />
</IconButton>

              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </>
  );
}
