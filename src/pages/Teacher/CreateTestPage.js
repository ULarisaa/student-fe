import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Grid,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,Divider, 
  Snackbar, 
  Alert
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { AddCircleOutline } from '@mui/icons-material';
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";


const CreateTest = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
const [allowSwitch, setAllowSwitch] = useState(false);
const [timeLimitError, setTimeLimitError] = useState("");
 const location = useLocation();
  const courseName = location.state?.courseName || 'Unknown Course';
  const [testName, setTestName] = useState("");
  const [testStartTime, setTestStartTime] = useState("");
  const [testEndTime, setTestEndTime] = useState("");
  const [startingGrade, setStartingGrade] = useState(0);
  const [overallTimeLimit, setOverallTimeLimit] = useState("00:00:00");
 const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

const [tasks, setTasks] = useState([
  {
    type: "coding",
    question: "",
    testCases: [{ input: "", output: "" }],
    timeLimit: "00:00:00",
    options: [""],
    correctAnswers: [],
    points: 0,
  },
]);


  
  const [useCustomTimePerTask, setUseCustomTimePerTask] = useState(false);

const validateTimeLimits = () => {
  if (!testStartTime || !testEndTime) {
    setTimeLimitError("");
    return true;
  }

  const start = new Date(testStartTime);
  const end = new Date(testEndTime);
  if (isNaN(start) || isNaN(end) || end <= start) {
    setTimeLimitError("Invalid start or end time.");
    return false;
  }

  const maxDuration = Math.floor((end - start) / 1000); 

  if (useCustomTimePerTask) {
    const sumTaskSeconds = tasks.reduce((acc, task) => {
      const sec = parseTimeToSeconds(task.timeLimit) || 0;
      return acc + sec;
    }, 0);

    const newTasks = [...tasks];
    newTasks.forEach(t => (t.timeLimitError = ""));

    if (sumTaskSeconds > maxDuration) {
      const testDurationStr = formatSecondsToTime(maxDuration);
      const tasksDurationStr = formatSecondsToTime(sumTaskSeconds);
      newTasks.forEach(t => {
        t.timeLimitError = `The total time of all tasks of ${tasksDurationStr} (HH:MM:SS) exceeds the test duration of ${testDurationStr} (HH:MM:SS). Please adjust the limits.`;
      });
      setTasks(newTasks);
      setTimeLimitError("");
      return false;
    } else {
      setTasks(newTasks);
    }
  } else {
    const overallSeconds = parseTimeToSeconds(overallTimeLimit);
    if (overallSeconds === null) {
      setTimeLimitError("Overall time limit format is invalid.");
      return false;
    }

    if (overallSeconds > maxDuration) {
     const testDurationStr = formatSecondsToTime(maxDuration);
const overallLimitStr = formatSecondsToTime(overallSeconds);

      setTimeLimitError(`Overall time limit of ${overallLimitStr} (HH:MM:SS) exceeds the test duration  of ${testDurationStr} (HH:MM:SS). Please adjust it.`);
      return false;
    }

    setTimeLimitError("");
  }

  return true;
};



 const handleTaskTypeChange = (index, newType) => {
  console.log(newType);
  setTasks((prevTasks) => {
    const updatedTasks = [...prevTasks];
    const updatedTask = { ...updatedTasks[index], type: newType };

  
    if (newType === "coding") {
      updatedTask.testCases = [{ input: "", output: "" }];
      updatedTask.options = [""];
      updatedTask.correctAnswers = [];
    } else if (newType === "multiple_choice") {
      updatedTask.options = [""];
      updatedTask.correctAnswers = [];
      updatedTask.testCases = []; 
    } else if (newType === "free_answer") {
      updatedTask.options = [""];
      updatedTask.correctAnswers = [];
      updatedTask.testCases = []; 
    }

    updatedTasks[index] = updatedTask;
    return updatedTasks;
  });
};

const handleTaskChange = (index, field, value) => {
  const newTasks = [...tasks];
  newTasks[index][field] = value;

  if (field === 'options') {
    const optionCount = value.length;
    const oldAnswers = newTasks[index].correctAnswers || [];

    const newAnswers = [];
    for (let i = 0; i < optionCount; i++) {
 
      newAnswers[i] = oldAnswers[i] !== undefined ? oldAnswers[i] : false;
    }
    newTasks[index].correctAnswers = newAnswers;
  }

  setTasks(newTasks);
};


