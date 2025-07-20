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
  Collapse,
  Avatar,
  Stack,
} from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchWithRefresh } from "../utils/fetchWithRefresh";

export default function CoursePostsStudentDropdown({ courseId }) {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
     const res = await fetchWithRefresh(`http://localhost:5000/course/${courseId}/posts`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setPosts(data);
      console.log(data);

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
    if (courseId && open) fetchPosts();
  }, [courseId, fetchPosts, open]);

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

  const COMMENTS_LIMIT = 3;

  return (
    <Box mt={4}>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          cursor: "pointer",
          py: 1,
          borderRadius: 1,
          boxShadow: open ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            backgroundColor: "#f9f9f9",
          },
        }}
      >
        <Box display="flex" alignItems="center">
          <MessageIcon sx={{ mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Teacher Forum Posts
          </Typography>
        </Box>
        <ExpandMoreIcon
          sx={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </Box>


      <Collapse in={open}>
        <Box mt={2}>
          {loading ? (
            <Box textAlign="center" mt={4}>
              <CircularProgress />
              <Typography mt={2}>Loading posts...</Typography>
            </Box>
          ) : posts.length === 0 ? (
            <Typography
              sx={{ px: 2, py: 1 }}
              textAlign="center"
              color="text.secondary"
            >
              No posts available for this course.
            </Typography>
          ) : (
            posts.map((post) => (
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
                      <Avatar
                        alt={post.author_name}
                        src={post.author_avatar_url || ""}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Typography variant="subtitle1" fontWeight="600" noWrap>
                        {post.author_name}
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


                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary"
                    gutterBottom
                    sx={{ mt: 0 }}
                  >
                    {post.title}
                  </Typography>

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
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
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
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                              <Stack direction="row" spacing={1} alignItems="center" flexGrow={1} minWidth={0}>
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
                          onChange={(e) =>
                            handleCommentChange(post.id, e.target.value)
                          }
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
            ))
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
