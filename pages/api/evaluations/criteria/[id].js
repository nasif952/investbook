import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import connectDB from '../../../../lib/db';
import EvaluationCriteria from '../../../../lib/models/EvaluationCriteria';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { id } = req.query;

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid Criterion ID format' });
  }

  await connectDB();

  // --- Handle PUT: Update specific criterion (e.g., toggle active) ---
  if (req.method === 'PUT') {
    try {
        const criterion = await EvaluationCriteria.findById(id);
        if (!criterion) {
            return res.status(404).json({ message: 'Criterion not found' });
        }

        // Only update fields provided in the body
        const { active, name, description, weight, order } = req.body;

        if (active !== undefined) {
            criterion.active = active;
        }
        // Add logic for other fields later if needed for Edit
        if (name !== undefined) criterion.name = name;
        if (description !== undefined) criterion.description = description;
        if (weight !== undefined) criterion.weight = weight;
        if (order !== undefined) criterion.order = order;
        
        const updatedCriterion = await criterion.save();
        res.status(200).json(updatedCriterion);

    } catch (error) {
        console.error('Update Criterion API Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error updating criterion' });
    }
  }
  // --- Handle DELETE: Delete specific criterion (Add later) ---
  // else if (req.method === 'DELETE') { ... }
  
  // --- Handle Other Methods ---
  else {
    res.setHeader('Allow', ['PUT', 'DELETE']); // Add DELETE later
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 