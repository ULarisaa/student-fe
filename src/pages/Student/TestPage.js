import React, { useState, useEffect, useCallback } from "react";
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
  TableBody, 
  Tooltip, TextField, Stack, Radio, RadioGroup, Paper, Checkbox,   Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

} from "@mui/material";
import { ArrowBack, ArrowForward, AccessTime } from "@mui/icons-material";
import { data, useNavigate, useParams, useLocation } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useRef } from "react";
import renderTaskWithCode from "../../components/RenderTaskWithCode";
import TestRulesModal from "../../components/TestRulesModal";
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";

const PROMPT_REGEX = /(Enter.*?:\s*)/;

const sanitizeInput = (input) => input.replace(/[<>]/g, "");

export default function TestPage() {
  const { testId } = useParams();
  const [input, setInput] = useState('');
  const [testData, setTestData] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [output, setOutput] = useState({});

  const [chosenCase, setChosenCase] = useState({});

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const navigate = useNavigate();
const [debouncedResponses, setDebouncedResponses] = useState({});
const debounceTimerRef = useRef(null);
  const updateInterval = 5;
const [submitCount, setSubmitCount] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [answers, setAnswers] = useState({}); 
const [answerSubmitted, setAnswerSubmitted] = useState({});
const [questionTimeLeft, setQuestionTimeLeft] = useState(null);

const testStartTime = useRef(Date.now());
const [mouseLeaveCount, setMouseLeaveCount] = useState(0);
const [copyPasteAttempts, setCopyPasteAttempts] = useState(0);
const [codeDrafts, setCodeDrafts] = useState({});
const alreadySubmitting = useRef(false);
const [typedChars, setTypedChars] = useState(0);
const lastTypedTimestamp = useRef(Date.now());
const questionStartTimestamp = useRef(Date.now());
const totalIdleTime = useRef(0);
  const totalIdleTimeRef = useRef(0);
const typedCharsRef = useRef(0);
const idleTimerRef = useRef(null);
const prevValueRef = useRef("");
const codeHistoryRef = useRef({});

const mouseLeaveCountRef = useRef(0);
const copyPasteAttemptsRef = useRef(0);
  const isMounted = useRef(true);
  const fullscreenExitCountRef = useRef(0);
const [fullscreenExitCount, setFullscreenExitCount] = useState(0);

const firstTypedTimestampRef = useRef(null);

 const location = useLocation();
 const [showFullscreenButton, setShowFullscreenButton] = useState(true);
 const [inFullscreen, setInFullscreen] = useState(false);

const handleEditorMount = (editor, monaco) => {
  // Disable context menu
  editor.updateOptions({ contextmenu: false });

  // Intercept Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U, Ctrl+B
  editor.onKeyDown((e) => {
    const key = e.browserEvent.key.toLowerCase();
    const isCtrl = e.browserEvent.ctrlKey || e.browserEvent.metaKey;

    const forbiddenCombo =
      (isCtrl && ["c", "v", "x", "u", "b"].includes(key)) ||
      (e.browserEvent.ctrlKey && e.browserEvent.shiftKey && key === "i") ||
      key === "f12";

    if (forbiddenCombo) {
      e.preventDefault();
      e.stopPropagation();
      showSnackbar("Copy and paste actions are restricted. This event will be reported.", "warning");

      // Log and count attempt
      copyPasteAttemptsRef.current += 1;
      setCopyPasteAttempts(copyPasteAttemptsRef.current);
    }
  });
};
const handleStartFullscreen = () => {
  const elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem.requestFullscreen()
      .then(() => {
        setShowFullscreenButton(false);
        setInFullscreen(true); // marchezi că e fullscreen activ
      })
      .catch((err) => {
        console.error("Fullscreen error:", err);
      });
  } else {
    console.warn("Fullscreen API not supported");
    setShowFullscreenButton(false);
  }
};

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };



const testEndRef = useRef(null);

   const [code, setCode] = useState("");
const [results, setResults] = useState({});

    const [error, setError] = useState("");

  const javaTemplate = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Write your code here
        scanner.close();
    }
}`;

const handleSubmitQuestion = async () => {
  const code = codeDrafts[currentQuestion] ?? javaTemplate;
  setError("");
  setIsSubmitting(true);
  setResults(prev => ({
    ...prev,
    [currentQuestion]: null,
  }));

  try {
  const response = await fetchWithRefresh(`http://localhost:5000/test/${testId}/question/${q.id}/submitq`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ code }),
});

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Submission failed");
      return null;
    } else {
      const { results: testResults, tests_passed, tests_total } = data;

      setResults(prev => ({
        ...prev,
        [currentQuestion]: data,
      }));

      setAnswerSubmitted(prev => ({
        ...prev,
        [currentQuestion]: true,
      }));

      setAnswers(prev => ({
  ...prev,
  [q.id]: {
    answer: code,
    answer_time: prev[q.id]?.answer_time || 0,
    typing_speed: prev[q.id]?.typing_speed || 0,
    idle_time: prev[q.id]?.idle_time || 0,
    tests_passed,
    tests_total,
    test_results: testResults,
  },
}));


      return { code, passedCount: tests_passed, totalCount: tests_total };
    }
  } catch (err) {
    setError("Error submitting code");
    return null;
  } finally {
    setIsSubmitting(false);
  }
};



