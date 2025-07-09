import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PracticeIcon from '@mui/icons-material/School';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth0 } from '@auth0/auth0-react';
import { 
    Box,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Typography,
    Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
    Home as HomeIcon,
    Person as PersonIcon,
    EmojiEvents as ContestsIcon,
    Logout as LogoutIcon,
    Login as LoginIcon,
    Dashboard as DashboardIcon
} from '@mui/icons-material';

const StyledSidebar = styled(Box)(({ theme }) => ({
    width: 256,
    height: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column'
}));

const mainMenuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile', protected: true },
    { text: 'Contests', icon: <ContestsIcon />, path: '/contests', protected: true }
];

const practiceMenuItems = [
    { text: 'DSA', path: '/practice/dsa' },
    { text: 'Aptitude', path: '/practice/aptitude' }
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
    const [practiceOpen, setPracticeOpen] = useState(false);

    return (
        <StyledSidebar>
            {/* User Profile Section */}
            <Box sx={{ p: 2 }}>
                {isAuthenticated ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user?.picture} alt={user?.name} />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap>
                                {user?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {user?.email}
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<LoginIcon />}
                        onClick={() => loginWithRedirect()}
                    >
                        Log In
                    </Button>
                )}
            </Box>

            <Divider />

            {/* Navigation Links */}
            <List component="nav" sx={{ flex: 1, px: 1 }}>
                {mainMenuItems.map((item) => {
                    if (item.protected && !isAuthenticated) return null;
                    if (item.text === 'Practice') return null; // Remove old Practice item
                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    '&.Mui-selected': {
                                        backgroundColor: 'background.card'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}

                {/* Practice Dropdown */}
                {isAuthenticated && (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => setPracticeOpen((prev) => !prev)}
                                selected={location.pathname.startsWith('/practice')}
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    '&.Mui-selected': {
                                        backgroundColor: 'background.card'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <PracticeIcon />
                                </ListItemIcon>
                                <ListItemText primary="Practice" />
                                {practiceOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                            </ListItemButton>
                        </ListItem>
                        {practiceOpen && practiceMenuItems.map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ pl: 4 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    selected={location.pathname === item.path}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        ml: 2,
                                        '&.Mui-selected': {
                                            backgroundColor: 'background.card'
                                        }
                                    }}
                                >
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </>
                )}
            </List>

            {/* Logout Button */}
            {isAuthenticated && (
                <Box sx={{ p: 2 }}>
                    <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        startIcon={<LogoutIcon />}
                        onClick={() => logout({ returnTo: window.location.origin })}
                        sx={{
                            color: '#fff',
                            '&:hover': {
                                color: '#fff'
                            }
                        }}
                    >
                        Log Out
                    </Button>
                </Box>
                )}
        </StyledSidebar>
    );
};

export default Sidebar;