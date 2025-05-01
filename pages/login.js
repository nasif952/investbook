import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  Divider,
  Fade,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Header from '../components/Header';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Check if user just registered or was redirected
  useEffect(() => {
    if (router.query.registered) {
      setIsRegistered(true);
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3, 
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container 
        component={motion.main} 
        maxWidth="sm" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4
        }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card
          component={motion.div}
          variants={itemVariants}
          elevation={6}
          sx={{
            borderRadius: 3,
            overflow: 'visible',
            position: 'relative',
            background: isDarkMode ? 
              'linear-gradient(145deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95))' : 
              'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.95))',
            boxShadow: isDarkMode ? 
              '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)' : 
              '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <motion.div variants={itemVariants}>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    mb: 1,
                    fontWeight: 800,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Welcome Back
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 3 }}>
                  Sign in to access your account
                </Typography>
              </motion.div>

              {isRegistered && (
                <motion.div 
                  variants={itemVariants}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert 
                    severity="success" 
                    sx={{ 
                      width: '100%', 
                      mb: 3,
                      borderRadius: 2,
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    Account created successfully! Please sign in.
                  </Alert>
                </motion.div>
              )}
              
              {error && (
                <motion.div 
                  variants={itemVariants}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      width: '100%', 
                      mb: 3,
                      borderRadius: 2,
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}

              <motion.div variants={itemVariants} style={{ width: '100%' }}>
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{ width: '100%' }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused': {
                          boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
                        },
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: `${theme.palette.primary.main}15`,
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused': {
                          boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
                        },
                      },
                    }}
                  />
                  
                  <Box sx={{ textAlign: 'right', mt: 1 }}>
                    <MuiLink
                      component={Link}
                      href="/forgot-password"
                      variant="body2"
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        '&:hover': {
                          color: 'primary.main',
                          textDecoration: 'none',
                        }
                      }}
                    >
                      Forgot password?
                    </MuiLink>
                  </Box>
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={<LoginIcon />}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      borderRadius: 2,
                      boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transform: 'translateX(-100%)',
                        transition: 'all 0.7s',
                      },
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(37, 99, 235, 0.3)',
                        transform: 'translateY(-2px)',
                        '&::after': {
                          transform: 'translateX(100%)',
                        },
                      },
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  
                  <Divider sx={{ my: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ px: 1 }}
                    >
                      New to the platform?
                    </Typography>
                  </Divider>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      component={Link}
                      href="/register"
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                        }
                      }}
                    >
                      Create Account
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            </Box>
          </CardContent>
        </Card>

        <motion.div variants={itemVariants}>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              By signing in, you agree to our{' '}
              <MuiLink component={Link} href="/terms" sx={{ fontWeight: 500 }}>
                Terms of Service
              </MuiLink>{' '}
              and{' '}
              <MuiLink component={Link} href="/privacy" sx={{ fontWeight: 500 }}>
                Privacy Policy
              </MuiLink>
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
} 