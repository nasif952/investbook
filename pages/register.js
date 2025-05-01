import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
// Remove react-bootstrap imports
// import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap'; 
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link as MuiLink, // Use MuiLink for consistency
  FormHelperText, // Import FormHelperText if needed, though TextField helperText prop is usually sufficient
  InputAdornment,
  IconButton,
  Divider,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Fade,
} from '@mui/material';
// Remove Message import
// import Message from '../components/Message'; 
import Loader from '../components/Loader'; // Keep Loader import
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  AccountCircle as AccountCircleIcon,
  ArrowForward as ArrowForwardIcon,
  ChevronLeft as ChevronLeftIcon,
  HowToReg as HowToRegIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'startup',
    phone: '',
    position: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();

  // Define steps for the registration process
  const steps = ['Account Details', 'Personal Information', 'Role Selection'];

  // Animation variants
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Account Details
        if (!formData.email) {
          setError('Email is required');
          return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!formData.password) {
          setError('Password is required');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;
        
      case 1: // Personal Information
        if (!formData.name) {
          setError('Name is required');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setError('');
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Final validation
    if (!validateStep(0) || !validateStep(1)) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          position: formData.position,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
      setLoading(false);
    }
  };

  // Get content based on current step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            key="step1"
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Create Your Account
            </Typography>
            
            <motion.div variants={itemVariants}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
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
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
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
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: `${theme.palette.primary.main}15`,
                          }
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            </motion.div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            key="step2"
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Personal Information
            </Typography>
            
            <motion.div variants={itemVariants}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
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
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <TextField
                margin="normal"
                fullWidth
                id="phone"
                label="Phone Number (Optional)"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
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
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <TextField
                margin="normal"
                fullWidth
                id="position"
                label="Position/Title (Optional)"
                name="position"
                value={formData.position}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="action" />
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
            </motion.div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            key="step3"
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Select Your Role
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                Please select your role in the platform:
              </Typography>
              
              <motion.div variants={itemVariants}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card 
                      elevation={formData.role === 'startup' ? 4 : 1}
                      onClick={() => setFormData(prev => ({...prev, role: 'startup'}))}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: `2px solid ${formData.role === 'startup' ? theme.palette.primary.main : 'transparent'}`,
                        transition: 'all 0.2s',
                        transform: formData.role === 'startup' ? 'translateY(-4px)' : 'none',
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                          transform: 'translateY(-4px)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BusinessIcon 
                          color="primary" 
                          fontSize="large" 
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="h6" fontWeight={600}>
                          Startup Founder
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Register as a startup founder to showcase your business and get evaluated by our experts.
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Card 
                      elevation={formData.role === 'sales' ? 4 : 1}
                      onClick={() => setFormData(prev => ({...prev, role: 'sales'}))}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: `2px solid ${formData.role === 'sales' ? theme.palette.primary.main : 'transparent'}`,
                        transition: 'all 0.2s',
                        transform: formData.role === 'sales' ? 'translateY(-4px)' : 'none',
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                          transform: 'translateY(-4px)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon 
                          color="primary" 
                          fontSize="large" 
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="h6" fontWeight={600}>
                          Sales Representative
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Register as a sales representative to evaluate startups and provide professional feedback.
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            </Box>
            
            <motion.div variants={itemVariants}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                By registering, you agree to our Terms of Service and Privacy Policy. Your selected role determines your access level within the platform.
              </Typography>
            </motion.div>
          </motion.div>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container 
        component="main" 
        maxWidth="md" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Card
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
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ width: '100%', mb: 5 }}>
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel
                sx={{
                  '& .MuiStepConnector-line': {
                    borderTopWidth: 3,
                  },
                  '& .MuiStepIcon-root': {
                    fontSize: 32,
                    '&.Mui-active': {
                      color: theme.palette.primary.main,
                    },
                    '&.Mui-completed': {
                      color: theme.palette.success.main,
                    },
                  },
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
            
            {error && (
              <Fade in={!!error}>
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
              </Fade>
            )}
            
            <form onSubmit={handleSubmit}>
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<ChevronLeftIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    visibility: activeStep === 0 ? 'hidden' : 'visible',
                  }}
                >
                  Back
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={<HowToRegIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
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
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 15px rgba(37, 99, 235, 0.3)',
                      },
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </form>
            
            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <MuiLink
                  component={Link}
                  href="/login"
                  sx={{ 
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                    }
                  }}
                >
                  Sign In
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage; 