const handleCustomTimeToggle = (event) => {
  const checked = event.target.checked;
  setUseCustomTimePerTask(checked);

  if (!checked) {
    
    const newTasks = tasks.map(task => ({
      ...task,
      useCustomTime: false,
    }));
    setTasks(newTasks);
    setAllowSwitch(false);
  } else {

    const newTasks = tasks.map(task => ({
      ...task,
      useCustomTime: true,
    }));
    setTasks(newTasks);
    setAllowSwitch(false);
  }
};



function parseTimeToSeconds(timeStr) {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) {

    const [minutes, seconds] = parts;
    if (
      Number.isInteger(minutes) && minutes >= 0 &&
      Number.isInteger(seconds) && seconds >= 0 && seconds < 60
    ) {
      return minutes * 60 + seconds;
    }
  } else if (parts.length === 3) {

    const [hours, minutes, seconds] = parts;
    if (
      Number.isInteger(hours) && hours >= 0 &&
      Number.isInteger(minutes) && minutes >= 0 && minutes < 60 &&
      Number.isInteger(seconds) && seconds >= 0 && seconds < 60
    ) {
      return hours * 3600 + minutes * 60 + seconds;
    }
  }
  return null; 
}

function formatSecondsToTime(seconds) {
  if (typeof seconds !== 'number' || seconds <= 0) return "00:00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


const handleOverallTimeLimitChange = (e) => {
  const value = e.target.value;
  setOverallTimeLimit(value);

  const seconds = parseTimeToSeconds(value);
  if (seconds === null) {
    setTimeLimitError("Invalid time format. Use HH:MM:SS or MM:SS");
    return;
  }

  validateTimeLimits();
};
const handleTaskTimeLimitChange = (index, value) => {
  const seconds = parseTimeToSeconds(value);
  const newTasks = [...tasks];

  newTasks[index].timeLimit = value;

  if (seconds === null) {
    newTasks[index].timeLimitError = 'Formatul trebuie să fie HH:MM:SS sau MM:SS';
  } else {
    newTasks[index].timeLimitError = '';
  }

  setTasks(newTasks);

  validateTimeLimits();
};





const addNewTask = () => {
  const newTask = {
    type: "multiple_choice",
    question: "",
    testCases: [{ input: "", output: "" }],
    timeLimit: "00:00:00",
    options: [""],
    correctAnswers: [false],
    points: 0,
  };
  setTasks([...tasks, newTask]);
};


  const removeTask = (indexToRemove) => {
    setTasks((prevTasks) => prevTasks.filter((_, idx) => idx !== indexToRemove));
  };
const removeOption = (taskIndex, optionIndex) => {
  const newTasks = [...tasks];
  const task = newTasks[taskIndex];

  if (task.options.length > 1) {
    task.options.splice(optionIndex, 1);
    task.correctAnswers.splice(optionIndex, 1);

    while (task.correctAnswers.length < task.options.length) {
      task.correctAnswers.push(false);
    }
    while (task.correctAnswers.length > task.options.length) {
      task.correctAnswers.pop();
    }

    setTasks(newTasks);
  }
};


  const addOption = (taskIndex) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].options.push(""); 
    newTasks[taskIndex].correctAnswers.push(false);
    setTasks(newTasks);
  };
  
const handleCorrectAnswerChange = (taskIndex, optionIndex) => {
  const newTasks = [...tasks];
  newTasks[taskIndex].correctAnswers[optionIndex] = !newTasks[taskIndex].correctAnswers[optionIndex];
  setTasks(newTasks);
};
useEffect(() => {
  validateTimeLimits();

}, [testStartTime, testEndTime, overallTimeLimit, useCustomTimePerTask]); 

