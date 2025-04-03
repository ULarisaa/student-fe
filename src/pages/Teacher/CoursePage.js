import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchCourseData = async () => {
      const token = localStorage.getItem("token");  // Assuming the token is stored in localStorage

      try {
        const response = await fetch(`http://localhost:5000/course/${courseId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,  // Attach the token to the request header
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

    fetchCourseData();
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

  // Check if the data is still loading
  if (loading) {
    return <Typography variant="h6" color="textSecondary">Loading...</Typography>;
  }

  // If the course data is null or invalid, handle gracefully
  if (!courseData || !courseData.students || !courseData.tests) {
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
            <StudentItem key={student.id} student={student} expandedGrades={expandedGrades} toggleExpandGrades={toggleExpandGrades} />
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">No students enrolled yet</Typography>
        )}
      </List>

      <Typography variant="h5" fontWeight="bold" mt={5}>Manage Tests</Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" mt={3}>Upcoming Tests</Typography>
      <List>
        {courseData.tests?.upcoming?.length > 0 ? (
          courseData.tests.upcoming.map((test, index) => (
            <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <ListItemText primary={test} />
              <IconButton onClick={() => toggleTestStatus(test)} sx={{ p: 0.5 }}>
                {testStatus[test] === "running" ? <StopCircle size={22} color="#E74C3C" /> : <PlayCircle size={22} color="#333" />}
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
                <ListItemText primary={student.name} sx={{ flex: 2 }} />
                {student.tests?.find(test => test.name === reportVisibility)?.graded ? (
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
                  to={`/courses/${student.courseId}/test/${reportVisibility}/student/${student.id}/report`}
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
