import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from '../../../lib/db';
import Evaluation from '../../../lib/models/Evaluation';
import Startup from '../../../lib/models/Startup'; // Needed for /pending
import User from '../../../lib/models/User'; // Needed for populating
import mongoose from 'mongoose';
import EvaluationCriteria from '../../../lib/models/EvaluationCriteria';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const userId = session.user.id;
  const userRole = session.user.role;

  await connectDB();

  // --- Handle GET Requests ---
  if (req.method === 'GET') {
    const { scope } = req.query; // Check for ?scope=my or ?scope=pending

    try {
      // --- Handle GET /api/evaluations/my ---
      if (scope === 'my') {
        // Authorization: Sales users only
        if (userRole !== 'sales') {
          return res.status(403).json({ message: 'Not authorized' });
        }
        const evaluations = await Evaluation.find({ evaluatorId: userId })
          .populate('startupId', 'companyName industry stage');
        return res.status(200).json(evaluations);
      }
      // --- Handle GET /api/evaluations/pending ---
      else if (scope === 'pending') {
         // Authorization: Sales users only
        if (userRole !== 'sales') {
          return res.status(403).json({ message: 'Not authorized' });
        }
        const evaluatedStartupIds = await Evaluation.find({ evaluatorId: userId }).distinct('startupId');
        const pendingStartups = await Startup.find({
          _id: { $nin: evaluatedStartupIds },
        }).select('companyName industry stage createdAt');
        return res.status(200).json(pendingStartups);
      }
      // --- Handle GET /api/evaluations (all) ---
      else {
         // Authorization: Admin users only
        if (userRole !== 'admin') {
          return res.status(403).json({ message: 'Not authorized' });
        }
        const evaluations = await Evaluation.find()
          .populate('startupId', 'companyName industry stage')
          .populate('evaluatorId', 'name email');
        return res.status(200).json(evaluations);
      }
    } catch (error) {
      console.error('Get Evaluations API Error:', error);
      return res.status(500).json({ message: 'Server Error fetching evaluations' });
    }
  }
  // --- Handle POST Requests ---
  else if (req.method === 'POST') {
    console.log('--- Received POST /api/evaluations ---'); // Log start
    console.log('Request Body:', JSON.stringify(req.body, null, 2)); // Log incoming body
    
    // Read startupId, scores, and comments from body
    const { startupId, scores, comments, recommendIncubation, status } = req.body;

    // Validate startupId
    if (!startupId || !mongoose.Types.ObjectId.isValid(startupId)) {
        return res.status(400).json({ message: 'Invalid or missing startupId' });
    }
    
    // Basic validation for scores
    if (!scores || !Array.isArray(scores)) {
        return res.status(400).json({ message: 'scores array is required' });
    }

    try {
        // Check if startup exists
        // ... (startup check logic) ...

        // Check if evaluation already exists by this evaluator
        // ... (existingEvaluation check logic) ...

        // Validate incoming scores structure and ensure criteria exist
        const validatedScores = [];
        for (const item of scores) {
            if (!item.criterionId || !mongoose.Types.ObjectId.isValid(item.criterionId) || item.score === undefined) {
                console.warn('Skipping invalid score item:', item);
                continue; // Skip invalid items
            }
            // Optional: Check if criterion exists and is active (important!)
            const dbCriteria = await EvaluationCriteria.findById(item.criterionId);
            if (!dbCriteria || !dbCriteria.active) {
                 console.warn(`Criterion ${item.criterionId} not found or inactive. Skipping score.`);
                 continue; // Skip scores for non-existent/inactive criteria
            }
            validatedScores.push({
                criterionId: item.criterionId,
                score: item.score,
                // Do NOT store name/weight/comment here
            });
        }
        console.log('Validated Scores Array:', JSON.stringify(validatedScores, null, 2)); // Log validated scores

        if (validatedScores.length === 0) {
            console.warn('Validation failed: No valid scores provided for active criteria.'); // Log validation failure
            return res.status(400).json({ message: 'No valid scores provided for active criteria' });
        }

        // Create and save the new evaluation using the 'scores' field
        const evaluation = new Evaluation({
            startupId: startupId,
            evaluatorId: userId,
            scores: validatedScores, // Use the correct field name and structure
            status: status || 'completed', 
            comments: comments || '',
            recommendIncubation: recommendIncubation === true,
        });

        const savedEvaluation = await evaluation.save(); // Pre-save hook calculates overallScore
        console.log('--- Evaluation Saved Successfully ---'); // Log success
        console.log('Saved Evaluation Object:', JSON.stringify(savedEvaluation.toObject(), null, 2)); // Log saved object
        res.status(201).json(savedEvaluation);

    } catch (error) {
      console.error('Post Evaluations API Error:', error); // Keep existing error log
      console.log('--- Evaluation Save Failed ---'); // Log failure
      return res.status(500).json({ message: 'Server Error saving evaluation' });
    }
  }
  // --- Handle Other Methods ---
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 