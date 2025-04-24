import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";

const PROMPT_REGEX = /(Enter.*?:\s*)/;  // adjust to your prompt text

const TestPage = () => {
  const { testId } = useParams();
  const [testData, setTestData] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [output, setOutput] = useState({});
  const [errors, setErrors] = useState({});
  const [chosenCase, setChosenCase] = useState({});   // map: questionIndex → caseIndex
  const [sampleInputUsed, setSampleInputUsed] = useState({});

  useEffect(() => {
    (async () => {
      const res = await fetch(`http://localhost:5000/test/${testId}`);
      const data = await res.json();
      setTestData(data);
      setLoading(false);
      // start timer...
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
    })();
  }, [testId]);

  const handleRunCode = async (qIdx) => {
    const code = responses[qIdx] || "";
    if (!code.trim()) {
      setErrors((e) => ({ ...e, [qIdx]: ["Please enter some code."] }));
      return;
    }

    // pick a random sample case index
    const cases = testData.questions[qIdx].sample_input || [];
    const caseIndex = Math.floor(Math.random() * cases.length);
    const sample = cases[caseIndex] ?? "";

    setChosenCase((c) => ({ ...c, [qIdx]: caseIndex }));
    setSampleInputUsed((s) => ({ ...s, [qIdx]: sample }));
    setOutput((o) => ({ ...o, [qIdx]: "" }));
    setErrors((e) => ({ ...e, [qIdx]: [] }));

    console.log(caseIndex);
    try {
      const res = await fetch("http://localhost:5000/run-java", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, testId, caseIndex }),
      });
      const data = await res.json();
      if (res.ok && data.output != null) {
        setOutput((o) => ({ ...o, [qIdx]: data.output }));
      } else {
        setErrors((e) => ({ ...e, [qIdx]: [data.error || "Unknown error"] }));
      }
    } catch {
      setErrors((e) => ({ ...e, [qIdx]: ["Network error"] }));
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/test/${testId}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ testId, responses }),
    });
    alert("Test submitted!");
  };

  const formatTime = (ms) => {
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) return <Typography>Loading…</Typography>;

  return (
    <Box sx={{ maxWidth: "80%", mx: "auto" }}>
      <Typography variant="h4" align="center">{testData.test.name}</Typography>
      <Typography variant="h6" color="error">
        Time Left: {timeLeft ? formatTime(timeLeft) : "Loading…"}
      </Typography>

      {testData.questions.map((q, i) => {
        // weave sample input into program prompt if present
        let display = output[i] || "";
        const promptMatch = display.match(PROMPT_REGEX);
        if (promptMatch && sampleInputUsed[i] !== undefined) {
          display = display.replace(
            PROMPT_REGEX,
            `${promptMatch[1]}${sampleInputUsed[i]}\n`
          );
        }

        return (
          <Card key={i} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Task {i+1}: {q.task}</Typography>

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
                            chosenCase[i] === idx
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
                height="300px"
                language="java"
                value={responses[i] || ""}
                onChange={(v) => {
                  const nr = [...responses];
                  nr[i] = v;
                  setResponses(nr);
                }}
                theme="vs-dark"
              />

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => handleRunCode(i)}
              >
                Run Code
              </Button>

              <MonacoEditor
                height="200px"
                language="text"
                value={display}
                theme="vs-dark"
                options={{ readOnly: true }}
                sx={{ mt: 2 }}
              />

              {errors[i]?.length > 0 && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {errors[i].join("\n")}
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Box display="flex" justifyContent="center">
        <Button variant="contained" onClick={handleSubmit}>
          Submit Test
        </Button>
      </Box>
    </Box>
  );
};

export default TestPage;
