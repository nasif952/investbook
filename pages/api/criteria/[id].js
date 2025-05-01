import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import connectDB from '../../../lib/db';
import EvaluationCriteria from '../../../lib/models/EvaluationCriteria';
import User from '../../../lib/models/User'; // Needed for populating
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { id } = req.query; 
  
  const session = await getServerSession(req, res, authOptions);
  // Read access might be allowed for sales, write only for admin

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Criteria ID format' });
  }

  await connectDB();

  // --- Handle GET: Fetch specific criteria (Admin/Sales) ---
  if (req.method === 'GET') {
     if (!session || !['admin', 'sales'].includes(session.user.role)) {
        return res.status(403).json({ message: 'Not authorized' });
    }
    const userRole = session.user.role;
    try {
        const criteria = await EvaluationCriteria.findById(id)
            .populate('createdBy', 'name email');
        if (!criteria) {
            return res.status(404).json({ message: 'Criteria not found' });
        }
        // Sales can only see active criteria
        if (userRole === 'sales' && !criteria.active) {
            return res.status(404).json({ message: 'Criteria not found' });
        }
        res.status(200).json(criteria);
    } catch (error) {
        console.error('Get Criteria By ID API Error:', error);
        res.status(500).json({ message: 'Server Error fetching criteria' });
    }
  }
  // --- Handle PUT: Update specific criteria (Admin only) ---
  else if (req.method === 'PUT') {
    // Authorization: Admin only
     if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update criteria' });
    }
    const { name, description, weight, active } = req.body;
    try {
        let criteria = await EvaluationCriteria.findById(id);
        if (!criteria) {
            return res.status(404).json({ message: 'Criteria not found' });
        }
        // Update fields if provided
        if (name !== undefined) criteria.name = name;
        if (description !== undefined) criteria.description = description;
        if (weight !== undefined) criteria.weight = weight;
        if (active !== undefined) criteria.active = active;
        const updatedCriteria = await criteria.save();
        res.status(200).json(updatedCriteria);
    } catch (error) {
        console.error('Update Criteria API Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: `Criteria with name '${name}' already exists` });
        }
        res.status(500).json({ message: 'Server Error updating criteria' });
    }
  }
  // --- Handle DELETE: Delete specific criteria (Admin only) ---
  else if (req.method === 'DELETE') {
    // Authorization: Admin only
     if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete criteria' });
    }
    try {
        const criteria = await EvaluationCriteria.findById(id);
        if (!criteria) {
            return res.status(404).json({ message: 'Criteria not found' });
        }
        await criteria.deleteOne(); 
        res.status(200).json({ message: 'Criteria deleted successfully' });
    } catch (error) {
        console.error('Delete Criteria API Error:', error);
        res.status(500).json({ message: 'Server Error deleting criteria' });
    }
  }
  // --- Handle Other Methods ---
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 