import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  CircularProgress,
  Box,
  Button,
  TextField,
  Alert,
  Stack,
  Divider,
    Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  CardContent,
  Link,
  IconButton,
  Avatar
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { fetchWithRefresh } from "../../utils/fetchWithRefresh";


const AssignmentPage = () => {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
   const [attachmentFiles, setAttachmentFiles] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const [textAnswer, setTextAnswer] = useState("");
  const [textError, setTextError] = useState("");

  const [submitStatus, setSubmitStatus] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [duePassed, setDuePassed] = useState(false);


  const [grade, setGrade] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState("No submissions yet");
  const [lastModified, setLastModified] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
const [commentError, setCommentError] = useState("");
const [commentSubmitStatus, setCommentSubmitStatus] = useState("");
const [submission,setSubmission]=useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

const [existingFiles, setExistingFiles] = useState([]);   
const [editing, setEditing] = useState(false);  
const showTemporaryStatus = (message, duration = 3000) => {
  setSubmitStatus(message);
  setTimeout(() => {
    setSubmitStatus("");
  }, duration);
};



useEffect(() => {
  const fetchSubmission = async () => {


    try {
      const response = await fetchWithRefresh(`http://localhost:5000/assignments/assignment/${assignmentId}/submission`);

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setSubmission(data);
        setHasSubmitted(true);
        setGrade(data.grade || null);
        setSubmissionStatus(data.status || 'Submitted');
        setLastModified(data.last_modified ? new Date(data.last_modified) : null);
      } else if (response.status === 404) {
        setHasSubmitted(false);
        setSubmissionStatus('No submissions yet');
      } else {
        throw new Error('Fetch error');
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      setHasSubmitted(false);
      setSubmissionStatus('Error loading submission');
    } finally {
      setLoading(false);
    }
  };

  if (assignmentId) {
    fetchSubmission();
  }
}, [assignmentId]);
  useEffect(() => {
    const fetchAssignment = async () => {


      try {
       const response = await fetchWithRefresh(`http://localhost:5000/assignments/assignment/${assignmentId}`);

        if (response.ok) {
          const data = await response.json();
          setAssignment(data);

          const now = new Date();
          const dueDate = new Date(data.due_date);
          setDuePassed(now > dueDate);

         console.log(data);
    
 
        } else {
          setAssignment(null);
        }
      } catch {
        setAssignment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);


function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}


const handleFileChange = (e) => {
  setFileError("");

  const files = e.target.files;
  if (!files || files.length === 0) {
    setAttachmentFiles([]);
    setSelectedFile(null);
    return;
  }

  const allowed = assignment.allowed_file_types
    ? assignment.allowed_file_types
        .split(",")
        .map((ext) => ext.trim().toLowerCase().replace(/^\./, ""))
    : [];

  const maxFileSizeBytes = assignment.max_file_size
    ? assignment.max_file_size * 1024 * 1024
    : Infinity;

  const maxFiles = assignment.max_files || Infinity;

  const newFilesArray = Array.from(files);


  const filteredNewFiles = newFilesArray.filter((newFile) => {
    return !attachmentFiles.some(
      (existingFile) =>
        existingFile.name === newFile.name && existingFile.size === newFile.size
    );
  });

  for (const file of filteredNewFiles) {
    const fileExt = file.name.split(".").pop().toLowerCase();
    if (allowed.length && !allowed.includes(fileExt)) {
      setFileError(`File type .${fileExt} is not allowed.`);
      return;
    }
  }

  if (attachmentFiles.length + filteredNewFiles.length > maxFiles) {
    setFileError(`You can only upload up to ${maxFiles} files.`);
    return;
  }

  const totalSizeBytes =
    attachmentFiles.reduce((acc, f) => acc + f.size, 0) +
    filteredNewFiles.reduce((acc, f) => acc + f.size, 0);

  if (totalSizeBytes > maxFileSizeBytes) {
    setFileError(
      `Total files size exceeds the max allowed size of ${assignment.max_file_size.toFixed(
        2
      )} MB.`
    );
    return;
  }

  setAttachmentFiles((prevFiles) => [...prevFiles, ...filteredNewFiles]);

  setSelectedFile(filteredNewFiles[filteredNewFiles.length - 1] || null);


  e.target.value = null;
};

const handleFileSubmit = async () => {
  setFileError("");
  setSubmitStatus("");
  setIsSubmitting(true);

  const existingFileIds = existingFiles.map((f) => f.id);
console.log(existingFiles);
  try {
 
    if (attachmentFiles.length === 0 && existingFileIds.length === 0) {
     const response = await fetchWithRefresh(`http://localhost:5000/assignments/${assignmentId}/delete-submission`, {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json", 
  },
});
if (response.ok) {
  setHasSubmitted(false);
  setExistingFiles([]);
  setSubmission((prev) => ({
    ...prev,
    files: [],
    submittedAt: null,
    status: "not submitted",
  }));
showTemporaryStatus("Submission deleted.");

setTimeout(() => {
  window.location.reload();
}, 2000); 

}
 else {
        const err = await response.json();
        setSubmitStatus(`Delete error: ${err.error || "Unknown error"}`);
      }
    } else {

      const formData = new FormData();
      attachmentFiles.forEach((file) => formData.append("files", file));
      formData.append("existingFileIds", JSON.stringify(existingFileIds));
      formData.append("assignmentId", assignmentId);

      const response = await fetchWithRefresh(`http://localhost:5000/assignments/${assignmentId}/submit-file`, {
  method: "POST",
  body: formData, 
});
if (response.ok) {
  const data = await response.json();

  setHasSubmitted(true);
  setAttachmentFiles([]);
  setExistingFiles(data.updatedFiles || []);

  setSubmission((prev) => ({
    ...prev,
    files: data.updatedFiles || [],
    submittedAt: data.submittedAt || new Date().toISOString(),
    status: data.status || "submitted",
  }));

setEditing(false);
showTemporaryStatus("File submitted successfully!");

setTimeout(() => {
  window.location.reload();
}, 2000); 

}
 else {
        const err = await response.json();
        setSubmitStatus(`Submission error: ${err.error || "Unknown error"}`);
      }
    }
  } catch (error) {
    setSubmitStatus("Submission error: " + error.message);
  } finally {
    setIsSubmitting(false);
  }
};



  const handleTextSubmit = async () => {
    if (!textAnswer.trim()) {
      setTextError("Please enter your answer.");
      return;
    }

    setSubmitStatus("");


    try {
    const response = await fetchWithRefresh(`http://localhost:5000/assignments/${assignmentId}/submit-test`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    assignmentId,
    answer: textAnswer.trim(),
  }),
});


      if (response.ok) {
        setSubmitStatus("Answer submitted successfully!");
        setHasSubmitted(true);
        setTextAnswer("");

        setSubmissionStatus("Submitted");
        setLastModified(new Date());
      } else {
        const err = await response.json();
        setSubmitStatus(`Submission error: ${err.error || "Unknown error"}`);
      }
    } catch (error) {
      setSubmitStatus("Submission error: " + error.message);
    }
  };


  const renderTimeLeft = () => {
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const diffMs = dueDate - now;

    if (diffMs > 0) {
 
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      return `Time left: ${diffDays} day(s) ${diffHours} hour(s)`;
    } else {

      const overdueMs = now - dueDate;
      const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
      const overdueHours = Math.floor((overdueMs / (1000 * 60 * 60)) % 24);
      return `Assignment overdue by: ${overdueDays} day(s) ${overdueHours} hour(s)`;
    }
  };

  
