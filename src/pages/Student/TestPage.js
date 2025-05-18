import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  TableCell,
  TableRow, 
  TableHead,
  Table, 
  TableBody
} from "@mui/material";
import { ArrowBack, ArrowForward, AccessTime } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";

const PROMPT_REGEX = /(Enter.*?:\s*)/;

export default function TestPage() {
  const { testId } = useParams();
  const [testData, setTestData] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [output, setOutput] = useState({});
  const [errors, setErrors] = useState({});
  const [chosenCase, setChosenCase] = useState({});
  const [sampleInputUsed, setSampleInputUsed] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const navigate = useNavigate();

  // State to track debounced responses
  const [debouncedResponses, setDebouncedResponses] = useState([]);

  // Regular update interval (in milliseconds)
  const updateInterval = 5000; // 5 seconds

  useEffect(() => {
    const elem = document.documentElement;
    const requestFs = () => {
      elem.requestFullscreen?.().catch(() => {});
    };

    requestFs();
    const handleFullscreenChange = async () => {
      if (!document.fullscreenElement) {
        showSnackbar("You exited fullscreen. The test will be submitted.", "warning");
        await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for snackbar
        await handleSubmit();
        navigate("/StudentDashboard");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [navigate]);

  /*const preventCopyPaste = (e) => {
    if ((e.ctrlKey && e.key === "c") || (e.ctrlKey && e.key === "v")) {
      e.preventDefault();
      showSnackbar("Copy and paste actions are restricted. This event will be reported.", "warning");
    }
  };

  useEffect(() => {
    // Attach event listener for copy-paste prevention
    document.addEventListener("keydown", preventCopyPaste);

    // Cleanup on component unmount
    return () => {
      document.removeEventListener("keydown", preventCopyPaste);
    };
  }, []);
*/
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/test/${testId}`);
        if (!res.ok) throw new Error("Failed to load test");
        const data = await res.json();
        setTestData(data);
        setLoading(false);
        const start = new Date(data.test.start_time).getTime();
        const end = start + data.test.duration * 60000;
        const iv = setInterval(() => {
          const rem = end - Date.now();
          if (rem <= 0) {
            clearInterval(iv);
            handleSubmit();
          } else {
            setTimeLeft(rem);
          }
        }, 1000);
        return () => clearInterval(iv);
      } catch (err) {
        showSnackbar("Failed to load test data. Please check your connection.", "error");
        setLoading(false);
      }
    })();
  }, [testId]);

  useEffect(() => {
    // Set up interval to send responses to backend
    const interval = setInterval(() => {
      if (debouncedResponses[currentQuestion] !== undefined) {
        handleSaveResponse(debouncedResponses[currentQuestion]);
      }
    }, updateInterval);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [debouncedResponses, currentQuestion]);

  const handleSaveResponse = async (response) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/test/${testId}/save-response`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId,
          questionIndex: currentQuestion,
          response,
        }),
      });
    } catch (err) {
      console.error("Failed to save response:", err);
    }
  };
  const handleRunCode = async (qIdx) => {
    const code = responses[qIdx] || "";
    if (!code.trim()) {
      setErrors((e) => ({ ...e, [qIdx]: ["Please enter some code."] }));
      return;
    }
  
    const cases = testData.questions[qIdx].sample_input || [];
    if (cases.length === 0) {
      setErrors((e) => ({ ...e, [qIdx]: ["No sample input available for this test."] }));
      return;
    }
  
    const caseIndex = Math.floor(Math.random() * cases.length);
    const sample = cases[caseIndex] || "";
    setChosenCase((c) => ({ ...c, [qIdx]: caseIndex }));
    setSampleInputUsed((s) => ({ ...s, [qIdx]: sample }));
    setOutput((o) => ({ ...o, [qIdx]: "" }));
    setErrors((e) => ({ ...e, [qIdx]: [] }));
  
    try {
      if (!testId) {
        setErrors((e) => ({ ...e, [qIdx]: ["Test ID is missing."] }));
        return;
      }
  
      const res = await fetch("http://localhost:5000/run-java", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, testId, caseIndex, qIdx }),
      });
  
      const data = await res.json();
      if (res.ok && data.output != null) {
        setOutput((o) => ({ ...o, [qIdx]: data.output }));
      } else {
        setErrors((e) => ({ ...e, [qIdx]: [data.error || "Unknown error"] }));
      }
    } catch (err) {
      showSnackbar("Network error. Please retry.", "error");
      setErrors((e) => ({ ...e, [qIdx]: ["Network error. Please retry."] }));
    }
  };
  
  
  
  const handleSubmit = async () => {
    setIsTestSubmitted(true); // Prevent further submissions
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/test/${testId}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testId, responses }),
      });
      showSnackbar("Test submitted successfully!", "success");
    } catch {
      showSnackbar("Submission failed. Please try again.", "error");
    }

    try {
      await document.exitFullscreen();
    } catch {}
  };

  const formatTime = (ms) => {
    const m = Math.floor(ms / 60000),
      s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Disable copy, cut, and paste on the entire document
  useEffect(() => {
    const disableCopyPaste = (e) => {
      e.preventDefault();
    };

    document.addEventListener("copy", disableCopyPaste);
    document.addEventListener("cut", disableCopyPaste);
    document.addEventListener("paste", disableCopyPaste);

    return () => {
      document.removeEventListener("copy", disableCopyPaste);
      document.removeEventListener("cut", disableCopyPaste);
      document.removeEventListener("paste", disableCopyPaste);
    };
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const q = testData.questions[currentQuestion];
  let display = output[currentQuestion] || "";
  const promptMatch = display.match(PROMPT_REGEX);
  if (promptMatch && sampleInputUsed[currentQuestion] !== undefined) {
    display = display.replace(
      PROMPT_REGEX,
      `${promptMatch[1]}${sampleInputUsed[currentQuestion]}\n`
    );
  }

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        p: 2,
        bgcolor: "#fff",
        overflowY: "auto",
      }}
    >
      {/* Test name and time left on the same line */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "1000px",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ flex: 1, textAlign: "left" }}>
          {testData.test.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <IconButton sx={{ mr: 1 }}>
            <AccessTime />
          </IconButton>
          <Typography variant="h6" color="error" align="center">
            {formatTime(timeLeft)}
          </Typography>
        </Box>
      </Box>

      {/* Navigation buttons at top */}
      <Box
        display="flex"
        justifyContent="space-between"
        width="100%"
        maxWidth="1000px"
        mb={2}
      >
        <Button
          variant="outlined"
          disabled={currentQuestion === 0 || isTestSubmitted}
          onClick={() => setCurrentQuestion((q) => q - 1)}
          startIcon={<ArrowBack />}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          disabled={currentQuestion === testData.questions.length - 1 || isTestSubmitted}
          onClick={() => setCurrentQuestion((q) => q + 1)}
          endIcon={<ArrowForward />}
        >
          Next
        </Button>
      </Box>

      {/* Test Content */}
      <Card sx={{ width: "100%", maxWidth: "1000px" }}>
        <CardContent>
          <Typography variant="h6">
            Task {currentQuestion + 1}: {q.task}
          </Typography>
          {q.sample_input?.length > 0 && (
  <>
    <Typography sx={{ mt: 2 }}>Sample Test Cases:</Typography>
    <Table size="small" sx={{ mb: 2 }}>
      <TableHead>
        <TableRow>
          <TableCell><strong>#</strong></TableCell>
          <TableCell><strong>Input</strong></TableCell>
          <TableCell><strong>Expected</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {q.sample_input.map((inp, idx) => (
          <TableRow
            key={idx}
            sx={
              chosenCase[currentQuestion] === idx
                ? { backgroundColor: "rgba(25,118,210,0.1)" }
                : {}
            }
          >
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{inp}</TableCell>
            <TableCell>{q.expected_output?.[idx]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </>
)}

     
          <MonacoEditor
            height="250px"
            width="100%"
            language="java"
            value={responses[currentQuestion] || ""}
            onChange={(v) => {
              const nr = [...responses];
              nr[currentQuestion] = v;
              setResponses(nr);
              // Store the updated value in the debouncedResponses
              setDebouncedResponses((prev) => {
                const newResponses = [...prev];
                newResponses[currentQuestion] = v;
                return newResponses;
              });
            }}
            theme="vs-dark"
            options={{
              readOnly: isTestSubmitted,
              contextmenu: false,
              clipboard: false, // This disables copy-paste within Monaco Editor itself
              domReadOnly: isTestSubmitted,
            }}
          />

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => handleRunCode(currentQuestion)}
            disabled={isTestSubmitted}
          >
            Run Code
          </Button>

          <MonacoEditor
            height="150px"
            width="100%"
            language="text"
            value={display}
            theme="vs-dark"
            options={{ readOnly: true }}
            sx={{ mt: 2 }}
          />
        </CardContent>
      </Card>

      {/* Submit button with full width */}
      <Button
        variant="contained"
        color="error"
        sx={{ mt: 2, width: "100%", maxWidth: "1000px" }}
        onClick={handleSubmit}
        disabled={isTestSubmitted}
      >
        Submit Test
      </Button>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Snackbar at the top
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
