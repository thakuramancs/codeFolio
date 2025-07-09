import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthUtils } from '../context/useAuthUtils';
import Sidebar from './Sidebar';
import { Box, CircularProgress, Drawer, useTheme } from '@mui/material';

const Layout = () => {
    const { isAuthenticated, isLoading } = useAuthUtils();
    const theme = useTheme();

    if (isLoading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
                sx={{ backgroundColor: theme.palette.background.default }}
            >
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box 
            display="flex" 
            minHeight="100vh"
            sx={{
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary
            }}
        >
            {isAuthenticated && (
                <Drawer
                    variant="permanent"
                    sx={{
                        display: 'block',
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: 256,
                            border: 'none',
                            boxShadow: theme.shadows[3]
                        }
                    }}
                    open
                >
                    <Sidebar />
                </Drawer>
            )}

            <Box 
                component="main"
                flex={1}
                overflow="auto"
                sx={{
                    backgroundColor: theme.palette.background.default,
                    p: 3,
                    ...(isAuthenticated && {
                        ml: '256px'
                    })
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;