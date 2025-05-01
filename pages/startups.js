import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Typography,
  Box,
  Container,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Button,
  Card,
  CardContent,
  useTheme,
  Divider,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  Business as BusinessIcon,
  ViewList as ViewListIcon,
  GridView as GridViewIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';

const StartupsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState('');
  const [startups, setStartups] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sortField, setSortField] = useState('companyName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [industries, setIndustries] = useState([]);
  const [viewMode, setViewMode] = useState('list');

  const user = session?.user;

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && user?.role === 'startup') {
      router.push('/startup/form');
    }
  }, [status, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated' && user && (user.role === 'admin' || user.role === 'sales')) {
        setApiLoading(true);
        setError('');
        try {
           const startupsRes = await fetch('/api/startups');
           const startupsData = await startupsRes.json();
           if (!startupsRes.ok) {
             throw new Error(startupsData.message || 'Failed to fetch startups');
           }
           setStartups(startupsData);
           setFilteredStartups(startupsData);
           const uniqueIndustries = [...new Set(startupsData.map(s => s.industry))].filter(Boolean).sort();
           setIndustries(uniqueIndustries);

           if (user.role === 'sales') {
             const evalRes = await fetch('/api/evaluations?scope=my');
             const evalData = await evalRes.json();
             if (evalRes.ok) setEvaluations(evalData);
             else console.warn('Could not fetch evaluations:', evalData.message);
           }
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setApiLoading(false);
        }
      }
    };
    fetchData();
  }, [status, user]);

  useEffect(() => {
    let results = [...startups];
    if (searchTerm) {
      results = results.filter(
        startup => 
          startup.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (startup.description && startup.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (industryFilter) {
      results = results.filter(startup => startup.industry === industryFilter);
    }
    if (stageFilter) {
      results = results.filter(startup => startup.stage === stageFilter);
    }
    results.sort((a, b) => {
      let comparison = 0;
      const fieldA = a[sortField];
      const fieldB = b[sortField];

      if (sortField === 'foundingDate') {
        comparison = new Date(fieldA) - new Date(fieldB);
      } else if (typeof fieldA === 'string' && typeof fieldB === 'string') {
         comparison = fieldA.localeCompare(fieldB);
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
         comparison = fieldA - fieldB;
      } 
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    setFilteredStartups(results);
  }, [startups, searchTerm, industryFilter, stageFilter, sortField, sortDirection]);

   const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
   };
    const getStageColor = (stage) => {
      return theme.palette.grey[500];
   };

  const hasEvaluated = (startupId) => {
    return evaluations.some(evaluation => evaluation.startupId._id === startupId);
  };

  const handleStartupClick = (startup) => {
    router.push(`/startup/${startup._id}`);
  };

  const handleSortChange = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Define columns for the DataTable
  const columns = [
    { id: 'companyName', label: 'Company', sortable: true },
    { id: 'industry', label: 'Industry', sortable: true },
    { id: 'stage', label: 'Stage', sortable: true },
    { id: 'foundingDate', label: 'Founded', sortable: true },
    { id: 'teamSize', label: 'Team Size', sortable: true, numeric: true },
    // Add a hidden column for evaluation status if needed for sales role logic in renderCell
    { id: 'evaluated', label: 'Evaluated', sortable: false, hidden: true } 
  ];

  // Map filtered startups to the format needed by DataTable
  const tableData = filteredStartups.map(startup => ({
    _id: startup._id, // Ensure _id is passed for click handler
    companyName: startup.companyName,
    industry: startup.industry,
    stage: startup.stage,
    foundingDate: formatDate(startup.foundingDate), // Format the date
    teamSize: startup.teamSize,
    evaluated: user?.role === 'sales' ? hasEvaluated(startup._id) : undefined // Include evaluated status for sales
  }));

  const containerVariants = { /* ... */ };
  const itemVariants = { /* ... */ };

  if (status === 'loading' || apiLoading) return <Loader />;
  if (status !== 'authenticated' || user?.role === 'startup') return null;

  return (
    <Container maxWidth="xl" component={motion.div} initial="hidden" animate="visible" variants={containerVariants} sx={{ py: 4 }}>
       <Box sx={{ mb: 4 }}>
         {/* ... Title and subtitle ... */}
       </Box>

       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

       <Paper sx={{ p: 2, mb: 3 }} component={motion.div} variants={itemVariants}>
         <Grid container spacing={2} alignItems="center">
           <Grid item xs={12} md={4}>
             <TextField 
                fullWidth 
                variant="outlined" 
                size="small"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                    endAdornment: searchTerm && (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setSearchTerm('')}><ClearIcon /></IconButton>
                        </InputAdornment>
                    )
                }}
             />
           </Grid>
           <Grid item xs={6} md={2}>
             <FormControl fullWidth size="small">
                <InputLabel>Industry</InputLabel>
                <Select value={industryFilter} label="Industry" onChange={(e) => setIndustryFilter(e.target.value)}>
                    <MenuItem value=""><em>All Industries</em></MenuItem>
                    {industries.map(ind => <MenuItem key={ind} value={ind}>{ind}</MenuItem>)}
                </Select>
             </FormControl>
           </Grid>
           <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                    <InputLabel>Stage</InputLabel>
                    <Select value={stageFilter} label="Stage" onChange={(e) => setStageFilter(e.target.value)}>
                         <MenuItem value=""><em>All Stages</em></MenuItem>
                         <MenuItem value="idea">Idea</MenuItem>
                         <MenuItem value="prototype">Prototype</MenuItem>
                         <MenuItem value="mvp">MVP</MenuItem>
                         <MenuItem value="growth">Growth</MenuItem>
                    </Select>
                </FormControl>
           </Grid>
           <Grid item xs={6} md={2}>
              <Button fullWidth variant="outlined" size="small" onClick={() => handleSortChange('companyName')} startIcon={<SortIcon />}>
                 Sort: {sortField === 'companyName' ? (sortDirection === 'asc' ? 'Name A-Z' : 'Name Z-A') : 'Name'}
              </Button>
           </Grid>
           <Grid item xs={6} md={2} sx={{ textAlign: 'right' }}>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    size="small"
                    onChange={(e, newMode) => { if (newMode !== null) setViewMode(newMode); }}
                    aria-label="view mode"
                >
                    <ToggleButton value="list" aria-label="list view"><ViewListIcon /></ToggleButton>
                    <ToggleButton value="grid" aria-label="grid view"><GridViewIcon /></ToggleButton>
                </ToggleButtonGroup>
           </Grid>
         </Grid>
       </Paper>

        {viewMode === 'list' ? (
             <motion.div variants={itemVariants}>
                 <Paper sx={{ p: { xs: 1, sm: 2 }, overflowX: 'auto' }}>
                    <DataTable 
                        columns={columns} 
                        data={tableData} 
                        onRowClick={handleStartupClick} 
                        getRowProps={(row) => ({sx: { cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.action.hover } }}) }
                        renderCell={(row, column) => {
                            const value = row[column.id];
                            if (column.id === 'stage') {
                                return <Chip label={value} size="small" sx={{ backgroundColor: getStageColor(value), color: 'white' }} />;
                            }
                             if (column.id === 'companyName' && user?.role === 'sales' && row.evaluated) {
                                return (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="body2">{value}</Typography>
                                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: '1rem' }} titleAccess="Evaluated" />
                                    </Stack>
                                );
                             }
                            return value;
                        }}
                    />
                </Paper>
            </motion.div>
        ) : (
            <Grid container spacing={3} component={motion.div} variants={containerVariants}>
                 {filteredStartups.map((startup) => (
                    <Grid item xs={12} sm={6} md={4} key={startup._id} component={motion.div} variants={itemVariants}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 3 } }} onClick={() => handleStartupClick(startup)}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={1} mb={1}>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>{startup.companyName}</Typography>
                                    {user?.role === 'sales' && hasEvaluated(startup._id) && <CheckCircleOutlineIcon color="success" fontSize='small' titleAccess='Evaluated' />}
                                </Stack>
                                <Chip label={startup.stage} size="small" sx={{ backgroundColor: getStageColor(startup.stage), color: 'white', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{startup.industry}</Typography>
                                <Typography variant="body2" sx={{ mb: 1, height: '60px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                    {startup.description}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" display="block" color="text.secondary">Founded: {formatDate(startup.foundingDate)}</Typography>
                                <Typography variant="caption" display="block" color="text.secondary">Team Size: {startup.teamSize}</Typography>
                            </CardContent>
                            <Button size="small" fullWidth sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>View Details</Button>
                        </Card>
                    </Grid>
                 ))}
            </Grid>
        )}
    </Container>
  );
};

export default StartupsPage; 