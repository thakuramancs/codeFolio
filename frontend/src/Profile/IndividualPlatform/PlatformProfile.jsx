
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Box, Alert, Typography, Card, CardContent, Chip, Grid, Divider } from '@mui/material';
import { profileService } from '../profileService';

const platformDisplayNames = {
  leetcode: 'LeetCode',
  codeforces: 'CodeForces',
  codechef: 'CodeChef',
  geeksforgeeks: 'GeeksForGeeks',
  github: 'GitHub',
  atcoder: 'AtCoder'
};

const PlatformProfile = () => {
  const { platform } = useParams();
  const { user, getAccessTokenSilently } = useAuth0();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.sub || !platform) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getAccessTokenSilently();
        localStorage.setItem('auth_token', token);
        const data = await profileService.fetchPlatformProfile(user.sub, platform);
        setStats(data);
      } catch (err) {
        setError(`No ${platformDisplayNames[platform] || platform} profile found.`);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, platform, getAccessTokenSilently]);

  // Helper renderers from PlatformStats
  const formatValue = (value) => {
    if (typeof value === 'number') return value.toLocaleString();
    return value || 'N/A';
  };

  const renderDifficultyStats = () => {
    if (!stats?.difficultyWiseSolved) return null;
    return (
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>Difficulty Breakdown</Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {Object.entries(stats.difficultyWiseSolved).map(([difficulty, count]) => (
            <Chip
              key={difficulty}
              label={`${difficulty}: ${formatValue(count)}`}
              color={
                difficulty.toLowerCase() === 'easy' ? 'success' :
                difficulty.toLowerCase() === 'medium' ? 'warning' :
                'error'
              }
              variant="outlined"
            />
          ))}
        </Box>
      </Box>
    );
  };

  const renderTopicStats = () => {
    if (!stats?.topicWiseSolved || Object.keys(stats.topicWiseSolved).length === 0) return null;
    return (
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>Topics Solved</Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {Object.entries(stats.topicWiseSolved).map(([topic, count]) => (
            <Chip
              key={topic}
              label={`${topic}: ${formatValue(count)}`}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Box>
    );
  };

  const renderAwards = () => {
    if (!stats?.awards) return null;
    try {
      const awards = typeof stats.awards === 'string' ? JSON.parse(stats.awards) : stats.awards;
      if (!Array.isArray(awards) || awards.length === 0) return null;
      return (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>Achievements</Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {awards.map((award, index) => (
              <Chip
                key={index}
                label={award.name}
                color="secondary"
                variant="outlined"
                icon={award.icon ? (
                  <img 
                    src={award.icon} 
                    alt="" 
                    style={{ width: 20, height: 20, marginLeft: 8, objectFit: 'contain' }} 
                  />
                ) : undefined}
                sx={{
                  '& .MuiChip-icon': {
                    order: 1,
                    marginLeft: '8px',
                    marginRight: '-8px',
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      );
    } catch (e) {
      console.error('Error parsing awards:', e);
      return null;
    }
  };

  const renderSubmissionCalendar = () => {
    if (!stats?.submissionCalendar) return null;
    try {
      const calendar = typeof stats.submissionCalendar === 'string' ? JSON.parse(stats.submissionCalendar) : stats.submissionCalendar;
      const totalDays = Object.keys(calendar).length;
      const totalSubmissions = Object.values(calendar).reduce((a, b) => a + b, 0);
      return (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>Submission Activity</Typography>
          <Typography variant="body2">
            Total Active Days: {formatValue(stats.totalActiveDays)}
          </Typography>
          <Typography variant="body2">
            Total Submissions: {formatValue(totalSubmissions)}
          </Typography>
        </Box>
      );
    } catch (e) {
      console.error('Error parsing submission calendar:', e);
      return null;
    }
  };

  if (!platform) return null;
  if (!user?.sub) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Please log in to view your {platformDisplayNames[platform] || platform} profile.</Alert>
      </Box>
    );
  }
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  if (platform === 'atcoder') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Coming Soon</Typography>
        <Typography color="text.secondary">AtCoder profile integration will be available soon.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {platformDisplayNames[platform] || platform} Profile {stats.username ? `- ${stats.username}` : ''}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Total Questions Solved:</strong> {formatValue(stats.totalQuestions)}
              </Typography>
              <Typography>
                <strong>Rating:</strong> {formatValue(stats.rating)}
              </Typography>
              <Typography>
                <strong>{stats.platformSpecificLabels?.contestRanking || 'Contest Ranking'}:</strong> {formatValue(stats.contestRanking)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Total Contests:</strong> {formatValue(stats.totalContests)}
              </Typography>
              <Typography>
                <strong>Active Days:</strong> {formatValue(stats.totalActiveDays)}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          {renderDifficultyStats()}
          {renderTopicStats()}
          {renderSubmissionCalendar()}
          {renderAwards()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlatformProfile;