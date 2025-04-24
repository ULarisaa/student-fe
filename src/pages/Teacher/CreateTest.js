import { useState } from "react";
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
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const CreateTest = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [testName, setTestName] = useState("");
  const [testDateTime, setTestDateTime] = useState("");
  const [tasks, setTasks] = useState([
    {
      type: "coding",
      question: "",
      testCases: [{ input: "", output: "" }],
      timeLimit: 10,
      useCustomTime: false,
      options: [],
      correctAnswers: [],
    },
  ]);
  const [overallTimeLimit, setOverallTimeLimit] = useState(60);
  const [useCustomTimePerTask, setUseCustomTimePerTask] = useState(false);

  const handleTestCaseChange = (taskIndex, testCaseIndex, field, value) => {
    const newTasks = [...tasks];
    const updatedTestCases = [...newTasks[taskIndex].testCases];
    updatedTestCases[testCaseIndex] = {
      ...updatedTestCases[testCaseIndex],
      [field]: value,
    };
    newTasks[taskIndex].testCases = updatedTestCases;
    setTasks(newTasks);
  };
  
  const handleTaskTypeChange = (index, type) => {
    const newTasks = [...tasks];
    newTasks[index].type = type;
    if (type !== "multiple-choice") {
      newTasks[index].options = [];
      newTasks[index].correctAnswers = [];
    }
    setTasks(newTasks);
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const handleCustomTimeToggle = (event) => {
    setUseCustomTimePerTask(event.target.checked);
    if (!event.target.checked) {
      const newTasks = tasks.map((task) => ({
        ...task,
        timeLimit: overallTimeLimit,
        useCustomTime: false,
      }));
      setTasks(newTasks);
    }
  };

  const handleOverallTimeLimitChange = (e) => {
    const newOverallTimeLimit = e.target.value;
    setOverallTimeLimit(newOverallTimeLimit);
    const newTasks = tasks.map((task) => {
      if (!task.useCustomTime) {
        task.timeLimit = newOverallTimeLimit;
      }
      return task;
    });
    setTasks(newTasks);
  };

  const addNewTask = () => {
    const newTask = {
      type: "multiple-choice",
      question: "",
      testCases: [{ input: "", output: "" }],
      timeLimit: 10,
      useCustomTime: false,
      options: [""], // Initialize with one empty option
      correctAnswers: [false], // Initialize with one false value (no correct answer selected)
    };
    
    setTasks([...tasks, newTask]);
  };

  const removeTask = (indexToRemove) => {
    setTasks((prevTasks) => prevTasks.filter((_, idx) => idx !== indexToRemove));
  };


  const removeOption = (taskIndex, optionIndex) => {
    const newTasks = [...tasks];
    if (newTasks[taskIndex].options.length > 1 && optionIndex !== 0) {
      newTasks[taskIndex].options.splice(optionIndex, 1);
      newTasks[taskIndex].correctAnswers.splice(optionIndex, 1);
      setTasks(newTasks);
    }
  };

  const addOption = (taskIndex) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].options.push(""); // Add new option
    newTasks[taskIndex].correctAnswers.push(false); // Add false to correctAnswers
    setTasks(newTasks);
  };
  
  const handleCorrectAnswerChange = (taskIndex, optionIndex) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].correctAnswers[optionIndex] = !newTasks[taskIndex].correctAnswers[optionIndex]; // Toggle correct answer
    setTasks(newTasks);
  };
  

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    console.log('Tasks:', tasks);


  
    // Make sure all required fields are included
    const testData = {
      name: testName, // test name
      courseId, // course ID
      startTime: testDateTime, // start time
      duration: overallTimeLimit, // duration of the test
      questions: tasks, // tasks array, which should be the list of questions
    };
  
    try {
      
      const response = await fetch(`http://localhost:5000/test/${courseId}/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData), // Send test data
       
      });
  
      if (response.ok) {
        alert("Test created successfully!");
        navigate(`/TeacherDashboard/courses/${courseId}`);
      } else {
        alert("Error creating test.");
      }
    } catch (error) {
      console.error("Error creating test:", error);
    }
  };
  

  return (
    <Box sx={{ maxWidth: "80%", margin: "0 auto", padding: "20px", borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold", color: "#1976d2" }}>
        Create New Test
      </Typography>

      <Card sx={{ marginBottom: 3, padding: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
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
            label="Date and Time"
            type="datetime-local"
            value={testDateTime}
            onChange={(e) => setTestDateTime(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true, style: { color: "#1976d2" } }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Number of Tasks</InputLabel>
            <Select
              value={tasks.length}
              onChange={(e) => {
                const newCount = parseInt(e.target.value);
                const currentCount = tasks.length;

                if (newCount > currentCount) {
                  const additionalTasks = Array.from({ length: newCount - currentCount }, () => ({
                    type: "coding",
                    question: "",
                    testCases: [{ input: "", output: "" }],
                    timeLimit: 10,
                    useCustomTime: false,
                    options: [],
                    correctAnswers: [],
                  }));
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
            <FormHelperText>Choose the number of tasks for the test</FormHelperText>
          </FormControl>

          {!useCustomTimePerTask && (
            <TextField
              label="Overall Time Limit (minutes)"
              type="number"
              value={overallTimeLimit}
              onChange={handleOverallTimeLimitChange}
              fullWidth
              required
              sx={{ mb: 2 }}
              InputLabelProps={{ style: { color: "#1976d2" } }}
            />
          )}

          <FormControlLabel
            control={<Switch checked={useCustomTimePerTask} onChange={handleCustomTimeToggle} color="primary" />}
            label="Use Custom Time Per Task"
          />
        </CardContent>
      </Card>

      {tasks.map((task, index) => (
        <Card key={index} sx={{ marginBottom: 3, padding: 3, borderRadius: 2, boxShadow: 3, position: "relative" }}>
          {/* Delete Task Button - placed at the bottom-right corner */}
          {index !== 0 && (
    <Box
      sx={{
        position: "absolute",
        bottom: 10, // Position at the bottom of the card
        left: 10, // Margin from the left
        right: 10, // Margin from the right
        display: "flex",
        justifyContent: "center", // Center the button horizontally
      }}
    >
      <Button
        onClick={() => removeTask(index)} // Calls removeTask function on click
        variant="contained"
        sx={{
          padding: "8px 16px",
          fontSize: "1rem",
          backgroundColor: "#f44336", // Red background color
          color: "#fff", // White text
          ":hover": {
            backgroundColor: "#d32f2f", // Darker red on hover
            color: "#fff", // Ensure the text stays white on hover
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
              <InputLabel>Task Type</InputLabel>
              <Select
                value={task.type}
                onChange={(e) => handleTaskTypeChange(index, e.target.value)}
                label="Task Type"
              >
                <MenuItem value="coding">Coding</MenuItem>
                <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                <MenuItem value="free-answer">Free Answer</MenuItem>
              </Select>
            </FormControl>

            {useCustomTimePerTask && (
              <TextField
                label="Time Limit (minutes)"
                type="number"
                value={task.timeLimit}
                onChange={(e) => handleTaskChange(index, "timeLimit", e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
            )}

            {/* Coding Task Section */}
            {task.type === "coding" && (
              <>
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

<Typography variant="subtitle1" color="#1976d2">
  Sample Test Cases
</Typography>

{task.testCases.map((testCase, testCaseIndex) => (
  <Grid container spacing={2} alignItems="center" key={testCaseIndex} sx={{ mb: 2 }}>
    <Grid item xs={5}>
      <TextField
        label={`Sample Input ${testCaseIndex + 1}`}
        value={testCase.input}
        onChange={(e) => {
          const newTasks = [...tasks];
          newTasks[index].testCases[testCaseIndex] = {
            ...newTasks[index].testCases[testCaseIndex],
            input: e.target.value
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
            output: e.target.value
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
      {testCaseIndex === task.testCases.length - 1 && task.testCases.length < 5 && (
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

            {/* Multiple Choice Section */}
            {task.type === "multiple-choice" && (
              <>
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

                <Typography variant="subtitle1" color="#1976d2">
                  Options
                </Typography>

                {task.options.map((option, optionIndex) => (
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
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton
                        onClick={() => handleCorrectAnswerChange(index, optionIndex)}
                        color={task.correctAnswers[optionIndex] ? "primary" : "default"}
                      >
                        {task.correctAnswers[optionIndex] ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                {task.options.length < 4 && (
                  <Box display="flex" justifyContent="center">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => addOption(index)}
                      startIcon={<AddCircleIcon />}
                      sx={{ mt: 1 }}
                    >
                      Add Option
                    </Button>
                  </Box>
                )}
              </>
            )}
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
          sx={{ px: 5, py: 2, fontSize: "1.2rem", backgroundColor: "#1976d2" }}
        >
          Create Test
        </Button>
      </Box>
    </Box>
  );
};

export default CreateTest;