// de exemplu, un useEffect care rulează la tastare și calculează idle time
useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    if (now - lastTypedTimestamp.current > 1000) {  // dacă e idle > 1 sec
      totalIdleTime.current += now - lastTypedTimestamp.current;
      lastTypedTimestamp.current = now;
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);
const handleTyping = (newValue) => {
  if (typeof newValue !== "string") return;

  const totalLength = newValue.length;
  const typedLength = Math.max(0, totalLength - javaTemplate.length);

  setTypedChars(typedLength);
  typedCharsRef.current = typedLength;

  const now = Date.now();

  // Setează momentul primei tastări
  if (!firstTypedTimestampRef.current) {
    firstTypedTimestampRef.current = now;
  }

  // Poți păstra și ultima tastare pentru alte scopuri, dar nu o folosești pentru idle total acum
  lastTypedTimestamp.current = now;
};


useEffect(() => {
  questionStartTimestamp.current = Date.now();
  totalIdleTime.current = 0;
  lastTypedTimestamp.current = Date.now();
  firstTypedTimestampRef.current = null;  // resetează prima tastare
  setTypedChars(0);
  typedCharsRef.current = 0;
}, [currentQuestion]);


const handleSubmitClick = async () => {
    const now = Date.now();
  const answerTimeMs = now - questionStartTimestamp.current;

  // Idle time = timp de la începutul întrebării până la prima tastare
  const idleTimeMs = firstTypedTimestampRef.current
    ? firstTypedTimestampRef.current - questionStartTimestamp.current
    : answerTimeMs;  // dacă nu s-a tastat nimic, idle = tot timpul

  const activeTypingTimeSec = (answerTimeMs - idleTimeMs) / 1000;
  const typedChars = typedCharsRef.current;

  const typingSpeed = activeTypingTimeSec > 0 ? (typedChars / activeTypingTimeSec) * 60 : 0;

  console.log(typingSpeed);
  console.log(idleTimeMs);

  // Actualizare answers cu aceste date
  const updatedAnswer = {
    ...answers[q.id],
    answer_time: Math.round(answerTimeMs / 1000), // secunde
    idle_time: Math.round(idleTimeMs / 1000),     // secunde
    typing_speed: Math.round(typingSpeed),
  };

  setAnswers(prev => ({
    ...prev,
    [q.id]: updatedAnswer,
  }));

  // Pentru coding
  if (q.category === "coding") {
    const count = submitCount[currentQuestion] || 0;
    if (count < 3) {
      const submissionResult = await handleSubmitQuestion();
      if (submissionResult) {
        const { code, passedCount, totalCount } = submissionResult;

        // Preluăm și test_results din answers, dacă există
        const testResults = updatedAnswer.test_results || [];

        const updated = { ...responses };
        updated[q.id] = {
          question_id: q.id,
          answer: code || "",
          answer_time: updatedAnswer.answer_time,
          typing_speed: updatedAnswer.typing_speed,
          idle_time: updatedAnswer.idle_time,
          tests_passed: passedCount,
          tests_total: totalCount,
          test_results: testResults,  // array cu detalii despre fiecare test (passed true/false etc)
        };
        console.log(updated);
        setResponses(updated);
        setSubmitCount(prev => ({
          ...prev,
          [currentQuestion]: count + 1,
        }));
      }
    } else {
      showSnackbar("Maximum 3 submissions allowed for this question", "warning");
    }
  } else {
    // Pentru non-coding
    if (answerSubmitted[currentQuestion]) return;

    const updated = { ...responses };
    const ansObj = answers[q.id];
    let answerValue = ansObj;
    if (typeof ansObj === "object" && ansObj !== null && "answer" in ansObj) {
      answerValue = ansObj.answer;
    }
    updated[q.id] = {
      question_id: q.id,
      answer: typeof answerValue === "string" ? answerValue : JSON.stringify(answerValue),
      answer_time: updatedAnswer.answer_time,
      typing_speed: updatedAnswer.typing_speed,
      idle_time: updatedAnswer.idle_time,
    };

    setResponses(updated);

    handleSubmitSimpleAnswer();

    setAnswerSubmitted(prev => ({
      ...prev,
      [currentQuestion]: true,
    }));
  }
};



const handleSubmitSimpleAnswer = () => {
  const type = q.category;  // corect aici

  let isValid = true;
  const answer = answers[currentQuestion];

  if (type === "free_answer") {
    if (!answer || answer.trim() === "") {
      setError("Please provide an answer.");
      isValid = false;
    }
  } else if (type === "multiple_choice") {
    if (!answer || !answer.includes("t")) {
      setError("Please select at least one option.");
      isValid = false;
    }
  }

  if (isValid) {
    setError("");
    setAnswerSubmitted(prev => ({
      ...prev,
      [currentQuestion]: true,
    }));
  }
};






