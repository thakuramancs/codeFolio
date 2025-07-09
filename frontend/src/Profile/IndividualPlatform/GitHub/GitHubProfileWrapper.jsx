
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Card, CardContent, Alert, Button, Box, CircularProgress } from '@mui/material';
import { Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { profileService } from '../../profileService';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
}));

const ContributionBox = styled(Box)(({ count }) => ({
  width: '10px',
  height: '10px',
  margin: '1px',
  borderRadius: '2px',
  backgroundColor: getContributionColor(count),
}));

function getContributionColor(count) {
  if (count === 0) return '#ebedf0';
  if (count <= 3) return '#9be9a8';
  if (count <= 6) return '#40c463';
  if (count <= 9) return '#30a14e';
  return '#216e39';
}

const GitHubProfileWrapper = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated || !user?.sub) return;
      try {
        setLoading(true);
        setError(null);
        const token = await getAccessTokenSilently();
        localStorage.setItem('auth_token', token);
        const data = await profileService.fetchGitHubProfile(user.sub);
        setStats(data);
      } catch (err) {
        setError('Failed to fetch GitHub stats. Please set your GitHub username in profile settings.');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">Please log in to view your GitHub profile.</Alert>
        </CardContent>
      </Card>
    );
  }
  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            {error}
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                href="/profile/settings"
              >
                Go to Profile Settings
              </Button>
            </Box>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  if (!stats) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            Please connect your GitHub account in profile settings.
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                href="/profile/settings"
              >
                Go to Profile Settings
              </Button>
            </Box>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Render GitHub stats UI (merged from GitHubProfile.jsx)
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <StyledPaper>
          <Typography variant="h6" gutterBottom>Overview</Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Public Repositories: {stats.repositories || 0}</Typography>
            <Typography>Total Stars: {stats.stars || 0}</Typography>
            <Typography>Followers: {stats.followers || 0}</Typography>
            <Typography>Following: {stats.following || 0}</Typography>
          </Box>
        </StyledPaper>
      </Grid>
      <Grid item xs={12} md={6}>
        <StyledPaper>
          <Typography variant="h6" gutterBottom>Activity</Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Total Contributions: {stats.totalContributions || 0}</Typography>
            <Typography>Active Days: {stats.totalActiveDays || 0}</Typography>
            <Typography>Current Streak: {stats.currentStreak || 0} days</Typography>
            <Typography>Longest Streak: {stats.maxStreak || 0} days</Typography>
          </Box>
        </StyledPaper>
      </Grid>
      <Grid item xs={12} md={6}>
        <StyledPaper>
          <Typography variant="h6" gutterBottom>Development</Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Pull Requests: {stats.prs || 0}</Typography>
            <Typography>Issues: {stats.issues || 0}</Typography>
            <Typography>Commits: {stats.commits || 0}</Typography>
          </Box>
        </StyledPaper>
      </Grid>
      {stats.languages && Object.keys(stats.languages).length > 0 && (
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Languages</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {Object.entries(stats.languages)
                .sort(([, a], [, b]) => b - a)
                .map(([language, percentage]) => (
                  <Box key={language} display="flex" justifyContent="space-between">
                    <Typography>{language}</Typography>
                    <Typography>{percentage.toFixed(1)}%</Typography>
                  </Box>
                ))}
            </Box>
          </StyledPaper>
        </Grid>
      )}
      {stats.contributionCalendar && stats.contributionCalendar.length > 0 && (
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Contribution Calendar</Typography>
            <Box 
              display="flex" 
              flexWrap="wrap" 
              gap={0.5} 
              maxWidth="100%" 
              sx={{ overflowX: 'auto', padding: 1 }}
            >
              {stats.contributionCalendar.map((day, index) => (
                <ContributionBox
                  key={day.date}
                  count={day.count}
                  title={`${day.date}: ${day.count} contributions`}
                />
              ))}
            </Box>
          </StyledPaper>
        </Grid>
      )}
    </Grid>
  );
};

export default GitHubProfileWrapper; 