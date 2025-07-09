import React from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Chip, 
    Link, 
    Grid 
} from '@mui/material';
import { formatDistanceToNow, format } from 'date-fns';

const ContestList = ({ contests, type }) => {
    if (!contests || contests.length === 0) {
        return (
            <Typography color="textSecondary">
                No {type} contests found.
            </Typography>
        );
    }

    return (
        <Grid container spacing={3}>
            {contests.map((contest) => (
                <Grid item xs={12} key={contest.id}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        {contest.name}
                                    </Typography>
                                    <Typography color="textSecondary" gutterBottom>
                                        {contest.platform}
                                    </Typography>
                                </Box>
                                <Chip 
                                    label={type === 'active' ? 'Active' : 'Upcoming'} 
                                    color={type === 'active' ? 'success' : 'primary'} 
                                    variant="outlined" 
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Start Time: {format(new Date(contest.startTime), 'PPp')}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Duration: {Math.round(contest.duration / (1000 * 60 * 60))} hours
                                </Typography>
                                {type === 'upcoming' && (
                                    <Typography variant="body2" color="primary">
                                        Starts {formatDistanceToNow(new Date(contest.startTime), { addSuffix: true })}
                                    </Typography>
                                )}
                            </Box>

                            {contest.description && (
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    {contest.description}
                                </Typography>
                            )}

                            <Link 
                                href={contest.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                color="primary"
                            >
                                View Contest
                            </Link>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default ContestList; 