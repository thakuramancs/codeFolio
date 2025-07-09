import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, CircularProgress, Alert } from '@mui/material';
import ProfileHeader from './Overview/ProfileHeader';
import { Outlet } from 'react-router-dom';
import { profileService } from './profileService';
import Button from '@mui/material/Button';

const Profile = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [profilePageData, setProfilePageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfilePageData = async () => {
      try {
        const token = await getAccessTokenSilently();
        localStorage.setItem('auth_token', token);
        // Always pass email and name if available
        const data = await profileService.fetchAndAggregateProfile(
          user.sub,
          user.email,
          user.name
        );
        setProfilePageData(data);
        setLoading(false);
      } catch (err) {
        // If error is 404, show a friendly setup message
        if (err?.response?.status === 404) {
          setError('No profile found for this user. Please set up your profile.');
        } else {
          setError('Failed to load profile data');
        }
        setLoading(false);
      }
    };
    if (user?.sub) fetchProfilePageData();
  }, [user, getAccessTokenSilently]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
        {error.includes('set up your profile') && (
          <Box display="flex" justifyContent="center">
            <a href="/profile/settings">
              <Button variant="contained" color="primary">Go to Profile Setup</Button>
            </a>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', width: '100%', py: 3 }}>
      <ProfileHeader user={user} profileData={profilePageData?.profileData} />
      <Outlet context={profilePageData} />
    </Box>
  );
};

export default Profile;