import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Code as CodeIcon, ImportExport as SortIcon } from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  width: '100%'
}));

// Circular progress with improved rendering
const DifficultyDonut = ({ easy, medium, hard }) => {
  const theme = useTheme();
  const total = easy + medium + hard;
  
  const easyPercent = total > 0 ? Math.round((easy / total) * 100) : 0;
  const mediumPercent = total > 0 ? Math.round((medium / total) * 100) : 0;
  const hardPercent = total > 0 ? Math.round((hard / total) * 100) : 0;

  // Calculate stroke angles
  const calculateStrokeDashoffset = (percentage) => {
    const circumference = 2 * Math.PI * 45;
    return circumference * (1 - percentage / 100);
  };

  return (
    <Box
      sx={{
  position: 'relative',
        width: {xs: 150, sm: 180, md: 200},
        height: {xs: 150, sm: 180, md: 200},
        margin: '0 auto',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={theme.palette.background.default}
          strokeWidth="10"
        />
        
        {/* Hard problems */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#FF375F"
          strokeWidth="10"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={calculateStrokeDashoffset(hardPercent)}
          transform="rotate(-90 50 50)"
        />
        
        {/* Medium problems */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#FFC01E"
          strokeWidth="10"
          strokeDasharray={`${2 * Math.PI * 45 * mediumPercent / 100}`}
          strokeDashoffset={0}
          transform={`rotate(${hardPercent * 3.6 - 90} 50 50)`}
        />
        
        {/* Easy problems */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#00B8A3"
          strokeWidth="10"
          strokeDasharray={`${2 * Math.PI * 45 * easyPercent / 100}`}
          strokeDashoffset={0}
          transform={`rotate(${(hardPercent + mediumPercent) * 3.6 - 90} 50 50)`}
        />
        
        {/* Inner circle for better appearance */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill={theme.palette.background.paper}
        />
      </svg>
      
      <Box
        sx={{
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          {total}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          Total Problems
        </Typography>
      </Box>
    </Box>
  );
};

const DifficultyGrid = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.card,
  borderRadius: 12,
  width: '100%',
}));

const DifficultyItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderRadius: 8,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
}));

const ProblemStats = ({ topicWise = {}, difficultyWise = {} }) => {
  // Debug: log the incoming props
  console.log('ProblemStats topicWise:', topicWise);
  console.log('ProblemStats difficultyWise:', difficultyWise);

  // Defensive: ensure topicWise is an object and not empty
  const topicEntries = topicWise && typeof topicWise === 'object' ? Object.entries(topicWise) : [];
  const topicData = topicEntries
    .filter(([_, count]) => Number(count) > 0)
    .map(([name, count]) => ({
      name: name.length > 12 ? name.slice(0, 12) + '...' : name,
      fullName: name,
      count: Number(count) || 0
    }));

  // Defensive: ensure difficultyWise is an object
  const easy = Number(difficultyWise?.easy) || 0;
  const medium = Number(difficultyWise?.medium) || 0;
  const hard = Number(difficultyWise?.hard) || 0;

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h5" fontWeight="700" gutterBottom>
        Problem Solving Performance
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="600">Problems by Difficulty</Typography>
              <CodeIcon color="primary" />
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <DifficultyDonut easy={easy} medium={medium} hard={hard} />
            </Box>
            <DifficultyGrid>
              <DifficultyItem>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#00B8A3' }} />
                  <Typography variant="body2">Easy</Typography>
                </Box>
                <Typography variant="body2" fontWeight="600">{easy}</Typography>
              </DifficultyItem>
              <DifficultyItem>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FFC01E' }} />
                  <Typography variant="body2">Medium</Typography>
                </Box>
                <Typography variant="body2" fontWeight="600">{medium}</Typography>
              </DifficultyItem>
              <DifficultyItem>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF375F' }} />
                  <Typography variant="body2">Hard</Typography>
                </Box>
                <Typography variant="body2" fontWeight="600">{hard}</Typography>
              </DifficultyItem>
            </DifficultyGrid>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="600">Top Problem Categories</Typography>
              <SortIcon color="primary" />
            </Box>
            {topicData.length > 0 ? (
              <Box sx={{ height: { xs: 300, sm: 350, md: 400 }, mt: 3, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" tickLine={false} axisLine={{ stroke: '#333' }} />
                    <YAxis dataKey="name" type="category" width={120} tickLine={false} axisLine={{ stroke: '#333' }} />
                    <Tooltip formatter={(value, name, props) => [`Problems: ${value}`, props.payload.fullName]} />
                    <Bar dataKey="count" fill="#64B5F6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ height: { xs: 200, sm: 250, md: 300 }, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, opacity: 0.7 }}>
                <SortIcon color="disabled" sx={{ fontSize: 60 }} />
                <Typography>No topic data available</Typography>
              </Box>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProblemStats; 