import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { Switch, Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { motion } from 'framer-motion';

// Create custom styled switch
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

// Create modern icon button style switch
const ModernThemeSwitch = ({ checked, onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50px',
        padding: '4px',
        background: isDark 
          ? 'linear-gradient(to right, #0f172a, #1e293b)' 
          : 'linear-gradient(to right, #e2e8f0, #cbd5e1)',
        boxShadow: isDark
          ? 'inset 0 2px 6px rgba(0,0,0,0.3)'
          : 'inset 0 2px 6px rgba(0,0,0,0.1)',
        width: '72px',
        height: '36px',
      }}
    >
      <motion.div
        animate={{
          x: checked ? 36 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
        style={{
          position: 'absolute',
          left: '4px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: checked 
            ? 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)' 
            : 'linear-gradient(to bottom right, #fbbf24, #f59e0b)',
          zIndex: 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      />

      <Box
        sx={{
          display: 'flex',
          width: '100%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Tooltip title="Light Mode">
          <IconButton
            onClick={() => onChange({ target: { checked: false } })}
            sx={{
              color: checked ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,1)',
              flex: 1,
              padding: 0,
            }}
            size="small"
          >
            <LightMode fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Dark Mode">
          <IconButton
            onClick={() => onChange({ target: { checked: true } })}
            sx={{
              color: checked ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.5)',
              flex: 1,
              padding: 0,
            }}
            size="small"
          >
            <DarkMode fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

const ThemeSwitch = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const handleChange = (event) => {
    const newMode = event.target.checked ? 'dark' : 'light';
    localStorage.setItem('theme', newMode);
    
    // Trigger theme change by refreshing the page
    // This is needed because theme is initialized in _app.js
    window.location.reload();
  };

  return (
    <ModernThemeSwitch
      checked={isDarkMode}
      onChange={handleChange}
    />
  );
};

export default ThemeSwitch; 