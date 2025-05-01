import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Alert,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha,
  Rating,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Star as StarIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import Loader from '../../components/Loader'; // Adjust path as needed
import Header from '../../components/Header'; // Import Header
import { motion } from 'framer-motion';

const ViewEvaluationPage = () => {
  const router = useRouter();
  const { evaluationId } = router.query; // Get ID from route
  const { data: session, status } = useSession();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [evaluation, setEvaluation] = useState(null);
  const [criteriaMap, setCriteriaMap] = useState(null); // Initialize to null
  const [loadingEvaluation, setLoadingEvaluation] = useState(true);
  const [loadingCriteria, setLoadingCriteria] = useState(true); // Separate loading states
  const [error, setError] = useState('');

  // Fetch criteria details once
  useEffect(() => {
    setLoadingCriteria(true); // Ensure loading state is true
    const fetchCriteria = async () => {
      try {
        const res = await fetch('/api/evaluations/criteria');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch criteria');
        const map = data.reduce((acc, criterion) => {
          acc[criterion._id] = criterion;
          return acc;
        }, {});
        setCriteriaMap(map);
      } catch (err) {
        console.error("Error fetching criteria for view:", err);
        setError('Could not load criteria details.');
      } finally {
        setLoadingCriteria(false); // Set criteria loading false
      }
    };
    fetchCriteria();
  }, []);

  // Fetch evaluation details when ID and session are available
  useEffect(() => {
    if (evaluationId && status === 'authenticated') {
      setLoadingEvaluation(true); // Ensure loading state is true
      setError(''); // Clear previous errors
      const fetchEvaluation = async () => {
        try {
          const res = await fetch(`/api/evaluations/${evaluationId}`);
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || 'Failed to fetch evaluation');
          }
          
          // Authorization check: Admin or the specific evaluator or the startup founder
          const isEvaluator = session.user.id === (data.evaluatorId?._id || data.evaluatorId);
          const isStartupOwner = session.user.id === (data.startupId?.userId || data.startupId?.user); // Assuming user reference is userId or user
          
          if (session.user.role !== 'admin' && !isEvaluator && !isStartupOwner) {
               throw new Error('You are not authorized to view this evaluation.');
          }
          
          setEvaluation(data);
        } catch (err) {
          setError(err.message || 'An error occurred fetching the evaluation');
        } finally {
           setLoadingEvaluation(false); // Set evaluation loading false
        }
      };
      fetchEvaluation();
    } else if (status === 'unauthenticated') {
         router.push('/login');
    } else if (status === 'authenticated' && !evaluationId) {
         // Handle case where ID is missing but user is logged in
         setLoadingEvaluation(false);
         setError('Evaluation ID missing from URL.');
    }

  }, [evaluationId, status, session, router]);

  // Combined loading check
  const isLoading = status === 'loading' || loadingEvaluation || loadingCriteria;

  // Helper to get criterion details safely
  const getCriterion = (scoreEntry) => {
    return scoreEntry.criterionDetails || 
           (scoreEntry.criterionId && criteriaMap ? 
            criteriaMap[typeof scoreEntry.criterionId === 'object' ? scoreEntry.criterionId._id : scoreEntry.criterionId] : 
            null);
  }

  // Calculate overall score
  const calculatedOverallScore = (() => {
    if (!evaluation || !Array.isArray(evaluation?.scores) || evaluation.scores.length === 0 || !criteriaMap) {
      return evaluation?.overallScore?.toFixed(1) || 'N/A'; // Use stored if available or N/A
    }
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    evaluation.scores.forEach(scoreEntry => {
      const criterion = getCriterion(scoreEntry);
      if (criterion && typeof criterion.weight === 'number' && typeof scoreEntry.score === 'number') {
        totalWeightedScore += scoreEntry.score * criterion.weight;
        totalWeight += criterion.weight;
      }
    });
    return totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(1) : (evaluation?.overallScore?.toFixed(1) || 'N/A');
  })();

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Loader message="Loading evaluation details..." />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="md" sx={{ mt: 4, flexGrow: 1 }}>
          <Alert severity="error">{error}</Alert>
          <Button component={Link} href="/dashboard" sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
            Back to Dashboard
          </Button>
        </Container>
      </Box>
    );
  }

  // Data not ready state
  if (!evaluation || !criteriaMap) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="md" sx={{ mt: 4, flexGrow: 1 }}>
          <Alert severity="warning">Could not load evaluation data or criteria.</Alert>
          <Button component={Link} href="/dashboard" sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
            Back to Dashboard
          </Button>
        </Container>
      </Box>
    );
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

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
        <motion.div variants={itemVariants}>
          <Card 
            elevation={2}
            sx={{ 
              mb: 3,
              borderRadius: 3, 
              overflow: 'hidden',
              background: isDarkMode 
                ? alpha(theme.palette.background.paper, 0.9) 
                : alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(8px)',
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                      Evaluation Details
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {`For: ${evaluation.startupId?.companyName || 'Unknown Startup'}`}
                    </Typography>
                  </Box>
                  <Button 
                    component={Link} 
                    href={`/startup/${evaluation.startupId?._id || evaluation.startupId}`}
                    startIcon={<ArrowBackIcon />}
                    sx={{ mt: { xs: 2, sm: 0 } }}
                  >
                      View Startup
                  </Button>
              </Box>
              <Divider sx={{ mb: 3 }}/>
              
              <Grid container spacing={3}>
                  <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mr: 1.5 }}>
                          <BusinessIcon />
                      </Avatar>
                      <Typography variant="body1"><strong>Startup:</strong> {evaluation.startupId?.companyName || 'N/A'}</Typography>
                  </Grid>
                   <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                       <Avatar sx={{ bgcolor: 'secondary.light', mr: 1.5 }}>
                          <PersonIcon />
                       </Avatar>
                      <Typography variant="body1"><strong>Evaluator:</strong> {evaluation.evaluatorId?.name || evaluation.evaluatorId?.email || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'info.light', mr: 1.5 }}>
                          <CalendarTodayIcon />
                      </Avatar>
                      <Typography variant="body1"><strong>Date:</strong> {evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString() : 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'warning.light', mr: 1.5 }}>
                          <StarIcon />
                      </Avatar>
                      <Typography variant="body1"><strong>Overall Score:</strong> {calculatedOverallScore} / 10</Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'success.light', mr: 1.5 }}>
                          <CommentIcon />
                      </Avatar>
                      <Typography variant="body1"><strong>Recommended for Incubation:</strong> 
                        <Chip 
                          label={evaluation.recommendIncubation === true ? 'Yes' : evaluation.recommendIncubation === false ? 'No' : 'Pending'} 
                          color={evaluation.recommendIncubation === true ? 'success' : evaluation.recommendIncubation === false ? 'error' : 'default'} 
                          size="small" 
                          sx={{ ml: 1, fontWeight: 500 }}
                        />
                      </Typography>
                  </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        <Grid container spacing={3}>
          {/* Scores Card */}
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Scores per Criterion</Typography>
                  <Divider sx={{ mb: 2 }}/>
                  <List dense sx={{ px: 0 }}>
                      {Array.isArray(evaluation?.scores) && evaluation.scores.length > 0 ? (
                          evaluation.scores.map(scoreEntry => {
                              const criterion = getCriterion(scoreEntry);
                              return (
                                  <ListItem 
                                    key={scoreEntry._id || Math.random().toString(36)} 
                                    disableGutters 
                                    divider
                                    sx={{ py: 1.5 }}
                                  >
                                      <ListItemText 
                                          primary={<Typography variant="body2" fontWeight={500}>{criterion?.name || 'Unknown Criterion'}</Typography>} 
                                          secondary={`Weight: ${criterion?.weight || 'N/A'}%`}
                                      />
                                      <Rating 
                                        name={`score-${criterion?._id || 'unknown'}`} 
                                        value={scoreEntry.score / 2} // Assuming score is out of 10, rating is out of 5
                                        precision={0.5}
                                        readOnly 
                                        sx={{ mr: 1 }} 
                                      />
                                      <Chip 
                                        label={`${scoreEntry.score} / 10`} 
                                        size="small"
                                        variant="outlined"
                                      />
                                  </ListItem>
                              );
                          })
                      ) : (
                          <ListItem><ListItemText primary="Score data missing." /></ListItem>
                      )}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          
          {/* Comments Card */}
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>Evaluator Comments</Typography>
                  <Divider sx={{ mb: 2 }}/>
                  <Box 
                    sx={{ 
                      p: 2, 
                      whiteSpace: 'pre-wrap', 
                      bgcolor: isDarkMode ? alpha(theme.palette.common.black, 0.1) : alpha(theme.palette.grey[100], 0.7),
                      borderRadius: 2,
                      minHeight: 150,
                    }}
                  >
                       <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {evaluation.comments || 'No comments provided.'}
                      </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
};

export default ViewEvaluationPage; 