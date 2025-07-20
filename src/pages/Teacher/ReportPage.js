import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Box,
  Button,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  TextField,
  Slider,
  InputAdornment,
  Table, TableRow, 
  TableCell, TableHead, 
  TableBody
} from "@mui/material";
import ContentPasteOffIcon from '@mui/icons-material/ContentPasteOff';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MouseIcon from '@mui/icons-material/Mouse';
import MonacoEditor from "@monaco-editor/react";
import { Snackbar, Alert } from '@mui/material';
import CodeReplay from "../../components/CodeReplay";
import renderTaskWithCode from "../../components/RenderTaskWithCode";
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";


export default function ReportPage() {
  const { courseId, testName, studentId, testId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savedGrades, setSavedGrades] = useState({});
  const [testDetails, setTestDetails] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
const [gradeErrors, setGradeErrors] = useState({});
const [grades, setGrades] = useState({});
const [snackbar, setSnackbar] = useState({ open: false, message: "" });
const [initialGrades, setInitialGrades] = useState({});



  useEffect(() => {
    if (!testId) return;
    async function fetchTestDetails() {
  try {
    const res = await fetchWithRefresh(`http://localhost:5000/test/${testId}`);
    if (!res.ok) throw new Error("Failed to fetch test details");
    const data = await res.json();
    setTestDetails(data);
  } catch (error) {
    console.error(error);
  }
}

    fetchTestDetails();
  }, [testId]);

  useEffect(() => {
    if (!testId) return;
    async function fetchQuestions() {
      try {
        const res = await fetchWithRefresh(`http://localhost:5000/test/${testId}/questions`);
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        setQuestions(data);
        console.log(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingQuestions(false);
      }
    }
    fetchQuestions();
  }, [testId]);


  useEffect(() => {
    if (!(testId && studentId)) return;
    async function fetchSubmission() {
      try {
        const res = await fetchWithRefresh(
          `http://localhost:5000/testSubmissions/submission?test_id=${testId}&user_id=${studentId}`
        );
        if (!res.ok) throw new Error("Submission not found");
        const data = await res.json();
        setSubmission(data);
console.log(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSubmission();
  }, [testId, studentId]);


  useEffect(() => {
    if (!submission?.id) return;
    async function fetchAnswers() {
      try {
        const res = await fetchWithRefresh(`http://localhost:5000/testSubmissions/${submission.id}/answers`);
        if (!res.ok) throw new Error("Failed to fetch answers");
        const data = await res.json();
        setAnswers(data);
        console.log(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAnswers(false);
      }
    }
    fetchAnswers();
  }, [submission?.id]);

  const calculateFinalGrade = () => {
  if (!questionsWithAnswers || !questionsWithAnswers.length) {
    console.warn("No questions provided.");
    return 0;
  }

  const rawStartingGrade = testDetails?.test?.start_grade;
  const startingGrade = Number.isFinite(parseFloat(rawStartingGrade))
    ? parseFloat(rawStartingGrade)
    : 0;

  let sumGrades = 0;

  for (const question of questionsWithAnswers) {
    const rawManualGrade = grades[question.id];
    const numericGrade = parseFloat(rawManualGrade);

    if (!isNaN(numericGrade)) {
      sumGrades += numericGrade;
    } else {
      const fallbackGrade = parseFloat(question.expected_grade);
      if (!isNaN(fallbackGrade)) {
        sumGrades += fallbackGrade;
      } else {
        console.warn(`Grade missing for question ${question.id}`);
      }
    }
  }

  const finalGrade = startingGrade + sumGrades;
  return Math.max(0, Math.min(10, finalGrade));
};



  const handleReplay = () => {
    if (!currentQuestion.codeSnapshot?.length) return;
    setPlaying(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= currentQuestion.codeSnapshot.length) {
        clearInterval(interval);
        setPlaying(false);
        return;
      }
      setCurrentCodeIndex(i);
      i++;
    }, speed);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleSpeedChange = (_, newValue) => {
    setSpeed(newValue);
  };
const exitFullscreenCount = submission?.exit_fullscreen_count || 0;
const mouseLeftWindow = submission?.mouse_leave_count || 0;

const reasons = [];

if (exitFullscreenCount > 0) reasons.push("Exited fullscreen");
if (mouseLeftWindow > 0) reasons.push("Mouse left window");

const countOnes = reasons.length > 0 ? 1 : 0;

const autosubmitReason = reasons.length > 0 ? reasons.join(", ") : "unknown";



const questionsWithAnswers = questions.map((q) => {
  const answer = answers.find((a) => a.question_id === q.id);
  let parsedAnswer = null;

  if (answer) {
    try {
      if (q.category === "coding" && typeof answer.answer === "string") {
        parsedAnswer = JSON.parse(answer.answer);
      } else if (typeof answer.answer === "string") {
        parsedAnswer = JSON.parse(answer.answer);
      } else {
        parsedAnswer = answer.answer;
      }
    } catch {
      parsedAnswer = answer.answer;
    }
  }

  return {
    ...q,
    studentAnswer: parsedAnswer?.code ?? parsedAnswer ?? "",
    testsPassed: answer?.tests_passed ?? null,
    testsTotal: answer?.tests_total ?? null,
    grade: answer?.grade ?? null,
    expected_grade: answer?.expected_grade ?? null,
    testResults: answer?.test_results ?? [],
    antiCheatingMetrics: {
      typingSpeed: answer?.typing_speed || null,
      idleTimeBeforeTyping: answer?.idle_time?.seconds || null,
      answerTime: answer?.answer_time?.seconds || null,
    },
  };
});




useEffect(() => {
  if (questionsWithAnswers.length && Object.keys(grades).length === 0) {
    const initial = {};
    questionsWithAnswers.forEach((q) => {

      if (q.grade !== null && q.grade !== undefined) {
        initial[q.id] = parseFloat(q.grade);
      } else {

        const expected = parseFloat(q.expected_grade);
        if (!isNaN(expected)) {
          initial[q.id] = expected;
        }
      }
    });
    setGrades(initial);
    setInitialGrades(initial);
  }
}, [questionsWithAnswers]);



const gradesChanged = () => {
  const keys = Object.keys(initialGrades);
  for (let key of keys) {
    const current = parseFloat(grades[key]);
    const initial = parseFloat(initialGrades[key]);
    if (isNaN(current) || isNaN(initial)) return true;
    if (current !== initial) return true;
  }
  return false;
};


  const currentQuestion = questionsWithAnswers[currentQuestionIndex] || {};
  console.log(questionsWithAnswers);
const questionId = currentQuestion.id;

const handleGradeChange = (event, index) => {
  const val = event.target.value;
  const questionId = questionsWithAnswers[index].id;
  const maxPoints = questionsWithAnswers[index].points || 10;

  let errorsCopy = { ...gradeErrors };

  if (val === "") {
    delete errorsCopy[questionId];
    setGrades(prev => ({ ...prev, [questionId]: "" }));
    setGradeErrors(errorsCopy);
    return;
  }

  const numericVal = Number(val);

  if (isNaN(numericVal)) {
    errorsCopy[questionId] = "Invalid number";
  } else if (numericVal > maxPoints) {
    errorsCopy[questionId] = `Grade cannot be greater than ${maxPoints}`;
  } else if (numericVal < 0) {
    errorsCopy[questionId] = "Grade cannot be negative";
  } else {
    delete errorsCopy[questionId];
    setGrades(prev => ({ ...prev, [questionId]: numericVal }));
    setGradeErrors(errorsCopy);
    return;
  }

  setGrades(prev => ({ ...prev, [questionId]: val }));
  setGradeErrors(errorsCopy);
};
const handleSave = async () => {
  setLoadingSave(true);
  console.log(grades);
  try {
   await fetchWithRefresh("http://localhost:5000/testSubmissions/submission/save-grade", {
  method: "POST",
  body: JSON.stringify({
    submissionId: submission.id,
    grade: calculateFinalGrade(),
    questionGrades: grades,
  }),
});

    setSnackbar({ open: true, message: "Grade has been saved!", severity: "success" });


    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (err) {
    console.error(err);
    setSnackbar({ open: true, message: "Error saving grade", severity: "error" });
  } finally {
    setLoadingSave(false);
  }
};



  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loadingQuestions || loadingAnswers) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
        <Typography mt={2}>Loading...</Typography>
      </Box>
    );
  }

  

function getOptionStyles(isSelected, isCorrect) {
  if (isCorrect && isSelected) {
    return {
      bgColor: "#388e3c", 
      borderColor: "#1b5e20",
      icon: "✅",
      color: "white",
      fontWeight: "bold",
    };
  }
  if (isCorrect && !isSelected) {
    return {
      bgColor: "#81c784", 
      borderColor: "#4caf50",
      icon: null,
      color: "white",
      fontWeight: "bold",
    };
  }
  if (!isCorrect && isSelected) {
    return {
      bgColor: "#d32f2f",
      borderColor: "#b71c1c",
      icon: "❌",
      color: "black",
      fontWeight: "normal",
    };
  }

  return {
    bgColor: "#e0e0e0",
    borderColor: "#9e9e9e",
    icon: null,
    color: "black",
    fontWeight: "normal",
  };
}


const LegendItem = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{ width: 24, height: 24, bgcolor: color, borderRadius: 1 }} />
    <Typography>{label}</Typography>
  </Box>
);

 return (
  <Paper sx={{ p: 3, boxShadow: 4, borderRadius: 3, maxWidth: 1200, margin: "auto" }}>
    <Typography variant="h4" fontWeight="bold" align="center">
  {(submission?.first_name && submission?.last_name)
    ? `${submission.first_name} ${submission.last_name}`
    : "Student"}'s report for {testDetails?.test?.name || testName}
</Typography>


    <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="body2" color="text.secondary">Starting Grade</Typography>
        <Typography variant="h6" fontWeight="medium">
          {testDetails?.test?.start_grade ?? 'N/A'}
        </Typography>
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary">Final Grade</Typography>
        <Typography variant="h6" fontWeight="bold" color="primary">
          {calculateFinalGrade().toFixed(2)}
        </Typography>
      </Box>

  <Button
  variant="contained"
  color="primary"
  onClick={handleSave}
  disabled={
    loadingSave ||
    Object.keys(gradeErrors).length > 0 ||
    !gradesChanged()
  }
  sx={{ minWidth: 150 }}
>
  {loadingSave ? <CircularProgress size={24} /> : "Save"}
</Button>



    </Box>

   <Divider sx={{ my: 3 }} />

<Typography variant="h6" fontWeight="bold" gutterBottom>
  Anti-Cheating Metrics Summary for the Test
</Typography>

<Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, p: 2 }}>
  <CardContent>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <ContentPasteOffIcon color="warning" />
          <Typography>Copy/Paste Attempts: {submission?.copy_paste_attempts || 0}</Typography>
        </Box>
      </Grid>

      {countOnes === 1 ? (
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <ReportGmailerrorredIcon color="error" />
            <Typography color="error" fontWeight="medium">
              Test was auto-submitted due to <strong>{autosubmitReason}</strong>.
            </Typography>
          </Box>
        </Grid>
      ) : (
        <>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <FullscreenExitIcon color="action" />
              <Typography>Exit Fullscreen Events: {exitFullscreenCount}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <MouseIcon color="action" />
              <Typography>Mouse Left Window: {mouseLeftWindow}</Typography>
            </Box>
          </Grid>
        </>
      )}
    </Grid>
  </CardContent>
</Card>

<Divider sx={{ my: 3 }} />


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

  <Box sx={{ p: 3, borderRadius: 3, backgroundColor: "#fff", boxShadow: 2 }}>

  <Typography variant="h6" fontWeight="bold" gutterBottom>
    📝 Task {currentQuestionIndex + 1}:
  </Typography>

    {typeof currentQuestion.task === "string" ? (
    renderTaskWithCode(currentQuestion.task)
  ) : (
   <Typography variant="body1" gutterBottom>
    {currentQuestion.task}
  </Typography>
  )}
 

 <Box mt={3} maxWidth={300}>
  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
    🧮 Grade for this Question
  </Typography>


  {currentQuestion.expected_grade !== null && (
    <Typography variant="body2" color="textSecondary" mb={1}>
      Auto-graded: <strong>{currentQuestion.expected_grade}</strong> / {currentQuestion.points || 10}
    </Typography>
  )}


  {currentQuestion.grade !== undefined && currentQuestion.grade !== null && (
    <Typography variant="body2" color="textSecondary" mb={1}>
      Previous grade: <strong>{currentQuestion.grade}</strong> / {currentQuestion.points || 10}
    </Typography>
  )}


  
<TextField
  type="number"
  value={grades[questionId] !== undefined ? grades[questionId] : ""}
  onChange={(event) => handleGradeChange(event, currentQuestionIndex)}
  variant="outlined"
  size="small"
  fullWidth
  error={!!gradeErrors[questionId]}
  helperText={gradeErrors[questionId] || ""}
  inputProps={{
    max: currentQuestion.points || 10,
    min: 0,
    step: 1,
    style: { textAlign: "right" },
  }}
  InputProps={{
    endAdornment: <InputAdornment position="end">/ {currentQuestion.points}</InputAdornment>,
  }}
