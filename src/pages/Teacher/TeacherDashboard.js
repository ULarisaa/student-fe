import { useState, useEffect } from "react";
import { Book, Users, Calendar, LayoutDashboard, User, PlusCircle, LogOut } from "lucide-react";
import { Link, Routes, Route } from "react-router-dom";
import { Drawer, Box, CssBaseline, Typography, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Button } from "@mui/material";
import CoursePage from "./CoursePage"; 
import ReportPage from "./ReportPage"; 

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    courses: 3,
    pendingRequests: 5,
    upcomingTests: 2,
  });

  const [teacherName, setTeacherName] = useState("Teacher");

  useEffect(() => {
    const storedName = localStorage.getItem("teacherName");
    if (storedName) {
      setTeacherName(storedName);
    }
  }, []);

  // Fake course data for demo
  const courses = [
    { id: 0, name: "Mathematics 101", students: 12 },
    { id: 1, name: "Physics 202", students: 15 },
    { id: 2, name: "Computer Science", students: 18 }
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box", bgcolor: "grey.900", color: "white", padding: 2 }
        }}
      >
        <List>
          {/* Profile Section */}
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon sx={{ color: "white" }}>
                <User size={20} />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
          </ListItem>

          {/* Menu Items */}
          {[ 
            { text: "Dashboard", link: "/TeacherDashboard", icon: <LayoutDashboard size={20} /> },
            { text: "Create Course", link: "/TeacherDashboard/create-course", icon: <PlusCircle size={20} /> }
          ].map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton component={Link} to={item.link}>
                <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          {/* Logout Button */}
          <ListItem disablePadding sx={{ mt: 2 }}>
            <ListItemButton
              onClick={() => {
                localStorage.removeItem("teacherName");
                window.location.href = "/";
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

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          {/* Dashboard */}
          <Route
            path="/"
            element={
              <>
                <Typography variant="h4" fontWeight="bold">Welcome, {teacherName}!</Typography>
                <Typography variant="body1" color="textSecondary" mt={1}>
                  Here's an overview of your courses and activities.
                </Typography>

                {/* Quick Stats */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3, mt: 3 }}>
                  {[ 
                    { icon: <Book size={40} className="text-blue-600" />, label: "Courses", value: stats.courses },
                    { icon: <Users size={40} className="text-green-600" />, label: "Pending Requests", value: stats.pendingRequests },
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

                {/* Courses Overview */}
                <Box mt={5}>
                  <Typography variant="h5" fontWeight="bold">Your Courses</Typography>
                  <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
                    {courses.map((course) => (
                      <Box key={course.id} sx={{ p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "white", transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
                        <Typography variant="h6" fontWeight="bold">{course.name}</Typography>
                        <Typography variant="body2" color="textSecondary">{course.students} students enrolled</Typography>
                        <Button variant="contained" sx={{ mt: 2 }} fullWidth component={Link} to={`/TeacherDashboard/courses/${course.id}`}>
                          Manage
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            }
          />

          {/* Course Page */}
          <Route path="/courses/:courseId" element={<CoursePage />} />

          <Route path="/test/:testName/student/:studentId/report" element={<ReportPage />} />

        </Routes>
      </Box>
    </Box>
  );
}