const handleSubmit = async () => {
  const token = localStorage.getItem("token");

  const syncedTasks = tasks.map(task => {
    if (task.type === 'multiple_choice' && task.options) {
      const correctAnswers = Array(task.options.length).fill(false);
      for (let i = 0; i < task.options.length; i++) {
        correctAnswers[i] = task.correctAnswers?.[i] || false;
      }
      return { ...task, correctAnswers };
    }
    return task;
  });

  const testData = {
    name: testName,
    courseId,
    startTime: testStartTime,
    endTime: testEndTime,
    duration: useCustomTimePerTask ? 0 : parseTimeToSeconds(overallTimeLimit),
    allowSwitch,
    start_grade: startingGrade,
    questions: syncedTasks.map(task => ({
      ...task,
      timeLimit: useCustomTimePerTask ? parseTimeToSeconds(task.timeLimit) : undefined,
    })),
  };

  try {
  const response = await fetchWithRefresh(`http://localhost:5000/test/${courseId}/create`, {
  method: "POST",
  body: JSON.stringify(testData),
});


    if (response.ok) {
      setSnackbar({ open: true, message: "Test created successfully!", severity: "success" });

setTimeout(() => {
  navigate(`/TeacherDashboard`);
}, 2000);  

    } else {
      setSnackbar({ open: true, message: "Error creating test.", severity: "error" });
    }
  } catch (error) {
    console.error("Error creating test:", error);
    setSnackbar({ open: true, message: "Network or server error.", severity: "error" });
  }
};

  
const totalPointsIncludingStartingGrade = startingGrade + tasks.reduce((acc, t) => acc + (t.points || 0), 0);

