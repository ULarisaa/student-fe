import { useState } from "react";
import { Book, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Drawer, Box, CssBaseline, Button, Typography, List, ListItem, ListItemButton, ListItemText } from "@mui/material";

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    courses: 3,
    pendingRequests: 5,
    upcomingTests: 2,
  });

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{ width: 240, flexShrink: 0, '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', bgcolor: 'grey.900', color: 'white', padding: 2 } }}
      >
        <Typography variant="h6" gutterBottom>Teacher Portal</Typography>
        <List>
          {[{ text: "Dashboard", link: "/TeacherDashboard" },
            { text: "Courses", link: "/TeacherDashboard/courses" },
            { text: "Create Course", link: "/TeacherDashboard/create-course" }].map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton component={Link} to={item.link}>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
          ))}
        </List>
        <Button 
          variant="contained" 
          color="error" 
          fullWidth 
          sx={{ mt: 2 }}
          onClick={() => window.location.href = "/"}
        >
          Logout
        </Button>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: 30 }}>
        <Typography variant="h4" fontWeight="bold">Welcome, Teacher!</Typography>
        <Typography variant="body1" color="textSecondary" mt={1}>Here's an overview of your courses and activities.</Typography>
      
        {/* Quick Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mt: 3 }}>
          {[{icon: <Book size={40} className="text-blue-600" />, label: "Courses", value: stats.courses},
            {icon: <Users size={40} className="text-green-600" />, label: "Pending Requests", value: stats.pendingRequests},
            {icon: <Calendar size={40} className="text-red-600" />, label: "Upcoming Tests", value: stats.upcomingTests}]
            .map((item, index) => (
              <Box key={index} sx={{ p: 3, boxShadow: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'white' }}>
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
          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {[{ name: "Mathematics 101", students: 12 },
              { name: "Physics 202", students: 15 },
              { name: "Computer Science", students: 18 }]
              .map((course, index) => (
                <Box key={index} sx={{ p: 3, boxShadow: 3, borderRadius: 2, bgcolor: 'white', transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                  <Typography variant="h6" fontWeight="bold">{course.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{course.students} students enrolled</Typography>
                  <Button variant="contained" sx={{ mt: 2 }} fullWidth>Manage</Button>
                </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
