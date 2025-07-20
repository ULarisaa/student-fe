import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Link,
  Button,
  TextField,
  Alert,
  Stack,
  TableRow, 
  Paper, 
  TableCell,
  Table,
  TableContainer, 
  TableBody, Avatar
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { fetchWithRefresh } from '../../utils/fetchWithRefresh';

const GradeAssignmentPage = () => {
  const { assignmentId, studentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentSubmitStatus, setCommentSubmitStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialGrade, setInitialGrade] = useState('');
const [initialFeedback, setInitialFeedback] = useState('');


useEffect(() => {
  if (submission) {
    setInitialGrade(submission.grade || '');
    setGrade(submission.grade || '');
    setInitialFeedback(submission.feedback || '');
    setFeedback(submission.feedback || '');
  }
}, [submission]);

  

  const token = localStorage.getItem('token');

const fetchData = async () => {
  try {
    const [assignmentRes, submissionRes, commentsRes] = await Promise.all([
      fetchWithRefresh(`http://localhost:5000/assignments/assignment/${assignmentId}`),
      fetchWithRefresh(`http://localhost:5000/assignments/${assignmentId}/submission/${studentId}`),
      fetchWithRefresh(`http://localhost:5000/assignments/${assignmentId}/comments`),
    ]);

    if (!assignmentRes.ok) throw new Error('Assignment not found');
    if (!submissionRes.ok) throw new Error('Submission not found');

    const assignmentData = await assignmentRes.json();
    const submissionData = await submissionRes.json();
    const commentsData = commentsRes.ok ? await commentsRes.json() : [];

    setAssignment(assignmentData);
    setSubmission(submissionData);
    setComments(commentsData);
  } catch (error) {
    console.error('Error loading data:', error.message);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchData();
}, [assignmentId, studentId, token]);

async function handleGradeAndFeedbackSubmit() {
  try {
    const res = await fetchWithRefresh(
  `http://localhost:5000/assignments/grade-assignment/${submission.submissionId}`,
  {
    method: 'POST',
    body: JSON.stringify({ grade, feedback }),
  }
);

    

    if (!res.ok) throw new Error('Failed to submit grade and feedback');

    const data = await res.json();
    await fetchData(); 
setSubmitStatus('Grade and feedback saved successfully');

 
  
    window.location.reload();
  } catch (error) {
    setSubmitStatus(`Error: ${error.message}`);
  }
}

  const handleCommentSubmit = async () => {
    if (!newCommentText.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }

    try {
    const res = await fetchWithRefresh(`http://localhost:5000/assignments/${assignmentId}/comments`, {
  method: 'POST',
  body: JSON.stringify({ comment: newCommentText.trim() }),
});


      if (res.ok) {
        const createdComment = await res.json();
        setComments((prev) => [...prev, createdComment]);
        setNewCommentText('');
        setCommentError('');
    
        await fetchData();setCommentSubmitStatus('Comment submitted successfully!');
        setTimeout(() => {
          setCommentSubmitStatus('');
        }, 3000); 

      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Unknown error');
      }
    } catch (err) {
      setCommentSubmitStatus('Submission error: ' + err.message);
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
  const downloadFile = async (file) => {
    try {
     const response = await fetchWithRefresh(`http://localhost:5000/assignments/attachments/${file.id}`);


      if (!response.ok) throw new Error('Failed to download file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const duePassed = new Date() > new Date(assignment?.due_date);
  const renderTimeLeft = () => {
    const now = new Date();
    const due = new Date(assignment.due_date);
    const diff = due - now;
    if (diff <= 0) return 'Deadline passed';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} day(s) left`;
  };

  function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

  if (loading) return <div>Loading...</div>;
  if (!assignment || !submission) return <div>Assignment or submission not found.</div>;

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
                color: duePassed ? 'error.main' : 'success.main',
                fontSize: 28,
              }}
            />
         <Box>
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
    {duePassed
      ? `The assignment was closed on ${new Date(assignment.due_date).toLocaleDateString()}`
      : `Time left until deadline: ${renderTimeLeft()}`}
  </Typography>
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
                        onClick={() => downloadFile(file)}
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
  <Typography fontWeight={600} mb={1}>
    Student's submission:
  </Typography>

  {submission.files && submission.files.length > 0 ? (
    <Stack spacing={1}>
      {submission.files.map((file, idx) => (
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
      ))}
    </Stack>
  ) : (
    <Alert severity="warning" sx={{ fontWeight: 600 }}>
      No files were submitted by the student.
    </Alert>
  )}
</>

  ) : assignment.answer_type === 'text' ? (
    <>
      {submission?.textAnswer?.trim() ? (
        <>
          <Alert severity="info" sx={{ mb: 2, fontWeight: 600 }}>
            Student's text answer:
          </Alert>
          <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {submission.textAnswer}
            </Typography>
          </Box>
        </>
      ) : (
        <Alert severity="warning" sx={{ fontWeight: 600 }}>
          No text answer was submitted by the student.
        </Alert>
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
          <TextField
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="Enter grade"
            size="small"
            sx={{ maxWidth: 200 }}
            fullWidth
          />
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
          <TextField
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write feedback"
            size="small"
            multiline
            minRows={3}
            fullWidth
          />
        </TableCell>
      </TableRow>



<TableRow>
  <TableCell />
  <TableCell sx={{ pt: 1 }}>
    <Button
      variant="contained"
      onClick={handleGradeAndFeedbackSubmit}
      disabled={grade === initialGrade && feedback === initialFeedback}
    >
      Save
    </Button>
    {submitStatus && (
      <Alert
        severity={submitStatus.startsWith('Error') ? 'error' : 'success'}
        sx={{ mt: 2 }}
      >
        {submitStatus}
      </Alert>
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

export default GradeAssignmentPage;
