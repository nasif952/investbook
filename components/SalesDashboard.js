import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Typography, 
  Grid, 
  Box, 
  Button, 
  Container, 
  Paper,
  Stack,
  useTheme,
  Divider,
  Chip,
  Alert,
  Avatar,
  Tab,
  Tabs,
  Badge,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
  CircularProgress,
} from '@mui/material';
import { 
  Assessment as AssessmentIcon, 
  Business as BusinessIcon, 
  CheckCircleOutline as CheckCircleOutlineIcon,
  ListAlt as ListAltIcon,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  DonutLarge as DonutLargeIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  GetApp as GetAppIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Assignment as AssignmentIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardCard from './DashboardCard'; // Assuming this exists now
import DataTable from './DataTable'; // Assuming this exists now

// Tab panel component for dashboard sections
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ pt: 3, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SalesDashboard = ({ startups = [], evaluations = [] }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const user = session?.user;
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const evaluatedStartupIds = new Set(evaluations.map(e => e.startupId?._id || e.startupId)); // Handle populated/unpopulated ID
  const totalEvaluations = evaluations.length;
  const totalAssignedStartups = startups.length; // Assuming all listed startups are relevant to sales

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const columns = [
    { id: 'companyName', label: 'Company', sortable: true },
    { id: 'industry', label: 'Industry', sortable: true },
    { id: 'stage', label: 'Stage', sortable: true },
    { id: 'evaluated', label: 'Evaluated', sortable: false },
    // { id: 'foundingDate', label: 'Founded' },
  ];

  const tableData = startups.map(startup => ({
    ...startup,
    // foundingDate: formatDate(startup.foundingDate),
    evaluated: evaluatedStartupIds.has(startup._id)
  }));

  const handleViewDetails = (startup) => {
    router.push(`/startup/${startup._id}`);
  };

  // Custom cell renderer for the 'evaluated' column
  const renderEvaluationCell = (row, column) => {
    if (column.id === 'evaluated') {
      return row.evaluated ? 
        <Chip label="Yes" color="success" size="small" icon={<CheckCircleOutlineIcon />} /> : 
        <Chip label="No" variant="outlined" size="small" />;
    } 
    if (column.id === 'stage') {
      return <Chip label={row.stage || 'N/A'} size="small" variant="outlined" />
    }
    // Default rendering for other cells
    return row[column.id];
  };
  
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const cardContainerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  // Compute dashboard metrics
  const totalStartups = startups.length;
  const pendingEvaluations = evaluations.filter(e => e.status === 'pending').length;
  const completedEvaluations = evaluations.filter(e => e.status === 'completed').length;
  
  // Calculate average score
  const averageScore = evaluations.length > 0 
    ? Math.round(evaluations.reduce((sum, evaluationItem) => sum + (evaluationItem.overallScore || 0), 0) / evaluations.length * 10) / 10
    : 0;
  
  // Define startup columns
  const startupColumns = [
    { 
      id: 'companyName', 
      label: 'Company', 
      primary: true,
      format: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              mr: 1.5, 
              bgcolor: row.industry 
                ? stringToColor(row.industry) 
                : theme.palette.primary.main 
            }}
          >
            {value ? value[0].toUpperCase() : 'S'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>{value}</Typography>
            {row.industry && (
              <Typography variant="caption" color="text.secondary">
                {row.industry}
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    { id: 'stage', label: 'Stage', type: 'status' },
    { 
      id: 'teamSize', 
      label: 'Team', 
      format: (value) => value ? `${value} members` : '-'
    },
    { 
      id: 'foundingDate', 
      label: 'Founded', 
      format: (value) => value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : '-'
    },
    { 
      id: 'evaluation', 
      label: 'Status', 
      format: (_, row) => {
        const evaluationItem = evaluations.find(e => e.startupId === row._id);
        if (!evaluationItem) return 'Not evaluated';
        if (evaluationItem.status === 'completed') return 'Evaluated';
        if (evaluationItem.status === 'in-progress') return 'In progress';
        return 'Pending';
      },
      type: 'status'
    }
  ];
  
  // Define evaluation columns
  const evaluationColumns = [
    { 
      id: 'startupName', 
      label: 'Startup',
      primary: true,
      format: (_, row) => {
        const startup = startups.find(s => s._id === row.startupId);
        return startup?.companyName || 'Unknown Startup';
      }
    },
    { 
      id: 'overallScore', 
      label: 'Score',
      format: (value) => {
        if (!value && value !== 0) return '-';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 35,
                height: 35,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: getScoreColor(value, 'bg'),
                color: getScoreColor(value, 'text'),
                fontWeight: 600,
                mr: 1
              }}
            >
              {value}
            </Box>
            {value >= 7 ? 'High' : value >= 5 ? 'Medium' : 'Low'}
          </Box>
        );
      }
    },
    { id: 'status', label: 'Status', type: 'status' },
    { 
      id: 'createdAt', 
      label: 'Date',
      format: (value) => value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'
    },
    { 
      id: 'recommendIncubation', 
      label: 'Recommended',
      type: 'status',
      format: (value) => value === true ? 'Yes' : value === false ? 'No' : 'Pending'
    }
  ];
  
  // Helper function for avatar colors
  function stringToColor(string) {
    if (!string) return theme.palette.primary.main;
    
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    
    return color;
  }
  
  // Helper function for score colors
  function getScoreColor(score, type = 'bg') {
    if (!score && score !== 0) return theme.palette.grey[500];
    
    if (score >= 8) {
      return type === 'bg' ? theme.palette.success.main : theme.palette.success.main;
    } else if (score >= 6) {
      return type === 'bg' ? theme.palette.primary.main : theme.palette.primary.main;
    } else if (score >= 4) {
      return type === 'bg' ? theme.palette.warning.main : theme.palette.warning.main;
    } else {
      return type === 'bg' ? theme.palette.error.main : theme.palette.error.main;
    }
  }
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  // Handle refresh data
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulated refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  // Handle menu open/close
  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Handle startup click
  const handleViewStartup = (startup) => {
    router.push(`/startup/${startup._id}`);
  };
  
  // Handle evaluation click
  const handleViewEvaluation = (evaluationItem) => {
    router.push(`/evaluations/${evaluationItem._id}`);
  };

  return (
    <AnimatePresence mode="wait">
      <Container maxWidth="xl" component={motion.div} initial="hidden" animate="visible" exit="exit" variants={containerVariants}>
        <Box sx={{ mb: 4 }}>
          <motion.div variants={itemVariants}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
              <Box>
                <Typography variant="h4" component={motion.h4} variants={itemVariants}>
                  Sales Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" component={motion.p} variants={itemVariants}>
                  Welcome, {user?.name}. Manage your startup evaluations.
                </Typography>
              </Box>
              <motion.div variants={itemVariants}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<LogoutIcon />} 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  Logout
                </Button>
              </motion.div>
            </Stack>
          </motion.div>
        </Box>

        <Box sx={{ mb: 4 }} component={motion.div} variants={cardContainerVariants}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemVariants}>
                    <DashboardCard title="Assigned Startups" value={totalAssignedStartups} icon={<BusinessIcon sx={{ fontSize: 40 }} color="primary" />} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemVariants}>
                    <DashboardCard title="Evaluations Completed" value={totalEvaluations} icon={<CheckCircleOutlineIcon sx={{ fontSize: 40 }} color="success" />} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} component={motion.div} variants={itemVariants}>
                    <DashboardCard title="Pending Evaluations" value={totalAssignedStartups - totalEvaluations} icon={<ListAltIcon sx={{ fontSize: 40 }} color="warning" />} />
                </Grid>
            </Grid>
        </Box>

        <motion.div variants={itemVariants}>
          <Paper sx={{ p: 3, background: isDarkMode ? theme.palette.grey[900] : theme.palette.background.paper, borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Your Startups
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <DataTable 
                columns={columns}
                data={tableData}
                onRowClick={handleViewDetails}
                renderCell={renderEvaluationCell} // Pass the custom renderer
              />
          </Paper>
        </motion.div>

        <Box sx={{ mb: 4 }}>
          <motion.div variants={itemVariants}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 1
            }}>
              <Typography variant="h4" component="h1" fontWeight={700}>
                Sales Dashboard
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
                <Tooltip title="Refresh data">
                  <IconButton 
                    onClick={handleRefresh} 
                    disabled={isLoading}
                    sx={{ 
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Dashboard options">
                  <IconButton 
                    onClick={handleMenuOpen}
                    sx={{ 
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
                
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      borderRadius: 2,
                      minWidth: 200,
                      mt: 1,
                      overflow: 'hidden',
                    }
                  }}
                >
                  <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                      <FilterListIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Filter Data</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                      <GetAppIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export Data</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                      <BarChartIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View Reports</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
            
            <Typography variant="subtitle1" color="text.secondary">
              Welcome, {session?.user?.name || 'Sales Representative'}. Here's your activity overview.
            </Typography>
          </motion.div>
        </Box>

        <Box sx={{ mb: 4 }} component={motion.div} variants={cardContainerVariants}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                      title="Total Startups"
                      value={totalStartups}
                      icon={<BusinessIcon fontSize="medium" />}
                      color="primary"
                    />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                      title="Your Evaluations"
                      value={totalEvaluations}
                      icon={<AssessmentIcon fontSize="medium" />}
                      color="secondary"
                      trend={evaluations.length > 3 ? "up" : null}
                      trendValue={evaluations.length > 3 ? "+2" : null}
                      trendLabel="this week"
                    />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                      title="Pending Reviews"
                      value={pendingEvaluations}
                      icon={<AssignmentIcon fontSize="medium" />}
                      color="warning"
                      trend={pendingEvaluations > 0 ? "down" : null}
                      trendValue={pendingEvaluations > 0 ? "-1" : null}
                      trendLabel="from last week"
                    />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <DashboardCard
                      title="Average Score"
                      value={averageScore || '-'}
                      icon={<DonutLargeIcon fontSize="medium" />}
                      color="info"
                    />
                </Grid>
            </Grid>
        </Box>

        <motion.div variants={itemVariants}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 2,
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.main,
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1, fontSize: 20 }} />
                    Startups
                    <Chip 
                      label={totalStartups} 
                      size="small" 
                      sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
                    />
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon sx={{ mr: 1, fontSize: 20 }} />
                    Evaluations
                    <Badge 
                      badgeContent={pendingEvaluations} 
                      color="error"
                      sx={{ ml: 1 }}
                    >
                      <Chip 
                        label={totalEvaluations} 
                        size="small" 
                        sx={{ ml: 0.5, height: 20, fontSize: '0.75rem' }} 
                      />
                    </Badge>
                  </Box>
                }
              />
            </Tabs>
          </Box>
        </motion.div>
        
        {/* Tab panels */}
        <TabPanel value={currentTab} index={0}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Startup Companies
              </Typography>
              
              <Button 
                component={Link}
                href="/startups"
                variant="outlined"
                size="small"
                endIcon={<ChevronRightIcon />}
              >
                View All
              </Button>
            </Box>
            
            <DataTable
              columns={startupColumns}
              data={startups}
              onRowClick={handleViewStartup}
              emptyMessage="No startups available for evaluation yet"
              enableSearch={true}
              initialSortBy="companyName"
            />
          </motion.div>
        </TabPanel>
        
        <TabPanel value={currentTab} index={1}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Your Evaluations
              </Typography>
              
              <Button
                component={Link}
                href="/evaluations"
                variant="outlined"
                size="small"
                endIcon={<ChevronRightIcon />}
              >
                View All
              </Button>
            </Box>
            
            <DataTable
              columns={evaluationColumns}
              data={evaluations}
              onRowClick={handleViewEvaluation}
              emptyMessage="You haven't created any evaluations yet"
              enableSearch={true}
              initialSortBy="createdAt"
              initialSortDirection="desc"
            />
          </motion.div>
        </TabPanel>
      </Container>
    </AnimatePresence>
  );
};

export default SalesDashboard; 