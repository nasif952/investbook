import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Box,
  Button,
  Typography,
  Slider,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Divider,
  FormControl,
  FormLabel,
  useTheme,
  alpha,
  Stack,
  Card,
  CardContent,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import Loader from './Loader';
import FormField from './FormField';
import { motion } from 'framer-motion';

const StartupEvaluation = ({ startupId }) => {
  const { data: session, status } = useSession();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState(false);
  const [loadingCriteria, setLoadingCriteria] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCriteria = async () => {
      setLoadingCriteria(true);
      setError('');
      try {
        const res = await fetch('/api/evaluations/criteria');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch evaluation criteria');
        }
        const activeCriteria = data.filter(c => c.active);
        setCriteria(activeCriteria);
        const initialScores = {};
        activeCriteria.forEach(c => {
          initialScores[c._id] = c.defaultValue !== undefined ? c.defaultValue : 5;
        });
        setScores(initialScores);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCriteria(false);
      }
    };
    fetchCriteria();
  }, []);

  const handleScoreChange = (criterionId, value) => {
    setScores(prevScores => ({ ...prevScores, [criterionId]: value }));
  };

  const handleRecommendationChange = (event) => {
    setRecommendation(event.target.value === 'true');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    if (!session?.user?.id) {
        setError('You must be logged in to submit an evaluation.');
        setSubmitting(false);
        return;
    }
    const evaluationData = {
      startupId: startupId,
      evaluatorId: session.user.id,
      scores: Object.entries(scores).map(([criterionId, score]) => ({ criterionId, score })),
      comments: comments,
      recommendIncubation: recommendation
    };
    console.log("Submitting Evaluation Payload:", evaluationData);
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluationData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit evaluation');
      }
      setSuccess('Evaluation submitted successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCriteria) {
    return <Loader message="Loading evaluation criteria..." />;
  }

  if (!criteria.length && !error) {
       return <Alert severity="info">No active evaluation criteria available.</Alert>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  return (
    <Card 
      elevation={2} 
      sx={{ 
        borderRadius: 3, 
        height: '100%', 
        p: { xs: 2, sm: 3 },
        background: isDarkMode 
          ? alpha(theme.palette.background.paper, 0.9) 
          : alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(8px)',
      }}
    >
      <CardContent>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Submit Evaluation
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
        
        {!success ? (
          <Box component="form" onSubmit={handleSubmit}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {criteria.map((criterion) => (
                <motion.div key={criterion._id} variants={itemVariants}>
                  <Box sx={{ mb: 3, p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                    <Typography variant="subtitle1" fontWeight={500} component="div" id={`slider-label-${criterion._id}`}>
                      {criterion.name} 
                      <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                        (Weight: {criterion.weight || 0}%)
                      </Typography>
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1.5, fontStyle: 'italic' }}>
                        {criterion.description}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Slider
                          value={scores[criterion._id] ?? 5}
                          onChange={(e, newValue) => handleScoreChange(criterion._id, newValue)}
                          aria-labelledby={`slider-label-${criterion._id}`}
                          valueLabelDisplay="auto"
                          step={1}
                          marks={[ { value: 0, label: '0' }, { value: 5, label: '5' }, { value: 10, label: '10' } ]}
                          min={0}
                          max={10}
                          disabled={submitting}
                          sx={{ 
                              color: theme.palette.primary.main,
                              '& .MuiSlider-thumb': {
                                  backgroundColor: theme.palette.primary.main,
                                  border: `2px solid ${theme.palette.primary.contrastText}`,
                                  boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)',
                                  '&:hover, &.Mui-focusVisible': {
                                      boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                                  },
                                  '&.Mui-active': {
                                      boxShadow: `0px 0px 0px 14px ${alpha(theme.palette.primary.main, 0.16)}`,
                                  },
                              },
                              '& .MuiSlider-track': {
                                  height: 6,
                                  borderRadius: 3,
                              },
                              '& .MuiSlider-rail': {
                                  height: 6,
                                  borderRadius: 3,
                                  opacity: 0.3,
                              },
                              '& .MuiSlider-markLabel': {
                                  fontSize: '0.75rem',
                                  color: 'text.secondary'
                              }
                          }}
                      />
                      <Box sx={{ minWidth: 35, textAlign: 'center' }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                              fontWeight: 'bold',
                              color: 'primary.main',
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              borderRadius: '4px',
                              px: 1,
                              py: 0.5
                          }}
                        >
                          {scores[criterion._id] ?? 5}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </motion.div>
              ))}

              <motion.div variants={itemVariants}>
                <FormField
                  fullWidth
                  id="comments"
                  name="comments"
                  label="Overall Comments"
                  type="textarea"
                  rows={5}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  disabled={submitting}
                  margin="normal"
                  tooltipText="Provide your overall feedback and justification for the scores."
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                 <FormControl component="fieldset" margin="normal" fullWidth disabled={submitting}>
                    <FormLabel component="legend" sx={{ fontWeight: 500, mb: 1 }}>Recommend for Incubation?</FormLabel>
                    <RadioGroup
                      row
                      aria-label="recommend-incubation"
                      name="recommendIncubation"
                      value={recommendation.toString()}
                      onChange={handleRecommendationChange}
                      sx={{ justifyContent: 'space-around' }}
                    >
                      <FormControlLabel value="true" control={<Radio />} label="Yes" />
                      <FormControlLabel value="false" control={<Radio />} label="No" />
                    </RadioGroup>
                  </FormControl>
              </motion.div>
            </motion.div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, py: 1.5, fontSize: '1rem' }}
              disabled={submitting || status !== 'authenticated'}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Evaluation'}
            </Button>
          </Box>
        ) : (
           <Box sx={{ textAlign: 'center', py: 4 }}>
             <Typography variant="h6" color="success.main" gutterBottom>Evaluation Submitted!</Typography>
             <Typography color="text.secondary">Thank you for providing your feedback.</Typography>
             <Button component={Link} href={`/startup/${startupId}`} sx={{ mt: 2 }}>
               View Startup Details Again?
             </Button>
           </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StartupEvaluation; 