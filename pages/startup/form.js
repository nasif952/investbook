import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import Loader from '../../components/Loader';
import FormField from '../../components/FormField';
import Header from '../../components/Header';
import { motion } from 'framer-motion';
import {
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  Web as WebIcon,
  LocationOn as LocationOnIcon,
  Group as GroupIcon,
  Description as DescriptionIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingUp as TrendingUpIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  People as PeopleIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';

const StartupFormPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [formData, setFormData] = useState({
    companyName: '',
    foundingDate: '',
    stage: '',
    industry: '',
    description: '',
    teamSize: '',
    website: '',
    location: '',
    financials: { revenue: '', funding: '', burnRate: '' },
    metrics: { userBase: '', growthRate: '' },
    onboardingCompleted: false,
  });
  
  const [isExistingStartup, setIsExistingStartup] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = session?.user;

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && session?.user?.role !== 'startup') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchStartupProfile = async () => {
      if (status === 'authenticated' && session?.user?.role === 'startup') {
        setApiLoading(true);
        try {
          const response = await fetch('/api/startups/profile'); 
          
          if (response.ok) {
            const data = await response.json();
            setIsExistingStartup(true);
            setFormData({
              companyName: data.companyName || '',
              foundingDate: data.foundingDate ? data.foundingDate.substring(0, 10) : '',
              stage: data.stage || '',
              industry: data.industry || '',
              description: data.description || '',
              teamSize: data.teamSize || '',
              website: data.website || '',
              location: data.location || '',
              financials: {
                revenue: data.financials?.revenue ?? '',
                funding: data.financials?.funding ?? '',
                burnRate: data.financials?.burnRate ?? ''
              },
              metrics: {
                userBase: data.metrics?.userBase ?? '',
                growthRate: data.metrics?.growthRate ?? ''
              },
              onboardingCompleted: data.onboardingCompleted || false,
            });
          } else if (response.status === 404) {
             setIsExistingStartup(false);
             console.log('No existing startup profile found.');
          } else {
            const errorData = await response.json();
            setError(errorData.message || 'Error fetching startup profile');
          }
        } catch (err) {
          console.error('Error fetching startup:', err);
          setError('Network error fetching startup profile');
        } finally {
          setApiLoading(false);
        }
      }
       else if (status === 'authenticated') {
          setApiLoading(false);
      } 
       else if (status === 'unauthenticated') {
           setApiLoading(false); 
       }
    };
    
    fetchStartupProfile();
  }, [status, session]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split('.');
    
    if (keys.length === 2) {
      const [parentKey, childKey] = keys;
      setFormData(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [childKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
  };

  const handleSkillsChange = (event, newValue) => {
    setFormData({ ...formData, keySkills: newValue });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      const url = isExistingStartup ? '/api/startups/profile' : '/api/startups';
      const method = isExistingStartup ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
        financials: {
          revenue: formData.financials.revenue ? parseFloat(formData.financials.revenue) : undefined,
          funding: formData.financials.funding ? parseFloat(formData.financials.funding) : undefined,
          burnRate: formData.financials.burnRate ? parseFloat(formData.financials.burnRate) : undefined,
        },
        metrics: {
          userBase: formData.metrics.userBase ? parseInt(formData.metrics.userBase) : undefined,
          growthRate: formData.metrics.growthRate ? parseFloat(formData.metrics.growthRate) : undefined,
        },
        onboardingCompleted: true
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error submitting startup data');
      }
      
      setSuccess(`Startup information ${isExistingStartup ? 'updated' : 'saved'} successfully!`);
      setIsExistingStartup(true);
      setFormData(prev => ({ ...prev, onboardingCompleted: true }));
      
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || apiLoading) {
    return <Loader />;
  }
  
  if (status !== 'authenticated' || session?.user?.role !== 'startup') {
      return null; 
  }

  const industryOptions = ["Tech", "Finance", "Health", "Education", "Retail", "Other"];
  const stageOptions = ["Idea", "Prototype", "MVP", "Growth", "Established"];
  const skillsOptions = ["JavaScript", "React", "Node.js", "Python", "Marketing", "Sales"];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container 
        component={motion.main}
        maxWidth="md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{ 
          flexGrow: 1, 
          py: 4,
        }}
      >
        <Paper 
          elevation={3}
          component={motion.div}
          variants={itemVariants}
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            borderRadius: 3,
            background: isDarkMode 
              ? alpha(theme.palette.background.paper, 0.9) 
              : alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div variants={itemVariants}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              {isExistingStartup ? 'Update Startup Profile' : 'Create Startup Profile'}
            </Typography>
          </motion.div>
          
          {error && 
            <motion.div variants={itemVariants}>
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
            </motion.div>
          }
          {success && 
            <motion.div variants={itemVariants}>
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>
            </motion.div>
          }
          
          <Box component="form" onSubmit={submitHandler}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
                <FormField
                  required
                  fullWidth
                  id="companyName"
                  name="companyName"
                  label="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  disabled={submitting}
                  startAdornment={<BusinessIcon color="action" />}
                  tooltipText="The official name of your company."
                />
              </Grid>
              <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
                <FormField
                  required
                  fullWidth
                  id="foundingDate"
                  name="foundingDate"
                  label="Founding Date"
                  type="date"
                  value={formData.foundingDate}
                  onChange={handleChange}
                  disabled={submitting}
                  startAdornment={<CalendarTodayIcon color="action" />}
                />
              </Grid>
              <Grid item xs={12} component={motion.div} variants={itemVariants}>
                <FormField
                  required
                  fullWidth
                  id="description"
                  name="description"
                  label="Company Description"
                  type="textarea"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={submitting}
                  startAdornment={<DescriptionIcon color="action" sx={{ alignSelf: 'flex-start', mt: 1.5 }} />}
                  tooltipText="Briefly describe your company's mission and product/service."
                />
              </Grid>
              <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
                <FormField
                  required
                  fullWidth
                  id="industry"
                  name="industry"
                  label="Industry"
                  type="select"
                  value={formData.industry}
                  onChange={handleChange}
                  disabled={submitting}
                  options={industryOptions.map(opt => ({ value: opt, label: opt }))}
                />
              </Grid>
              <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
                <FormField
                  required
                  fullWidth
                  id="stage"
                  name="stage"
                  label="Stage"
                  type="select"
                  value={formData.stage}
                  onChange={handleChange}
                  disabled={submitting}
                  options={stageOptions.map(opt => ({ value: opt.toLowerCase(), label: opt }))}
                />
              </Grid>
              <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
                <FormField
                  fullWidth
                  id="website"
                  name="website"
                  label="Website (Optional)"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={submitting}
                  type="url"
                  startAdornment={<WebIcon color="action" />}
                />
              </Grid>
              <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
                <FormField
                  fullWidth
                  id="location"
                  name="location"
                  label="Location (Optional)"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={submitting}
                  startAdornment={<LocationOnIcon color="action" />}
                />
              </Grid>
              <Grid item xs={12} component={motion.div} variants={itemVariants}>
                <FormField
                  fullWidth
                  id="teamSize"
                  name="teamSize"
                  label="Team Size (Optional)"
                  type="number"
                  value={formData.teamSize}
                  onChange={handleChange}
                  disabled={submitting}
                  startAdornment={<GroupIcon color="action" />}
                />
              </Grid>
              <Grid item xs={12} component={motion.div} variants={itemVariants}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Financials (Optional)</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} sm={4} component={motion.div} variants={itemVariants}>
                <FormField
                  fullWidth
                  id="financials.revenue"
                  name="financials.revenue"
                  label="Annual Revenue (USD)"
                  type="number"
                  value={formData.financials.revenue}
                  onChange={handleChange}
                  disabled={submitting}
                  startAdornment={<MonetizationOnIcon color="action" />}
                />
              </Grid>
              <Grid item xs={12} sm={4} component={motion.div} variants={itemVariants}>
                <FormField
                  fullWidth
                  id="financials.funding"
                  name="financials.funding"
                  label="Total Funding (USD)"
                  type="number"
                  value={formData.financials.funding}
                  onChange={handleChange}
                  disabled={submitting}
                  startAdornment={<MonetizationOnIcon color="action" />}
                />
              </Grid>
              <Grid item xs={12} sm={4} component={motion.div} variants={itemVariants}>
                <FormField
                  fullWidth
                  id="financials.burnRate"
                  name="financials.burnRate"
                  label="Monthly Burn Rate (USD)"
                  type="number"
                  value={formData.financials.burnRate}
                  onChange={handleChange}
                  disabled={submitting}
                  startAdornment={<LocalFireDepartmentIcon color="action" />}
                />
              </Grid>
              <Grid item xs={12} component={motion.div} variants={itemVariants}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Key Metrics (Optional)</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
                <FormField
                  fullWidth
                  id="metrics.userBase"
                  name="metrics.userBase"
                  label="User Base / Customers"
                  type="number"
                  value={formData.metrics.userBase}
                  onChange={handleChange}
                  disabled={submitting}
                  startAdornment={<PeopleIcon color="action" />}
                />
              </Grid>
              <Grid item xs={12} sm={6} component={motion.div} variants={itemVariants}>
                <FormField
                  fullWidth
                  id="metrics.growthRate"
                  name="metrics.growthRate"
                  label="Growth Rate (%) Monthly"
                  type="number"
                  value={formData.metrics.growthRate}
                  onChange={handleChange}
                  disabled={submitting}
                  startAdornment={<ShowChartIcon color="action" />}
                />
              </Grid>
              <Grid item xs={12} component={motion.div} variants={itemVariants}>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{
                      minWidth: 150,
                      py: 1.5,
                      position: 'relative'
                    }}
                  >
                    {submitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      isExistingStartup ? 'Update Profile' : 'Save Profile'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default StartupFormPage; 