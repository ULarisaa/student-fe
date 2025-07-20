import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,  
} from "@mui/material";
import Tooltip from '@mui/material/Tooltip';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import DateRangeIcon from '@mui/icons-material/DateRange';
import QuizIcon from '@mui/icons-material/Quiz';
import { useNavigate } from 'react-router-dom';
import GradesDropdown from "../../components/GradesDropown";
import EventsCalendar from "../../components/EventsCalendar";
import MaterialsDropdown from "../../components/CourseMaterialsDropdown";
import ForumPostsDropdown from "../../components/ForumPostsDropdown";
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);
const [events, setEvents] = useState([]);

 
  useEffect(() => {
    const emailIcon = document.querySelector('.email-tooltip')?.parentNode;
  
    if (emailIcon) {
      emailIcon.addEventListener('mouseenter', () => {
        emailIcon.querySelector('.email-tooltip').style.display = 'block';
      });
      emailIcon.addEventListener('mouseleave', () => {
        emailIcon.querySelector('.email-tooltip').style.display = 'none';
      });
    }
  }, []);
  
useEffect(() => {
  const fetchCourseDetails = async () => {
    const token = localStorage.getItem("token");
    try {
    const response = await fetchWithRefresh(`http://localhost:5000/course/${courseId}/full`, {
  method: "GET",
});

      if (!response.ok) throw new Error("Failed to fetch course details");
      const data = await response.json();

      const formattedAssignments = data.assignments.map(assignment => {
        const date = new Date(assignment.due_date);
        return {
          ...assignment,
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
          type: "Assignment",
          title: assignment.title || "Assignment",
          description: assignment.description || "Assignment Details",
          start_time: assignment.due_date,
        };
      });

      const formattedTests = data.tests.map(test => {
        const date = new Date(test.start_time);
        return {
          ...test,
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
          type: "Test",
          title: test.name,
        };
      });

      const mergedEvents = [...formattedTests, ...formattedAssignments];

const statusResponse = await fetchWithRefresh(`http://localhost:5000/course/${courseId}/submissions/status`, {
  method: "GET",
});
if (!statusResponse.ok) throw new Error("Failed to fetch submission status");

const statusData = await statusResponse.json(); 


const statusMap = {};


statusData.assignments.forEach((assignment) => {
  statusMap[`assignment_${assignment.id}`] = {
    status: assignment.status,
    grade: assignment.grade ?? null,
  };
});


statusData.tests.forEach((test) => {
  statusMap[`test_${test.id}`] = {
    status: test.status,
    grade: test.grade ?? null,
  };
});


const eventsWithStatusAndGrades = mergedEvents.map((event) => {
  const key = `${event.type.toLowerCase()}_${event.id}`;
  const data = statusMap[key] || { status: "not_submitted", grade: null };

  return {
    ...event,
    status: data.status,
    grade: data.grade,
  };
});

setEvents(eventsWithStatusAndGrades);

      setCourse(data.course);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchCourseDetails();
}, [courseId]);


useEffect(() => {
  console.log(events); 
}, [events]);



  const handleCloseDialog = () => {
  setOpenDialog(false); 


  setTimeout(() => {
    setDialogContent(null);
  }, 300); 
};

  const handleTestCountdown = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  const isAccessible = now >= start && now <= end;

  if (isAccessible) {
    return { message: "Test is available now!", isAccessible: true };
  }

  if (now > end) {
    return {
      message: "Test is no longer available.",
      isAccessible: false,
      isTestExpired: true,
    };
  }

  const diff = start - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let message = "Test will be available in ";
  if (days > 0) message += `${days} day(s) `;
  if (hours > 0 || days > 0) message += `${hours} hour(s) `;
  message += `${minutes} minute(s)`;

  return {
    message: message.trim(),
    isAccessible: false,
    isTestExpired: false,
  };
};
const handleAssignmentCountdown = (dueDateString) => {
  const now = new Date();
  const dueDate = new Date(dueDateString);

  const isAccessible = now <= dueDate;

  if (!isAccessible) {
    return {
      message: "Assignment is past due.",
      isAccessible: false,
      isExpired: true,
    };
  }

  const diff = dueDate - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let message = "Assignment is due in ";
  if (days > 0) message += `${days} day(s) `;
  if (hours > 0 || days > 0) message += `${hours} hour(s) `;
  message += `${minutes} minute(s)`;

  return {
    message: message.trim(),
    isAccessible: true,
    isExpired: false,
  };
};

  const handleDateClick = (date) => {
  const event = events.find(e => e.date === date);
  if (event) {
    let countdownMessage = "";
    let countdown = null;
    console.log(event);

    if (event.type === "Test") {
      countdown = handleTestCountdown(event.start_time, event.end_time);
      countdownMessage = countdown.message;
    } else if (event.type === "Assignment") {
      countdownMessage = `Assignment due on ${new Date(event.start_time).toLocaleString()}`;
    }

    setDialogContent({
      ...event,
      countdownMessage,
      isTestAccessible: event.type === "Test" ? countdown?.isAccessible : false
    });
    setOpenDialog(true);
  }
};


  
  const calculateTimeRemaining = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;
  
    if (diff <= 0) return "Test is available now!";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `Test will be available in ${hours} hour(s) ${minutes} minute(s)`;
  };
  
  

  const navigate = useNavigate();


