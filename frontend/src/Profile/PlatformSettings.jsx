import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthUtils } from '../context/useAuthUtils';
import axios from 'axios';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    CircularProgress,
    Container,
    Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    marginBottom: theme.spacing(3)
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.divider,
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
    '& .MuiInputLabel-root': {
        color: theme.palette.text.secondary,
    },
    '& .MuiInputBase-input': {
        color: theme.palette.text.primary,
    }
}));

const PlatformSettings = () => {
    const { user, getToken } = useAuthUtils();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const hasLoadedProfile = useRef(false);
    const abortControllerRef = useRef(null);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        leetcodeUsername: '',
        codeforcesUsername: '',
        codechefUsername: '',
        atcoderUsername: '',
        geeksforgeeksUsername: '',
        githubUsername: ''
    });

    const fetchProfile = useCallback(async () => {
        // Don't fetch if we've already loaded or no user
        if (!user?.sub || hasLoadedProfile.current) {
            setLoading(false);
            return;
        }

        try {
            // Cancel any existing request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new abort controller
            abortControllerRef.current = new AbortController();
            
            const token = await getToken();
            console.log('Fetching profile for user:', user.sub);
            const response = await axios.get(
                `http://localhost:8080/api/profiles/${user.sub}`,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    signal: abortControllerRef.current.signal
                }
            );

            if (response.data) {
                setProfile({
                    name: response.data.name || '',
                    email: response.data.email || '',
                    leetcodeUsername: response.data.leetcodeUsername || '',
                    codeforcesUsername: response.data.codeforcesUsername || '',
                    codechefUsername: response.data.codechefUsername || '',
                    atcoderUsername: response.data.atcoderUsername || '',
                    geeksforgeeksUsername: response.data.geeksforgeeksUsername || '',
                    githubUsername: response.data.githubUsername || ''
                });
                hasLoadedProfile.current = true;
            }
            } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request cancelled');
                return;
            }
            console.error('Error fetching profile:', error.response || error);
            setNotification({
                message: `Failed to load profile data: ${error.response?.data?.message || error.message}`,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, [user?.sub, getToken]);

    useEffect(() => {
        fetchProfile();

        return () => {
            // Cleanup: cancel any pending request when component unmounts
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchProfile]);

    // Reset hasLoadedProfile when user changes
    useEffect(() => {
        hasLoadedProfile.current = false;
    }, [user?.sub]);

    const createEmptyPlatformStats = () => ({
        totalQuestions: 0,
        totalActiveDays: 0,
        totalContests: 0,
        rating: 0,
        contestRanking: 0,
        difficultyWiseSolved: {},
        topicWiseSolved: {},
        submissionCalendar: "",
        awards: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setNotification({ message: '', type: '' });

        try {
            const token = await getToken();

            // First try to get or create profile
            const getOrCreateResponse = await axios.get(
                `http://localhost:8080/api/profiles/me`,
                {
                    params: {
                        userId: user.sub,
                        email: profile.email?.trim() || '',
                        name: profile.name?.trim() || ''
                    },
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Prepare the update data with all required fields
            const updateData = {
                id: getOrCreateResponse.data?.id || null,
                userId: user.sub,
                name: profile.name?.trim() || '',
                email: profile.email?.trim() || '',
                leetcodeUsername: profile.leetcodeUsername?.trim() || null,
                codeforcesUsername: profile.codeforcesUsername?.trim() || null,
                codechefUsername: profile.codechefUsername?.trim() || null,
                atcoderUsername: profile.atcoderUsername?.trim() || null,
                geeksforgeeksUsername: profile.geeksforgeeksUsername?.trim() || null,
                githubUsername: profile.githubUsername?.trim() || null,
                // Initialize platform stats with existing data or empty objects
                leetcodeStats: getOrCreateResponse.data?.leetcodeStats || createEmptyPlatformStats(),
                codeforcesStats: getOrCreateResponse.data?.codeforcesStats || createEmptyPlatformStats(),
                codechefStats: getOrCreateResponse.data?.codechefStats || createEmptyPlatformStats(),
                atcoderStats: getOrCreateResponse.data?.atcoderStats || createEmptyPlatformStats(),
                geeksforgeeksStats: getOrCreateResponse.data?.geeksforgeeksStats || createEmptyPlatformStats(),
                // GitHub specific stats
                githubRepos: getOrCreateResponse.data?.githubRepos || 0,
                githubStars: getOrCreateResponse.data?.githubStars || 0,
                githubFollowers: getOrCreateResponse.data?.githubFollowers || 0,
                githubFollowing: getOrCreateResponse.data?.githubFollowing || 0,
                lastUpdated: new Date().toISOString()
            };

            // Then update the profile
            const response = await axios.put(
                `http://localhost:8080/api/profiles/${user.sub}`,
                updateData,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                setNotification({
                    message: 'Profile updated successfully',
                    type: 'success'
                });
                
                // Update local state with response data
                setProfile({
                    name: response.data.name || '',
                    email: response.data.email || '',
                    leetcodeUsername: response.data.leetcodeUsername || '',
                    codeforcesUsername: response.data.codeforcesUsername || '',
                    codechefUsername: response.data.codechefUsername || '',
                    atcoderUsername: response.data.atcoderUsername || '',
                    geeksforgeeksUsername: response.data.geeksforgeeksUsername || '',
                    githubUsername: response.data.githubUsername || ''
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               error.message || 
                               'An unexpected error occurred';
            
            setNotification({
                message: `Failed to update profile: ${errorMessage}`,
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    // Handle input changes
    const handleChange = (field) => (event) => {
        const value = event.target.value;
        console.log(`Updating ${field} to:`, value);
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Profile Settings
            </Typography>

            {notification.message && (
                <Alert 
                    severity={notification.type} 
                    sx={{ mb: 3 }}
                    variant="outlined"
                    onClose={() => setNotification({ message: '', type: '' })}
                >
                    {notification.message}
                </Alert>
            )}

            <StyledPaper>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Basic Information
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={profile.name}
                                onChange={handleChange('name')}
                                disabled={saving}
                                required
                                inputProps={{ 
                                    autoComplete: 'name'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={profile.email}
                                onChange={handleChange('email')}
                                disabled={saving}
                                required
                                inputProps={{ 
                                    autoComplete: 'email'
                                }}
                            />
                        </Grid>

                        {/* Platform Usernames */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Platform Usernames
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                        fullWidth
                        label="LeetCode Username"
                                name="leetcodeUsername"
                                value={profile.leetcodeUsername}
                                onChange={handleChange('leetcodeUsername')}
                                disabled={saving}
                                inputProps={{ 
                                    spellCheck: 'false',
                                    autoComplete: 'off'
                                }}
                    />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                        fullWidth
                        label="Codeforces Username"
                                name="codeforcesUsername"
                                value={profile.codeforcesUsername}
                                onChange={handleChange('codeforcesUsername')}
                                disabled={saving}
                                inputProps={{ 
                                    spellCheck: 'false',
                                    autoComplete: 'off'
                                }}
                    />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                        fullWidth
                        label="CodeChef Username"
                                name="codechefUsername"
                                value={profile.codechefUsername}
                                onChange={handleChange('codechefUsername')}
                                disabled={saving}
                                inputProps={{ 
                                    spellCheck: 'false',
                                    autoComplete: 'off'
                                }}
                    />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                        fullWidth
                        label="AtCoder Username"
                                name="atcoderUsername"
                                value={profile.atcoderUsername}
                                onChange={handleChange('atcoderUsername')}
                                disabled={saving}
                                inputProps={{ 
                                    spellCheck: 'false',
                                    autoComplete: 'off'
                                }}
                    />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                        fullWidth
                                label="GeeksforGeeks Username"
                                name="geeksforgeeksUsername"
                                value={profile.geeksforgeeksUsername}
                                onChange={handleChange('geeksforgeeksUsername')}
                                disabled={saving}
                                inputProps={{ 
                                    spellCheck: 'false',
                                    autoComplete: 'off'
                                }}
                    />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                        fullWidth
                        label="GitHub Username"
                                name="githubUsername"
                                value={profile.githubUsername}
                                onChange={handleChange('githubUsername')}
                                disabled={saving}
                                inputProps={{ 
                                    spellCheck: 'false',
                                    autoComplete: 'off'
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Button 
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={saving}
                        sx={{ 
                            mt: 3,
                            color: '#fff',
                            '&:hover': {
                                color: '#fff'
                            }
                        }}
                    >
                        {saving ? 'Saving Changes...' : 'Save Changes'}
                    </Button>
                </Box>
            </StyledPaper>
        </Container>
    );
};

export default PlatformSettings; 