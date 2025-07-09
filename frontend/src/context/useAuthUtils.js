import { useAuth0 } from '@auth0/auth0-react';

export const useAuthUtils = () => {
    const { 
        isAuthenticated, 
        isLoading, 
        user, 
        getAccessTokenSilently, 
        loginWithRedirect, 
        logout 
    } = useAuth0();

    const handleLogin = () => {
        loginWithRedirect();
    };

    const handleLogout = () => {
        logout({ returnTo: window.location.origin });
    };

    const getToken = async () => {
        try {
            return await getAccessTokenSilently();
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    };

    return {
        isAuthenticated,
        isLoading,
        user,
        login: handleLogin,
        logout: handleLogout,
        getToken
    };
}; 