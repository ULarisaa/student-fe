import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";

const ExpectedGradePage = () => {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [expectedGrade, setExpectedGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questionCategory, setQuestionCategory] = useState(new Set());

  useEffect(() => {
    if (!testId) return;

    const fetchEvaluation = async () => {
      setLoading(true);
      setError(null);

      try {

     const res = await fetchWithRefresh(`http://localhost:5000/test/${testId}/evaluate`);

        if (!res.ok) throw new Error("Failed to fetch evaluation");

        const data = await res.json();

 
        setExpectedGrade(data.expectedGrade);
        setQuestionCategory(new Set(data.questionCategories || []));
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [testId]);

  const renderWarnings = () => {
    if (questionCategory.size === 0) return null;

    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>Important:</strong> This grade is only an estimation and may be modified after manual review.
        <ul style={{ marginTop: "0.5em", paddingLeft: "1.2em" }}>
          {questionCategory.has("multiple_choice") && (
            <li><strong>Multiple Choice</strong>: evaluated automatically based on correct options.</li>
          )}
          {questionCategory.has("free_answer") && (
            <li><strong>Free Answer</strong>: not automatically evaluated. It requires manual grading.</li>
          )}
          {questionCategory.has("coding") && (
            <li><strong>Coding Questions</strong>: estimated based on how many test cases your code passed.</li>
          )}
        </ul>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Any attempt of cheating was reported and may impact your final grade.
        </Typography>
      </Alert>
    );
  };

  if (!testId) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          No test selected.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate("/StudentDashboard")}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading expected grade...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate("/StudentDashboard")}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {renderWarnings()}

        <Typography variant="h5" color="secondary" gutterBottom>
          Estimated Grade until now: {expectedGrade ?? "N/A"}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={() => navigate("/StudentDashboard")}>
            Close evaluation
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ExpectedGradePage;