function shuffleArray(array) {

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}




useEffect(() => {
  let iv;

  function timeObjToMs(timeObj) {
    if (!timeObj || typeof timeObj !== "object") return 0;
    const h = timeObj.hours ?? 0;
    const m = timeObj.minutes ?? 0;
    const s = timeObj.seconds ?? 0;
    return ((h * 3600) + (m * 60) + s) * 1000;
  }

  (async () => {
    try {
      const res = await fetchWithRefresh(`http://localhost:5000/test/${testId}`);
      if (!res.ok) throw new Error("Failed to load test");
      const data = await res.json();

      // Shuffle questions
      data.questions = shuffleArray(data.questions);
      setTestData(data);
      setLoading(false);

      console.log(data);

      // Initialize empty responses for each question:
      const emptyResponses = {};
      data.questions.forEach(q => {
        emptyResponses[q.id] = {
          question_id: q.id,
          answer: "",       // empty answer string
          answer_time: 0,
          typing_speed: 0,
        };
      });
      setResponses(emptyResponses);

      // Calculate test duration
      const testDuration = data.test.duration;

      const isDurationEmpty = 
        !testDuration || 
        (typeof testDuration === "object" && Object.keys(testDuration).length === 0);

      let durationMs = 0;
      if (!isDurationEmpty) {
        durationMs = timeObjToMs(testDuration);
      } else {
        durationMs = data.questions.reduce(
          (sum, q) => sum + timeObjToMs(q.time_limit ?? {}),
          0
        );
      }

      const now = Date.now();
      testEndRef.current = now + durationMs;

      iv = setInterval(() => {
        const rem = testEndRef.current - Date.now();
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

  return () => {
    if (iv) clearInterval(iv);
  };
}, [testId]);


useEffect(() => {
  // La început, trimite instant snapshot pentru codul curent (ex: javaTemplate)
  const response = debouncedResponses[currentQuestion];
  if (response !== undefined) {
    const currentCode = response.answer;
    const now = Date.now();

    const history = codeHistoryRef.current[currentQuestion] || [];
    const lastSnapshot = history[history.length - 1];

    if (!lastSnapshot || lastSnapshot.code !== currentCode) {
      const newSnapshot = { timestamp: now, code: currentCode };
      codeHistoryRef.current[currentQuestion] = [...history, newSnapshot];

      const questionId = testData?.questions?.[currentQuestion]?.id;
      if (questionId) {
        handleSaveResponse(questionId, codeHistoryRef.current[currentQuestion]);
      }
    }
  }

  // Apoi pornește intervalul care verifică și trimite la fiecare 5 secunde
  let iv = setInterval(() => {
    const response = debouncedResponses[currentQuestion];
    if (response !== undefined) {
      const currentCode = response.answer;
      const now = Date.now();

      const history = codeHistoryRef.current[currentQuestion] || [];
      const lastSnapshot = history[history.length - 1];

      if (!lastSnapshot || lastSnapshot.code !== currentCode) {
        const newSnapshot = { timestamp: now, code: currentCode };
        codeHistoryRef.current[currentQuestion] = [...history, newSnapshot];

        const questionId = testData?.questions?.[currentQuestion]?.id;
        if (questionId) {
          handleSaveResponse(questionId, codeHistoryRef.current[currentQuestion]);
        }
      }
    }
  }, 5000);

  return () => clearInterval(iv);
}, [debouncedResponses, currentQuestion, testData]);


const handleSaveResponse = async (questionId, history) => {
  const token = localStorage.getItem("token");
  console.log(history);

  const lastSnapshot = history[history.length - 1];
  const code = lastSnapshot ? lastSnapshot.code : "";

  try {
   const response = await fetchWithRefresh(`http://localhost:5000/testSubmissions/${testId}/save-snapshot`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    questionId,
    code,
  }),
});
    if (response.ok) {
      console.log(`Răspuns salvat cu succes pentru întrebarea ${questionId}`);
    } else {
      console.error(`Eroare la salvarea răspunsului pentru întrebarea ${questionId}:`, response.statusText);
    }
  } catch (err) {
    console.error("Failed to save response:", err);
  }
};




const handleRunCodeNoInput = async () => {
  const testCode = codeDrafts[currentQuestion] || javaTemplate;
  const userInput = input || "";

  setChosenCase(prev => ({ ...prev, [currentQuestion]: undefined }));

  try {
    const response = await fetchWithRefresh("http://localhost:5000/run-java", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: testCode, input: userInput }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      setOutput(prev => ({
        ...prev,
        [currentQuestion]: `Error: ${errorData.error || "Unknown error"}`,
      }));
      return;
    }

    const data = await response.json();
    setOutput(prev => ({ ...prev, [currentQuestion]: data.output || "" }));
  } catch (error) {
    console.error("Run failed", error);
    setOutput(prev => ({ ...prev, [currentQuestion]: "Failed to run code" }));
  }
};


const handleInputChange = (e) => {
  const value = e.target.value;
  // Example: allow letters, digits, spaces, basic punctuation only
  const allowedPattern = /^[a-zA-Z0-9\s.,;:!?"'()*+-]*$/;
  
  if (allowedPattern.test(value)) {
    setInput(value);
  } else {
    // optionally ignore invalid chars or show a warning
  }
};
const responsesRef = useRef(responses);

useEffect(() => {
  responsesRef.current = responses;
}, [responses]);

const handleSubmit = useCallback(async () => {
  setIsTestSubmitted(true);
  const token = localStorage.getItem("token");

  try {
    const questionsRes = await fetchWithRefresh(`http://localhost:5000/test/${testId}/questions`);
    if (!questionsRes.ok) throw new Error("Failed to fetch questions");
    const questions = await questionsRes.json();

    const responsesArray = Array.isArray(responsesRef.current)
      ? responsesRef.current
      : Object.values(responsesRef.current);

    const responsesMap = new Map();
    responsesArray.forEach(r => {
      responsesMap.set(Number(r.question_id), r);
    });

    const resultsMap = new Map();
    Object.entries(results).forEach(([key, value]) => {
      resultsMap.set(Number(key), value);
    });

   const normalizedResponses = questions.map((q) => {
  const resp = responsesMap.get(Number(q.id));
  const result = resultsMap.get(Number(q.id));

  const baseAnswer = {
    question_id: q.id,
    answer: resp?.answer ?? answers[q.id] ?? "",
    answer_time: resp?.answer_time || 0,
    typing_speed: resp?.typing_speed || 0,
    idle_time: resp?.idle_time || 0, 
  };

  if (q.category === "coding") {
    return {
      ...baseAnswer,
      tests_passed: answers[q.id]?.tests_passed ?? 0,
      tests_total: answers[q.id]?.tests_total ?? 0,
      test_results: answers[q.id]?.test_results ?? [], // aici adaugă array-ul cu detalii despre fiecare test
    };
  }

  return baseAnswer;
});



    const payload = {
      status: "submitted",
      responses: normalizedResponses,
      submission_time: new Date().toISOString(),
    copy_paste_attempts: copyPasteAttemptsRef.current,
    exit_fullscreen_count: fullscreenExitCountRef.current,
    mouse_leave_count: mouseLeaveCountRef.current,
    };
    console.log(payload);

    const res = await fetchWithRefresh(`http://localhost:5000/testSubmissions/${testId}/submit`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

    if (!res.ok) throw new Error("Submission failed");

    showSnackbar("Test submitted successfully!", "success");

    setTimeout(() => {
      document.exitFullscreen().catch(() => {});
      navigate(`/StudentDashboard/test/${testId}/expected`, {
        state: { answers, testId, testData },
      });
    }, 3000);

  } catch (error) {
    console.error(error);
    showSnackbar("Submission failed. Please try again.", "error");
    setIsTestSubmitted(false);
  }
}, [
  testId,
  copyPasteAttempts,
  fullscreenExitCount,
  mouseLeaveCount,
  navigate,
  showSnackbar,
  answers,
  testData,
  results,
]);


useEffect(() => {
  isMounted.current = true;
  return () => {
    isMounted.current = false;
  };
}, []);

const safeShowSnackbar = (message, severity = "info") => {
  if (isMounted.current) {
    showSnackbar(message, severity);
  }
};
useEffect(() => {
  const onKeyDown = (e) => {
    console.log("keydown event:", e.key, e.keyCode);
  };
  document.addEventListener("keydown", onKeyDown);
  return () => {
    document.removeEventListener("keydown", onKeyDown);
  };
}, []);

useEffect(() => {
  if (!inFullscreen) return;

  const triggerSubmit = () => {
    if (alreadySubmitting.current) return;
    alreadySubmitting.current = true;
    safeShowSnackbar("The test will be auto-submitted.", "warning");
    setTimeout(() => {
      if (isMounted.current) {
        handleSubmit();
      }
    }, 4000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      console.log("ESC key pressed (may cause fullscreen exit)");
      // Poți loga dacă vrei, dar nu declanșăm submit aici.
    }
  };

  const handleMouseOut = (e) => {
    if (!e.relatedTarget || e.relatedTarget.nodeName === "HTML") {
      mouseLeaveCountRef.current += 1;
      setMouseLeaveCount(mouseLeaveCountRef.current);
      console.log("Mouse left window (mouseout)", mouseLeaveCountRef.current);

      safeShowSnackbar("You left the test screen. The test will be auto-submitted.", "warning");
      triggerSubmit();
    }
  };

  const handleMouseMove = (e) => {
    if (
      e.clientY <= 0 ||
      e.clientX <= 0 ||
      e.clientX >= window.innerWidth ||
      e.clientY >= window.innerHeight
    ) {
      mouseLeaveCountRef.current += 1;
      setMouseLeaveCount(mouseLeaveCountRef.current);
      console.log("Mouse left window by coordinates", mouseLeaveCountRef.current);

      safeShowSnackbar("You left the test screen. The test will be auto-submitted.", "warning");
      triggerSubmit();
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      safeShowSnackbar("You switched tab or minimized the window. The test will be auto-submitted.", "warning");
      triggerSubmit();
    }
  };

  const handleWindowBlur = () => {
    safeShowSnackbar("You switched window or lost focus. The test will be auto-submitted.", "warning");
    triggerSubmit();
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      // Aici contorizezi ieșirea din fullscreen
      fullscreenExitCountRef.current += 1;
      setFullscreenExitCount(fullscreenExitCountRef.current);
      console.log("Exited fullscreen", fullscreenExitCountRef.current);

      safeShowSnackbar("You exited fullscreen. The test will be auto-submitted.", "warning");
      triggerSubmit();
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("mouseout", handleMouseOut);
  window.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleWindowBlur);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("mouseout", handleMouseOut);
    window.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
  };
}, [inFullscreen, handleSubmit, showSnackbar]);

 

const questionTimerRef = useRef(null);
const questionEndRef = useRef(null);
const previousQuestionRef = useRef(null);
const answerTimeRef = useRef(null);

const typingStartRef = useRef(null);
const idleStartRef = useRef(null);
const totalTypedCharsRef = useRef(0);

useEffect(() => {
  if (!testData || isTestSubmitted) return;
  answerTimeRef.current = Date.now(); // momentul start răspuns pentru întrebarea curentă
}, [currentQuestion]);




const saveAnswerTimeForQuestion = (questionIndex, elapsedMs, typingSpeedCPM, idleTimeMs) => {
  console.log("Saving times for question", questionIndex, { elapsedMs, typingSpeedCPM, idleTimeMs });
  setAnswers((prev) => {
    const qid = testData.questions[questionIndex]?.id;
    if (!qid) return prev;

    return {
      ...prev,
      [qid]: {
        ...(typeof prev[qid] === "string" ? { text: prev[qid] } : prev[qid]),
        answer_time: elapsedMs,
        typing_speed: Math.round(typingSpeedCPM),
        idle_time: idleTimeMs,
      },
    };
  });
};useEffect(() => {
  console.log("useEffect start for question", currentQuestion);
  if (!testData || isTestSubmitted) {
    console.log("Exiting useEffect early due to testData/isTestSubmitted");
    return;
  }

  answerTimeRef.current = Date.now();
  // Nu mai folosim totalIdleTimeRef, ci firstTypedTimestampRef
  firstTypedTimestampRef.current = null;  // resetează prima tastare

  typingStartRef.current = null;
  totalTypedCharsRef.current = 0;

  return () => {
    console.log("useEffect cleanup for question", currentQuestion);
    const now = Date.now();
    const elapsedMs = now - answerTimeRef.current;

    // Idle time = timpul de la început până la prima tastare (dacă există)
    const idleTimeMs = firstTypedTimestampRef.current
      ? firstTypedTimestampRef.current - answerTimeRef.current
      : elapsedMs;

    const activeTypingTimeMs = elapsedMs - idleTimeMs;
    const activeTypingTimeMin = activeTypingTimeMs / 60000;

    const typingSpeedCPM = activeTypingTimeMin > 0
      ? totalTypedCharsRef.current / activeTypingTimeMin
      : 0;

    console.log("Typing stats", {
      elapsedMs,
      idleTimeMs,
      totalTypedChars: totalTypedCharsRef.current,
    });

    saveAnswerTimeForQuestion(
      currentQuestion,
      Math.round(elapsedMs / 1000),
      Math.round(typingSpeedCPM),
      Math.round(idleTimeMs / 1000)
    );
  };
}, [currentQuestion]);



useEffect(() => {
  if (!testData) return;
  if (isTestSubmitted) return;

  const questions = testData.questions;
  if (!questions || questions.length === 0) return;

  const currentQ = questions[currentQuestion];
  if (!currentQ || !currentQ.time_limit || typeof currentQ.time_limit !== "object") {
    setQuestionTimeLeft(0);
    return;
  }

  function timeObjToMs(timeObj) {
    if (!timeObj || typeof timeObj !== "object") return 0;
    const h = timeObj.hours ?? 0;
    const m = timeObj.minutes ?? 0;
    const s = timeObj.seconds ?? 0;
    return ((h * 3600) + (m * 60) + s) * 1000;
  }

  const totalMs = timeObjToMs(currentQ.time_limit);
  if (isNaN(totalMs) || totalMs <= 0) {
    setQuestionTimeLeft(0);
    return;
  }

  // aici adăugăm 500 ms în plus
  const end = Date.now() + totalMs + 350;
  questionEndRef.current = end;

  const updateTime = () => {
    const remaining = questionEndRef.current - Date.now();
    if (remaining <= 0) {
      clearInterval(questionTimerRef.current);
      setQuestionTimeLeft(0);
      showSnackbar("Timpul pentru această întrebare a expirat.", "info");
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        handleSubmit();
      }
    } else {
      setQuestionTimeLeft(remaining);
    }
  };

  updateTime();
  questionTimerRef.current = setInterval(updateTime, 10);

  return () => clearInterval(questionTimerRef.current);
}, [currentQuestion, testData, isTestSubmitted]);


function formatTime(ms) {
  if (typeof ms !== 'number' || ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
}

useEffect(() => {
  const showBlockMessage = () => {
    copyPasteAttemptsRef.current += 1;
    setCopyPasteAttempts(copyPasteAttemptsRef.current);
    showSnackbar("Copy and paste actions are restricted. This event will be reported.", "warning");
    console.log("Blocked action attempt:", copyPasteAttemptsRef.current);
  };

  const disableNativeCopyPaste = (e) => {
    e.preventDefault();
    showBlockMessage();
  };

  const preventKeyCombinations = (e) => {
    const key = e.key.toLowerCase();
    if (
      (e.ctrlKey && (key === "c" || key === "v" || key === "x" || key === "u")) ||
      (e.metaKey && (key === "c" || key === "v" || key === "x")) ||
      (e.ctrlKey && e.shiftKey && key === "i") ||
      key === "f12"
    ) {
      e.preventDefault();
      showBlockMessage();
    }
  };

  document.addEventListener("copy", disableNativeCopyPaste);
  document.addEventListener("cut", disableNativeCopyPaste);
  document.addEventListener("paste", disableNativeCopyPaste);

  document.addEventListener("keydown", preventKeyCombinations);

  return () => {
    document.removeEventListener("copy", disableNativeCopyPaste);
    document.removeEventListener("cut", disableNativeCopyPaste);
    document.removeEventListener("paste", disableNativeCopyPaste);
    document.removeEventListener("keydown", preventKeyCombinations);
  };
}, []);



  if (loading) {
    return (
      <Box sx={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

 const handleNextQuestion = () => {
  const now = Date.now();
  // Calculează cât timp a trecut efectiv de la start
  const elapsed = now - (testEndRef.current - timeLeft);

  // Setează noul final al testului scăzând timpul întrebării deja consumat
  testEndRef.current = now + (timeLeft - questionTimeLeft);

  // Actualizează timeLeft în mod corect
  setTimeLeft(prev => Math.max(0, prev - questionTimeLeft));

  setCurrentQuestion(prev => prev + 1);
};


  const q = testData.questions[currentQuestion];
  let display = output[currentQuestion] || "";
  


return (
  <>
 {showFullscreenButton && (
  <TestRulesModal
    open={showFullscreenButton}
    onConfirm={handleStartFullscreen}
    onCancel={() => {
      setShowFullscreenButton(false);
      navigate("/StudentDashboard");
    }}
  />
)}


  {!showFullscreenButton && (
    <>
  <Box
    sx={{
      overflowY: "auto",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      width: "100vw",
      justifyContent: "flex-start",
      alignItems: "center",
      bgcolor: "#fff",
    }}
  >
<Box
  sx={{
    p: 1,
    mb: 2,
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "1000px",
    alignItems: "center",
  }}
>
  {/* Test name */}
  <Typography variant="h4" fontWeight="bold" sx={{ flex: 1, textAlign: "left" }}>
    {testData.test.name}
  </Typography>

  {/* Total time left */}
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mr: 3 }}>
    <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
      Test Time Left
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <AccessTime color="error" sx={{ mr: 1 }} />
      <Typography variant="h6" color="error">
        {formatTime(timeLeft)}
      </Typography>
    </Box>
  </Box>

{(!testData?.test?.duration || Object.keys(testData.test.duration).length === 0) && (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mr: 3 }}>
    <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
      Question Time Left
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <AccessTime color="primary" sx={{ mr: 1 }} />
      <Typography variant="h6" color="primary">
        {formatTime(questionTimeLeft)}
      </Typography>
    </Box>
  </Box>
)}


 
</Box>

<Box
  display="flex"
  justifyContent="space-between"
  width="100%"
  maxWidth="1000px"
  mb={2}
  gap={2}
>
  {/* Previous Button – afișat doar dacă nu suntem la prima întrebare */}
  {currentQuestion !== 0 ? (
    <Button
      variant="outlined"
      onClick={() => setCurrentQuestion((q) => q - 1)}
      startIcon={<ArrowBack />}
      disabled={isTestSubmitted}
       sx={{
    textTransform: "none",
    width: "200px",
    visibility: (() => {
      const d = testData.test.duration;
      return !d || (typeof d === "object" && Object.keys(d).length === 0) ? "hidden" : "visible";
    })()
  }}
    >
      Previous
    </Button>
  ) : (
    <Box width="200px" /> // placeholder ca să păstrezi alinierea
  )}

  {/* End Test Button – mereu afișat */}
  <Button
    variant="outlined"
    color="warning"
    startIcon={<DoneAllIcon />}
    onClick={handleSubmit}
    disabled={isTestSubmitted}
    sx={{ width: "200px", fontWeight: "bold", textTransform: "none" }}
  >
    END Test
  </Button>


  {currentQuestion !== testData.questions.length - 1 ? (
 <Button
  variant="outlined"
  onClick={handleNextQuestion}
  endIcon={<ArrowForward />}
  disabled={isTestSubmitted || !answerSubmitted[currentQuestion]}
  sx={{ width: "200px", textTransform: "none" }}
>
  Next
</Button>

  ) : (
    <Box width="200px" /> 
  )}
</Box>



 <Box
  sx={{
    width: "100%",
    maxWidth: 1000,
    minHeight: "400px",
    boxShadow: 1,
    borderRadius: 2,
    bgcolor: "background.paper",
    p: 2,
    display: "flex",
    flexDirection: "column",
  }}
>
  {/* Task Title */}
<Stack spacing={1} mb={2}>
  <Typography
    variant="subtitle2"
    sx={{
      color: "#1976d2",
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase",
    }}
  >
    Task {currentQuestion + 1}
  </Typography>

  {typeof q.task === "string" ? (
    renderTaskWithCode(q.task)
  ) : (
    <Typography variant="h6" fontWeight={600} component="div">
      {q.task}
    </Typography>
  )}
</Stack>



  {/* Multiple Choice */}
{q.category === "multiple_choice" && (
  <>
    {(q.options || []).map((choice, i) => (
      <Paper
        key={i}
        elevation={answers[q.id]?.[i] ? 4 : 1}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          cursor: answerSubmitted[currentQuestion] ? "default" : "pointer",
          bgcolor: answers[q.id]?.[i] ? "#e3f2fd" : "background.paper",
          border: answers[q.id]?.[i] ? "2px solid" : "1px solid transparent",
          borderColor: answers[q.id]?.[i] ? "#1976d2" : "grey.300",
          transition: "all 0.2s",
          "&:hover": {
            borderColor: !answerSubmitted[currentQuestion] ? "#1976d2" : "grey.300",
            boxShadow: !answerSubmitted[currentQuestion] ? 3 : 1,
          },
        }}
        onClick={() => {
          if (!answerSubmitted[currentQuestion]) {
            const prev = answers[q.id] || new Array(q.options.length).fill(false);
            const updated = [...prev];
            updated[i] = !updated[i];
            setAnswers((prevAnswers) => ({
              ...prevAnswers,
              [q.id]: updated,
            }));
          }
        }}
      >
        <Checkbox
          checked={answers[q.id]?.[i] === true}
          disabled={answerSubmitted[currentQuestion]}
          sx={{
            mr: 2,
            color: "#1976d2",
            "&.Mui-checked": {
              color: "#1976d2",
            },
          }}
        />
        <span>{choice}</span>
      </Paper>
    ))}

    <Tooltip
      title={
        answerSubmitted[currentQuestion]
          ? "Your final answer has already been submitted and cannot be changed."
          : "Click to submit your final answer. This action can only be done once, so please confirm your response before submitting."
      }
      arrow
    >
      <span>
        <Button
          type="button"
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          sx={{
            mt: 3,
            width: "100%",
            fontWeight: "600",
            borderRadius: 2,
            textTransform: "none",
          }}
          onClick={handleSubmitClick}
          disabled={answerSubmitted[currentQuestion] || isSubmitting}
          size="large"
          id={`submit-button-${currentQuestion}`}
        >
          Submit Your Answer
        </Button>
      </span>
    </Tooltip>
  </>
)}


  {/* Free Answer */}
  {q.category === "free_answer" && (
    <>
      <TextField
        multiline
        minRows={3}
        fullWidth
        variant="outlined"
        value={answers[q.id] ?? ""}
   onChange={(e) => {
  if (!answerSubmitted[currentQuestion]) {
    const cleanValue = sanitizeInput(e.target.value);

    if (!firstTypedTimestampRef.current) {
      firstTypedTimestampRef.current = Date.now();
    }

    const prevLength = typeof answers[q.id] === "string" ? answers[q.id].length : 0;
    const typedCharsDelta = Math.max(0, cleanValue.length - prevLength);
    totalTypedCharsRef.current += typedCharsDelta;

    setAnswers((prev) => ({ ...prev, [q.id]: cleanValue }));
    setTypedChars(cleanValue.length);
  }
}}




        disabled={answerSubmitted[currentQuestion]}
        placeholder="Type your answer here..."
        sx={{ mb: 2 }}
      />
      <Tooltip
        title={
          answerSubmitted[currentQuestion]
            ? "Your final answer has already been submitted and cannot be changed."
            : "Click to submit your final answer. This action can only be done once, so please confirm your response before submitting."
        }
        arrow
      >
        <span>
          <Button
            type="button"
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            sx={{
              mt: 3,
              width: "100%",
              fontWeight: "600",
              borderRadius: 2,
              textTransform: "none",
            }}
            onClick={handleSubmitClick}
            disabled={answerSubmitted[currentQuestion] || isSubmitting}
            size="large"
            id={`submit-button-${currentQuestion}`}
          >
            Submit Your Answer
          </Button>
        </span>
      </Tooltip>
    </>
  )}

  {/* Coding */}
  {q.category === "coding" && (
    <>
      {/* Sample Test Cases */}
  {q.sample_input?.length > 0 && (
  <>
    <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
      Sample Test Case
    </Typography>
    <Table size="small" sx={{ mb: 2 }}>
      <TableHead>
        <TableRow>
          <TableCell><strong>Input</strong></TableCell>
          <TableCell><strong>Expected Result</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow
          sx={
            chosenCase[currentQuestion] === 0
              ? { backgroundColor: "rgba(25,118,210,0.1)" }
              : {}
          }
        >
          <TableCell>{q.sample_input[0]}</TableCell>
          <TableCell>{q.expected_output?.[0]}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </>
)}




      {/* Code Editor */}


<MonacoEditor
  height="300px"
  width="100%"
  language="java"
  value={codeDrafts[currentQuestion] || javaTemplate}
  onChange={(v) => {
    if (typeof v !== "string") return;

    handleTyping(v);
    const now = Date.now();

    if (!firstTypedTimestampRef.current) firstTypedTimestampRef.current = now;
    if (!questionStartTimestamp.current) questionStartTimestamp.current = now;

    const prev = prevValueRef.current || "";
    const diff = v.length - prev.length;
    if (diff > 0) typedCharsRef.current += diff;
    prevValueRef.current = v;

    setCodeDrafts((prev) => ({ ...prev, [currentQuestion]: v }));

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedResponses((prev) => ({
        ...prev,
        [currentQuestion]: { answer: v },
      }));
    }, 500);
  }}
  onMount={handleEditorMount}
  theme="vs-dark"
  options={{
    readOnly:
      isTestSubmitted ||
      (submitCount?.[currentQuestion] || 0) >= 3 ||
      results?.[currentQuestion]?.passed === true,
    contextmenu: false,
    clipboard: false,
    domReadOnly:
      isTestSubmitted ||
      (submitCount?.[currentQuestion] || 0) >= 3 ||
      results?.[currentQuestion]?.passed === true,
    wordBasedSuggestions: true,
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
  }}
/>





    {/* Input Section */}
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} mb={1}>
        Input
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
      <TextField
  multiline
  minRows={2}
  fullWidth
  variant="outlined"
  value={input}
  onChange={handleInputChange}
  placeholder="Enter input here..."
  disabled={
    isTestSubmitted ||
    (submitCount?.[currentQuestion] || 0) >= 3 ||
    results?.[currentQuestion]?.passed === true
  }
  size="small"
/>

        <Button
          variant="contained"
          onClick={handleRunCodeNoInput}
          disabled={
            isTestSubmitted ||
            (submitCount?.[currentQuestion] || 0) >= 3 ||
            results?.[currentQuestion]?.passed === true
          }
          sx={{ alignSelf: "flex-start", mt: "4px" }}
          size="medium"
        >
          Run
        </Button>
      </Box>
    </Box>

    {/* Output Section */}
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} mb={1}>
        Output
      </Typography>
      <MonacoEditor
        height="100px"
        width="100%"
        language="text"
        value={display}
        theme="vs-dark"
        options={{ readOnly: true }}
      />
    </Box>

    {/* Feedback or Results */}
    <Box
  mt={2}
  sx={{ minHeight: '36px' }} // ajustează după înălțimea necesară
