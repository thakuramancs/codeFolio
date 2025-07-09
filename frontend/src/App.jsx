import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth0Provider, withAuthenticationRequired } from '@auth0/auth0-react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './layout/Layout';
import Home from './Home';
import Profile from './Profile/Profile';
import Contests from './Contest/Contests';
import AuthCallback from './context/pages/AuthCallback';
import auth0Config from './context/auth0Config';
import theme from './theme';
import PlatformProfile from './Profile/IndividualPlatform/PlatformProfile';
import GitHubProfileWrapper from './Profile/IndividualPlatform/GitHub/GitHubProfileWrapper';
import PlatformSettings from './Profile/PlatformSettings';
import PracticeLayout from './Practice/practiceLayout';
import AptitudePage from './Practice/aptitudePage';
import DsaPage from './Practice/dsaPage';
import Overview from './Profile/Overview/overview';

// Simple protected route wrapper
function ProtectedRoute({ component: Component, ...rest }) {
  const Wrapped = withAuthenticationRequired(Component, {
    onRedirecting: () => <div>Loading...</div>,
  });
  return <Wrapped {...rest} />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Auth0Provider {...auth0Config}>
        <Router>
          <Routes>
            <Route path="/login/callback" element={<AuthCallback />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="profile" element={<ProtectedRoute component={Profile} />}>
                 <Route path="overview" element={<ProtectedRoute component={Overview} />} />
                <Route path=":platform" element={<ProtectedRoute component={PlatformProfile} />} />
                <Route path="settings" element={<ProtectedRoute component={PlatformSettings} />} />
                <Route path="github" element={<ProtectedRoute component={GitHubProfileWrapper} />} />
              </Route>
              <Route path="contests" element={<ProtectedRoute component={Contests} />} />
              <Route path="practice" element={<ProtectedRoute component={PracticeLayout} />}>
                <Route path="dsa" element={<ProtectedRoute component={DsaPage} />} />
                <Route path="aptitude" element={<ProtectedRoute component={AptitudePage} />} />
              </Route>
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </Router>
      </Auth0Provider>
    </ThemeProvider>
  );
}

export default App;