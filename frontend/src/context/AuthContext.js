import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    getAccessTokenSilently, 
    logout,
    loginWithRedirect 
  } = useAuth0();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null
  });

  const handleLogout = async () => {
    try {
      await logout({
        logoutParams: {
          returnTo: window.location.origin,
          federated: true,
          clientId: 'RNrftxwQV1VM9XT6igFru5ZKCUhVLzee'
        }
      });
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null
      });
      localStorage.removeItem('auth_state');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithRedirect({
        appState: { returnTo: '/dashboard' },
        authorizationParams: {
          prompt: 'login',
        }
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  useEffect(() => {
    const updateAuthState = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          const newState = {
            isAuthenticated: true,
            isLoading: false,
            user,
            token
          };
          setAuthState(newState);
          localStorage.setItem('auth_state', JSON.stringify({ isAuthenticated: true }));
          
          // Navigate to dashboard if on login page
          if (window.location.pathname === '/login') {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error getting token:', error);
          handleLogout();
        }
      } else if (!isLoading) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null
        });
        localStorage.removeItem('auth_state');
      }
    };

    updateAuthState();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently, navigate]);

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      logout: handleLogout,
      login: handleLogin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 