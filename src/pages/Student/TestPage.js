import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import { useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";

const TestPage = () => {
  const { testId } = useParams();
  const [testData, setTestData] = useState(null);
  const [responses, setResponses] = useState([]); // Store responses for each question
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);

  const [outputs, setOutputs] = useState({}); // For storing output per question
  const [errors, setErrors] = useState({}); // For storing errors per question

  const [inputValue, setInputValue] = useState(""); // For user input
  const [output, setOutput] = useState(""); // For displaying output
  const [isWaitingForInput, setIsWaitingForInput] = useState(false); // To simulate input wait

  const [socket, setSocket] = useState(null); // WebSocket state
  const [currentIndex, setCurrentIndex] = useState(null); // To keep track of the current question index

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      const response = await fetch(`http://localhost:5000/test/${testId}`);
      const data = await response.json();
      setTestData(data);
      setLoading(false);

      const startTime = new Date(data.test.start_time).getTime();
      const durationInMs = data.test.duration * 60 * 1000;
      const endTime = startTime + durationInMs;

      const interval = setInterval(() => {
        const currentTime = new Date().getTime();
        const remainingTime = endTime - currentTime;

        if (remainingTime <= 0) {
          clearInterval(interval);
          alert("Time's up! Test is automatically submitted.");
          handleSubmit();
          setTimeLeft(0);
        } else {
          setTimeLeft(remainingTime);
        }
      }, 1000);

      setTimerInterval(interval);
    };

    fetchTestData();

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [testId, timerInterval]);

  // WebSocket connection setup
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");
  
    ws.onopen = () => {
      console.log("WebSocket connected");
    };
  
    ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data); // Log the received message
      const data = JSON.parse(event.data);
  
      // If output requires user input
      if (data.output && data.output.includes("Enter an integer")) {
        setIsWaitingForInput(true); // Allow the user to provide input
        setOutput(data.output); // Show the prompt message
      } else if (data.output) {
        setOutput(data.output); // Otherwise, show the output
        setIsWaitingForInput(false); // Don't allow further input once output is shown
      } else if (data.error) {
        setErrors((prev) => ({ ...prev, [data.index]: [data.error] }));
      }
    };
  
    setSocket(ws);
  
    return () => {
      ws.close();
    };
  }, []);
  
  

  // Handle the running of code for a specific question
  const handleRunCode = (index, code) => {
    setOutputs((prev) => ({ ...prev, [index]: "" }));
    setErrors((prev) => ({ ...prev, [index]: [] }));

    if (socket) {
      socket.send(
        JSON.stringify({
          code,
          input: inputValue, // Pass the user input here
          index,
        })
      );
    }
  };

  const handleInputForCode = () => {
    setIsWaitingForInput(false); // After providing input, continue execution
    setOutput("Program continuing after input...");
    setInputValue(""); // Clear input value
  
    // Resume code execution
    handleRunCode(currentIndex, responses[currentIndex]); // Ensure to run code for the correct question
  };
  

  // Handle the test submission
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const submissionData = {
      testId,
      responses,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/test/${testId}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        }
      );

      if (response.ok) {
        alert("Test submitted successfully!");
      } else {
        alert("Error submitting test.");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
    }
  };

  // Format time for display
  const formatTime = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: "80%", margin: "0 auto", padding: "20px", borderRadius: 2 }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: "bold", color: "#1976d2" }}>
        {testData.test.name}
      </Typography>

      <Typography variant="h6" color="textSecondary">
        Duration: {testData.test.duration} minutes
      </Typography>

      <Typography variant="h5" color="error" align="center" sx={{ mb: 4 }}>
        Time Left: {timeLeft !== null ? formatTime(timeLeft) : "Loading..."}
      </Typography>

      {testData.questions.map((question, index) => (
        <Card key={index} sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" color="#1976d2">
              Task {index + 1}: {question.task}
            </Typography>

            {question.category === "coding" ? (
              <>
                <MonacoEditor
                  height="400px"
                  language="java"
                  value={responses[index] || ""}
                  onChange={(value) => setResponses((prev) => {
                    const newResponses = [...prev];
                    newResponses[index] = value;
                    return newResponses;
                  })}
                  theme="vs-dark"
                  options={{
                    readOnly: false,
                    wordWrap: "on",
                    minimap: { enabled: false },
                    contextmenu: true,
                  }}
                  sx={{ mt: 3 }}
                />

                <Button
                  variant="outlined"
                  onClick={() => {
                    setCurrentIndex(index); // Set the current question index
                    handleRunCode(index, responses[index]);
                  }}
                  sx={{ mt: 2 }}
                >
                  Run Code
                </Button>

                <MonacoEditor
                  height="200px"
                  language="text"
                  value={output || ""}
                  theme="vs-dark"
                  options={{
                    readOnly: false,
                    wordWrap: "on",
                    minimap: { enabled: false },
                  }}
                  sx={{ mt: 3 }}
                />

                {isWaitingForInput && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                      The program is waiting for input...
                    </Typography>

                    <TextField
                      label="Provide Input"
                      variant="outlined"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      fullWidth
                      sx={{ mt: 2 }}
                    />

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleInputForCode}
                      sx={{ mt: 2 }}
                    >
                      Provide Input
                    </Button>
                  </>
                )}

                {errors[index] && errors[index].length > 0 && (
                  <Box sx={{ mt: 2, background: "#ffe6e6", p: 2, borderRadius: 1 }}>
                    <Typography color="error">Errors:</Typography>
                    {errors[index].map((err, idx) => (
                      <Typography key={idx} color="error">
                        Line {err.line}: {err.message}
                      </Typography>
                    ))}
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="body1">
                Answer this question in the text area.
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}

      <Box display="flex" justifyContent="center" sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ px: 5, py: 2, fontSize: "1.2rem" }}
        >
          Submit Test
        </Button>
      </Box>
    </Box>
  );
};

export default TestPage;
