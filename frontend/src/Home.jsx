import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Paper,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)'
    }
}));

const Home = () => {
    const { isAuthenticated, user, loginWithRedirect, isLoading } = useAuth0();

    if (isLoading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="80vh"
            >
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box textAlign="center" mb={6}>
                <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #64B5F6 30%, #B39DDB 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    Welcome to CodeFolio
                </Typography>
                
                {isAuthenticated ? (
                    <Box>
                        <Typography 
                            variant="h5" 
                            color="text.secondary" 
                            gutterBottom
                            sx={{ mb: 4 }}
                        >
                            Hello, {user?.name}! 👋
                        </Typography>
                        
                        <StyledPaper elevation={2}>
                            <Typography variant="h4" gutterBottom>
                                Your Dashboard
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <StyledPaper 
                                        elevation={1}
                                        sx={(theme) => ({
                                            backgroundColor: theme.palette.primary.dark,
                                            color: theme.palette.primary.contrastText
                                        })}
                                    >
                                        <Typography variant="h6" gutterBottom>
                                            Your Profile
                                        </Typography>
                                        <Typography variant="body1">
                                            View and manage your coding profiles
                                        </Typography>
                                    </StyledPaper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <StyledPaper 
                                        elevation={1}
                                        sx={(theme) => ({
                                            backgroundColor: theme.palette.secondary.dark,
                                            color: theme.palette.secondary.contrastText
                                        })}
                                    >
                                        <Typography variant="h6" gutterBottom>
                                            Contests
                                        </Typography>
                                        <Typography variant="body1">
                                            Check upcoming coding contests
                                        </Typography>
                                    </StyledPaper>
                                </Grid>
                            </Grid>
                        </StyledPaper>
                    </Box>
                ) : (
                    <Box>
                        <Typography 
                            variant="h5" 
                            color="text.secondary" 
                            gutterBottom
                            sx={{ mb: 4 }}
                        >
                            Track your coding journey across multiple platforms
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => loginWithRedirect()}
                            sx={{
                                px: 4,
                                py: 1.5,
                                color: '#fff',
                                '&:hover': {
                                    color: '#fff'
                                }
                            }}
                        >
                            Get Started
                        </Button>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Home; 