const handleDeleteFile = (index) => {
  setAttachmentFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
};

const fetchComments = async () => {
  try {
    const res = await fetchWithRefresh(`http://localhost:5000/assignments/${assignmentId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    } else {
      console.error("Failed to fetch comments");
    }
  } catch (err) {
    console.error("Error fetching comments:", err);
  }
};

useEffect(() => {
  if (assignmentId) {
    fetchComments();
  }
}, [assignmentId]);

const handleCommentSubmit = async () => {
  if (!newCommentText.trim()) {
    setCommentError("Comment cannot be empty.");
    return;
  }
  setCommentError("");
  setCommentSubmitStatus("");

  try {
    const res = await fetchWithRefresh(`http://localhost:5000/assignments/${assignmentId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: newCommentText.trim() }),
    });

    if (res.ok) {
      const createdComment = await res.json();
      setNewCommentText("");
      setCommentSubmitStatus("Comment submitted successfully!");
      
      await fetchComments();
    } else {
      const errData = await res.json();
      setCommentSubmitStatus(`Submission error: ${errData.error || "Unknown error"}`);
    }
  } catch (err) {
    setCommentSubmitStatus("Submission error: " + err.message);
  }
};



  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Typography
        variant="h6"
        align="center"
        sx={{ mt: 6, color: "error.main", fontWeight: "medium" }}
      >
        Assignment not found.
      </Typography>
    );
  }

  const downloadFileAssignment = async (file) => {


  try {
    
const response = await fetchWithRefresh(`http://localhost:5000/assignments/attachments/${file.id}`);

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.file_name; 
    console.log(file.file_name);

    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
  }
};


  const downloadFileSubmission = async (file) => {


  try {
   const response = await fetchWithRefresh(`http://localhost:5000/assignments/submission-files/${file.id}`);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await response.blob();

 
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.file_name; 
    console.log(file.file_name);

    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
  }
};