const isFormValid = () => {
  if (
    !testName.trim() ||
    !testStartTime ||
    !testEndTime ||
    (!useCustomTimePerTask && (!overallTimeLimit || parseTimeToSeconds(overallTimeLimit) === null)) ||
    startingGrade === null ||
    tasks.length === 0
  ) {
    return false;
  }

  for (const task of tasks) {
    if (
      !task.question.trim() ||
      task.points === undefined ||
      task.points < 0 ||
      (useCustomTimePerTask && (!task.timeLimit || parseTimeToSeconds(task.timeLimit) === null))
    ) {
      return false;
    }

    if (task.type === "coding") {
      if (
        task.testCases.length === 0 ||
        task.testCases.some(tc => !tc.input.trim() || !tc.output.trim())
      ) {
        return false;
      }
    }

    if (task.type === "multiple_choice") {
      if (
        task.options.length === 0 ||
        task.options.some(opt => !opt.trim()) ||
        task.correctAnswers.length === 0
      ) {
        return false;
      }
    }
  }

  return true;
};

 return (
  <Box sx={{ maxWidth: "80%", margin: "0 auto", padding: "20px", borderRadius: 2 }}>
<Card sx={{ marginBottom: 3, padding: 3, borderRadius: 3, boxShadow: 3 }}>
  <CardContent>
    <Typography
      variant="h4"
      gutterBottom
      sx={{ fontWeight: "bold", color: "#1976d2" }}
    
    >
      Create New Test for {courseName}
    </Typography>
    <Divider sx={{ mb: 3 }} />

    <TextField
      label="Test Name"
      value={testName}
      onChange={(e) => setTestName(e.target.value)}
      fullWidth
      required
      sx={{ mb: 2 }}
      InputLabelProps={{ style: { color: "#1976d2" } }}
    />

    <TextField
      label="Valid from "
      type="datetime-local"
      value={testStartTime}
      onChange={(e) => setTestStartTime(e.target.value)}
      fullWidth
      required
      sx={{ mb: 2 }}
      InputLabelProps={{ shrink: true, style: { color: "#1976d2" } }}
    />

    <TextField
      label="Valid until "
      type="datetime-local"
      value={testEndTime}
      onChange={(e) => setTestEndTime(e.target.value)}
      fullWidth
      required
      sx={{ mb: 2 }}
      InputLabelProps={{ shrink: true, style: { color: "#1976d2" } }}
    />

    {!useCustomTimePerTask && (
      <TextField
        label="Overall Time Limit (HH:MM:SS)"
        type="text"
        value={overallTimeLimit}
        onChange={e => {
          const val = e.target.value;
          setOverallTimeLimit(val);

          if (parseTimeToSeconds(val) === null) {
            setTimeLimitError('Formatul trebuie să fie HH:MM:SS sau MM:SS');
          } else {
            setTimeLimitError('');
          }
        }}
        fullWidth
        required
        error={Boolean(timeLimitError)}
        helperText={timeLimitError}
        sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: "#1976d2" } }}
      />
    )}

    <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Switch
              checked={useCustomTimePerTask}
              onChange={handleCustomTimeToggle}
              color="primary"
            />
          }
          label="Use custom time per task"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Switch
              checked={allowSwitch}
              onChange={(e) => setAllowSwitch(e.target.checked)}
              color="primary"
              disabled={useCustomTimePerTask}
            />
          }
          label="Allow switching between tasks"
        />
      </Grid>
    </Grid>

    <TextField
      label="Starting Grade"
      type="number"
      value={startingGrade}
      onChange={(e) => setStartingGrade(parseFloat(e.target.value))}
      fullWidth
      required
      sx={{ mb: 2 }}
      InputLabelProps={{ style: { color: "#1976d2" } }}
      InputProps={{
        inputProps: { min: 0 },
      }}
    />

    <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
      <InputLabel>Number of Tasks</InputLabel>
      <Select
        value={tasks.length}
        onChange={(e) => {
          const newCount = parseInt(e.target.value, 10);
          const currentCount = tasks.length;

          if (newCount > currentCount) {
            const additionalTasks = Array.from(
              { length: newCount - currentCount },
              () => ({
                type: "coding",
                question: "",
                testCases: [{ input: "", output: "" }],
                timeLimit: "00:00:00",
                useCustomTime: false,
                options: [""],
                correctAnswers: [],
              })
            );
            setTasks([...tasks, ...additionalTasks]);
          } else {
            setTasks(tasks.slice(0, newCount));
          }
        }}
        label="Number of Tasks"
      >
        {[...Array(10).keys()].map((num) => (
          <MenuItem key={num + 1} value={num + 1}>
            {num + 1}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </CardContent>
</Card>


    {tasks.map((task, index) => (
      <Card
        key={index}
        sx={{
          marginBottom: 3,
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
          position: "relative",
        }}
      >
    
        {index !== 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: 10,
              right: 10,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              onClick={() => removeTask(index)}
              variant="contained"
              sx={{
                padding: "8px 16px",
                fontSize: "1rem",
                backgroundColor: "#f44336",
                color: "#fff",
                ":hover": {
                  backgroundColor: "#d32f2f",
                  color: "#fff",
                },
              }}
            >
              <DeleteIcon sx={{ marginRight: 1 }} />
              Delete Task
            </Button>
          </Box>
        )}

        <CardContent sx={{ paddingTop: 4 }}>
          <Typography variant="h6" gutterBottom color="#1976d2">
            Task {index + 1}
          </Typography>

       <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel sx={{ color: "#1976d2" }}>Task Type</InputLabel>
  <Select
    value={task.type}
    onChange={(e) => handleTaskTypeChange(index, e.target.value)}
    label="Task Type"
    sx={{
      '& .MuiSelect-icon': { color: '#1976d2' }, 
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1976d2',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1976d2',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1976d2',
      },
    }}
  >
    <MenuItem value="coding">Coding</MenuItem>
    <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
    <MenuItem value="free_answer">Free Answer</MenuItem>
  </Select>
</FormControl>


  {useCustomTimePerTask && (
  <TextField
    label="Time Limit (HH:MM:SS)"
    value={task.timeLimit}
    onChange={(e) => handleTaskTimeLimitChange(index, e.target.value)}
    fullWidth
    sx={{ mb: 2 }}
    error={!!task.timeLimitError}
    helperText={task.timeLimitError}
    InputLabelProps={{ style: { color: "#1976d2" } }}
  />
)}





           <TextField
                label="Question"
                value={task.question}
                onChange={(e) => handleTaskChange(index, "question", e.target.value)}
                fullWidth
                required
                multiline
                rows={4}
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: "#1976d2" } }}
              />
<TextField
  label="Points for this Task"
  type="number"
  value={task.points}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    handleTaskChange(index, "points", value);
  }}
  fullWidth
  required
  InputLabelProps={{ style: { color: "#1976d2" } }}
  InputProps={{
    inputProps: { min: 0 },
  }}
  sx={{ mb: 2 }}
  helperText={`Total of points set until now: ${
    startingGrade + tasks.slice(0, index + 1).reduce((sum, t) => sum + (t.points || 0), 0)
  }`}
