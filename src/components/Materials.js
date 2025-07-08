import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { fetchWithRefresh } from "../utils/fetchWithRefresh";

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function CoursePostsWithFiles() {
  const { courseId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTitles, setExpandedTitles] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, file: null });
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const courseName = location.state?.courseName || 'Unknown Course';
  const [uploadError, setUploadError] = useState('');
const [uploadSuccess, setUploadSuccess] = useState('');
const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));



  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) setAttachmentFiles((prev) => [...prev, ...files]);
  };

  const handleDeleteFile = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

const handleUpload = async (e) => {
  e.preventDefault();

  setUploadError('');
  setUploadSuccess('');

  if (!title.trim()) {
    setUploadError('Please enter a title!');
    return;
  }

  if (attachmentFiles.length === 0) {
    setUploadError('Please add files before uploading!');
    return;
  }

  setUploading(true);

  const formData = new FormData();
  formData.append('title', title.trim());
  formData.append('courseId', courseId);
  attachmentFiles.forEach((file) => {
    formData.append('materials', file);
  });



  try {
 const response = await fetchWithRefresh(`http://localhost:5000/course/${courseId}/upload-materials`, {
  method: 'POST',
  body: formData,
});


  if (response.ok) {
  setUploadSuccess('Materials uploaded successfully!');
  setAttachmentFiles([]);
  setTitle('');

  setTimeout(() => {
    setUploadSuccess('');
    fetchPosts();  // apelul după ce dispare mesajul
  }, 3000);
} else {
  setUploadError('Upload failed.');
  setTimeout(() => {
    setUploadError('');
    // opțional, aici poți face alte acțiuni după ce dispare eroarea
  }, 3000);
}
  }
catch (error) {
  console.error('Upload error:', error);
  setUploadError('An error occurred during upload.');
  setTimeout(() => {
    setUploadError('');
    // eventual aici poți face alte acțiuni dacă vrei
  }, 3000);
}


  setUploading(false);
};

const fetchPosts = async () => {
  setLoading(true);
  try {
   const res = await fetchWithRefresh(`http://localhost:5000/course/${courseId}/materials`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setPosts(data);
  } catch (error) {
    console.error("Failed to load posts:", error);
    setPosts([]);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  if (courseId) {
    fetchPosts();
  }
}, [courseId]);


  const groupedPosts = posts.reduce((acc, post) => {
    if (!acc[post.title]) acc[post.title] = [];
    acc[post.title].push(post);
    return acc;
  }, {});

  const toggleExpand = (title) => {
    setExpandedTitles((prev) => ({ ...prev, [title]: !prev[title] }));
  };
 const formatFileSize = (size) => {
  const sizeNum = Number(size);
  if (sizeNum < 1024) return `${sizeNum} B`;
  if (sizeNum < 1024 * 1024) return `${(sizeNum / 1024).toFixed(1)} KB`;
  return `${(sizeNum / (1024 * 1024)).toFixed(2)} MB`;
};

  const downloadFile = async (file) => {
    try {
    const response = await fetchWithRefresh(`http://localhost:5000/course/materials/${file.id}/download`);

      if (!response.ok) throw new Error("Failed to download file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file: " + error.message);
    }
  };

  const handleDeleteClick = (file) => setDeleteDialog({ open: true, file });
  const handleCancelDelete = () => setDeleteDialog({ open: false, file: null });

const handleConfirmDelete = async () => {
  if (!deleteDialog.file) return;

  try {
    const res = await fetchWithRefresh(
      `http://localhost:5000/course/materials/${deleteDialog.file.id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to delete file (status ${res.status})`);
    }

    setPosts((prev) => prev.filter((p) => p.id !== deleteDialog.file.id));
    setDeleteDialog({ open: false, file: null });

    // Afișează snackbar de succes
    setSnackbar({
      open: true,
      message: "File deleted successfully.",
      severity: "success",
    });
  } catch (error) {
    // Afișează snackbar de eroare
    setSnackbar({
      open: true,
      message: "Error deleting file: " + error.message,
      severity: "error",
    });
  }
};



  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography mt={2}>Loading posts...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2 }}>
      {/** Upload form */}
 <Box p={3} mb={4} border="1px solid #ddd" borderRadius={3} boxShadow={1}>
  <Typography variant="h6" fontWeight="bold" mb={2}>
    Upload Materials 
  </Typography>

  <TextField
    fullWidth
    label="Upload Title"
    variant="outlined"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    disabled={uploading}
    sx={{ mb: 2 }}
    required
  />

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
      borderRadius: 2,
      padding: 2,
      backgroundColor: '#e3f2fd',
      cursor: 'pointer',
      color: '#1976d2',
      fontWeight: 500,
      mb: 2,
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
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: '#bbdefb',
              borderRadius: 1,
              p: 1,
              mb: 1,
            }}
          >
            <Typography>{file.name} ({formatBytes(file.size)})</Typography>
            <IconButton size="small" color="error" onClick={() => handleDeleteFile(idx)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Button variant="outlined" onClick={() => setAttachmentFiles([])} disabled={uploading}>
            Delete All
          </Button>
          <Button variant="outlined" component="label" disabled={uploading}>
            Add More
            <input type="file" multiple hidden onChange={handleFileChange} />
          </Button>
        </Stack>
      </>
    ) : (
      <>
        <Typography>Drag and drop files here or click below</Typography>
        <Button variant="outlined" component="label" sx={{ mt: 2 }} disabled={uploading}>
          Browse Files
          <input type="file" multiple hidden onChange={handleFileChange} />
        </Button>
      </>
    )}
  </Box>

  {uploadError && (
    <Typography color="error" mb={1}>
      {uploadError}
    </Typography>
  )}
  {uploadSuccess && (
    <Typography color="success.main" mb={1}>
      {uploadSuccess}
    </Typography>
  )}

  <Button variant="contained" onClick={handleUpload} disabled={uploading || !title || attachmentFiles.length === 0} fullWidth>
    {uploading ? 'Uploading...' : 'Upload'}
  </Button>
