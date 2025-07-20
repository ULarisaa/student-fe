import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Avatar, Stack
} from "@mui/material";
import { fetchWithRefresh } from "../utils/fetchWithRefresh";

export default function CoursePostsWithFiles({ onRefreshCourseData, courseId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({}); 


  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAllowComments, setNewPostAllowComments] = useState(true);
  const [addingPost, setAddingPost] = useState(false);
  const [addPostError, setAddPostError] = useState(null);
  const [addPostSuccess, setAddPostSuccess] = useState(null);

 const fetchPosts = useCallback(async () => {
  setLoading(true);
  try {
   const res = await fetchWithRefresh(`http://localhost:5000/course/${courseId}/posts`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setPosts(data);

    const initialComments = {};
    data.forEach((post) => {
      initialComments[post.id] = post.comments || [];
    });
    setComments(initialComments);
  } catch (error) {
    console.error("Failed to load posts:", error);
    setPosts([]);
  } finally {
    setLoading(false);
  }
}, [courseId]);

useEffect(() => {
  if (courseId) fetchPosts();
}, [courseId, fetchPosts]);



  const handleCommentChange = (postId, value) => {
    setNewComments((prev) => ({ ...prev, [postId]: value }));

  };

 const handleAddComment = async (postId) => {
  const commentText = newComments[postId]?.trim();
  if (!commentText) return;

  try {
  const res = await fetchWithRefresh("http://localhost:5000/course/posts/comment", {
  method: "POST",
  body: JSON.stringify({
    post_id: postId,
    comment_text: commentText,
  }),
});

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const savedComment = await res.json();


    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), savedComment],
    }));


    setNewComments((prev) => ({ ...prev, [postId]: "" }));
  
  } catch (err) {
    console.error("Failed to submit comment:", err.message);

  }
};

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };


const handleAddPost = async () => {
  if (!newPostTitle.trim() || !newPostContent.trim()) {
    setAddPostError("Title and content are required.");
    return;
  }

  setAddPostError(null);
  setAddPostSuccess(null);
  setAddingPost(true);

  try {
   
    const payload = {
      course_id: courseId,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      allowComments: newPostAllowComments,
    };

 const res = await fetchWithRefresh(`http://localhost:5000/course/posts`, {
  method: "POST",
  body: JSON.stringify(payload),
});


    if (!res.ok) {
      throw new Error(`Failed to add post (HTTP ${res.status})`);
    }

    const createdPost = await res.json();

   
    setAddPostSuccess("Post added successfully!");


    setTimeout(() => {
      setAddPostSuccess(null);
       setNewPostTitle("");
    setNewPostContent("");
    setNewPostAllowComments(true);
    onRefreshCourseData();
      fetchPosts();  
    }, 3000);
  } catch (error) {
    setAddPostError(error.message);
  } finally {
    setAddingPost(false);
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

  if (!posts.length) {
    return (
      <Box>
        <Typography sx={{ px: 2, py: 1 }} textAlign="center" color="text.secondary">
          No posts available for this course.
        </Typography>

        {renderAddPostForm()}
      </Box>
    );
  }

  const COMMENTS_LIMIT = 3;


function renderAddPostForm() {
  const isFormValid = newPostTitle.trim() !== "" && newPostContent.trim() !== "";

  return (
    <Box p={3} border="1px solid #ddd" borderRadius={3} boxShadow={1}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Add New Post
      </Typography>

      <TextField
        label="Title"
        fullWidth
        required
        value={newPostTitle}
        onChange={(e) => setNewPostTitle(e.target.value)}
        sx={{ mb: 2 }}

      />

      <TextField
        label="Content"
        multiline
        minRows={4}
        fullWidth
        required
        value={newPostContent}
        onChange={(e) => setNewPostContent(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Box display="flex" alignItems="center" mb={2}>
        <input
          type="checkbox"
          id="allowCommentsCheckbox"
          checked={newPostAllowComments}
          onChange={(e) => setNewPostAllowComments(e.target.checked)}
        />
        <label htmlFor="allowCommentsCheckbox" style={{ marginLeft: 8 }}>
          Allow comments
        </label>
      </Box>

      {addPostError && (
        <Typography color="error" mb={1}>
          {addPostError}
        </Typography>
      )}
      {addPostSuccess && (
        <Typography color="success.main" mb={1}>
          {addPostSuccess}
        </Typography>
      )}

      <Button
        variant="contained"
        onClick={handleAddPost}
        disabled={addingPost || !isFormValid}
      >
        {addingPost ? "Adding..." : "Add Post"}
      </Button>
    </Box>
  );
}


  return (
    <Box>
         <Box mb={4}>
  {renderAddPostForm()}
</Box>
      {posts.map((post) => (
  <Card
    key={post.id}
    sx={{
      mb: 4,
      borderRadius: 3,
      boxShadow: 3,
      "&:hover": { boxShadow: 6, bgcolor: "#f5f8ff" },
      transition: "all 0.3s ease",
    }}
  >
    <CardContent>

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexGrow={1}>
        <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom sx={{ mt: 0 }}>
        {post.title}
      </Typography>
     
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ whiteSpace: "nowrap", minWidth: 120, textAlign: "right" }}
        >
          {new Date(post.created_at).toLocaleString()}
        </Typography>
      </Stack>

  


      <Typography variant="body1" sx={{ whiteSpace: "pre-line", mb: 3 }}>
        {post.content}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {post.allow_comments ? (
        <>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            Comments
          </Typography>

          {!comments[post.id] || comments[post.id].length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No comments yet.
            </Typography>
          ) : (
            <>
              {(expandedComments[post.id]
                ? comments[post.id]
                : comments[post.id].slice(0, COMMENTS_LIMIT)
              ).map((c, index) => (
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
                        alt={c.full_name}
                        src={c.author_avatar_url || ""}
                        sx={{ width: 28, height: 28 }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        noWrap
                        sx={{ minWidth: 0 }}
                      >
                        {c.full_name}
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
              ))}

              {comments[post.id].length > COMMENTS_LIMIT && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => toggleComments(post.id)}
                  sx={{ mt: 1 }}
                >
                  {expandedComments[post.id]
                    ? "Show less comments"
                    : `Show all comments (${comments[post.id].length})`}
                </Button>
              )}
            </>
          )}


          <Box mt={2} display="flex" gap={1}>
            <TextField
              size="small"
              fullWidth
              multiline
              minRows={1}
              maxRows={4}
              placeholder="Write a comment..."
              value={newComments[post.id] || ""}
              onChange={(e) => handleCommentChange(post.id, e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => handleAddComment(post.id)}
              disabled={!newComments[post.id]?.trim()}
            >
              Send
            </Button>
          </Box>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Comments are disabled for this post.
        </Typography>
      )}
    </CardContent>
  </Card>
))}


     
    </Box>
  );
}
