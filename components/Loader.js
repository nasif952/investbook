import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop // Optional: for a more prominent loader
} from '@mui/material';

// Simple centered loader
const Loader = ({ size = 40, color = 'primary', message = 'Loading...', backdrop = false }) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // If not using backdrop, set minHeight to center on screen
        minHeight: backdrop ? 'auto' : '80vh', 
        p: 3,
        color: backdrop ? 'common.white' : 'text.primary' // Adjust color for backdrop
      }}
    >
      <CircularProgress
        size={size}
        color={color}
        thickness={4}
        sx={{
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': {
              transform: 'rotate(0deg)',
            },
            '100%': {
              transform: 'rotate(360deg)',
            },
          },
          mb: 2
        }}
      />
      <Typography variant="h6">{message}</Typography>
    </Box>
  );

  if (backdrop) {
    return (
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={true} // Assuming Loader is only rendered when loading is true
      >
        {content}
      </Backdrop>
    );
  }

  return content;
};

export default Loader; 