</Box>


       {Object.entries(groupedPosts).map(([title, files]) => (
        <Paper
          key={title}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            boxShadow: 4,
            backgroundColor: "#fff",
            userSelect: "none",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ cursor: "pointer" }}
            onClick={() => toggleExpand(title)}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1976d2" }}>
              {title}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary" sx={{ userSelect: "text" }}>
                {new Date(
                  Math.max(...files.map((file) => new Date(file.uploaded_at).getTime()))
                ).toLocaleString()}
              </Typography>
              {expandedTitles[title] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
          </Box>

          <Collapse in={expandedTitles[title]} timeout="auto" unmountOnExit>
            <Box mt={2}>
             {files.length > 0 ? (
  files.map((file) => (
    <Box
      key={file.id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1,
        mb: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
        boxShadow: 1,
        transition: 'background-color 0.2s',
        '&:hover': { backgroundColor: '#e3f2fd' },
      }}
    >
      <InsertDriveFileIcon color="primary" />
      
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Typography
          component="span"
          onClick={() => downloadFile(file)}
          sx={{
            color: '#1565c0',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            userSelect: 'text',
          }}
          title={file.filename}
        >
          {file.filename}
        </Typography>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ minWidth: 80, textAlign: 'right' }}
      >
        {formatFileSize(file.filesize)}
      </Typography>

      <Tooltip title="Delete file">
        <IconButton
          size="small"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(file);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Box>
  ))
) : (
  <Typography color="text.secondary" textAlign="center" py={1}>
    No files attached.
  </Typography>
)}

            </Box>
          </Collapse>
        </Paper>
      ))}

   <Dialog open={deleteDialog.open} onClose={handleCancelDelete}>
  <DialogTitle>Confirm Delete</DialogTitle>
  <DialogContent>
    Are you sure you want to delete file: <strong>{deleteDialog.file?.filename}</strong>?
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCancelDelete}>
      Cancel
    </Button>
    <Button color="error" variant="contained" onClick={handleConfirmDelete}>
      Delete
    </Button>
  </DialogActions>
</Dialog>
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
