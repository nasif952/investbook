import React from 'react';
import { Box, Container, Typography, Grid, Link as MuiLink, Stack, Divider, useTheme } from '@mui/material';
import Link from 'next/link';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { title: 'Home', path: '/' },
    { title: 'About', path: '/about' },
    { title: 'Services', path: '/services' },
    { title: 'Privacy Policy', path: '/privacy' },
    { title: 'Terms of Service', path: '/terms' },
    { title: 'Contact', path: '/contact' },
  ];

  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 4, 
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Incubator Platform
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {footerLinks.map((link) => (
                <Link key={link.title} href={link.path} passHref legacyBehavior>
                  <MuiLink 
                    underline="hover"
                    color="text.secondary"
                    sx={{ 
                      display: 'inline-block',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {link.title}
                  </MuiLink>
                </Link>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4}>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} Incubator Platform. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 