import React from 'react';
import { Card, CardContent, Typography, Button, Chip, Box, Paper, IconButton, Stack } from '@mui/material';
import { AccessTime, Event, Language, Timer, OpenInNew } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AddToCalendar from './calendar/AddToCalendar';

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
  },
  position: 'relative',
  overflow: 'visible',
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const StatusChip = styled(Chip)(({ theme, platform }) => {
  const colors = {
    'LeetCode': '#FFA116',
    'Codeforces': '#1890FF',
    'CodeChef': '#5B4638',
    'HackerRank': '#00EA64',
    'GeeksforGeeks': '#2F8D46',
  };

  return {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: colors[platform] || theme.palette.primary.main,
    color: platform === 'CodeChef' ? '#FFFFFF' : platform === 'LeetCode' ? '#000000' : '#FFFFFF',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    '& .MuiChip-label': {
      padding: '0 12px',
    },
  };
});

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)',
  '& svg': {
    fontSize: '1.2rem',
    color: theme.palette.primary.main,
  },
}));

const ViewButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  borderRadius: '12px',
  border: 0,
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
  transition: 'transform 0.2s',
  '&:hover': {
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    transform: 'scale(1.02)',
  },
}));

const ContestCard = ({ contest }) => {
  const startTime = new Date(contest.startTime);
  const endTime = new Date(startTime.getTime() + contest.duration);
  const durationHours = Math.floor(contest.duration / (1000 * 60 * 60));
  const durationMinutes = Math.floor((contest.duration % (1000 * 60 * 60)) / (1000 * 60));

  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeStatus = () => {
    const now = new Date();
    const timeUntilStart = startTime - now;
    const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `Starts in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Starts in ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return 'Starting soon';
    }
  };

  return (
    <StyledCard>
      <StatusChip
                label={contest.platform} 
        platform={contest.platform}
                size="small"
              />
      <CardContent sx={{ 
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 3,
        p: 3,
        position: 'relative'
      }}>
        <Box sx={{ 
          position: 'absolute',
          top: 16,
          right: 16
        }}>
          <AddToCalendar contest={contest} />
            </Box>

        <Box sx={{ flex: '1 1 auto' }}>
          <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: '1.2rem',
              lineHeight: 1.3,
              color: theme => theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
            }}
          >
            {contest.name}
          </Typography>

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            mt: 2
          }}>
            <InfoRow>
              <Event />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatDate(startTime)}
              </Typography>
            </InfoRow>

            <InfoRow>
              <AccessTime />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: theme => theme.palette.primary.main
                }}
              >
                {getTimeStatus()}
              </Typography>
            </InfoRow>

            <InfoRow>
              <Timer />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Duration: {durationHours}h {durationMinutes > 0 ? `${durationMinutes}m` : ''}
              </Typography>
            </InfoRow>
            </Box>
          </Box>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          minWidth: { xs: '100%', sm: '160px' }
        }}>
          <ViewButton
              variant="contained" 
            fullWidth
              href={contest.url} 
              target="_blank"
              rel="noopener noreferrer"
            endIcon={<OpenInNew />}
            >
              View Contest
          </ViewButton>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default ContestCard; 