/>
</Box>

  <Divider sx={{ my: 2 }} />
 <Box mt={2}>
  <Typography variant="h6" fontWeight="bold" gutterBottom>
    🔒 Anti-Cheating Metrics
  </Typography>

  {currentQuestion.category !== "multiple_choice" && (
    <>
      <Typography variant="body2">
        Typing Speed: {(currentQuestion.antiCheatingMetrics?.typingSpeed / 60).toFixed(2)} chars/sec
      </Typography>
    </>
  )}
  <Typography variant="body2">
        Idle Time Before Answering: {currentQuestion.antiCheatingMetrics?.idleTimeBeforeTyping} sec
      </Typography>

  <Typography variant="body2">
    Answer Time: {currentQuestion.antiCheatingMetrics?.answerTime} sec
  </Typography>
</Box>

<Divider sx={{ my: 2 }} />


  {currentQuestion.category === "coding" && (
    <>

     
       <Typography variant="subtitle1" fontWeight="medium" color="primary" gutterBottom>
  ✅ Test Case Summary
</Typography>

<Typography variant="body1" gutterBottom>
  <strong>Passed Tests:</strong> {currentQuestion.testsPassed} / {currentQuestion.testsTotal}
</Typography>

<Table size="small" sx={{ borderRadius: 2, overflow: "hidden", mt: 1 }}>
  <TableHead>
    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
      <TableCell><strong>#</strong></TableCell>
      <TableCell><strong>Input</strong></TableCell>
      <TableCell><strong>Expected Output</strong></TableCell>
      <TableCell align="center"><strong>Status</strong></TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {(currentQuestion.testResults || []).map((test, index) => {
      return (
        <TableRow
          key={index}
          sx={{
            backgroundColor: test.passed ? "#e8f5e9" : "#ffebee",
            '&:last-child td, &:last-child th': { border: 0 }
          }}
        >
          <TableCell>{index + 1}</TableCell>
          <TableCell>{test.input}</TableCell>
          <TableCell>{test.expected}</TableCell>
          <TableCell align="center" sx={{ fontWeight: 600 }}>
            {test.passed ? "✅" : "❌"}
          </TableCell>
        </TableRow>
      );
    })}
  </TableBody>
</Table>



      <Card variant="outlined" sx={{ mt: 3, borderRadius: 3, boxShadow: 1, p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          💻 Submitted Code
        </Typography>
        <MonacoEditor
          height="400px"
          language="java"
          theme="vs-dark"
          value={currentQuestion.studentAnswer || ""}
          options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
        />
      </Card>


    <CodeReplay testId={testId} questionId={currentQuestion.id} studentId={studentId} />

    </>
  )}

  {currentQuestion.category === "multiple_choice" && (
  <>
    <Typography variant="h6" fontWeight="bold" gutterBottom>
      ✅ Review Answers
    </Typography>


    <Box sx={{ mb: 4,mt :3, display: "flex", gap: 3, flexWrap: "wrap" }}>
      <LegendItem color="#388e3c" label="Selected & Correct" />
      <LegendItem color="#81c784" label="Correct but not selected" />
      <LegendItem color="#d32f2f" label="Selected but Wrong" />
      <LegendItem color="#e0e0e0" label="Not selected & Wrong" />
    </Box>

    <Box>
      {(() => {
        let studentAnswers = [];
        if (Array.isArray(currentQuestion.studentAnswer)) {
          studentAnswers = currentQuestion.studentAnswer;
        } else {
          try {
            studentAnswers = JSON.parse(currentQuestion.studentAnswer);
          } catch {
            studentAnswers = [];
          }
        }

        return currentQuestion.options.map((optionText, index) => {
          const isSelected = studentAnswers[index] === true;
          const isCorrect = currentQuestion.correct_answers[index] === true;

          const {
            bgColor,
            borderColor,
            icon,
            color,
            fontWeight,
          } = getOptionStyles(isSelected, isCorrect);

          return (
            <Box
              key={index}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: 2,
                backgroundColor: bgColor,
                border: `2px solid ${borderColor}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color,
                fontWeight,
                fontSize: "1rem",
              }}
            >
              <Typography>
                {String.fromCharCode(65 + index)}. {optionText}
              </Typography>
              <Typography sx={{ fontSize: 24 }}>{icon}</Typography>
            </Box>
          );
        });
      })()}
    </Box>
  </>
)}






  {currentQuestion.category === "free_answer" && (
    <>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        ✍️ Student Answer
      </Typography>
      <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2, backgroundColor: "#fafafa" }}>
        <Typography>{currentQuestion.studentAnswer || "No answer submitted."}</Typography>
      </Box>
    </>
  )}
</Box>
   <Snackbar
         open={snackbar.open}
         autoHideDuration={6000}
         onClose={handleCloseSnackbar}
         anchorOrigin={{ vertical: "top", horizontal: "center" }} 
       >
         <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
           {snackbar.message}
         </Alert>
       </Snackbar>
  </Paper>

  
);

}
