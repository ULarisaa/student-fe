import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Typography, Paper, Box, Button, Divider, Slider, TextField, CircularProgress, Stepper, Step, StepLabel } from "@mui/material";
import MonacoEditor from "@monaco-editor/react";

export default function ReportPage() {
  const { courseId, testName, studentId } = useParams();

  const initialReport = {
    name: "Alice Johnson",
    testName,
    questions: [
      {
        id: 1,
        questionText: "Write a function to sum two numbers",
        grade: 8,
        feedback: "Good work, but could optimize the function",
        codeSnapshot: [
          { timestamp: "00:05", code: "function sum(a, b) {\n" },
          { timestamp: "00:10", code: "function sum(a, b) {\n  return a + b;\n" },
        ],
        antiCheatingMetrics: {
          typingSpeed: "40 WPM",
          copyPasteEvents: 1,
          escKeyPresses: 0,
          idleTimeBeforeTyping: "20s",
        },
      },
      {
        id: 2,
        questionText: "Write a function to find the largest number in an array",
        grade: 7,
        feedback: "Needs improvement, the edge case is not handled",
        codeSnapshot: [
          { timestamp: "00:05", code: "function findLargest(arr) {\n" },
          { timestamp: "00:10", code: "function findLargest(arr) {\n  return Math.max(...arr);\n" },
        ],
        antiCheatingMetrics: {
          typingSpeed: "35 WPM",
          copyPasteEvents: 2,
          escKeyPresses: 1,
          idleTimeBeforeTyping: "15s",
        },
      },
    ],
    metrics: {
      typingSpeed: "40 WPM",
      copyPasteEvents: 1,
      escKeyPresses: 1,
      idleTimeBeforeTyping: "20s",
    },
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0); // Track the index of the code snapshots
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // Default speed of 1000ms (1 second per snapshot)
  const [loading, setLoading] = useState(false); // Loading state for save button
  const [questions, setQuestions] = useState(initialReport.questions);
  const [savedGrades, setSavedGrades] = useState({}); // State for grade and feedback for each question
  const [navigationHistory, setNavigationHistory] = useState([  // Hardcoded navigation events
    { timestamp: "12:00 PM", action: "Navigated to Question 1" },
    { timestamp: "12:05 PM", action: "Navigated to Question 2" },
    { timestamp: "12:10 PM", action: "Navigated to Question 1" },
    { timestamp: "12:20 PM", action: "Copy/Paste Attempt" },
    { timestamp: "12:25 PM", action: "Auto-submitted [ESC]" },
  ]);
  const activeStep = 0;


  useEffect(() => {
    if (playing && currentCodeIndex < currentQuestion.codeSnapshot.length - 1) {
      const timeout = setTimeout(() => {
        setCurrentCodeIndex(currentCodeIndex + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentCodeIndex, playing, speed]);

  useEffect(() => {
    if (Object.keys(savedGrades).length > 0) {
      localStorage.setItem("savedGrades", JSON.stringify(savedGrades));
    }
  }, [savedGrades]);

  const handleReplay = () => {
    setCurrentCodeIndex(0); // Start replay from the first snapshot for the current question
    setPlaying(true); // Start the replay for the current question
  };

  const handlePause = () => {
    setPlaying(false); // Pause the replay
  };

  const handleSpeedChange = (event, newValue) => {
    setSpeed(newValue); // Update the replay speed
  };

  const handleGradeChange = (event, questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].grade = event.target.value;
    setQuestions(newQuestions);
    saveGradeAndFeedback(questionIndex);
  };

  const handleFeedbackChange = (event, questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].feedback = event.target.value;
    setQuestions(newQuestions);
    saveGradeAndFeedback(questionIndex);
  };

  const saveGradeAndFeedback = (questionIndex) => {
    const currentQuestion = questions[questionIndex];
    setSavedGrades((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        grade: currentQuestion.grade,
        feedback: currentQuestion.feedback,
      },
    }));
  };

  const handleSave = () => {
    setLoading(true); // Set loading state to true when save starts

    // Simulate saving the grade and feedback
    setTimeout(() => {
      console.log("Saving data:", savedGrades);
      setLoading(false);
      alert("Grade and feedback saved successfully!");
    }, 2000); // Simulating an API call with a delay of 2 seconds
  };

  const calculateFinalGrade = () => {
    const totalGrade = questions.reduce((sum, question) => sum + parseInt(question.grade), 0);
    return totalGrade / questions.length;
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Paper sx={{ p: 3, boxShadow: 4, borderRadius: 3, maxWidth: 1200, margin: "auto" }}>
      <Typography variant="h4" fontWeight="bold" align="center">
        {initialReport.name}'s Report for {initialReport.testName}
      </Typography>

      {/* Final Grade and Save Button at the Top */}
      <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">
          Final Grade: {calculateFinalGrade().toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Save All Grades & Feedback"}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Navigation Timeline (Read-Only Stepper) */}
      <Box mt={2}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Navigation Timeline:
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel>
  {navigationHistory.map((event, index) => (
    <Step key={index} disabled>
         <StepLabel
            StepIconComponent={() => (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  fontSize: 14,
                }}
              >
                {index + 1} {/* Number of the step */}
              </Box>
            )}
          >
        {`${event.timestamp} - ${event.action}`}
      </StepLabel>
    </Step>
  ))}
</Stepper>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Navigate through Questions */}
      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="contained"
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
        >
          Previous Question
        </Button>
        <Button
          variant="contained"
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next Question
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Question Details */}
      <Typography variant="h6" gutterBottom>
        {currentQuestion.questionText}
      </Typography>

      {/* Grade for Current Question */}
      <Box mt={2}>
        <Typography variant="body1" fontWeight="bold">
          Grade for this Question:
        </Typography>
        <TextField
          type="number"
          value={currentQuestion.grade}
          onChange={(event) => handleGradeChange(event, currentQuestionIndex)}
          fullWidth
          inputProps={{ min: 0, max: 10 }}
        />
      </Box>

      {/* Feedback for Current Question */}
      <Box mt={2}>
        <Typography variant="body1" fontWeight="bold">
          Feedback for this Question:
        </Typography>
        <TextField
          variant="outlined"
          value={currentQuestion.feedback}
          onChange={(event) => handleFeedbackChange(event, currentQuestionIndex)}
          multiline
          rows={4}
          fullWidth
        />
      </Box>

      {/* Anti-Cheating Metrics */}
      <Box mt={3}>
        <Typography variant="h6" fontWeight="bold">
          Anti-Cheating Metrics for This Question:
        </Typography>
        <Typography variant="body2">
          Typing Speed: {currentQuestion.antiCheatingMetrics.typingSpeed}
        </Typography>
        <Typography variant="body2">
          Copy-Paste Events: {currentQuestion.antiCheatingMetrics.copyPasteEvents}
        </Typography>
        <Typography variant="body2">
          ESC Key Presses: {currentQuestion.antiCheatingMetrics.escKeyPresses}
        </Typography>
        <Typography variant="body2">
          Idle Time Before Typing: {currentQuestion.antiCheatingMetrics.idleTimeBeforeTyping}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Replay Code */}
      <Typography variant="h6" gutterBottom>
        Code Replay for this Question
      </Typography>
      <MonacoEditor
        height="400px"
        language="javascript"
        theme="vs-dark"
        value={currentQuestion.codeSnapshot[currentCodeIndex]?.code || ""}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          lineNumbers: "on",
        }}
      />

      <Box mt={2}>
        <Typography variant="body2">
          Timestamp: {currentQuestion.codeSnapshot[currentCodeIndex]?.timestamp || "00:00"}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Replay Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="contained"
          onClick={handleReplay}
          disabled={playing}
        >
          {playing ? "Replaying..." : "Replay Code"}
        </Button>
        <Button
          variant="contained"
          onClick={handlePause}
          disabled={!playing}
        >
          Pause
        </Button>
      </Box>

      {/* Speed Slider */}
      <Box mt={2}>
        <Typography variant="body2">Adjust Replay Speed</Typography>
        <Slider
          value={speed}
          min={500}
          max={5000}
          step={500}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value / 1000} sec`}
          onChange={handleSpeedChange}
        />
      </Box>
    </Paper>
  );
}