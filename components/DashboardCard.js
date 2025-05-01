import React from 'react';
import { Box, Card, CardContent, Typography, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  trendLabel,
  color, 
  onClick,
  chartComponent
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Determine color scheme
  const cardColor = color || 'primary';
  const mainColor = theme.palette[cardColor].main;
  const lightColor = theme.palette[cardColor].light;
  
  // Animation variants
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    },
    hover: {
      y: -5,
      boxShadow: `0 12px 20px -10px ${alpha(mainColor, 0.3)}`,
      transition: { duration: 0.2 }
    }
  };
  
  // Trend indicator
  const renderTrend = () => {
    if (!trend || !trendValue) return null;
    
    const isPositive = trend === 'up';
    const trendColor = isPositive ? theme.palette.success.main : theme.palette.error.main;
    const TrendIcon = isPositive ? 
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={trendColor}>
        <path d="M7 14l5-5 5 5z" />
      </svg> :
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={trendColor}>
        <path d="M7 10l5 5 5-5z" />
      </svg>;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        {TrendIcon}
        <Typography 
          variant="caption" 
          sx={{ 
            color: trendColor,
            fontWeight: 500,
            mr: 0.5 
          }}
        >
          {trendValue}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {trendLabel || 'vs previous period'}
        </Typography>
      </Box>
    );
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={onClick ? "hover" : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      style={{ height: '100%', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Card
        sx={{ 
          height: '100%',
          background: isDarkMode ? 
            `linear-gradient(145deg, ${alpha(mainColor, 0.15)}, ${alpha(lightColor, 0.05)})` : 
            `linear-gradient(145deg, ${alpha(mainColor, 0.03)}, ${alpha(lightColor, 0.1)})`,
          borderRadius: 3,
          border: `1px solid ${alpha(mainColor, isDarkMode ? 0.2 : 0.1)}`,
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '70px',
            height: '70px',
            background: `radial-gradient(circle at top right, ${alpha(mainColor, 0.2)}, transparent 70%)`,
            borderRadius: '0 0 0 100%',
          },
        }}
      >
        <CardContent sx={{ height: '100%', p: 3, pb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1
            }}
          >
            <Typography 
              variant="subtitle1" 
              component="div"
              color="text.secondary"
              sx={{ fontWeight: 500, mb: 0.5 }}
            >
              {title}
            </Typography>
            
            {icon && (
              <Box 
                sx={{ 
                  color: mainColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1,
                  borderRadius: '12px',
                  background: alpha(mainColor, 0.1),
                }}
              >
                {icon}
              </Box>
            )}
          </Box>
          
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              color: isDarkMode ? 'white' : 'text.primary',
              mb: chartComponent ? 2 : 0
            }}
          >
            {value}
          </Typography>
          
          {renderTrend()}
          
          {chartComponent && (
            <Box sx={{ mt: 2, height: '100px' }}>
              {chartComponent}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardCard; 