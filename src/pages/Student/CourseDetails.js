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
  DialogTitle
} from "@mui/material";
import Tooltip from '@mui/material/Tooltip';
import EmailIcon from '@mui/icons-material/Email';
import MessageIcon from '@mui/icons-material/Message';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import DateRangeIcon from '@mui/icons-material/DateRange';
import QuizIcon from '@mui/icons-material/Quiz';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import { useNavigate } from 'react-router-dom';

// ------------------ Calendar Component ------------------
const Calendar = ({ events, onDateClick, onMonthChange }) => {
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const currentYear = currentDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleMonthChange = (direction) => {
    const newMonth = currentMonth + direction;
    if (newMonth >= 0 && newMonth < 12) {
      setCurrentMonth(newMonth);
      onMonthChange(newMonth);
    }
  };

  return (
    <Box sx={{
      border: '2px solid #1976d2', 
      borderRadius: '8px',
      padding: '16px',
      width: '400px',
      margin: 'auto',
      backgroundColor: 'white',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      transition: 'box-shadow 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        transform: 'translateY(-4px)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      },
    }}>
      <Box sx={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  mb: 2,
  gap: 1
}}>
   <IconButton onClick={() => handleMonthChange(-1)} sx={{ padding: '8px', minWidth: 'unset', width: '36px', height: '36px' }}>
          <ArrowBackIcon sx={{ fontSize: '24px' }} />
        </IconButton>

        <Typography variant="h6" fontWeight="bold" sx={{ mx: 1, whiteSpace: 'nowrap' }}>
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
        </Typography>

        <IconButton onClick={() => handleMonthChange(1)} sx={{ padding: '8px', minWidth: 'unset', width: '36px', height: '36px' }}>
          <ArrowForwardIcon sx={{ fontSize: '24px' }} />
        </IconButton>
      </Box>



      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Box key={day} sx={{ textAlign: 'center', fontWeight: 'bold', color: '#1976d2' }}>{day}</Box>
        ))}
        {Array(firstDay).fill(null).map((_, index) => <Box key={index}></Box>)}
        {days.map((day) => {
  const dateString = `${currentYear}-${currentMonth + 1}-${day}`;
  const event = events.find(e => e.date === dateString);
  const isToday = new Date().toISOString().split('T')[0] === dateString;

  let backgroundColor = 'transparent';
  let textColor = 'black';

  if (event) {
    const now = new Date();
    const eventDate = new Date(event.start_time);
    const timeDiffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (timeDiffHours > 24) {
      backgroundColor = '#1976d2'; // Future >24h
      textColor = 'white';
    } else if (timeDiffHours < -24) {
      backgroundColor = '#90caf9'; // Past >24h
      textColor = 'white';
    } else {
      backgroundColor = '#f44336'; // Within 24h
      textColor = 'white';
    }
  } else if (isToday) {
    backgroundColor = '#ffeb3b';
    textColor = 'black';
  }

  return (
    <Box
      key={day}
      sx={{
        padding: '12px',
        backgroundColor,
        color: textColor,
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: '8px',
        '&:hover': {
          backgroundColor: event ? backgroundColor : '#f0f0f0'
        },
        fontWeight: isToday ? 'bold' : 'normal',
      }}
      onClick={() => onDateClick(dateString)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {event?.type === "Test" && <QuizIcon sx={{ fontSize: 20, color: 'white' }} />}
        {event?.type === "Assignment" && <InsertChartIcon sx={{ fontSize: 20, color: 'white' }} />}
      </Box>
      {day}
    </Box>
  );
})}

      </Box>
    </Box>
  );
};

// ------------------ CourseDetails Component ------------------
export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);
  const [upcomingTests, setUpcomingTests] = useState([]);

 
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
      const response = await fetch(`http://localhost:5000/course/${courseId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch course details");
      const data = await response.json();
      setCourse(data);

      const testResponse = await fetch(`http://localhost:5000/test/${courseId}/tests`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!testResponse.ok) throw new Error("Failed to fetch tests");
      const testData = await testResponse.json();

      // Format all tests: both past and upcoming
      const formattedTests = testData.map(test => {
        const date = new Date(test.start_time);
        return {
          ...test,
          date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
          type: "Test",
          title: test.name,
          description: test.description || "Test Details",
        };
      });
      
      
  

      setUpcomingTests(formattedTests); // Store all tests, both past and upcoming
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchCourseDetails();
}, [courseId]);

