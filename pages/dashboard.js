import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Typography, 
  Grid, 
  Box, 
  Button, 
  Container, 
  Skeleton,
  Alert,
  Stack,
  Paper,
  useTheme,
  Chip,
  Divider
} from '@mui/material';
import { 
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  PendingActions as PendingIcon,
  CheckCircle as CheckIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardCard from '../components/DashboardCard';
import DataTable from '../components/DataTable';
import SalesDashboard from '../components/SalesDashboard';
import Loader from '../components/Loader';

const DashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  
  const [startups, setStartups] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState('');
  
  const isDarkMode = theme.palette.mode === 'dark';
  const user = session?.user;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && session?.user?.role === 'startup') {
      router.push('/startup/form');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated' && session?.user && (session.user.role === 'admin' || session.user.role === 'sales')) {
        setApiLoading(true);
        setError('');
        try {
          const startupsRes = await fetch('/api/startups');
          const startupsData = await startupsRes.json();
          if (!startupsRes.ok) {
            throw new Error(startupsData.message || 'Could not fetch startups');
          }
          setStartups(startupsData);

          if (session.user.role === 'sales') {
            const evalRes = await fetch('/api/evaluations?scope=my');
            const evalData = await evalRes.json();
            if (!evalRes.ok) {
               console.warn('Could not fetch evaluations:', evalData.message);
            } else {
               setEvaluations(evalData);
            }
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setApiLoading(false);
        }
      }
    };
    if (status === 'authenticated') {
        fetchData();
    } else if (status === 'unauthenticated') {
        setApiLoading(false);
    } else {
        setApiLoading(true);
    }
  }, [status, session]);

  if (status === 'loading' || (status === 'authenticated' && apiLoading)) {
    return <Loader />; 
  }

  if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role === 'startup')) {
    return null; 
  }
  
  if (status === 'authenticated' && session?.user?.role === 'admin') {
    const user = session.user;
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const columns = [
      { id: 'companyName', label: 'Company' },
      { id: 'industry', label: 'Industry' },
      { id: 'stage', label: 'Stage' },
      { id: 'foundingDate', label: 'Founded' },
      { id: 'teamSize', label: 'Team Size' },
    ];

    const tableData = startups.map(startup => ({
      ...startup,
      foundingDate: formatDate(startup.foundingDate)
    }));

    const handleViewDetails = (startup) => {
      router.push(`/startup/${startup._id}`);
    };

    const containerVariants = { /* ... */ };
    const itemVariants = { /* ... */ };
    const cardContainerVariants = { /* ... */ };
    const cardVariants = { /* ... */ };

    return (
      <AnimatePresence mode="wait">
        <Container 
          maxWidth="xl" 
          component={motion.div} 
          initial="hidden" 
          animate="visible" 
          exit="exit" 
          variants={containerVariants}
        >
           <Box sx={{ mb: 4 }}>
            <motion.div variants={itemVariants}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                <Box>
                  <Typography variant="h4" component={motion.h4} variants={itemVariants} /* ... sx styles */>
                    Admin Dashboard
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" component={motion.p} variants={itemVariants}>
                    Welcome, {user.name}. You have admin privileges.
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={2} component={motion.div} variants={itemVariants}>
                   <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                       <Link href="/criteria/manage" passHref>
                          <Button
                              variant="outlined"
                              color="primary"
                              startIcon={<AssessmentIcon />}
                          >
                              Manage Criteria
                          </Button>
                       </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
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
              </Stack>
            </motion.div>
          </Box>

          <Box sx={{ mb: 4 }} component={motion.div} variants={cardContainerVariants}>
              <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4} component={motion.div} variants={cardVariants}>
                      <DashboardCard title="Total Startups" value={startups.length} icon={<BusinessIcon sx={{ fontSize: 40 }} color="primary" />} />
                  </Grid>
              </Grid>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <motion.div variants={itemVariants}>
              <Paper sx={{ p: 3, background: isDarkMode ? theme.palette.grey[900] : theme.palette.background.paper, borderRadius: 3, boxShadow: 3 }}>
                   <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Registered Startups
                   </Typography>
                   <Divider sx={{ mb: 2 }} />
                  <DataTable 
                      columns={columns}
                      data={tableData}
                      onRowClick={handleViewDetails}
                  />
              </Paper>
          </motion.div>
        </Container>
      </AnimatePresence>
    );
  }

  if (status === 'authenticated' && session?.user?.role === 'sales') {
      if (apiLoading) return <Loader />;
      return <SalesDashboard startups={startups} evaluations={evaluations} />;
  }

  return null;
};

export default DashboardPage; 