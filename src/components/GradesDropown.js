import React, { useState } from "react";
import { Box, Typography, Collapse, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PollIcon from "@mui/icons-material/Poll";
import { useNavigate } from "react-router-dom";


const GradesDropdown = ({ events }) => {
  const [open, setOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const navigate = useNavigate();
  

  const handleClick = (item) => {
    if (item.type === "Test") {
   navigate(`/StudentDashboard/test/${item.id}/expected`);
    } else if (item.type === "Assignment") {
      navigate(`/StudentDashboard/assignment/${item.id}`);
    }
  };

const handleTakeTest = (testId) => {
  setSelectedTestId(testId);
  navigate(`/test/${testId}`, { state: { enterFullscreen: true } });
};


  const handleGoToAssignment = (assignmentId) => {
    navigate(`/StudentDashboard/assignment/${assignmentId}`);
  };


  const now = new Date();

  const isTestActive = (event) => {
    const start = new Date(event.start_time);
    const end = event.end_time ? new Date(event.end_time) : null;
    return now >= start && (!end || now <= end);
  };

  const isAssignmentAvailable = (event) => {
    const due = new Date(event.due_date);
    return now <= due;
  };

  const getStatusLabel = (event) => {
    const now = new Date();
    const start = new Date(event.start_time);
    const end = event.end_time ? new Date(event.end_time) : null;
    const due = event.due_date ? new Date(event.due_date) : null;

    if (event.grade !== null) {
      return { label: `Grade: ${event.grade}`, color: "#4caf50" };
    }

    if (event.status === "submitted") {
      return { label: "Submitted, waiting for grade", color: "#ff9800" };
    }

    if (event.status === "not_submitted") {
      if (event.type === "Test") {
        if (now < start) {
          return { label: "Upcoming", color: "#2196f3" };
        }
        if (now >= start && (!end || now <= end)) {
          return { label: "Available", color: "#1976d2" };
        }
        if (end && now > end) {
          return { label: "Missed", color: "#f44336" };
        }
      } else if (event.type === "Assignment") {
        if (now <= due) {
          return { label: "Available", color: "#1976d2" };
        } else {
          return { label: "Missed", color: "#f44336" };
        }
      }
    }

    return { label: "Unknown", color: "#9e9e9e" };
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          cursor: "pointer",
          py: 1,
          borderRadius: 1,
          boxShadow: open ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            backgroundColor: "#f9f9f9",
          },
        }}
      >
        <Box display="flex" alignItems="center">
          <PollIcon sx={{ mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Grades
          </Typography>
        </Box>
        <ExpandMoreIcon
          sx={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </Box>

      <Collapse in={open}>
        {events.length ? (
          events.map((event) => {
            const isGraded = event.grade !== null;
            const isNotSubmitted = event.status === "not_submitted";
            const isSubmitted = event.status === "submitted" && !isGraded;
            const isClickable =
              (event.type === "Test" && isSubmitted) ||
              (event.type === "Assignment" );
            const canTakeTest =
              event.type === "Test" && isNotSubmitted && isTestActive(event);
            const canSolveAssignment =
              event.type === "Assignment" &&
              isNotSubmitted &&
              isAssignmentAvailable(event);

            return (
              <Box
                key={`${event.type}-${event.id}`}
                sx={{
                  px: 2,
                  py: 1,
                  borderBottom: "1px solid #eee",
                  cursor:
                (canTakeTest || canSolveAssignment || isClickable)
                  ? "pointer"
                  : "default",

                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                }}
              onClick={isClickable ? () => handleClick(event) : undefined}

              >
                <Typography fontWeight="bold">{event.title}</Typography>

                <Typography variant="body2" color="text.secondary">
                  {event.type === "Test"
                    ? `Start Time: ${formatDate(event.start_time)}`
                    : event.due_date
                    ? `Due Date: ${formatDate(event.due_date)}`
                    : null}
                </Typography>

                <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: getStatusLabel(event).color,
                    }}
                  >
                    {getStatusLabel(event).label}
                  </Typography>

                  {(canTakeTest || canSolveAssignment) && (
                    <Button
                      variant="contained"
                      color={event.type === "Test" ? "primary" : "secondary"}
                      size="small"
                      onClick={() =>
                        event.type === "Test"
                          ? handleTakeTest(event.id)
                          : handleGoToAssignment(event.id)
                      }
                    >
                      {event.type === "Test" ? "Take Test" : "Solve Assignment"}
                    </Button>
                  )}
                </Box>

                
              </Box>
            );
          })
        ) : (
          <Typography sx={{ px: 2, py: 1 }}>No grades available yet.</Typography>
        )}
      </Collapse>

     
    </Box>
  );
};

export default GradesDropdown;
