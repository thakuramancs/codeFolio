import React from 'react';
import { Box, Typography, IconButton, Button, Paper, Avatar, Divider, Tab, Tabs, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  GitHub as GitHubIcon,
  Edit as EditIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: 0,
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  width: '100%'
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  margin: 'auto',
  [theme.breakpoints.down('sm')]: {
    width: 100,
    height: 100,
  }
}));

const ProfileBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 140,
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  opacity: 0.9,
  zIndex: 0
}));

const PlatformTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minWidth: 'auto',
  padding: '12px 24px',
  borderRadius: 8,
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: '#fff'
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem',
    padding: '8px 16px'
  }
}));

const EditButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  zIndex: 2,
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: '#fff'
  },
  [theme.breakpoints.down('sm')]: {
    padding: '6px 12px',
    fontSize: '0.8rem'
  }
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.card,
  margin: theme.spacing(0, 0.5),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)'
  }
}));


const ProfileHeader = ({ user, profileData }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { platform } = useParams();


  // Platform tabs and their route keys (all as strings for easier mapping)
  const platforms = [
    { name: 'Overview', key: 'overview', icon: <CodeIcon /> },
    { name: 'LeetCode', key: 'leetcode' },
    { name: 'CodeForces', key: 'codeforces' },
    { name: 'CodeChef', key: 'codechef' },
    { name: 'GeeksForGeeks', key: 'geeksforgeeks' },
    { name: 'GitHub', key: 'github', icon: <GitHubIcon /> }
  ];

  // Determine selected tab index based on the URL param (default to 0 for overview)
  const selectedIndex = platforms.findIndex(p => (platform || 'overview') === p.key);

  // Handle tab change: navigate to the correct URL
  const handleTabChange = (_, index) => {
    const selected = platforms[index];
    navigate(`/profile/${selected.key}`);
  };

  return (
    <StyledPaper elevation={0}>
      <ProfileBackground />
      <EditButton
        startIcon={!isMobile && <EditIcon />}
        variant="contained"
        onClick={() => navigate('/profile/settings')}
      >
        {isMobile ? <EditIcon fontSize="small" /> : 'Edit Profile'}
      </EditButton>
      <Box sx={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 8,
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <ProfileAvatar
          src={user?.picture || '/default-avatar.png'}
          alt="Profile"
        />
        <Box sx={{ mt: 2, textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="700" sx={{
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            mb: 0.5
          }}>
            {user?.name || 'User Name'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            @{profileData?.username || 'username'}
          </Typography>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1
          }}>
            <SocialIcon size="small">
              <LinkedInIcon fontSize="small" />
            </SocialIcon>
            <SocialIcon size="small">
              <TwitterIcon fontSize="small" />
            </SocialIcon>
            <SocialIcon size="small">
              <GitHubIcon fontSize="small" />
            </SocialIcon>
          </Box>
        </Box>
        <Divider sx={{ width: '100%', mb: 2 }} />
        <Box sx={{ width: '100%', overflow: 'auto' }}>
          <Tabs
            value={selectedIndex === -1 ? 0 : selectedIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTabs-scrollButtons': { color: 'primary.main' }
            }}
          >
            {platforms.map((platform) => (
              <PlatformTab
                key={platform.key}
                label={platform.name}
                icon={platform.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>
      </Box>
    </StyledPaper>
  );
};

export default ProfileHeader; 