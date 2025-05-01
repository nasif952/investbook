import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // Use next-auth
import { useRouter } from 'next/router'; // Use next router
import Link from 'next/link'; // Use next link
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Alert,
  Tabs,
  Tab,
  Grid,
  Chip,
  Divider,
  Stack,
  Avatar,
  useTheme,
  alpha,
  CircularProgress,
  Link as MuiLink, // For website link
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Groups as GroupsIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
  Web as WebIcon,
  MonetizationOn as MonetizationOnIcon,
  ShowChart as ShowChartIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  People as PeopleIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
// Adjust paths if needed
import Loader from '../../components/Loader';
import StartupEvaluation from '../../components/StartupEvaluation';
import EvaluationSummary from '../../components/EvaluationSummary';
import Header from '../../components/Header'; // Import Header
import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable';

// Helper function to format currency
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `$${Number(value).toLocaleString()}`;
};

// Helper function to format numbers
const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return Number(value).toLocaleString();
};

// Helper function to format percentages
const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${Number(value).toFixed(1)}%`;
};

// --- Helper TabPanel component ---
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-startup-tabpanel-${index}`}
      aria-labelledby={`admin-startup-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StartupDetailPage = () => {
  // const { id } = useParams(); // Replace with useRouter
  const router = useRouter();
  const { id } = router.query; // Get id from query params

  // const { user } = useContext(AuthContext); // Replace with useSession
  const { data: session, status } = useSession();
  
  const [startup, setStartup] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminActiveTab, setAdminActiveTab] = useState(0); // Move this hook here
  const [activeTab, setActiveTab] = useState('info');

  const user = session?.user;

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Redirect logic
  useEffect(() => {
    if (status === 'loading') return; // Wait for session
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && user?.role === 'startup') {
      router.push('/startup/form');
    }
  }, [status, user, router]);

  // Fetch data (only if id is available and user is authorized)
  useEffect(() => {
    if (id && status === 'authenticated' && user && (user.role === 'admin' || user.role === 'sales')) {
      setApiLoading(true);
      setError('');
      let fetchedStartup = null; // Temp variable to hold startup

      const fetchStartupData = async () => {
        try {
          // No auth header needed
          const response = await fetch(`/api/startups/${id}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch startup data');
          }
          fetchedStartup = await response.json();
          setStartup(fetchedStartup);
        } catch (err) {
          setError(err.message || 'Error fetching startup');
          setApiLoading(false); // Stop loading on error
        }
      };

      const fetchEvaluations = async () => {
        try {
          // No auth header needed
          const response = await fetch(`/api/evaluations/startup/${id}`);
          if (response.ok) {
            const data = await response.json();
            setEvaluations(data);
          } else {
             const errorData = await response.json();
             console.warn("Could not fetch evaluations:", errorData.message)
          }
        } catch (err) {
          console.error('Error fetching evaluations:', err);
          // Don't necessarily set global error, maybe just log
        }
      };

      // Run fetches sequentially or in parallel
      Promise.all([fetchStartupData(), fetchEvaluations()])
        .finally(() => {
          // Console log the fetched evaluations to inspect structure
          console.log('Fetched Evaluations:', evaluations);
          // Only set loading false after BOTH fetches attempt completion
          // unless startup fetch failed earlier
          if (fetchedStartup || error) { // Ensure loading stops even if eval fails but startup succeeds
                 setApiLoading(false); 
          }
        });
    } else if (status !== 'loading' && id) { // Handle case where user is not admin/sales
        setApiLoading(false); // Stop loading if not authorized or not authenticated yet
    }
  }, [id, status, user]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  // Loading state
  if (status === 'loading' || apiLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Loader />
      </Box>
    );
  }

  // Error state or unauthorized
  if (status !== 'authenticated' || (user && user.role === 'startup')) {
     // Should be redirected, but render null just in case
     return null; 
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Alert severity="error">{error}</Alert>
          <Button component={Link} href="/dashboard" sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
            Back to Dashboard
          </Button>
      </Container>
      </Box>
    );
  }
  
  if (!startup) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Alert severity="warning">Startup not found.</Alert>
           <Button component={Link} href="/dashboard" sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
             Back to Dashboard
           </Button>
      </Container>
      </Box>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // --- Sales User View --- (Assuming StartupEvaluation is adapted for next-auth)
  if (user.role === 'sales') {
    const hasEvaluated = evaluations.some(
      (evaluation) => evaluation.evaluatorId?._id === user.id // Use user.id from session
    );
    const myEvaluation = evaluations.find(e => e.evaluatorId?._id === user.id);
    
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container 
          maxWidth="lg" 
          component={motion.main}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{ mt: 4, mb: 4, flexGrow: 1 }}
        >
          {/* Page Header */}
          <motion.div variants={itemVariants}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                  {startup.companyName}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip 
                    icon={<CategoryIcon fontSize="small" />} 
                    label={startup.industry || 'N/A'} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<BusinessIcon fontSize="small" />} 
                    label={startup.stage ? startup.stage.charAt(0).toUpperCase() + startup.stage.slice(1) : 'N/A'} 
                    size="small" 
                    color="secondary" 
                    variant="outlined" 
                  />
                </Stack>
              </Box>
              <Button 
                component={Link} 
                href="/dashboard" 
                variant="outlined" 
                startIcon={<ArrowBackIcon />} 
                sx={{ mt: { xs: 2, md: 0 } }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </motion.div>

          <Grid container spacing={3}>
            {/* Company Info Column */}
            <Grid item xs={12} md={5} component={motion.div} variants={itemVariants}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Company Overview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" paragraph>
                  {startup.description || 'No description provided.'}
                </Typography>

                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><CalendarTodayIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Founded" secondary={formatDate(startup.foundingDate)} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><GroupsIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Team Size" secondary={formatNumber(startup.teamSize)} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><LocationOnIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Location" secondary={startup.location || 'N/A'} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><WebIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText 
                      primary="Website" 
                      secondary={startup.website ? 
                        <MuiLink href={startup.website} target="_blank" rel="noopener noreferrer">{startup.website}</MuiLink> : 'N/A'} 
                    />
                  </ListItem>
                </List>

                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                  Financials
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><MonetizationOnIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Annual Revenue" secondary={formatCurrency(startup.financials?.revenue)} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><MonetizationOnIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Total Funding" secondary={formatCurrency(startup.financials?.funding)} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><LocalFireDepartmentIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Monthly Burn Rate" secondary={formatCurrency(startup.financials?.burnRate)} />
                  </ListItem>
                </List>

                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                  Metrics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                 <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><PeopleIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="User Base / Customers" secondary={formatNumber(startup.metrics?.userBase)} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><ShowChartIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Monthly Growth Rate" secondary={formatPercentage(startup.metrics?.growthRate)} />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          
            {/* Evaluation Column */}
            <Grid item xs={12} md={7} component={motion.div} variants={itemVariants}>
            {!hasEvaluated ? (
              <StartupEvaluation startupId={id} />
            ) : (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'info.light', width: 56, height: 56, mb: 2 }}>
                    <InfoIcon sx={{ fontSize: 30, color: 'info.dark' }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom align="center">
                    Evaluation Submitted
                  </Typography>
                  <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
                    You have already evaluated this startup.
                  </Typography>
                   {myEvaluation && (
                      <Button 
                        component={Link} 
                        href={`/evaluations/${myEvaluation._id}`} 
                        variant="contained"
                        startIcon={<AssessmentIcon />}
                      >
                        View My Evaluation
                      </Button>
                   )}
                </Paper>
            )}
            </Grid>
          </Grid>
      </Container>
      </Box>
    );
  }

  // --- Admin User View ---
  const handleTabChange = (event, newValue) => {
    setAdminActiveTab(newValue);
  };

  const handleEditStartup = () => {
     // TODO: Implement navigation to an edit form if it exists
     // Example: router.push(`/admin/startup/edit/${startup._id}`);
     console.log("Navigate to edit startup:", startup._id);
     alert("Edit functionality not yet implemented.");
  }

  // --- Handlers for Evaluation Actions (Admin) ---
  const handleViewEvaluation = (evaluationId) => {
    router.push(`/evaluations/${evaluationId}`);
  };

  const handleDeleteEvaluation = async (evaluationId) => {
    if (!confirm('Are you sure you want to delete this evaluation?')) {
      return;
    }
    // TODO: Add loading state feedback
    setError(''); // Clear previous errors
    try {
      const res = await fetch(`/api/evaluations/${evaluationId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete evaluation');
      }
      // Refresh evaluations list after deletion
      setEvaluations(prevEvaluations => prevEvaluations.filter(e => e._id !== evaluationId));
      // TODO: Show success message (e.g., using a Snackbar)
      console.log('Evaluation deleted successfully');
    } catch (err) {
      setError(err.message);
      console.error("Delete Error:", err);
      // TODO: Show error message (e.g., using Alert or Snackbar)
    }
  };

  // --- Prepare data for Evaluations DataTable (Admin) ---
  const evaluationColumns = [
    {
      id: 'evaluatorName',
      label: 'Evaluator',
      // Attempt to get name, fallback to ID. Requires evaluatorId to be populated or another user data source.
      format: (value, row) => row.evaluatorId?.name || row.evaluatorId?._id || 'Unknown'
    },
    {
      id: 'overallScore',
      label: 'Overall Score',
      format: (value) => value !== null && value !== undefined ? value.toFixed(1) : 'N/A'
    },
    {
      id: 'status',
      label: 'Status',
      format: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A'
    },
    {
      id: 'createdAt',
      label: 'Date Submitted',
      format: (value) => value ? formatDate(value) : 'N/A' // Use existing formatDate
    },
    {
      id: 'actions',
      label: 'Actions',
      renderCell: (row) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => handleViewEvaluation(row._id)}
          >
            View
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteEvaluation(row._id)}
            // TODO: Add disabled state while deleting
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  const evaluationsTableData = evaluations.map(e => ({
    ...e,
    // Ensure evaluatorId is included if needed for formatting
    evaluatorId: e.evaluatorId // Assuming evaluatorId might be populated or just the ID
  }));

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container 
          maxWidth="lg" 
          component={motion.main}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{ mt: 4, mb: 4, flexGrow: 1 }}
        >
        {/* Page Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                Admin View: {startup.companyName}
              </Typography>
              {/* Reuse chips from sales view */}
              <Stack direction="row" spacing={1}>
                  <Chip
                    icon={<CategoryIcon fontSize="small" />}
                    label={startup.industry || 'N/A'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<BusinessIcon fontSize="small" />}
                    label={startup.stage ? startup.stage.charAt(0).toUpperCase() + startup.stage.slice(1) : 'N/A'}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditStartup}
                >
                  Edit Startup
                </Button>
                <Button
                  component={Link}
                  href="/dashboard"
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                >
                  Back to Dashboard
                </Button>
            </Stack>
          </Box>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={adminActiveTab} onChange={handleTabChange} aria-label="Admin startup view tabs">
              <Tab label="Company Information" id="admin-startup-tab-0" aria-controls="admin-startup-tabpanel-0" />
              <Tab label="Evaluations" id="admin-startup-tab-1" aria-controls="admin-startup-tabpanel-1" />
            </Tabs>
          </Box>
        </motion.div>

        {/* Tab Panels */}
        <TabPanel value={adminActiveTab} index={0}>
          <motion.div variants={itemVariants}>
             {/* Reuse the Paper and List structure from Sales view */}
             <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Company Overview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" paragraph>
                  {startup.description || 'No description provided.'}
                </Typography>
                  
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><CalendarTodayIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Founded" secondary={formatDate(startup.foundingDate)} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><GroupsIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Team Size" secondary={formatNumber(startup.teamSize)} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><LocationOnIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Location" secondary={startup.location || 'N/A'} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><WebIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText 
                      primary="Website" 
                      secondary={startup.website ? 
                        <MuiLink href={startup.website} target="_blank" rel="noopener noreferrer">{startup.website}</MuiLink> : 'N/A'} 
                    />
                  </ListItem>
                  {/* Consider adding other relevant fields if available in the startup model and not sensitive */}
                </List>

                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                  Financials
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><MonetizationOnIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Annual Revenue" secondary={formatCurrency(startup.financials?.revenue)} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><MonetizationOnIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Total Funding" secondary={formatCurrency(startup.financials?.funding)} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><LocalFireDepartmentIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Monthly Burn Rate" secondary={formatCurrency(startup.financials?.burnRate)} />
                  </ListItem>
                </List>

                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                  Metrics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                 <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><PeopleIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="User Base / Customers" secondary={formatNumber(startup.metrics?.userBase)} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}><ShowChartIcon fontSize="small" color="action" /></ListItemIcon>
                    <ListItemText primary="Monthly Growth Rate" secondary={formatPercentage(startup.metrics?.growthRate)} />
                  </ListItem>
                </List>
             </Paper>
          </motion.div>
        </TabPanel>
        <TabPanel value={adminActiveTab} index={1}>
          <motion.div variants={itemVariants}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                 Submitted Evaluations
              </Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{`Error: ${error}`}</Alert>} {/* Display delete errors here */}
              {evaluationsTableData.length > 0 ? (
                <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
                   <DataTable
                      columns={evaluationColumns}
                      data={evaluationsTableData}
                      renderCell={(row, column) => 
                        column.renderCell 
                          ? column.renderCell(row) 
                          : column.format
                            ? column.format(row[column.id], row)
                            : row[column.id]
                      } 
                      onRowClick={row => handleViewEvaluation(row._id)} // Optional: make rows clickable
                   />
                </Paper>
              ) : (
                <Alert severity="info">No evaluations have been submitted for this startup yet.</Alert>
              )}
          </motion.div>
        </TabPanel>

    </Container>
    </Box>
  );
};

export default StartupDetailPage; 