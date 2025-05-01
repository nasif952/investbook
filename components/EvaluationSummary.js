import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Loader from './Loader'; // Assuming Loader exists

const EvaluationSummary = ({ evaluations = [] }) => {
  const [criteriaMap, setCriteriaMap] = useState({});
  const [loadingCriteria, setLoadingCriteria] = useState(true);
  const [error, setError] = useState('');

  // Fetch criteria details to display names instead of just IDs
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
        // Create a map for easy lookup: { criteriaId: { name, weight, ... } }
        const map = data.reduce((acc, criterion) => {
          acc[criterion._id] = criterion;
          return acc;
        }, {});
        setCriteriaMap(map);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching criteria for summary:", err);
      } finally {
        setLoadingCriteria(false);
      }
    };
    fetchCriteria();
  }, []);

  if (loadingCriteria) {
    return <Loader message="Loading criteria details..." />;
  }

  if (error) {
       return <Alert severity="error">Error loading criteria details: {error}</Alert>;
  }

  if (!evaluations || evaluations.length === 0) {
    return <Alert severity="info">No evaluations submitted for this startup yet.</Alert>;
  }

  const calculateAverageScore = (criterionId) => {
    let totalScore = 0;
    let count = 0;
    evaluations.forEach(ev => {
      // Add a check to ensure ev.scores is an array before calling find
      const scoreEntry = Array.isArray(ev?.scores) 
        ? ev.scores.find(s => s.criterionId === criterionId)
        : undefined;
        
      if (scoreEntry) {
        totalScore += scoreEntry.score;
        count++;
      }
    });
    return count > 0 ? (totalScore / count).toFixed(1) : 'N/A';
  };

  // Calculate overall weighted average
  const overallAverage = () => {
      let totalWeightedScore = 0;
      let totalWeight = 0;
      Object.keys(criteriaMap).forEach(criterionId => {
          const criterion = criteriaMap[criterionId];
          const avgScore = parseFloat(calculateAverageScore(criterionId));
          if (!isNaN(avgScore) && criterion && typeof criterion.weight === 'number') {
              totalWeightedScore += avgScore * criterion.weight;
              totalWeight += criterion.weight;
          }
      });
      return totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : 'N/A';
  };

  const renderEvaluator = (evaluator) => {
    if (!evaluator) return 'Unknown';
    if (typeof evaluator === 'object') {
      return evaluator.name || evaluator.email || evaluator._id || 'Unknown';
    } 
    return evaluator; // Assume it's an ID string
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Evaluation Summary (Overall Avg: {overallAverage()} / 10)
      </Typography>
      <Divider sx={{ mb: 2 }} />

       {/* Display average scores per criterion */} 
      <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Average Scores per Criterion:</Typography>
          <List dense>
              {Object.keys(criteriaMap).map(criterionId => (
                  <ListItem key={criterionId} disableGutters>
                      <ListItemText 
                          primary={criteriaMap[criterionId]?.name || 'Unknown Criterion'} 
                          secondary={`Weight: ${criteriaMap[criterionId]?.weight || 'N/A'}%`}
                      />
                      <Chip label={`${calculateAverageScore(criterionId)} / 10`} />
                  </ListItem>
              ))}
          </List>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Display individual evaluations */} 
      <Typography variant="subtitle1" gutterBottom>Individual Evaluations:</Typography>
      {evaluations.map((evaluation, index) => (
        <Accordion key={evaluation._id || index} sx={{ mb: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
          >
            <Typography sx={{ width: '70%', flexShrink: 0 }}>
              Evaluator: {renderEvaluator(evaluation.evaluatorId)}
            </Typography>
             {/* Optionally show overall score for this evaluation if calculated */} 
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Scores:</Typography>
                <List dense>
                {Array.isArray(evaluation?.scores) ? evaluation.scores.map(scoreEntry => (
                    <ListItem key={scoreEntry.criterionId} disableGutters>
                    <ListItemText primary={criteriaMap[scoreEntry.criterionId]?.name || scoreEntry.criterionId} />
                    <Chip label={`${scoreEntry.score} / 10`} />
                    </ListItem>
                )) : (
                    <ListItem><ListItemText primary="Score data missing for this evaluation." /></ListItem>
                )}
                </List>
            </Box>
             <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Comments:</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
              {evaluation.comments || 'No comments provided.'}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
};

export default EvaluationSummary; 