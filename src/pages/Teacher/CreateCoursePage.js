import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Box, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Card, CardContent, Divider, IconButton, Snackbar, Alert } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchWithRefresh } from '../../utils/fetchWithRefresh';

const CreateCourse = () => {
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
const navigate = useNavigate();

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    semester: '',
    isActive: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submission using fetch instead of axios
  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token');

  if (!token) {
    setSnackbar({
      open: true,
      message: 'You must be logged in to create a course!',
      severity: 'error',
    });
    return;
  }

  try {
   const response = await fetchWithRefresh('http://localhost:5000/course', {
  method: 'POST',
  body: JSON.stringify(formData),
});


  if (response.ok) {
  const result = await response.json();
  setSnackbar({
    open: true,
    message: `Course created successfully`,
    severity: 'success',
  });

  setFormData({
    name: '',
    description: '',
    semester: '',
    isActive: true,
  });

  setTimeout(() => {
  navigate('/TeacherDashboard', { replace: true });
  window.location.reload(); 
}, 2000);

}
 else {
      const errorResult = await response.json();
      setSnackbar({
        open: true,
        message: `Failed to create course: ${errorResult.error}`,
        severity: 'error',
      });
    }
  } catch (error) {
    console.error('Error creating course:', error);
    setSnackbar({
      open: true,
      message: 'Failed to create course',
      severity: 'error',
    });
  }
};
const isFormValid = formData.name.trim() !== '' &&
                    formData.description.trim() !== '' &&
                    formData.semester.trim() !== '';


  return (
    <Box sx={{ maxWidth: '80%', margin: 'auto', padding: '20px',  borderRadius: 2 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
        <CardContent>
         <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Create New Course
          </Typography>
          <Divider sx={{ marginBottom: 3 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Course Name */}
              <Grid item xs={12}>
                <TextField
                  label="Course Name"
                  variant="outlined"
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    style: { color: '#1976d2' }, // Make the label text color blue
                  }}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                  InputLabelProps={{
                    style: { color: '#1976d2' }, // Make the label text color blue
                  }}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>

              {/* Semester Dropdown */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#1976d2' }}>Semester</InputLabel>
                  <Select
                    label="Semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#1976d2' },
                        '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                      },
                    }}
                  >
                    <MenuItem value="First">First Semester</MenuItem>
                    <MenuItem value="Second">Second Semester</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Active Status */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      name="isActive"
                      sx={{
                        color: '#1976d2',
                        '&.Mui-checked': { color: '#1976d2' },
                      }}
                    />
                  }
                  label="Active Course"
                />
              </Grid>

              {/* Submit Button with Icon */}
              <Grid item xs={12}>
               <Button
  variant="contained"
  color="primary"
  type="submit"
  fullWidth
  disabled={!isFormValid} // 🔒 dezactivat dacă nu e valid
  sx={{
    backgroundColor: '#1976d2',
    '&:hover': { backgroundColor: '#1565c0' },
    padding: '12px',
    fontWeight: 'bold',
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <AddCircleOutline sx={{ marginRight: 1 }} /> Create Course
</Button>

              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
         <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
              </Alert>
            </Snackbar>
    </Box>
  );
};

export default CreateCourse;