/>




          {task.type === "coding" && (
            <>
             

              <Typography variant="subtitle1" color="#1976d2">
                Sample Test Cases
              </Typography>

              {task.testCases.map((testCase, testCaseIndex) => (
                <Grid
                  container
                  spacing={2}
                  alignItems="center"
                  key={testCaseIndex}
                  sx={{ mb: 2 }}
                >
                  <Grid item xs={5}>
                    <TextField
                      label={`Sample Input ${testCaseIndex + 1}`}
                      value={testCase.input}
                      onChange={(e) => {
                        const newTasks = [...tasks];
                        newTasks[index].testCases[testCaseIndex] = {
                          ...newTasks[index].testCases[testCaseIndex],
                          input: e.target.value,
                        };
                        setTasks(newTasks);
                      }}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      label={`Expected Output ${testCaseIndex + 1}`}
                      value={testCase.output}
                      onChange={(e) => {
                        const newTasks = [...tasks];
                        newTasks[index].testCases[testCaseIndex] = {
                          ...newTasks[index].testCases[testCaseIndex],
                          output: e.target.value,
                        };
                        setTasks(newTasks);
                      }}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton
                      onClick={() => {
                        const newTasks = [...tasks];
                        newTasks[index].testCases.splice(testCaseIndex, 1);
                        setTasks(newTasks);
                      }}
                      color="error"
                      sx={{ visibility: testCaseIndex === 0 ? "hidden" : "visible" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {testCaseIndex === task.testCases.length - 1 &&
                      task.testCases.length < 5 && (
                        <IconButton
                          onClick={() => {
                            const newTasks = [...tasks];
                            newTasks[index].testCases.push({ input: "", output: "" });
                            setTasks(newTasks);
                          }}
                          color="primary"
                        >
                          <AddCircleIcon />
                        </IconButton>
                      )}
                  </Grid>
                </Grid>
              ))}
            </>
          )}


          {task.type === "multiple_choice"  &&
            task.options.map((option, optionIndex) => (
              <Grid container alignItems="center" key={optionIndex} sx={{ mb: 1 }}>
                <Grid item xs={8}>
                  <TextField
                    label={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newTasks = [...tasks];
                      newTasks[index].options[optionIndex] = e.target.value;
                      setTasks(newTasks);
                    }}
                    fullWidth
                    required
                    sx={{mb: 1}}
                  />
                </Grid>

                <Grid item xs={2}>
                  <IconButton
                    onClick={() => removeOption(index, optionIndex)}
                    color="error"
                    sx={{ visibility: optionIndex === 0 ? "hidden" : "visible" }}
                  >
                    <DeleteIcon />
                  </IconButton>

                  {optionIndex === task.options.length - 1 &&
                     (
                      <IconButton onClick={() => addOption(index)} color="primary">
                        <AddCircleIcon />
                      </IconButton>
                    )}
                </Grid>

                <Grid item xs={2}>
                  <IconButton
                    onClick={() => handleCorrectAnswerChange(index, optionIndex)}
                    color={task.correctAnswers[optionIndex] ? "primary" : "default"}
                  >
                    {task.correctAnswers[optionIndex] ? (
                      <CheckCircleIcon />
                    ) : (
                      <RadioButtonUncheckedIcon />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
            ))}
        </CardContent>
      </Card>
    ))}

    <Box display="flex" justifyContent="center" sx={{ mb: 4 }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={addNewTask}
        startIcon={<AddCircleIcon />}
        sx={{
          px: 4,
          py: 1.5,
          fontSize: "1rem",
          borderColor: "#1976d2",
          color: "#1976d2",
          ":hover": { backgroundColor: "#1976d2", color: "#fff" },
        }}
      >
        Add Task
      </Button>
    </Box>

    <Box display="flex" justifyContent="center">
<Button
  variant="contained"
  color="primary"
  onClick={handleSubmit}
  fullWidth
  disabled={!isFormValid()}
  sx={{
    backgroundColor: '#1976d2',
    '&:hover': { backgroundColor: '#1565c0' },
    padding: '12px',
    fontWeight: 'bold',
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <AddCircleOutline sx={{ marginRight: 1 }} /> Create Test
</Button>

    </Box>
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

};

export default CreateTest;
