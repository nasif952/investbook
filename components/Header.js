import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Container,
  Avatar,
  Divider,
  ListItemIcon,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Badge,
  Fade,
  Chip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Person as PersonIcon, 
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  AccountCircle as AccountCircleIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import ThemeSwitch from './ThemeSwitch';
import { motion } from 'framer-motion';

// Define navigation items based on what's available in the application
const pages = [
  { title: 'Dashboard', href: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
  { title: 'Startups', href: '/startups', icon: <BusinessIcon fontSize="small" /> },
  { title: 'Evaluations', href: '/evaluations', icon: <AssessmentIcon fontSize="small" /> },
];

const settings = [
  { title: 'Profile', href: '/profile', icon: <PersonIcon fontSize="small" /> },
  { title: 'Settings', href: '/settings', icon: <SettingsIcon fontSize="small" /> },
];

const Header = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDarkMode = theme.palette.mode === 'dark';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleNavigation = (path) => {
    router.push(path);
    handleCloseNavMenu();
    setMobileOpen(false);
  };

  // Filter navigation items based on user role
  const filteredPages = isAuthenticated && user 
    ? user.role === 'startup' 
      ? [] // Startup users don't see main nav pages
      : pages // Sales and admin see all pages
    : []; // Unauthenticated users see no main nav pages

  // Get role-specific navigation items
  const roleSpecificItems = isAuthenticated && user
    ? user.role === 'startup'
      ? [{ label: 'Startup Profile', path: '/startup/form', icon: <EditIcon fontSize="small" /> }]
      : (user.role === 'sales' || user.role === 'admin')
      ? []
        //? [{ label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> }]
        : []
    : [
        { label: 'Sign In', path: '/login', icon: <LoginIcon fontSize="small" /> },
        { label: 'Sign Up', path: '/register', icon: <PersonAddIcon fontSize="small" /> },
      ];

  // Create styled drawer content for mobile menu
  const drawer = (
    <Box sx={{ 
      textAlign: 'center',
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      background: isDarkMode ? 'linear-gradient(180deg, #1a237e 0%, #111827 100%)' : 'linear-gradient(180deg, #e8f0fe 0%, #ffffff 100%)'
    }}>
      <Box sx={{ py: 3, px: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: isDarkMode ? 'white' : 'primary.main' }}>
          Incubator Platform
        </Typography>
        
        {isAuthenticated && user && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Chip
              avatar={<Avatar alt={user.name || 'User'} src="/avatar-placeholder.png" />}
              label={user.name || user.email}
              variant="outlined"
              color="primary"
              sx={{ 
                borderRadius: '20px',
                px: 1,
                '& .MuiChip-label': {
                  fontWeight: 500,
                }
              }}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: isDarkMode ? 'grey.400' : 'text.secondary' }}>
              {user.role === 'startup' ? 'Startup Founder' : 
               user.role === 'sales' ? 'Sales Representative' : 
               user.role === 'admin' ? 'Administrator' : 'User'}
            </Typography>
          </Box>
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ py: 2, flexGrow: 1, overflowY: 'auto' }}>
        <List>
          {/* Home link is always visible */}
          <ListItem disablePadding>
            <ListItemButton 
              component={Link}
              href="/"
              selected={router.pathname === '/'} 
              sx={{ 
                borderRadius: '8px',
                mx: 1,
                mb: 0.5,
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: router.pathname === '/' ? 'primary.main' : 'inherit' }}>
                <BusinessIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
  
          {/* Role-specific items */}
          {roleSpecificItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton 
                component={Link}
                href={item.path}
                selected={router.pathname === item.path}
                sx={{ 
                  borderRadius: '8px',
                  mx: 1,
                  mb: 0.5,
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: router.pathname === item.path ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
  
          {/* Filtered main pages */}
          {filteredPages.map((page) => (
            <ListItem key={page.title} disablePadding>
              <ListItemButton 
                component={Link}
                href={page.href}
                selected={router.pathname === page.href}
                sx={{ 
                  borderRadius: '8px',
                  mx: 1,
                  mb: 0.5,
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: router.pathname === page.href ? 'primary.main' : 'inherit' }}>
                  {page.icon}
                </ListItemIcon>
                <ListItemText primary={page.title} />
              </ListItemButton>
            </ListItem>
          ))}
  
          {/* Settings items for authenticated users */}
          {isAuthenticated && (
            <>
              <Divider sx={{ my: 1.5 }} />
              {settings.map((setting) => (
                <ListItem key={setting.title} disablePadding>
                  <ListItemButton 
                    component={Link}
                    href={setting.href}
                    selected={router.pathname === setting.href}
                    sx={{ 
                      borderRadius: '8px',
                      mx: 1,
                      mb: 0.5,
                      transition: 'all 0.2s',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: router.pathname === setting.href ? 'primary.main' : 'inherit' }}>
                      {setting.icon}
                    </ListItemIcon>
                    <ListItemText primary={setting.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          )}
        </List>
      </Box>
      
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" sx={{ color: isDarkMode ? 'grey.400' : 'text.secondary' }}>
            Theme
          </Typography>
          <ThemeSwitch />
        </Box>
        
        {isAuthenticated && (
          <Button 
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleSignOut}
            sx={{ mt: 1 }}
          >
            Sign Out
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={scrolled ? 4 : 0}
      sx={{ 
        bgcolor: 'background.paper',
        backgroundImage: theme.palette.mode === 'dark' 
          ? 'linear-gradient(to right, rgba(26, 35, 126, 0.95), rgba(40, 53, 147, 0.95))'
          : 'linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s',
        transform: scrolled ? 'translateY(0)' : 'translateY(0)',
        boxShadow: scrolled ? `0 4px 20px ${alpha('#000000', 0.08)}` : 'none',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 70 }}>
          {/* Logo - Desktop */}
          <Typography
            variant="h5"
            component={Link}
            href="/"
            sx={{
              mr: 3,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: isDarkMode ? 'white' : 'primary.main',
              textDecoration: 'none',
              alignItems: 'center',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'primary.light',
              },
            }}
          >
            INCUBATOR
          </Typography>

          {/* Mobile menu toggle */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="mobile menu"
              onClick={handleMobileMenuToggle}
              color="inherit"
              sx={{ 
                color: isDarkMode ? 'white' : 'text.primary',
                backgroundColor: mobileOpen ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>

          {/* Logo - Mobile */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: isDarkMode ? 'white' : 'primary.main',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            INCUBATOR
          </Typography>

          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
            {/* Always show Home link */}
            <Button
              component={Link}
              href="/"
              sx={{
                color: router.pathname === '/' ? 'primary.main' : (isDarkMode ? 'white' : 'text.primary'),
                fontWeight: router.pathname === '/' ? 600 : 500,
                my: 2,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                '&::after': router.pathname === '/' ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '20%',
                  width: '60%',
                  height: '3px',
                  bgcolor: 'primary.main',
                  borderRadius: '2px',
                } : {},
              }}
            >
              Home
            </Button>

            {/* Role-specific main navigation items */}
            {roleSpecificItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                href={item.path}
                startIcon={item.icon}
                sx={{
                  color: router.pathname === item.path ? 'primary.main' : (isDarkMode ? 'white' : 'text.primary'),
                  fontWeight: router.pathname === item.path ? 600 : 500,
                  my: 2,
                  px: 2,
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  '&::after': router.pathname === item.path ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '20%',
                    width: '60%',
                    height: '3px',
                    bgcolor: 'primary.main',
                    borderRadius: '2px',
                  } : {},
                }}
              >
                {item.label}
              </Button>
            ))}

            {/* Filtered main pages for specific roles */}
            {filteredPages.map((page) => (
              <Button
                key={page.title}
                component={Link}
                href={page.href}
                startIcon={page.icon}
                sx={{
                  color: router.pathname === page.href ? 'primary.main' : (isDarkMode ? 'white' : 'text.primary'),
                  fontWeight: router.pathname === page.href ? 600 : 500,
                  my: 2,
                  px: 2,
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  '&::after': router.pathname === page.href ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '20%',
                    width: '60%',
                    height: '3px',
                    bgcolor: 'primary.main',
                    borderRadius: '2px',
                  } : {},
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* User menu & auth buttons */}
          <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ ml: 1, display: { xs: 'none', sm: 'flex' } }}>
              <ThemeSwitch />
            </Box>

            {isAuthenticated && user ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton 
                    onClick={handleOpenUserMenu} 
                    sx={{ 
                      p: 0.5, 
                      ml: 2,
                      border: '2px solid',
                      borderColor: 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Avatar 
                      alt={user.name || 'User'} 
                      src="/avatar-placeholder.png" 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {user.name ? user.name[0].toUpperCase() : <PersonIcon />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  TransitionComponent={Fade}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.name || user.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {user.role === 'startup' ? 'Startup Founder' : 
                       user.role === 'sales' ? 'Sales Representative' : 
                       user.role === 'admin' ? 'Administrator' : 'User'}
                    </Typography>
                  </Box>
                  <Divider />
                  {settings.map((setting) => (
                    <MenuItem 
                      key={setting.title} 
                      onClick={() => {
                        handleNavigation(setting.href);
                        handleCloseUserMenu();
                      }}
                      sx={{
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                        px: 1,
                      }}
                    >
                      <ListItemIcon>
                        {setting.icon}
                      </ListItemIcon>
                      <Typography textAlign="center">{setting.title}</Typography>
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem 
                    onClick={handleSignOut}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      px: 1,
                      color: 'error.main',
                    }}
                  >
                    <ListItemIcon sx={{ color: 'error.main' }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Sign Out</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  component={Link}
                  href="/login"
                  variant="text"
                  sx={{
                    color: isDarkMode ? 'white' : 'text.primary',
                    display: { xs: 'none', sm: 'flex' },
                    mr: 1,
                  }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="contained"
                  disableElevation
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleMobileMenuToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ 
          sx: { 
            width: '280px',
            borderRadius: '0 16px 16px 0',
          } 
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header; 