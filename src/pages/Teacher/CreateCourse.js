import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Box, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Card, CardContent, Divider, IconButton } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';

const CreateCourse = () => {
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
  
    // Get the token from localStorage
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('You must be logged in to create a course!');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ensure that the token is prefixed with 'Bearer '
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        const result = await response.json();
        alert(`Course created successfully with ID: ${result.id}`);
        setFormData({
          name: '',
          description: '',
          semester: '',
          isActive: true,
        });
      } else {
        const errorResult = await response.json();
        alert(`Failed to create course: ${errorResult.error}`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };
  
  

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: '20px' }}>
      <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
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
                  <InputLabel>Semester</InputLabel>
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
    </Box>
  );
};

export default CreateCourse;
