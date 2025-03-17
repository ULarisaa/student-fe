import { useParams } from "react-router-dom";
import { Typography, Paper } from "@mui/material";

export default function ReportPage() {
  const { courseId, testName, studentId } = useParams();
  console.log('report');
  // Fake data for the report (use real data in practice)
  const studentReport = {
    name: "Alice Johnson",
    testName,
    grade: 8,
    feedback: "Good performance. Keep it up!",
  };

  return (
    <Paper sx={{ p: 3, boxShadow: 4, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight="bold">{studentReport.name}'s Report for {testName}</Typography>
      <Typography variant="body1" color="textSecondary" mt={2}>Grade: {studentReport.grade}/10</Typography>
      <Typography variant="body2" mt={1}>Feedback: {studentReport.feedback}</Typography>
    </Paper>
  );
}
