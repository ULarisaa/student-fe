import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  Grid,
  FormControlLabel,
  Checkbox,
  Stack,
  IconButton,Divider, 
  Snackbar, Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AddCircleOutline } from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";
const answerTypes = [
  { value: "text", label: "Text Answer" },
  { value: "file", label: "File Upload" },
];

const fileTypeOptions = [
  { label: ".pdf", value: ".pdf" },
  { label: ".docx", value: ".docx" },
  { label: ".txt", value: ".txt" },
  { label: ".zip", value: ".zip" },
  { label: ".png", value: ".png" },
  { label: ".jpg", value: ".jpg" },
];

const CreateAssignment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
 const location = useLocation();
  const courseName = location.state?.courseName || 'Unknown Course';
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [dueDateTime, setDueDateTime] = useState("");
  const [description, setDescription] = useState("");
  const [answerType, setAnswerType] = useState("text");
  const [selectedFileTypes, setSelectedFileTypes] = useState([]);
  const [maxFileSize, setMaxFileSize] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [maxFiles, setMaxFiles] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const formatBytes = (bytes) => {
    if (!bytes) return "";
    const k = 1024,
      sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Append new files instead of replacing existing files
  const handleFileChange = (event) => {
    if (event.target.files) {
      setAttachmentFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(event.target.files),
      ]);
    }
  };

  // Remove a single file by index
  const handleDeleteFile = (index) => {
    setAttachmentFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
  };

  const handleFileTypeChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedFileTypes((prev) => [...prev, value]);
    } else {
      setSelectedFileTypes((prev) => prev.filter((type) => type !== value));
    }
  };

 const handleSubmit = async () => {
  const token = localStorage.getItem("token");

  if (
    answerType === "file" &&
    (Number(maxFiles) < 1 || Number(maxFileSize) <= 0)
  ) {
    setSnackbar({
      open: true,
      message: "Please enter valid file limits.",
      severity: "error",
    });
    return;
  }

  const formData = new FormData();

  formData.append("title", assignmentTitle);
  formData.append("startDate", startDateTime);
  formData.append("dueDate", dueDateTime);
  formData.append("description", description);
  formData.append("answerType", answerType);
  formData.append("courseId", courseId);

  if (answerType === "file") {
    formData.append("allowedFileTypes", selectedFileTypes.join(","));
    formData.append("maxFileSize", Number(maxFileSize));
    formData.append("maxFiles", Number(maxFiles));
  }

  if (attachmentFiles.length > 0) {
    attachmentFiles.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  try {
   const response = await fetchWithRefresh(
  `http://localhost:5000/assignments/${courseId}/create`,
  {
    method: "POST",
    body: formData, // don't set Content-Type; browser sets it automatically for FormData
  }
);


    if (response.ok) {
      setSnackbar({
        open: true,
        message: "Assignment created successfully!",
        severity: "success",
      });
      setTimeout(() => {
        navigate(`/TeacherDashboard/courses/${courseId}`);
      }, 1500);
    } else {
      setSnackbar({
        open: true,
        message: "Error creating assignment.",
        severity: "error",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    setSnackbar({
      open: true,
      message: "Error creating assignment.",
      severity: "error",
    });
  }
};


  return (
    <Box sx={{ maxWidth: '80%', margin: 'auto', padding: '20px', borderRadius: 2 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Create New Assignment for {courseName}
          </Typography>
          <Divider sx={{ marginBottom: 3 }} />

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <Grid container spacing={4}>
              {/* Assignment Title */}
              <Grid item xs={12}>
                <TextField
                  label="Assignment Title"
                  variant="outlined"
                  fullWidth
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  required
                  InputLabelProps={{ style: { color: '#1976d2' } }}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>

              {/* Start Date and Time */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date and Time"
                  type="datetime-local"
                  variant="outlined"
                  fullWidth
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true, style: { color: '#1976d2' } }}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>

              {/* Due Date and Time */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Due Date and Time"
                  type="datetime-local"
                  variant="outlined"
                  fullWidth
                  value={dueDateTime}
                  onChange={(e) => setDueDateTime(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true, style: { color: '#1976d2' } }}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>

              {/* Description / Instructions */}
              <Grid item xs={12}>
                <TextField
                  label="Description / Instructions"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                />
              </Grid>

              {/* Answer Type */}
              <Grid item xs={12}>
                <TextField
                  select
                  label="Answer Type"
                  variant="outlined"
                  fullWidth
                  value={answerType}
                  onChange={(e) => setAnswerType(e.target.value)}
                  required
                  InputLabelProps={{ style: { color: '#1976d2' } }}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#1976d2' },
                      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                    },
                  }}
                >
                  {answerTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* File type options only if answerType === "file" */}
            {answerType === 'file' && (
  <>
    <Grid item xs={12}>
      <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        Allowed File Types:
      </Typography>
    </Grid>

    {fileTypeOptions.map((type, index) => (
      <Grid item xs={4} sm={4} key={type.value}>
        <FormControlLabel
          control={
            <Checkbox
              value={type.value}
              checked={selectedFileTypes.includes(type.value)}
              onChange={handleFileTypeChange}
              sx={{
                color: '#1976d2',
                '&.Mui-checked': { color: '#1976d2' },
              }}
            />
          }
          label={type.label}
        />
      </Grid>
    ))}

    <Grid container item xs={12} spacing={2}>
      <Grid item xs={6}>
        <TextField
          label="Max File Size (MB)"
          type="number"
          variant="outlined"
          fullWidth
          value={maxFileSize}
          onChange={(e) => setMaxFileSize(e.target.value)}
          InputLabelProps={{ style: { color: '#1976d2' } }}
          sx={{
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': { borderColor: '#1976d2' },
              '&.Mui-focused fieldset': { borderColor: '#1976d2' },
            },
          }}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          label="Max Number of Files"
          type="number"
          variant="outlined"
          fullWidth
          value={maxFiles}
          onChange={(e) => setMaxFiles(e.target.value)}
          InputLabelProps={{ style: { color: '#1976d2' } }}
          sx={{
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': { borderColor: '#1976d2' },
              '&.Mui-focused fieldset': { borderColor: '#1976d2' },
            },
          }}
        />
      </Grid>
    </Grid>
  </>
)}

              {/* File Attachments Drag and Drop */}
              <Grid item xs={12}>
                <Box
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedFiles = Array.from(e.dataTransfer.files);
                    if (droppedFiles.length) {
                      setAttachmentFiles((prev) => [...prev, ...droppedFiles]);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  sx={{
                    border: '2px dashed #90caf9',
                    borderRadius: 3,
                    padding: 3,
                    backgroundColor: '#e3f2fd',
                    cursor: 'pointer',
                    color: '#1976d2',
                    fontWeight: 500,
                    textAlign: 'center',
                  }}
                >
                  {attachmentFiles.length > 0 ? (
                    <>
                      {attachmentFiles.map((file, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: '#bbdefb',
                            borderRadius: 1,
                            p: 1,
                            mb: 1,
                          }}
                        >
                          <Typography variant="body1" fontWeight={600}>
                            {file.name} ({formatBytes(file.size)})
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteFile(idx)}
                            aria-label={`Delete ${file.name}`}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                      <Stack direction="row" spacing={2} justifyContent="center" mt={1}>
                        <Button variant="outlined" size="small" onClick={() => setAttachmentFiles([])}>
                          Delete All
                        </Button>
                        <Button variant="outlined" size="small" component="label">
                          Add More
                          <input type="file" multiple hidden onChange={handleFileChange} />
                        </Button>
                      </Stack>
                    </>
                  ) : (
                    <>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        Drag and drop files here or click to select
                      </Typography>
                      <Button variant="outlined" component="label" sx={{ display: 'block', mx: 'auto' }}>
                        Browse Files
                        <input type="file" multiple hidden onChange={handleFileChange} />
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  disabled={!assignmentTitle || !startDateTime || !dueDateTime}
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
                  startIcon={<AddCircleOutline />}
                >
                  Create Assignment
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
}

export default CreateAssignment;
