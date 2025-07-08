import { Stack, Typography, Box } from "@mui/material";
import { render } from "@testing-library/react";

function renderTaskWithCode(task: string) {
  const regex = /`([^`]+)`/g;
  const parts = task.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <Box
            key={index}
            component="pre"
            sx={{
              backgroundColor: "#f3f3f3",
              p: 2,
              borderRadius: 2,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              overflowX: "auto",
              my: 1,
            }}
          >
            {part}
          </Box>
        ) : (
          <Typography key={index} variant="h6" fontWeight={600}>
            {part}
          </Typography>
        )
      )}
    </>
  );
}

export default renderTaskWithCode;