return (
  <Box sx={{ maxWidth: '90%', margin: 'auto', padding: '20px', borderRadius: 2 }}>
    <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4, borderBottom: '2px solid #1565c0', pb: 1 }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, color: '#1565c0' }}
          >
            {assignment.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           

            <AccessTimeIcon
              sx={{
                color: hasSubmitted
                  ? 'success.main'
                  : duePassed
                    ? 'error.main'
                    : 'warning.main',
                fontSize: 28,
              }}
            />
            <Box>
             {hasSubmitted ? (
  <Typography
    variant="subtitle2"
    sx={{ fontWeight: 600, color: 'text.secondary' }}
  >
    Submitted on:{' '}
    {new Date(submission.submittedAt).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}
  </Typography>
) : (
  <>
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 600, color: duePassed ? 'error.main' : 'success.main' }}
    >
      Due:{' '}
      {new Date(assignment.due_date).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}
    </Typography>
    <Typography variant="caption" sx={{ color: '#555' }}>
      {renderTimeLeft()}
    </Typography>
  </>
)}

            </Box>
          </Box>
        </Stack>


        <Card
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: '#f0f4f8',
            borderRadius: 3,
            color: '#333',
            whiteSpace: 'pre-line',
            fontSize: '1.1rem',
            lineHeight: 1.6,
          }}
        >
          <Typography variant="body1" sx={{ mb: 3 }}>
            {assignment.description}
          </Typography>

          {assignment.attachments && assignment.attachments.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Stack spacing={1}>
                {assignment.attachments.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <InsertDriveFileIcon color="primary" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Link
                        component="button"
                        underline="hover"
                        onClick={() => downloadFileAssignment(file)}
                      >
                        {file.file_name}
                      </Link>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Card>
<Card
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: '#f0f4f8',
            borderRadius: 3,
            color: '#333',
            whiteSpace: 'pre-line',
            fontSize: '1.1rem',
            lineHeight: 1.6,
          }}
        >

     {assignment.answer_type === 'file' ? (
  <>
    {hasSubmitted && !editing ? (
      <>
        <Alert severity="success" sx={{ mb: 3, fontWeight: 600 }}>
          You have submitted the following files:
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Stack spacing={1}>
            {submission.files && submission.files.length > 0 ? (
              submission.files.map((file, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  <InsertDriveFileIcon color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Link
                      component="button"
                      underline="hover"
                      onClick={() => downloadFileSubmission(file)}
                    >
                      {file.file_name} ({formatBytes(file.file_size)})
                    </Link>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography>No files found.</Typography>
            )}
          </Stack>
        </Box>

        {!duePassed && (
          <Button
            variant="outlined"
            onClick={() => {
              setEditing(true);
              setAttachmentFiles(
                submission.files.map((file) => ({
                  name: file.file_name,
                  size: file.file_size,
                  id: file.id,
                }))
              );
            }}
            sx={{ mt: 2 }}
          >
            Change Answer
          </Button>
        )}
      </>
    ) : duePassed && !editing ? (
      <Alert severity="error" sx={{ mb: 3, fontWeight: 600 }}>
        Deadline has passed and no file was submitted.
      </Alert>
    ) : (

      <Stack spacing={2} mb={3}>

        <Box
          onDrop={(e) => {
            e.preventDefault();
            const droppedFiles = Array.from(e.dataTransfer.files);
            if (droppedFiles.length) {
              setAttachmentFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
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
            mb: 2,
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
              <Typography variant="body1" textAlign="center">
                Drag and drop files here or click to select
              </Typography>
              <Button
                variant="outlined"
                component="label"
                sx={{ mt: 2, display: 'block', mx: 'auto' }}
              >
                Browse Files
                <input type="file" multiple hidden onChange={handleFileChange} />
              </Button>
            </>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Max {assignment.max_files} files, total size up to {assignment.max_file_size} MB.
          </Typography>
        </Box>

        {fileError && (
          <Typography color="error" variant="body2" fontWeight={600}>
            {fileError}
          </Typography>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {hasSubmitted && (
            <Button
              variant="outlined"
              onClick={() => {
                setEditing(false);
                setAttachmentFiles([]);
              }}
            >
              Cancel
            </Button>
          )}

    <Button
  variant="contained"
  onClick={handleFileSubmit}
  disabled={isSubmitting}
  sx={{
    backgroundColor: '#1565c0',
    '&:hover': { backgroundColor: '#0d47a1' },
    fontWeight: 600,
    opacity: isSubmitting ? 0.7 : 1, 
  }}
>
  {isSubmitting ? "Submitting..." : hasSubmitted ? 'Save Changes' : 'Submit Answer'}
</Button>



        </Stack>
      </Stack>
    )}

    {submitStatus && (
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          fontWeight: 600,
          color: submitStatus.includes('success') ? 'success.main' : 'error.main',
        }}
      >
        {submitStatus}
      </Typography>
    )}
  </>
) : assignment.answer_type === 'text' ? (


          <>
            {hasSubmitted && !duePassed ? (
              <Alert severity="success" sx={{ mb: 3, fontWeight: 600 }}>
                Your answer has been submitted.
              </Alert>
            ) : duePassed && !hasSubmitted ? (
              <Alert severity="error" sx={{ mb: 3, fontWeight: 600 }}>
                Deadline has passed and no answer was submitted.
              </Alert>
            ) : (
              <Stack spacing={2} mb={3}>
                <TextField
                  multiline
                  minRows={5}
                  placeholder="Write your answer here..."
                  variant="outlined"
                  value={textAnswer}
                  onChange={(e) => {
                    setTextAnswer(e.target.value);
    
                    setTextError('');
                  }}
                  disabled={duePassed}
                  error={!!textError}
                  helperText={textError}
                  sx={{ fontSize: '1rem' }}
                />

                <Button
                  variant="contained"
                  onClick={handleTextSubmit}
                  disabled={!textAnswer.trim() || duePassed}
                  sx={{
                    backgroundColor: '#1565c0',
                    '&:hover': { backgroundColor: '#0d47a1' },
                    fontWeight: 600,
                  }}
                >
                  Submit Answer
                </Button>
              </Stack>
            )}

            {submitStatus && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  fontWeight: 600,
                  color: submitStatus.includes('success') ? 'success.main' : 'error.main',
                }}
              >
                {submitStatus}
              </Typography>
            )}
          </>
        ) : (
          <Typography
            variant="body1"
            align="center"
            color="error"
            sx={{ fontWeight: 600, mt: 3 }}
          >
            Unknown answer type.
          </Typography>
        )}
</Card>

        <Divider sx={{ my: 5 }} />

          <TableContainer component={Paper} elevation={3} sx={{ mb: 5, borderRadius: 2 }}>
        <Table>
          <TableBody>

            <TableRow>
              <TableCell
                colSpan={2}
                sx={{
                  backgroundColor: '#f7f9fc',
                  py: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
               {submission?.status === 'submitted' || submission?.status === 'graded' ? (
        submission?.status === 'graded' ? (
          <Typography color="info.main">📝 Graded</Typography>
        ) : new Date(submission.submittedAt) > new Date(assignment.due_date) ? (
          <Typography color="error">📅 Submitted after deadline</Typography>
        ) : (
          <Typography color="success.main">✅ Submitted on time</Typography>
        )
      ) : (
        <Typography color="warning.main">⚠️ Not submitted</Typography>
      )}
      
              </TableCell>
            </TableRow>
      

            <TableRow>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f7f9fc', width: 160 }}>
                Due Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {new Date(assignment.due_date).toLocaleString()}
              </TableCell>
            </TableRow>
      

      {(submission?.status === 'submitted' || submission?.status === 'graded') && submission.submittedAt && (
        <TableRow>
          <TableCell sx={{ fontWeight: 700, backgroundColor: '#f7f9fc' }}>
            Submitted At
          </TableCell>
          <TableCell sx={{ fontWeight: 600 }}>
            {new Date(submission.submittedAt).toLocaleString()}
          </TableCell>
        </TableRow>
      )}
      

            <TableRow>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f7f9fc' }}>Time Left</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{renderTimeLeft()}</TableCell>
            </TableRow>

<TableRow>
  <TableCell
    sx={{
      fontWeight: 700,
      backgroundColor: '#f7f9fc',
      verticalAlign: 'top',
    }}
  >
    Grade
  </TableCell>
  <TableCell sx={{ py: 2 }}>
    {submission?.grade != null ? (
      <Typography fontWeight={600}>{submission.grade}</Typography>
    ) : (
      <Typography fontStyle="italic" color="text.secondary">Not graded yet</Typography>
    )}
  </TableCell>
</TableRow>


<TableRow>
  <TableCell
    sx={{
      fontWeight: 700,
      backgroundColor: '#f7f9fc',
      verticalAlign: 'top',
    }}
  >
    Feedback
  </TableCell>
  <TableCell sx={{ py: 2 }}>
    {submission?.feedback ? (
      <Typography whiteSpace="pre-line">{submission.feedback}</Typography>
    ) : (
      <Typography fontStyle="italic" color="text.secondary">No feedback</Typography>
    )}
  </TableCell>
</TableRow>

          </TableBody>
        </Table>
      </TableContainer>
      
     <Card elevation={3} sx={{ p: 3, borderRadius: 3, backgroundColor: "#f9fbfd" }}>
  <Box sx={{ mt: 1 }}>
    <Typography variant="h6" gutterBottom>
      Comments
    </Typography>

    {(!comments || comments.length === 0) ? (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        No comments yet.
      </Typography>
    ) : (
      comments.map((c, index) => (
        <Card
          key={index}
          variant="outlined"
          sx={{
            mb: 1,
            p: 1.5,
            bgcolor: "#f9f9f9",
            borderRadius: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexGrow={1}
              minWidth={0}
            >
              <Avatar
                alt={c.author_name}
                src={c.author_avatar_url || ""}
                sx={{ width: 28, height: 28 }}
              />
              <Typography
                variant="body2"
                fontWeight="600"
                noWrap
                sx={{ minWidth: 0 }}
              >
                {c.author_name}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {new Date(c.created_at).toLocaleString()}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{ mt: 1, whiteSpace: "pre-line", pl: 5 }}
          >
            {c.comment_text}
          </Typography>
        </Card>
      ))
    )}


    <Box mt={2} display="flex" gap={1}>
      <TextField
        size="small"
        fullWidth
        multiline
        minRows={1}
        maxRows={4}
        placeholder="Write a comment..."
        value={newCommentText}
        onChange={(e) => {
          setNewCommentText(e.target.value);
          setCommentError("");
          setCommentSubmitStatus("");
        }}
        error={!!commentError}
        helperText={commentError}
      />
      <Button
        variant="contained"
        onClick={handleCommentSubmit}
        disabled={!newCommentText.trim()}
      >
        Send
      </Button>
    </Box>

    {commentSubmitStatus && (
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          fontWeight: 600,
          color: commentSubmitStatus.includes("success")
            ? "success.main"
            : "error.main",
        }}
      >
        {commentSubmitStatus}
      </Typography>
    )}
  </Box>
</Card>

      </CardContent>
    </Card>
  </Box>
);
};

export default AssignmentPage;
