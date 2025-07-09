import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Tooltip,
    IconButton,
    Grid,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import { 
    Info as InfoIcon, 
    EmojiEvents as TrophyIcon, 
    Leaderboard as LeaderboardIcon,
    TrendingUp as TrendingUpIcon 
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  }
}));

const StatCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.card,
  borderRadius: 16,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  height: '100%',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)'
  }
}));

const RatingChip = styled(Chip)(({ theme, rating }) => {
  // Define color based on rating range
  let color = '#64B5F6'; // Default blue
  
  if (rating >= 2400) color = '#FF5252'; // Red for high rating
  else if (rating >= 1800) color = '#FF9800'; // Orange for good rating
  else if (rating >= 1400) color = '#4CAF50'; // Green for average rating
  
  return {
    backgroundColor: color,
    color: '#fff',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  };
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  fontSize: '0.9rem',
  padding: '12px 16px',
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.background.card,
  color: theme.palette.text.secondary,
  borderBottom: `2px solid ${theme.palette.divider}`,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontWeight: 600,
  padding: '16px',
}));

const PlatformLogo = ({ platform }) => {
  // Basic implementation - ideally would be replaced with actual platform logos
  const logoColors = {
    'leetcode': '#FFA116',
    'codeforces': '#1890FF',
    'codechef': '#5B4638',
    'atcoder': '#222222',
    'geeksforgeeks': '#2F8D46',
    'hackerrank': '#00EA64',
  };
  
  return (
    <Box 
      sx={{ 
        width: 32, 
        height: 32, 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: logoColors[platform.toLowerCase()] || '#64B5F6',
        color: '#fff',
        fontWeight: 'bold',
        mr: 2
      }}
    >
      {platform.charAt(0).toUpperCase()}
    </Box>
  );
};