const [selectedTestId, setSelectedTestId] = useState(null);

const handleTakeTest = (testId) => {
  setSelectedTestId(testId);
  navigate(`/test/${testId}`, { state: { enterFullscreen: true } });
};

const handleSeeResults = (item) => {

  if (item.type === "Test") {
    navigate(`/StudentDashboard/test/${item.id}/expected`);
  } else if (item.type === "Assignment") {
    navigate(`/StudentDashboard/assignment/${item.id}`);
  }
};




const handleGoToAssignment = (assignmentId) => {
  navigate(`/StudentDashboard/assignment/${assignmentId}`);
};



  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Box mt={3}><Alert severity="error">{error}</Alert></Box>;
  if (!course) return <Typography>No course data found.</Typography>;

  return (
    <Box sx={{ p: 3 }}>
 
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
      
 
        <Box sx={{ flex: 1, minWidth: '45%' }}>
       <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom sx={{ color: '#1976d2' }}>
  {course?.name}
</Typography>

          

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1,
            mb: 2 
          }}>
            <SchoolIcon color="primary" fontSize="small" />
            <Typography variant="h6" color="textSecondary" sx={{ whiteSpace: 'nowrap' }}>
              Teacher: {course?.teacher_name}
            </Typography>
  
            <IconButton sx={{ 
              padding: '8px', 
              minWidth: 'unset', 
              width: '36px', 
              height: '36px', 
              color: 'secondary.main',
            }}>
              <MessageIcon sx={{ fontSize: '20px' }} />
            </IconButton>
  
            <Tooltip title={course?.teacher_email || "Email not available"} placement="top">
              <IconButton sx={{ 
                padding: '7px', 
                minWidth: 'unset', 
                width: '36px', 
                height: '36px', 
                color: 'secondary.main',
              }}>
                <EmailIcon sx={{ fontSize: '22px' }} />
              </IconButton>
            </Tooltip>
          </Box>
  
       
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}> 
            <DateRangeIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6" color="textSecondary">Semester: {course?.semester}</Typography>
          </Box>
  
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <ClassIcon sx={{ mr: 1, mt: '4px' }} color="primary" />
            <Typography variant="h6" color="textSecondary" component="p">
              {course?.description}
            </Typography>
          </Box>





        </Box>
  
   
        <Box sx={{ flex: 1, minWidth: '45%' }}>
          <EventsCalendar events={events} onDateClick={handleDateClick} onMonthChange={() => {}} />
        </Box>

      </Box>
     <Box sx={{  mx: "auto", mt: 3 }}>
 <GradesDropdown 
  events={events} 
  
/>

  </Box>

      
<MaterialsDropdown courseId={course.id} />

<ForumPostsDropdown courseId={course.id} />

  

  

<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
 <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  {dialogContent?.type === "Test" ? (
    <>
      <QuizIcon color="primary" />
      <Typography variant="subtitle1" component="p" fontWeight="bold">Test Details</Typography>
    </>
  ) : (
    <>
      <AssignmentIcon color="secondary" />
      <Typography variant="subtitle1" component="p" fontWeight="bold">Assignment Details</Typography>
    </>
  )}
