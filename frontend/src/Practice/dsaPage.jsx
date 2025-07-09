import React, { useEffect } from "react";
import usePracticeAPI from "./practiceService";
import { Card, CardContent, Typography, Chip, Box, Button } from "@mui/material";

const difficultyColors = {
  easy: "success",
  medium: "warning",
  hard: "error"
};

const DsaPage = () => {
  const { fetchDSAQuestions, data, loading, error } = usePracticeAPI();

  useEffect(() => {
    fetchDSAQuestions();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <Box sx={{
      maxWidth: 800,
      mx: "auto",
      mt: 4,
      px: { xs: 1, sm: 2 },
      height: 'calc(100vh - 80px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      background: theme => theme.palette.background.default,
      borderRadius: 2,
      boxShadow: 1
    }}>
      <Box display="flex" flexDirection="column" gap={2} width="100%">
        {data.map((q) => (
          <Card key={q.id} variant="outlined" sx={{ width: '100%', overflow: 'auto' }}>
            <CardContent sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                <Typography variant="h6" sx={{ wordBreak: 'break-word', flex: 1 }}>{q.title}</Typography>
                <Chip
                  label={q.difficulty || "Unknown"}
                  color={difficultyColors[(q.difficulty || '').toLowerCase()] || "default"}
                  size="small"
                  sx={{ ml: 2, mt: { xs: 1, sm: 0 } }}
                />
              </Box>
              {q.link && (
                <Button
                  href={q.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 1, wordBreak: 'break-all' }}
                  variant="contained"
                  size="small"
                >
                  View Question
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default DsaPage;