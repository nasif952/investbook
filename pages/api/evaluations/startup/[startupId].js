import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import connectDB from '../../../../lib/db';
import Evaluation from '../../../../lib/models/Evaluation';
import Startup from '../../../../lib/models/Startup';
import EvaluationCriteria from '../../../../lib/models/EvaluationCriteria'; // Needed for create
import User from '../../../../lib/models/User'; // Needed for role checks
// import { protect, authorize } from '../../../../lib/middleware/auth'; // Adapt later
import { getToken } from 'next-auth/jwt'; // Example if using next-auth
import mongoose from 'mongoose'; // Needed for ObjectId check

export default async function handler(req, res) {
  const { startupId } = req.query; 
  // --- Log the received startupId ---
  console.log(`[API /api/evaluations/startup/${startupId}] Received request for startup ID:`, startupId);

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    console.log(`[API /api/evaluations/startup/${startupId}] Authentication failed.`);
    return res.status(401).json({ message: "Not authenticated" });
  }
  const userId = session.user.id;
  const userRole = session.user.role;
  console.log(`[API /api/evaluations/startup/${startupId}] Authenticated user role:`, userRole);

  if (!mongoose.Types.ObjectId.isValid(startupId)) {
      console.log(`[API /api/evaluations/startup/${startupId}] Invalid Startup ID format:`, startupId);
      return res.status(400).json({ message: 'Invalid Startup ID format' });
  }

  try { // Wrap DB connection in try-catch as well
      await connectDB();
  } catch (dbError) {
      console.error(`[API /api/evaluations/startup/${startupId}] Database Connection Error:`, dbError);
      return res.status(500).json({ message: 'Database connection error' });
  }

  // --- Handle GET: Fetch evaluations for this startup (Admin/Sales) ---
  if (req.method === 'GET') {
    // Authorization
    if (!['admin', 'sales'].includes(userRole)) {
        console.log(`[API /api/evaluations/startup/${startupId}] Authorization failed for role:`, userRole);
        return res.status(403).json({ message: 'Not authorized' });
    }
    
    try {
      console.log(`[API /api/evaluations/startup/${startupId}] Attempting to find evaluations for startupId:`, startupId);
      const evaluations = await Evaluation.find({ startupId: startupId })
        .populate('evaluatorId', 'name email'); // Use name field
        
      // --- Log the result of the find operation ---
      console.log(`[API /api/evaluations/startup/${startupId}] Found evaluations count:`, evaluations.length);
      // Optional: Log the actual data found (can be verbose)
      // console.log(`[API /api/evaluations/startup/${startupId}] Found evaluations data:`, JSON.stringify(evaluations, null, 2)); 

      res.status(200).json(evaluations);
    } catch (error) {
      // --- Log any errors during the find operation ---
      console.error(`[API /api/evaluations/startup/${startupId}] Get Startup Evaluations API Error:`, error);
      res.status(500).json({ message: 'Server Error fetching evaluations for startup' });
    }
  }
  // --- Handle POST: Create evaluation for this startup (Sales only) ---
  else if (req.method === 'POST') {
    // Authorization
    if (userRole !== 'sales') {
        return res.status(403).json({ message: 'Not authorized to create evaluation' });
    }

    const { criteria, status, comments, recommendIncubation } = req.body;
    
    // Basic validation
    if (!criteria || !Array.isArray(criteria) || criteria.length === 0) {
        return res.status(400).json({ message: 'Criteria array is required and cannot be empty' });
    }

    try {
        // Check if startup exists
        const startup = await Startup.findById(startupId);
        if (!startup) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        // Check if evaluation already exists by this evaluator
        const existingEvaluation = await Evaluation.findOne({
            startupId: startupId,
            evaluatorId: userId,
        });
        if (existingEvaluation) {
            return res.status(400).json({ message: 'You have already submitted an evaluation for this startup' });
        }

        // Validate criteria and structure data for saving
        const criteriaData = [];
        let hasValidCriteria = false;
        for (const item of criteria) {
            if (!item.criteriaId || item.score === undefined) continue;
            const dbCriteria = await EvaluationCriteria.findById(item.criteriaId);
            if (dbCriteria && dbCriteria.active) {
                criteriaData.push({
                    name: dbCriteria.name,
                    score: item.score,
                    weight: dbCriteria.weight,
                    comment: item.comment || '',
                });
                hasValidCriteria = true;
            }
        }

        if (!hasValidCriteria) {
            return res.status(400).json({ message: 'No valid and active criteria found in the request' });
        }

        // Create and save the new evaluation
        const evaluation = new Evaluation({
            startupId: startupId,
            evaluatorId: userId,
            criteria: criteriaData,
            status: status || 'completed', // Default to completed on submit?
            comments: comments || '',
            recommendIncubation: recommendIncubation === true, // Ensure boolean
        });

        const savedEvaluation = await evaluation.save(); // Pre-save hook calculates overallScore
        res.status(201).json(savedEvaluation);

    } catch (error) {
        console.error('Create Evaluation API Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error creating evaluation' });
    }
  }
  // --- Handle Other Methods ---
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 