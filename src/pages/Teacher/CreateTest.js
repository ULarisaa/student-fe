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
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const CreateTest = ({ courseId }) => {
  const navigate = useNavigate();

  const [testName, setTestName] = useState("");
  const [tasks, setTasks] = useState([
    {
      type: "coding",
      question: "",
      expectedOutput: [""],
      timeLimit: 10,
      useCustomTime: false,
      options: [],
      correctAnswers: [],
    },
  ]);
  const [overallTimeLimit, setOverallTimeLimit] = useState(60);
  const [useCustomTimePerTask, setUseCustomTimePerTask] = useState(false);

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
      type: "coding",
      question: "",
      expectedOutput: [""],
      timeLimit: 10,
      useCustomTime: false,
      options: [],
      correctAnswers: [],
    };
    setTasks([...tasks, newTask]);
  };

  const addOption = (taskIndex) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].options.push("");
    newTasks[taskIndex].correctAnswers.push(false);
    setTasks(newTasks);
  };

  const removeOption = (taskIndex, optionIndex) => {
    const newTasks = [...tasks];
    if (newTasks[taskIndex].options.length > 1 && optionIndex !== 0) {
      newTasks[taskIndex].options.splice(optionIndex, 1);
      newTasks[taskIndex].correctAnswers.splice(optionIndex, 1);
      setTasks(newTasks);
    }
  };

  const handleCorrectAnswerChange = (taskIndex, optionIndex) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].correctAnswers[optionIndex] = !newTasks[taskIndex].correctAnswers[optionIndex];
    setTasks(newTasks);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const testData = {
      name: testName,
      courseId,
      overallTimeLimit,
      tasks,
    };

    try {
      const response = await fetch(`http://localhost:5000/course/${courseId}/create-test`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
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

  const removeExpectedOutput = (taskIndex, outputIndex) => {
    const newTasks = [...tasks];
    if (newTasks[taskIndex].expectedOutput.length > 1 && outputIndex !== 0) {
      newTasks[taskIndex].expectedOutput.splice(outputIndex, 1);
      setTasks(newTasks);
    }
  };

  return (
    <Box sx={{ maxWidth: "80%", margin: "0 auto", padding: "20px",  borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
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
            InputProps={{ style: { borderColor: "#1976d2" } }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Number of Tasks</InputLabel>
            <Select
              value={tasks.length}
              onChange={(e) => setTasks(tasks.slice(0, e.target.value))}
              label="Number of Tasks"
              sx={{ borderColor: "#1976d2" }}
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
            control={
              <Switch
                checked={useCustomTimePerTask}
                onChange={handleCustomTimeToggle}
                color="primary"
              />
            }
            label="Use Custom Time Per Task"
          />
        </CardContent>
      </Card>

      {/* Task Cards */}
      {tasks.map((task, index) => (
        <Card key={index} sx={{ marginBottom: 3, padding: 3, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="#1976d2">
              Task {index + 1}
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={task.type}
                onChange={(e) => handleTaskTypeChange(index, e.target.value)}
                label="Task Type"
                sx={{ borderColor: "#1976d2" }}
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

                <div>
                  <Typography variant="subtitle1" color="#1976d2">Expected Output</Typography>
                  {task.expectedOutput.map((output, outputIndex) => (
                    <div key={outputIndex} style={{ marginBottom: "10px" }}>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={8}>
                          <TextField
                            label={`Expected Output ${outputIndex + 1}`}
                            value={output}
                            onChange={(e) => {
                              const newTasks = [...tasks];
                              newTasks[index].expectedOutput[outputIndex] = e.target.value;
                              setTasks(newTasks);
                            }}
                            fullWidth
                            required
                            multiline
                            rows={2}
                            sx={{ mb: 2 }}
                          />
                        </Grid>

                        <Grid item xs={2} sx={{ display: "flex", justifyContent: "center" }}>
                          <IconButton
                            onClick={() => removeExpectedOutput(index, outputIndex)}
                            color="error"
                            sx={{
                              visibility: outputIndex === 0 ? "hidden" : "visible",
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>

                        {task.expectedOutput.length < 5 && outputIndex === task.expectedOutput.length - 1 && (
                          <Grid item xs={2} sx={{ display: "flex", justifyContent: "center" }}>
                            <IconButton
                              onClick={() => {
                                const newTasks = [...tasks];
                                newTasks[index].expectedOutput.push("");
                                setTasks(newTasks);
                              }}
                              color="primary"
                            >
                              <AddCircleIcon />
                            </IconButton>
                          </Grid>
                        )}
                      </Grid>
                    </div>
                  ))}
                </div>
              </>
            )}

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

                <Typography variant="subtitle1" color="#1976d2">Options</Typography>
                {task.options.map((option, optionIndex) => (
                  <Grid container alignItems="center" key={optionIndex} sx={{ marginBottom: "10px" }}>
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
                        sx={{ mb: 2 }}
                      />
                    </Grid>

                    <Grid item xs={2} sx={{ display: "flex", justifyContent: "center" }}>
                      <IconButton
                        onClick={() => removeOption(index, optionIndex)}
                        color="error"
                        sx={{
                          visibility: optionIndex === 0 ? "hidden" : "visible",
                        }}
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
                      sx={{ marginTop: "10px" }}
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

      {/* Add Task Button - placed below tasks */}
      <Box display="flex" justifyContent="center" sx={{ marginBottom: 4 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={addNewTask}
          startIcon={<AddCircleIcon />}
          sx={{
            padding: "10px 20px",
            fontSize: "1rem",
            color: "#1976d2",
            borderColor: "#1976d2",
            ":hover": {
              backgroundColor: "#1976d2",
              color: "#fff",
            },
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
          sx={{ padding: "10px 20px", fontSize: "1.2rem", backgroundColor: "#1976d2" }}
        >
          Create Test
        </Button>
      </Box>
    </Box>
  );
};

export default CreateTest;
