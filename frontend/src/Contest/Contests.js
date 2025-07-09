import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import ContestCard from './ContestCard';
import ContestSkeleton from './ContestSkeleton';
import { 
  ToggleButton, 
  ToggleButtonGroup, 
  Typography, 
  Alert, 
  Box,
  Container,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  styled
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiToggleButton-root': {
    textTransform: 'none',
    minWidth: 120,
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)',
  },
}));

const SortSelect = styled(FormControl)(({ theme }) => ({
  minWidth: 200,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)',
  },
}));

// Create axios instance with configuration
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add retry logic with exponential backoff
axiosInstance.interceptors.response.use(undefined, async (err) => {
  const { config } = err;
  if (!config || config.retry === undefined) {
    return Promise.reject(err);
  }
  
  config.retry = config.retry || 3;
  
  if (config.retry === 0) {
    return Promise.reject(err);
  }
  
  config.retry -= 1;
  
  const backoff = new Promise((resolve) => {
    const backoffTime = Math.min(1000 * (3 - config.retry) * 2, 10000);
    console.log(`Retrying request: ${config.url} in ${backoffTime}ms`);
    setTimeout(resolve, backoffTime);
  });
  
  await backoff;
  return axiosInstance(config);
});

const Contests = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [contests, setContests] = useState({ upcoming: [], active: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('startTime');

  useEffect(() => {
    const fetchContests = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const token = await getAccessTokenSilently();
        
        const [upcomingRes, activeRes] = await Promise.all([
          axiosInstance.get('/contests/upcoming', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            retry: 3
          }).catch(error => {
            console.error('Error fetching upcoming contests:', error);
            return { data: [] };
          }),
          axiosInstance.get('/contests/active', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            retry: 3
          }).catch(error => {
            console.error('Error fetching active contests:', error);
            return { data: [] };
          })
        ]);

        const upcomingData = Array.isArray(upcomingRes.data) ? upcomingRes.data : [];
        const activeData = Array.isArray(activeRes.data) ? activeRes.data : [];

        setContests({
          upcoming: upcomingData,
          active: activeData
        });
      } catch (error) {
        console.error('Error in fetchContests:', error);
        let errorMessage;
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. The server is taking too long to respond. Please try again later.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Unable to connect to the contest service. Please check your internet connection and try again.';
        } else {
          errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to fetch contests. Please try again later.';
        }
        
        setError(errorMessage);
        setContests({ upcoming: [], active: [] });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchContests();
      const interval = setInterval(fetchContests, 300000);
      return () => clearInterval(interval);
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  const handleTabChange = (event, newTab) => {
    if (newTab !== null) {
      setActiveTab(newTab);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const filterAndSortContests = (contests) => {
    let filteredContests = contests.filter(contest => 
      contest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contest.platform.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredContests.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'platform':
          return a.platform.localeCompare(b.platform);
        case 'duration':
          return a.duration - b.duration;
        case 'startTime':
        default:
          return new Date(a.startTime) - new Date(b.startTime);
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
        Please log in to view contests.
      </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Coding Contests
          </Typography>
        </Box>
        <Stack spacing={2}>
        {[1, 2, 3].map((n) => (
          <ContestSkeleton key={n} />
        ))}
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
        {error}
      </Alert>
      </Container>
    );
  }

  const currentContests = filterAndSortContests(contests[activeTab] || []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
        Coding Contests
      </Typography>

        <StyledToggleButtonGroup
        value={activeTab}
        exclusive
        onChange={handleTabChange}
          aria-label="contest type"
      >
        <ToggleButton value="upcoming">
          Upcoming ({contests.upcoming.length})
        </ToggleButton>
        <ToggleButton value="active">
          Active ({contests.active.length})
        </ToggleButton>
        </StyledToggleButtonGroup>

        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mt: 3,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <SearchBar
            fullWidth
            variant="outlined"
            placeholder="Search contests by name or platform..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <SortSelect>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="startTime">Start Time</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="platform">Platform</MenuItem>
              <MenuItem value="duration">Duration</MenuItem>
            </Select>
          </SortSelect>
        </Box>
      </Box>

      {currentContests.length === 0 ? (
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ textAlign: 'center', py: 8 }}
        >
          No {activeTab} contests {searchQuery ? 'matching your search' : 'available'}.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {currentContests.map((contest) => (
            <ContestCard key={contest.id} contest={contest} />
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default Contests;