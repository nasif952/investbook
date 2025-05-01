import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from '../../../lib/db';
import Evaluation from '../../../lib/models/Evaluation';
import EvaluationCriteria from '../../../lib/models/EvaluationCriteria'; // Needed for update
import User from '../../../lib/models/User'; // Needed for role checks
import Startup from '../../../lib/models/Startup'; // Import the Startup model
// import { protect, authorize } from '../../../lib/middleware/auth'; // Adapt later
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { id } = req.query; // Get evaluation ID from dynamic route

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const userId = session.user.id;
  const userRole = session.user.role;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Evaluation ID format' });
  }

  await connectDB();

  // --- Handle GET: Fetch specific evaluation ---
  if (req.method === 'GET') {
    try {
        // First, get the evaluation without trying to populate scores.criterionId
        const evaluation = await Evaluation.findById(id)
            .populate('startupId', 'companyName industry stage')
            .populate('evaluatorId', 'name email');

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        // Authorization check: Admin or the Sales user who created it
        if (userRole !== 'admin' && evaluation.evaluatorId._id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to access this evaluation' });
        }

        // Convert to plain object so we can modify it
        const evalObj = evaluation.toObject();
        
        // If there are scores in the evaluation, handle both possible schema structures
        if (evalObj.scores && Array.isArray(evalObj.scores) && evalObj.scores.length > 0) {
            // Get all unique criterionIds from the scores
            const criterionIds = [];
            evalObj.scores.forEach(score => {
                // Handle both object ID and string
                const criterionId = score.criterionId ? 
                    (score.criterionId._id || score.criterionId.toString()) : null;
                
                if (criterionId) criterionIds.push(criterionId);
            });
            
            // If we have criterionIds, fetch the corresponding criteria
            if (criterionIds.length > 0) {
                const criteria = await EvaluationCriteria.find({
                    _id: { $in: criterionIds }
                });
                
                // Create a lookup map for quick access
                const criteriaMap = {};
                criteria.forEach(criterion => {
                    criteriaMap[criterion._id.toString()] = criterion;
                });
                
                // For each score, attach the relevant criterion details directly
                evalObj.scores.forEach(score => {
                    const criterionId = score.criterionId ? 
                        (score.criterionId._id || score.criterionId.toString()) : null;
                    
                    if (criterionId && criteriaMap[criterionId]) {
                        // Replace the criterionId with the full criterion object
                        score.criterionDetails = criteriaMap[criterionId];
                    }
                });
            }
        }
        
        // Send the enhanced evaluation object
        res.status(200).json(evalObj);
    } catch (error) {
        console.error('Get Evaluation By ID API Error:', error);
        // Add more detailed error logging to help diagnose the issue
        console.error('Error Details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            path: error.path,
        });
        
        res.status(500).json({ 
            message: 'Server Error fetching evaluation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }
  // --- Handle PUT: Update specific evaluation (Sales owner only) ---
  else if (req.method === 'PUT') {
    // Authorization: Only sales users can update
    if (userRole !== 'sales') {
        return res.status(403).json({ message: 'Only sales users can update evaluations' });
    }

    // Expect 'scores' array in body now, not 'criteria'
    const { scores, status, comments, recommendIncubation } = req.body;

    try {
        let evaluation = await Evaluation.findById(id);
        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        // Authorization: Only the sales user who created it can update
        if (evaluation.evaluatorId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this evaluation' });
        }

        // Update basic fields
        if (status !== undefined) evaluation.status = status;
        if (comments !== undefined) evaluation.comments = comments;
        if (recommendIncubation !== undefined) evaluation.recommendIncubation = recommendIncubation;

        // Update scores if provided
        if (scores && Array.isArray(scores)) {
            const validatedScores = [];
            for (const item of scores) {
                if (!item.criterionId || !mongoose.Types.ObjectId.isValid(item.criterionId) || item.score === undefined) {
                    console.warn('Skipping invalid score item during update:', item);
                    continue; // Skip invalid items
                }
                 // Optional: Check if criterion exists and is active (important!)
                 const dbCriteria = await EvaluationCriteria.findById(item.criterionId);
                 if (!dbCriteria || !dbCriteria.active) {
                     console.warn(`Criterion ${item.criterionId} not found or inactive during update. Skipping score.`);
                     continue; // Skip scores for non-existent/inactive criteria
                 }
                validatedScores.push({
                    criterionId: item.criterionId,
                    score: item.score
                    // Do NOT store name/weight/comment here
                });
            }
            // Replace the entire scores array
            evaluation.scores = validatedScores; 
            // Note: If you want partial updates (only updating scores present in the request),
            // the logic would be more complex.
        }
        
        const updatedEvaluation = await evaluation.save(); // Pre-save calculates score
        res.status(200).json(updatedEvaluation);

    } catch (error) {
        console.error('Update Evaluation API Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error updating evaluation' });
    }
  }
  // --- Handle DELETE: Delete specific evaluation (Admin only) ---
  else if (req.method === 'DELETE') {
    // Authorization
    if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete evaluations' });
    }
    try {
        const evaluation = await Evaluation.findById(id);
        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }
        await evaluation.deleteOne();
        res.status(200).json({ message: 'Evaluation deleted successfully' });
    } catch (error) {
        console.error('Delete Evaluation API Error:', error);
        res.status(500).json({ message: 'Server Error deleting evaluation' });
    }
  }
  // --- Handle Other Methods ---
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 