useEffect(() => {
  console.log(upcomingTests); // Debugging step
}, [upcomingTests]);



  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogContent(null);
  };
  const handleTestCountdown = (testStartTime, durationMinutes) => {
    const now = new Date();
    const startTime = new Date(testStartTime);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  
    const isAccessible = now >= startTime && now <= endTime;
  
    if (isAccessible) {
      return { message: "Test is available now!", isAccessible: true };
    }
  
    if (now > endTime) {
      return { message: "Test is no longer available.", isAccessible: false, isTestExpired: true };
    }
  
    const diff = startTime - now;
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
  
  
  const handleDateClick = (date) => {
    const event = upcomingTests.find(e => e.date === date);
    if (event) {
      const countdown = handleTestCountdown(event.start_time, event.duration);
      setDialogContent({
        ...event,
        countdownMessage: countdown.message,
        isTestAccessible: countdown.isAccessible
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
  
  

  const materials = [
    { id: 1, title: "Introduction to Databases (PDF)", url: "http://example.com/db_intro.pdf" },
    { id: 2, title: "SQL Querying for Beginners (Video)", url: "http://example.com/sql_intro.mp4" },
    { id: 3, title: "Database Design (Slides)", url: "http://example.com/db_design.pptx" }
  ];

  const forumPosts = course ? [
    {
      id: 1,
      title: "Important Announcement on Database Exam",
      content: "The database exam has been rescheduled to May 5th, 2025 at 10:00 AM.",
      postedAt: "2025-04-18",
      teacher: course.teacher_name
    },
    {
      id: 2,
      title: "Final Project Guidelines",
      content: "Please ensure your final project is submitted by May 15th, 2025.",
      postedAt: "2025-04-17",
      teacher: course.teacher_name
    }
  ] : [];

  const navigate = useNavigate();

const handleTakeTest = (testId) => {
  navigate(`/test/${testId}`);
};


  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Box mt={3}><Alert severity="error">{error}</Alert></Box>;
  if (!course) return <Typography>No course data found.</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Info and Test Access Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
      
        {/* Left Side: Course Info and Test Access */}
        <Box sx={{ flex: 1, minWidth: '45%' }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#1976d2' }}>
  {course?.name}
</Typography>

          
          {/* Teacher Info */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1,
            mb: 2 // Consistent margin for Teacher section
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
  
          {/* Semester Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}> {/* Consistent margin for Semester section */}
            <DateRangeIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6" color="textSecondary">Semester: {course?.semester}</Typography>
          </Box>
  
          {/* Course Description */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}> {/* Consistent margin for Description section */}
            <ClassIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6" color="textSecondary">Description: {course?.description}</Typography>
          </Box>
          
          {upcomingTests.length > 0 && upcomingTests.map((test) => {
            const countdown = handleTestCountdown(test.start_time, test.duration);
  
            // Check if test start_time is within ±24 hours
            const now = new Date();
            const testStart = new Date(test.start_time);
            const diffInHours = Math.abs(now - testStart) / (1000 * 60 * 60);
  
            if (diffInHours > 24) {
              return null; // Skip rendering this test
            }
  
            return (
              <Box
                key={test.id}
                sx={{
                  mt: 3,
                  mb: 3,
                  padding: 2,
                  borderRadius: '8px',
                  backgroundColor: '#e0e0e0',
                }}
              >
                <Typography variant="h6" color="primary">
                  {test.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {test.description}
                </Typography>
  
                <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {countdown.message}
                </Typography>
  
                {countdown.isAccessible && (
                  <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }} 
                  fullWidth
                  onClick={() => handleTakeTest(test.id)}
                >
                  Take Test
                </Button>
                )}
              </Box>
            );
          })}
        </Box>
  
        {/* Right Side: Calendar */}
        <Box sx={{ flex: 1, minWidth: '45%' }}>
          <Calendar events={upcomingTests} onDateClick={handleDateClick} onMonthChange={() => {}} />
        </Box>
      </Box>
  
      {/* Course Materials Section */}
      <Box mt={5}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          <DescriptionIcon sx={{ mr: 1 }} /> Course Materials
        </Typography>
        {materials.map((material) => (
          <Card key={material.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{material.title}</Typography>
              <Button href={material.url} target="_blank" rel="noopener noreferrer" variant="outlined" sx={{ mt: 1 }}>
                View Material
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
  
      {/* Forum Posts Section */}
      <Box mt={5}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          <MessageIcon sx={{ mr: 1 }} /> Teacher Forum Posts
        </Typography>
        {forumPosts.map((post) => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" color="primary">{post.title}</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Posted by {post.teacher} on {post.postedAt}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1">{post.content}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
  
      {/* Test Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QuizIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">Upcoming Test Details</Typography>
        </DialogTitle>
        <DialogContent dividers>
          {dialogContent && (
            <Box>
              <Typography variant="h5" color="primary" gutterBottom>
                {dialogContent.title}
              </Typography>
  
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                Description:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {dialogContent.description || "No description provided."}
              </Typography>
  
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Date:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {new Date(dialogContent.start_time).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
  
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Time:
              </Typography>
              <Typography variant="body1">
                {new Date(dialogContent.start_time).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
  
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                Countdown:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {dialogContent.countdownMessage}
              </Typography>
  
              {dialogContent.isTestAccessible && (
               <Button 
               variant="contained" 
               color="primary" 
               sx={{ mt: 2 }} 
               fullWidth
               onClick={() => handleTakeTest(test.id)}
             >
               Take Test
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
    backgroundColor: "#f44336", // Red background color
    color: "#fff", // White text
    ":hover": {
      backgroundColor: "#d32f2f", // Darker red on hover
      color: "#fff", // Ensure the text stays white on hover
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
