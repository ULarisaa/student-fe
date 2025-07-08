import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Collapse,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StorageIcon from "@mui/icons-material/Storage";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchWithRefresh } from "../utils/fetchWithRefresh";

const formatBytes = (bytes) => {
  const kb = Number(bytes) / 1024;
  return `${kb.toFixed(1)} KB`;
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

const MaterialsDropdown = ({ courseId }) => {
  const [open, setOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
       const res = await fetchWithRefresh(`http://localhost:5000/course/${courseId}/materials`);

        const data = await res.json();
        setMaterials(data);
      } catch (err) {
        console.error("Error fetching materials:", err);
      } finally {
        setLoading(false);
      }
    };

    if (open && courseId) fetchMaterials();
  }, [open, courseId]);

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

  const groupedMaterials = materials.reduce((groups, mat) => {
    if (!groups[mat.title]) groups[mat.title] = [];
    groups[mat.title].push(mat);
    return groups;
  }, {});

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
          userSelect: "none",
        }}
      >
        <Box display="flex" alignItems="center">
          <DescriptionIcon sx={{ mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Course Materials
          </Typography>
        </Box>
        <ExpandMoreIcon
          sx={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {loading ? (
          <Box px={3} py={4} textAlign="center">
            <CircularProgress size={30} />
          </Box>
        ) : Object.keys(groupedMaterials).length ? (
          <Stack spacing={3} mt={3}>
            {Object.entries(groupedMaterials).map(([title, mats]) => (
              <Box key={title} sx={{ px: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mb={1}
                  color="primary.dark"
                  userSelect="text"
                >
                  {title}
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Stack spacing={1}>
                  {mats.map((mat) => (
                    <Box
                      key={mat.id}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: "#f5f5f5",
                        transition: "background-color 0.2s",
                        "&:hover": { bgcolor: "#e3f2fd" },
                      }}
                    >
                      <Typography
                        component="span"
                        onClick={() => downloadFile(mat)}
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
                        title={mat.filename}
                      >
                        <InsertDriveFileIcon fontSize="small" />
                        {mat.filename}
                      </Typography>
                      <Box display="flex" gap={2} color="text.secondary" fontSize={13}>
                        <Tooltip title="File size">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <StorageIcon fontSize="small" />
                            {formatBytes(mat.filesize)}
                          </Box>
                        </Tooltip>
                        <Tooltip title="Uploaded at">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <CalendarTodayIcon fontSize="small" />
                            {formatDate(mat.uploaded_at)}
                          </Box>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ px: 3, py: 2, color: "text.secondary" }} align="center">
            No materials available.
          </Typography>
        )}
      </Collapse>
    </Box>
  );
};

export default MaterialsDropdown;
