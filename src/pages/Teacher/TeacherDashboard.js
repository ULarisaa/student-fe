import { useState, useEffect } from "react";
import { Book, Users, Calendar, LayoutDashboard, User, PlusCircle, LogOut } from "lucide-react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import {
  Drawer,
  Box,
  CssBaseline,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Button,
} from "@mui/material";

import logo from "../../assets/logo.png"; 

import CoursePage from "./CoursePage"; 
import ReportPage from "./ReportPage"; 
import CreateCoursePage from "./CreateCoursePage";
import CreateTest from "./CreateTestPage";
import CreateAssignment from "./CreateAssignmentsPage";
import GradeAssignmentPage from "./GradeAssignmentPage";
import TeacherProfile from "./TeacherProfile";
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    courses: 0,
    pendingRequests: 2,
    upcomingTests: 3,
  });
  const [courses, setCourses] = useState([]);
  const [teacherName, setTeacherName] = useState("Teacher");
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("Name");
    if (storedName) {
      setTeacherName(storedName);
    }

  const fetchCourses = async () => {
  try {
    const response = await fetchWithRefresh("http://localhost:5000/course");

    const responseText = await response.text();
    if (response.ok) {
      const data = JSON.parse(responseText);

      const totalPendingRequests = data.reduce(
        (sum, course) => sum + parseInt(course.pending_count || 0),
        0
      );

      setCourses(data);
      setStats((prevStats) => ({
        ...prevStats,
        courses: data.length,
        pendingRequests: totalPendingRequests,
      }));
    } else {
      console.error("Failed to fetch courses, response status:", response.status);
      console.log("Response body:", responseText);
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
};


    fetchCourses();
  }, []);

const handleLogout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    await fetchWithRefresh("http://localhost:5000/user/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout failed", err);
  } finally {
    localStorage.clear();
    setTeacherName("Teacher"); 
    navigate("/", { replace: true }); 
  }
};
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            bgcolor: "#1976d2",
            color: "white",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >

        <Box>
          <Box
            sx={{
              mb: 3,
              mx: "auto",
              bgcolor: "white",
              p: 1,
              borderRadius: "50%",
              width: 120,
              height: 120,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                maxWidth: "80%",
                maxHeight: "80%",
                objectFit: "contain",
                borderRadius: "50%",
              }}
            />
          </Box>

          <List>
           

 
            {[
               { text: "Profile", link: "/TeacherDashboard/profile", icon: <User size={20} /> },
              { text: "Dashboard", link: "/TeacherDashboard", icon: <LayoutDashboard size={20} /> },
              { text: "Create Course", link: "/TeacherDashboard/create-course", icon: <PlusCircle size={20} /> },
            ].map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton component={Link} to={item.link}>
                  <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

         <Box>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ color: 'white' }}>
              <LogOut size={20} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
      </Drawer>


      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>

          <Route
            path="/"
            element={
              <>
                <Typography variant="h4" fontWeight="bold">
                  Welcome, {teacherName}!
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                    gap: 3,
                    mt: 3,
                  }}
                >
                  {[
                    { icon: <Book size={40} className="text-blue-600" />, label: "Courses", value: stats.courses },
                    { icon: <Users size={40} className="text-green-600" />, label: "Pending Requests", value: stats.pendingRequests },
                    { icon: <Calendar size={40} className="text-red-600" />, label: "Upcoming Tests", value: stats.upcomingTests },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 3,
                        boxShadow: 3,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        bgcolor: "white",
                      }}
                    >
                      {item.icon}
                      <div>
                        <Typography variant="h6" fontWeight="bold">
                          {item.value}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {item.label}
                        </Typography>
                      </div>
                    </Box>
                  ))}
                </Box>


                <Box mt={5}>
                  <Typography variant="h5" fontWeight="bold">
                    Your Courses
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                      gap: 3,
                    }}
                  >
             {courses.map((course) => (
  <Box
    key={course.id}
    sx={{
      p: 3,
      boxShadow: 3,
      borderRadius: 2,
      bgcolor: "white",
      transition: "0.3s",
      "&:hover": { boxShadow: 6 },
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: 170,
    }}
  >
    <Typography variant="h6" fontWeight="bold" mb={1}>
      {course.name}
    </Typography>

    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Users size={18} color="#4caf50" />
        <Typography variant="body2" fontWeight="medium">
          {course.enrolled_count} enrolled
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <User size={18} color="#ff9800" />
        <Typography variant="body2" fontWeight="medium">
          {course.pending_count} pending
        </Typography>
      </Box>
    </Box>

    <Button
      variant="contained"
      sx={{ mt: 3 }}
      fullWidth
      component={Link}
      to={`/TeacherDashboard/courses/${course.id}`}
    >
      Manage
    </Button>
  </Box>
))}


                  </Box>
                </Box>
              </>
            }
          />


         <Route path="/profile" element={<TeacherProfile />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route path="/courses/:courseId/create-test" element={<CreateTest />} />
          <Route path="/courses/:courseId/create-assignment" element={<CreateAssignment />} />
          <Route path="/test/:testId/student/:studentId/report" element={<ReportPage />} />
          <Route path="/create-course" element={<CreateCoursePage />} />
          <Route path="/assignment/:assignmentId/submission/:studentId" element={<GradeAssignmentPage />} />

        </Routes>
      </Box>
    </Box>
  );
}
