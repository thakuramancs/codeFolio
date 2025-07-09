import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { QuestionAnswer, CalendarMonth, Favorite, Grade } from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  }
}));

const StatCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.card,
  borderRadius: 16,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  height: '100%',
  overflow: 'visible',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)'
  }
}));

const IconContainer = styled(Box)(({ theme, color }) => ({
  backgroundColor: color || theme.palette.primary.main,
  borderRadius: '50%',
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: theme.spacing(0, 2, 0, 0),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    width: 48,
    height: 48,
    margin: theme.spacing(0, 1.5, 0, 0),
  }
}));

const StatsOverview = ({ totalQuestions, totalActiveDays }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h5" fontWeight="700" gutterBottom sx={{ 
        fontSize: { xs: '1.25rem', md: '1.5rem' },
        mb: 3
      }}>
        Performance Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
        <Grid item xs={12} sm={6} lg={3} sx={{ p: { xs: 1, sm: 1.5 } }}>
          <StatCard>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconContainer color="#4CAF50">
                  <QuestionAnswer sx={{ color: '#fff', fontSize: isMobile ? '1.5rem' : '1.75rem' }} />
                </IconContainer>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Problems Solved
                  </Typography>
                  <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>
                    {totalQuestions || 0}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Across all platforms
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3} sx={{ p: { xs: 1, sm: 1.5 } }}>
          <StatCard>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconContainer color="#FF9800">
                  <CalendarMonth sx={{ color: '#fff', fontSize: isMobile ? '1.5rem' : '1.75rem' }} />
                </IconContainer>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Active Days
                  </Typography>
                  <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>
                    {totalActiveDays || 0}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Days of coding
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3} sx={{ p: { xs: 1, sm: 1.5 } }}>
          <StatCard>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconContainer color="#E91E63">
                  <Favorite sx={{ color: '#fff', fontSize: isMobile ? '1.5rem' : '1.75rem' }} />
                </IconContainer>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Consistency
                  </Typography>
                  <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>
                    {totalActiveDays > 0 ? Math.min(Math.round((totalActiveDays / 365) * 100), 100) : 0}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Yearly activity
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3} sx={{ p: { xs: 1, sm: 1.5 } }}>
          <StatCard>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconContainer color="#2196F3">
                  <Grade sx={{ color: '#fff', fontSize: isMobile ? '1.5rem' : '1.75rem' }} />
                </IconContainer>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Expertise
                  </Typography>
                  <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>
                    {getExpertiseLevel(totalQuestions)}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Based on problems solved
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper function to determine expertise level
const getExpertiseLevel = (problemCount) => {
  if (problemCount >= 500) return 'Expert';
  if (problemCount >= 300) return 'Advanced';
  if (problemCount >= 100) return 'Intermediate';
  if (problemCount >= 50) return 'Regular';
  if (problemCount > 0) return 'Beginner';
  return 'New';
};

export default StatsOverview; 