const ContestStats = ({ contestStats, ratingHistory, platformErrors = {} }) => {
    const platforms = Object.keys(contestStats || {});
    
    // Process rating history data for the chart
    const chartData = (ratingHistory || [])
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: new Date(item.date).getTime(),
        rating: item.rating,
        platform: item.platform
      }));
    
    // Create a color map for platforms
    const platformColors = {
      'leetcode': '#FFA116',
      'codeforces': '#1890FF',
      'codechef': '#5B4638',
      'atcoder': '#222222',
      'geeksforgeeks': '#2F8D46',
      'hackerrank': '#00EA64',
    };
    
    // Calculate total contests across all platforms
    const totalContests = platforms.reduce((sum, platform) => sum + (contestStats[platform].totalContests || 0), 0);
    
    // Find highest rating and its platform
    let highestRating = 0;
    let highestRatingPlatform = '';
    
    platforms.forEach(platform => {
      const rating = contestStats[platform].rating || 0;
      if (rating > highestRating) {
        highestRating = rating;
        highestRatingPlatform = platform;
      }
    });
    
    // Custom tooltip for rating chart
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <Box
            sx={{
              backgroundColor: 'background.paper',
              p: 1.5,
              borderRadius: 1,
              boxShadow: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2">{label}</Typography>
            {payload.map((entry, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    backgroundColor: entry.color,
                    borderRadius: '50%',
                    mr: 1,
                  }}
                />
                <Typography variant="caption" sx={{ mr: 1 }}>
                  {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}:
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {entry.value}
                </Typography>
              </Box>
            ))}
          </Box>
        );
      }
      return null;
    };

    if (platforms.length === 0 && Object.keys(platformErrors).length === 0) {
        return (
            <StyledPaper>
                <Typography variant="h5" fontWeight="700" gutterBottom>
                    Contest Participation
                </Typography>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <TrophyIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="textSecondary">
                    No contest data available. Make sure you've set up your platform usernames in profile settings.
                </Typography>
                </Box>
            </StyledPaper>
        );
    }

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <Typography variant="h5" fontWeight="700" gutterBottom sx={{ 
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                mb: 3
            }}>
                Contest Participation
            </Typography>

            {/* Display platform-specific errors */}
            {Object.entries(platformErrors).map(([platform, error]) => (
                <Alert 
                    key={platform} 
                    severity="warning" 
                    sx={{ mb: 2, borderRadius: 2 }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}: {error}
                        <Tooltip title="This error won't affect other platforms' data">
                            <IconButton size="small" sx={{ ml: 1 }}>
                                <InfoIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Alert>
            ))}

            {platforms.length > 0 && (
                <>
                    <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
                        <Grid item xs={12} sm={6} md={4} sx={{ p: { xs: 1, sm: 1.5 } }}>
                            <StatCard>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Contests
                                        </Typography>
                                        <TrophyIcon color="primary" />
                                    </Box>
                                    <Typography variant="h4" fontWeight="700">
                                        {totalContests}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Across all platforms
                                    </Typography>
                                </CardContent>
                            </StatCard>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4} sx={{ p: { xs: 1, sm: 1.5 } }}>
                            <StatCard>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Highest Rating
                                        </Typography>
                                        <LeaderboardIcon color="primary" />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="h4" fontWeight="700" sx={{ mr: 1 }}>
                                            {highestRating}
                                        </Typography>
                                        <RatingChip 
                                            label={highestRatingPlatform.charAt(0).toUpperCase() + highestRatingPlatform.slice(1)} 
                                            rating={highestRating} 
                                            size="small"
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Best performance
                                    </Typography>
                                </CardContent>
                            </StatCard>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4} sx={{ p: { xs: 1, sm: 1.5 } }}>
                            <StatCard>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Active Platforms
                                        </Typography>
                                        <TrendingUpIcon color="primary" />
                                    </Box>
                                    <Typography variant="h4" fontWeight="700">
                                        {platforms.length}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Platforms with contest participation
                                    </Typography>
                                </CardContent>
                            </StatCard>
                        </Grid>
                    </Grid>
                
                    {chartData.length > 0 && (
                        <StyledPaper sx={{ mb: 3, mt: 3 }}>
                            <Typography variant="h6" fontWeight="600" gutterBottom>
                                Rating History
                            </Typography>
                            <Box sx={{ 
                                height: { xs: 300, sm: 350, md: 400 }, 
                                mt: 2, 
                                width: '100%',
                                '& .recharts-wrapper': {
                                    width: '100% !important'
                                }
                            }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={chartData}
                                        margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                        <XAxis 
                                            dataKey="date" 
                                            minTickGap={30}
                                            tickLine={false}
                                        />
                                        <YAxis 
                                            tickLine={false}
                                            axisLine={false}
                                            width={35}
                                        />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        
                                        {/* Create a line for each platform */}
                                        {Object.keys(platformColors).map(platform => {
                                            const platformData = chartData.filter(item => 
                                                item.platform.toLowerCase() === platform.toLowerCase()
                                            );
                                            
                                            if (platformData.length > 0) {
                                                return (
                                                    <Line
                                                        key={platform}
                                                        type="monotone"
                                                        dataKey="rating"
                                                        data={platformData}
                                                        name={platform}
                                                        stroke={platformColors[platform]}
                                                        strokeWidth={2}
                                                        dot={{ r: 3, strokeWidth: 1, fill: '#fff' }}
                                                        activeDot={{ r: 5, strokeWidth: 0 }}
                                                    />
                                                );
                                            }
                                            return null;
                                        })}
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </StyledPaper>
                    )}
                    
                    <StyledPaper>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                            Platform Performance
                        </Typography>
                        <TableContainer sx={{ 
                            overflowX: 'auto',
                            '& .MuiTable-root': {
                                minWidth: 650
                            }
                        }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                        <StyledTableHeaderCell>Platform</StyledTableHeaderCell>
                                        <StyledTableHeaderCell align="right">Contests</StyledTableHeaderCell>
                                        <StyledTableHeaderCell align="right">Rating</StyledTableHeaderCell>
                                        <StyledTableHeaderCell align="right">Ranking</StyledTableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {platforms.map(platform => {
                                const stats = contestStats[platform];
                                return (
                                                    <TableRow 
                                                        key={platform}
                                                        sx={{ backgroundColor: 'background.paper' }}
                                                    >
                                                        <StyledTableCell component="th" scope="row">
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <PlatformLogo platform={platform} />
                                                                <Typography variant="body2" fontWeight="500">
                                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                                </Typography>
                                                            </Box>
                                                        </StyledTableCell>
                                                        <StyledTableCell align="right">{stats.totalContests || 0}</StyledTableCell>
                                                        <StyledTableCell align="right">
                                                            <RatingChip 
                                                                label={stats.rating || 0} 
                                                                rating={stats.rating || 0} 
                                                                size="small"
                                                            />
                                                        </StyledTableCell>
                                                        <StyledTableCell align="right">
                                                            {stats.ranking ? 
                                                                `#${stats.ranking}` : 
                                                                <Typography variant="caption" color="text.secondary">N/A</Typography>}
                                                        </StyledTableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                    </StyledPaper>
                </>
            )}
        </Box>
    );
};

export default ContestStats; 