</DialogTitle>

<DialogContent dividers>
  {dialogContent && (
    <Box>
      <Typography variant="h5" component="h2" color="primary" gutterBottom>
        {dialogContent.title}
      </Typography>

      {dialogContent.type === "Assignment" && (
        <>
          <Typography variant="subtitle1" component="p" sx={{ mt: 2, fontWeight: 'bold' }}>
            Description:
          </Typography>
          <Typography variant="body1" component="p" sx={{ mb: 2 }}>
            {dialogContent.description || "No description provided."}
          </Typography>
        </>
      )}

      {dialogContent.type === "Test" ? (
        <>
          <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold' }}>
            Date:
          </Typography>
        </>
      ) : dialogContent.type === "Assignment" ? (
        <>
          <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold' }}>
            Due Date:
          </Typography>
        </>
      ) : null}

      <Typography variant="body1" component="p" sx={{ mb: 2 }}>
        {new Date(dialogContent.start_time).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Typography>

      {dialogContent.type === "Test" ? (
        <>
          <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold' }}>
            Start Time:
          </Typography>
        </>
      ) : dialogContent.type === "Assignment" ? (
        <>
          <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold' }}>
            Due Time:
          </Typography>
        </>
      ) : null}

      <Typography variant="body1" component="p" sx={{ mb: 2 }}>
        {new Date(dialogContent.start_time).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Typography>

   <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold' }}>
  Status:
</Typography>


{!(dialogContent.type === "Test" && (dialogContent.status === "graded" || dialogContent.status === "submitted")) && (
  <Typography variant="body1" component="p" sx={{ mb: 2 }}>
    {dialogContent.countdownMessage}
  </Typography>
)}

{dialogContent.type === "Test" && (() => {
  const getStatusStyle = (dialogContent) => {
    if (dialogContent.status === "graded") {
      return { label: `Grade: ${dialogContent.grade ?? 'N/A'}`, color: "#4caf50" }; 
    }
    if (dialogContent.status === "submitted") {
      return { label: "Submitted - Waiting for grade", color: "#ff9800" }; 
    }
    return null;
  };

  const status = getStatusStyle(dialogContent);

  return (
    <>
      {status && (
        <>
          <Typography
            sx={{  color: status.color }}
          >
            {status.label}
          </Typography>

          {dialogContent.status === "submitted" && (
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              fullWidth
              onClick={() => {
                handleCloseDialog();
                setTimeout(() => {
                  handleSeeResults(dialogContent);
                }, 500);
              }}
            >
              See auto-grading results
            </Button>
          )}
        </>
      )}

      {!["submitted", "graded"].includes(dialogContent.status) && dialogContent.isTestAccessible && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          fullWidth
          onClick={() => {
            handleCloseDialog();
            setTimeout(() => {
              handleTakeTest(dialogContent.id);
            }, 500);
          }}
        >
          Take Test
        </Button>
      )}
    </>
  );
})()}




{dialogContent.type === "Assignment" && new Date(dialogContent.due_date) <= new Date() && (
  <Button
    variant="contained"
    color="secondary"
    sx={{ mt: 2 }}
    fullWidth
    onClick={() => {
      handleCloseDialog();
      setTimeout(() => {
        handleSeeResults(dialogContent);  
      }, 500);
    }}
  >
    See Results
  </Button>
)}


      {console.log("Type:", dialogContent.type)}
      {console.log("Due time:", dialogContent.id)}

      {console.log("Parsed due date:", new Date(dialogContent.due_date
      ))}
      {console.log("Is future due date:", new Date(dialogContent.due_date) > new Date())}

       {dialogContent.type === "Assignment" && new Date(dialogContent.due_date) > new Date() && (
  <Button
    variant="contained"
    color="secondary"
    sx={{ mt: 2 }}
    fullWidth
    onClick={() => handleGoToAssignment(dialogContent.id)}
  >
    Solve Assignment
  </Button>
)}


      </Box>
    )}
  </DialogContent>



  <DialogActions sx={{ justifyContent: 'center' }}>
    <Button
      onClick={handleCloseDialog}
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
      Close
    </Button>
  </DialogActions>
</Dialog>


  
    </Box>
  );
  
}
