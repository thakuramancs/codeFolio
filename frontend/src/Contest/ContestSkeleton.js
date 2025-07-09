import React from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  overflow: 'visible',
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const StatusChipSkeleton = styled(Skeleton)(({ theme }) => ({
  position: 'absolute',
  top: -12,
  right: 16,
  height: 24,
  width: 100,
  borderRadius: 12,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)',
}));

const InfoRowSkeleton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)',
}));

const ContestSkeleton = () => (
  <StyledCard>
    <StatusChipSkeleton animation="wave" variant="rounded" />
    <CardContent sx={{ 
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'stretch', sm: 'center' },
      gap: 3,
      p: 3,
      position: 'relative'
    }}>
      <Box sx={{ 
        position: 'absolute',
        top: 16,
        right: 16
      }}>
        <Skeleton 
          animation="wave" 
          variant="circular" 
          width={30} 
          height={30}
          sx={{
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
          }}
        />
      </Box>
      
      <Box sx={{ flex: '1 1 auto' }}>
        <Skeleton 
          animation="wave" 
          height={32} 
          width="60%" 
          sx={{ 
            borderRadius: 1,
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
          }} 
        />

        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          mt: 2
        }}>
          {[1, 2, 3].map((index) => (
            <InfoRowSkeleton key={index}>
              <Skeleton 
                animation="wave" 
                variant="circular" 
                width={24} 
                height={24}
                sx={{
                  backgroundColor: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)',
                }}
              />
              <Skeleton 
                animation="wave" 
                height={24} 
                width="70%" 
                sx={{
                  borderRadius: 1,
                  backgroundColor: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)',
                }}
              />
            </InfoRowSkeleton>
          ))}
        </Box>
      </Box>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: { xs: '100%', sm: '160px' }
      }}>
        <Skeleton 
          animation="wave" 
          height={48} 
          width="100%" 
          sx={{ 
            borderRadius: 3,
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
          }} 
        />
      </Box>
    </CardContent>
  </StyledCard>
);

export default ContestSkeleton; 