>
  {isSubmitting ? (
    <Stack direction="row" alignItems="center" spacing={1}>
      <CircularProgress size={20} />
      <Typography variant="body1">Testing...</Typography>
    </Stack>
  ) : (
    results[currentQuestion] &&
    Array.isArray(results[currentQuestion].results) &&
    results[currentQuestion].results.length > 0 && (
      <Typography variant="subtitle1" fontWeight={600}>
        {results[currentQuestion].results.filter((r) => r.passed).length} out of{" "}
        {results[currentQuestion].results.length} tests passed
      </Typography>
    )
  )}
</Box>


    {/* Submit Button with Tooltip */}
    <Tooltip
      title={
        results?.[currentQuestion]?.passed === true
          ? "All tests passed. No further submissions are needed."
          : (submitCount?.[currentQuestion] || 0) >= 3
          ? "You’ve reached the maximum of 3 submissions. Your final code is now locked."
          : "Click to submit and test your code. You can submit up to 3 times."
      }
      arrow
    >
      <span>
        <Button
          type="button"
          variant="contained"
          color="primary"
          startIcon={
            results?.[currentQuestion]?.passed === true ? <DoneAllIcon /> : <SendIcon />
          }
          sx={{
            mt: 3,
            width: "100%",
            fontWeight: "600",
            borderRadius: 2,
            textTransform: "none",
          }}
          onClick={handleSubmitClick}
          disabled={
            results?.[currentQuestion]?.passed === true ||
            (submitCount?.[currentQuestion] || 0) >= 3 ||
            isTestSubmitted
          }
          size="large"
          id={`submit-button-${currentQuestion}`}
        >
          {results?.[currentQuestion]?.passed === true
            ? "All tests passed!"
            : `Submit your answer (${submitCount?.[currentQuestion] || 0}/3)`}
        </Button>
      </span>
    </Tooltip>
  </>
)}


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
  </Box>
       </>
  )}
</>
);

}