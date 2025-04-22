import { useState, useEffect } from "react";
import { Book, Calendar, LayoutDashboard, User, LogOut } from "lucide-react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { Drawer, Box, CssBaseline, Typography, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Button, CircularProgress } from "@mui/material";
import EnrollPage from "./EnrollPage";
import CourseDetails from "./CourseDetails";
import TestPage from "./TestPage";

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    courses: 0,
    upcomingTests: 3, // Static for now, you can modify this based on upcoming exams
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [studentName, setStudentName] = useState("Student");
  const [loading, setLoading] = useState(true); // State for loading
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("studentName");
    if (storedName) {
      setStudentName(storedName);
    }

    const fetchEnrolledCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/enroll/approved", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const responseText = await response.text();
        if (response.ok) {
          const data = JSON.parse(responseText);
          setEnrolledCourses(data);
          setStats((prevStats) => ({
            ...prevStats,
            courses: data.length,
          }));
        } else {
          console.error("Failed to fetch enrolled courses:", responseText);
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchEnrolledCourses();
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box", bgcolor: "#1976d2", color: "white", padding: 2 }
        }}
      >
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon sx={{ color: "white" }}>
                <User size={20} />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
          </ListItem>

          {[ 
            { text: "Dashboard", link: "/StudentDashboard", icon: <LayoutDashboard size={20} /> },
            { text: "Enroll", link: "/StudentDashboard/enroll", icon: <Book size={20} /> },
          ].map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton component={Link} to={item.link}>
                <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding sx={{ mt: 2 }}>
            <ListItemButton
              onClick={() => {
                localStorage.removeItem("studentName");
                localStorage.removeItem("token");
                navigate("/");
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <LogOut size={20} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Typography variant="h4" fontWeight="bold">Welcome, {studentName}!</Typography>
                <Typography variant="body1" color="textSecondary" mt={1}>
                  Here's an overview of your courses and activities.
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mt: 3 }}>
                  {[ 
                    { icon: <Book size={40} className="text-blue-600" />, label: "Courses", value: stats.courses },
                    { icon: <Calendar size={40} className="text-red-600" />, label: "Upcoming Tests", value: stats.upcomingTests }
                  ].map((item, index) => (
                    <Box key={index} sx={{ p: 3, boxShadow: 3, borderRadius: 2, display: "flex", alignItems: "center", gap: 2, bgcolor: "white" }}>
                      {item.icon}
                      <div>
                        <Typography variant="h6" fontWeight="bold">{item.value}</Typography>
                        <Typography variant="body2" color="textSecondary">{item.label}</Typography>
                      </div>
                    </Box>
                  ))}
                </Box>

                <Box mt={5}>
  <Typography variant="h5" fontWeight="bold">Enrolled Courses</Typography>
  <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
    {loading ? (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    ) : enrolledCourses.length > 0 ? (
      enrolledCourses.map((course) => (
        <Box key={course.id} sx={{ p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "white", transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
          <Typography variant="h6" fontWeight="bold">{course.course_name}</Typography>
          <Typography variant="body2" color="textSecondary">
            Teacher: {course.teacher_first_name} {course.teacher_last_name}
          </Typography>
          <Typography variant="body2" color="textSecondary">Semester: {course.semester}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }} 
            fullWidth 
            onClick={() => navigate(`/StudentDashboard/courses/${course.course_id}`)}
          >
            View Details
          </Button>
        </Box>
      ))
    ) : (
      <Typography variant="body1" color="textSecondary">No enrolled courses found.</Typography>
    )}
  </Box>
</Box>

              </>
            }
          />

          <Route path="/enroll" element={<EnrollPage />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/test/:testId" element={<TestPage />} />
        </Routes>
      </Box>
    </Box>
  );
}
