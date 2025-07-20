import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, Box, Button, Slider, CircularProgress } from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import MonacoEditor from "@monaco-editor/react";
import { fetchWithRefresh } from "../utils/fetchWithRefresh";

function CodeReplay({ testId, questionId, studentId }) {
  const [snapshots, setSnapshots] = useState([]);
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); 
  const intervalRef = useRef(null);

  useEffect(() => {
    async function fetchSnapshots() {
      try {
        const response = await fetchWithRefresh(
  `http://localhost:5000/testSubmissions/${testId}/snapshots?questionId=${questionId}&studentId=${studentId}`
);

        if (response.ok) {
          const data = await response.json();
          setSnapshots(data);
          setCurrentCodeIndex(0);
          setPlaying(false);
          clearInterval(intervalRef.current);
        } else {
          console.error("Failed to fetch snapshots:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching snapshots:", err);
      }
    }
    if (testId && questionId && studentId) {
      fetchSnapshots();
    }
    return () => clearInterval(intervalRef.current);
  }, [testId, questionId, studentId]);

  const handleStartFromBeginning = () => {
    if (snapshots.length === 0) return;

    clearInterval(intervalRef.current);
    setCurrentCodeIndex(0);
    setPlaying(true);

    intervalRef.current = setInterval(() => {
      setCurrentCodeIndex((prevIndex) => {
        if (prevIndex + 1 >= snapshots.length) {
          clearInterval(intervalRef.current);
          setPlaying(false);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, speed);
  };

  const handlePause = () => {
    clearInterval(intervalRef.current);
    setPlaying(false);
  };

  const handleSpeedChange = (event, newValue) => {
    setSpeed(newValue);
    if (playing) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentCodeIndex((prevIndex) => {
          if (prevIndex + 1 >= snapshots.length) {
            clearInterval(intervalRef.current);
            setPlaying(false);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, newValue);
    }
  };

  return (
    <Card variant="outlined" sx={{ mt: 3, borderRadius: 3, boxShadow: 1, p: 2 }}>
      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
        🎬 Code Replay
      </Typography>
      <MonacoEditor
        height="300px"
        language="java"
        theme="vs-dark"
        value={snapshots[currentCodeIndex]?.code || ""}
        options={{ readOnly: true, minimap: { enabled: false } }}
      />
      <Typography variant="body2" mt={1}>
        Timestamp:{" "}
        {snapshots[currentCodeIndex]
          ? new Date(snapshots[currentCodeIndex].timestamp).toLocaleTimeString()
          : "00:00"}
      </Typography>

      <Box display="flex" gap={2} mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartFromBeginning}
          disabled={snapshots.length === 0 || playing}
          startIcon={<ReplayIcon />}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "primary.dark" },
          }}
        >
          Replay
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handlePause}
          disabled={!playing}
          startIcon={<PauseIcon />}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            borderColor: "secondary.main",
            "&:hover": { borderColor: "secondary.dark", backgroundColor: "action.hover" },
          }}
        >
          Pause
        </Button>
      </Box>

      <Box mt={3}>
        <Typography variant="body2" gutterBottom>
          Adjust Replay Speed
        </Typography>
        <Slider
          value={speed}
          min={500}
          max={5000}
          step={500}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value / 1000} sec`}
          onChange={handleSpeedChange}
          disabled={snapshots.length === 0}
        />
      </Box>
    </Card>
  );
}

export default CodeReplay;
