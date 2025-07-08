import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  IconButton,
  Snackbar,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";
const TeacherProfile = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");

  const [profilePic, setProfilePic] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

 useEffect(() => {
  fetchWithRefresh("http://localhost:5000/user/profile")
    .then((res) => res.json())
    .then((data) => {
      setStudentData(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error('Error fetching profile:', err);
      setLoading(false);
    });
}, []);


  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleOpenSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

const handlePasswordChange = () => {
  if (!oldPassword.trim() || !newPassword.trim()) {
    handleOpenSnackbar("Please fill in both fields.", "error");
    return;
  }

  fetchWithRefresh("http://localhost:5000/user/change-password", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ oldPassword, newPassword }),
    credentials: "include", // dacă refresh token-ul e în cookie, trimite-l
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        handleOpenSnackbar("Password changed successfully.", "success");
        setOldPassword("");
        setNewPassword("");
      } else {
        handleOpenSnackbar(data.message || "Password change failed.", "error");
      }
    })
    .catch(() => handleOpenSnackbar("Server error. Please try again.", "error"));
};

  const handleContactSubmit = () => {
    if (!message.trim()) {
      handleOpenSnackbar("Please enter a message.", "error");
      return;
    }

    // Simulez trimiterea mesajului (sau apelezi API-ul real)
    handleOpenSnackbar("Your message has been sent to the admin.", "success");
    setMessage("");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isPasswordFormValid = oldPassword.trim() !== "" && newPassword.trim() !== "";
  const isMessageValid = message.trim() !== "";

  return (
    <Box sx={{ mx: "auto" }}>
      {/* Profile Header */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Teacher Profile" />
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Box sx={{ position: "relative" }}>
                <Avatar src={profilePic} sx={{ width: 100, height: 100 }}>
                  {studentData.first_name.charAt(0)}
                </Avatar>
                <IconButton component="label" sx={{ position: "absolute", bottom: -10, right: -10 }}>
                  <PhotoCamera />
                  <input type="file" hidden accept="image/*" onChange={handleProfilePicChange} />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs>
              <Typography variant="h6">
                {studentData.first_name} {studentData.last_name}
              </Typography>
              <Typography color="text.secondary">{studentData.email}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Change Password" />
        <CardContent>
          <TextField
            fullWidth
            type="password"
            label="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={!isPasswordFormValid}
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Contact Admin */}
      <Card>
        <CardHeader title="Contact Admin" />
        <CardContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="outlined"
            onClick={handleContactSubmit}
            disabled={!isMessageValid}
          >
            Send Message
          </Button>
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherProfile;
