import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from '../../../lib/db';
import EvaluationCriteria from '../../../lib/models/EvaluationCriteria';
import User from '../../../lib/models/User'; // Needed for populating

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  // GET route might be accessible without session depending on requirements
  // Let's assume read access is allowed for sales/admin, write only for admin

  await connectDB();

  // --- Handle GET: Fetch all criteria (Admin/Sales) ---
  if (req.method === 'GET') {
    // Allow if admin or sales
    if (!session || !['admin', 'sales'].includes(session.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const userRole = session.user.role;

    try {
      // Filter active criteria only for sales team
      const filter = userRole === 'sales' ? { active: true } : {};
      const criteria = await EvaluationCriteria.find(filter)
        .populate('createdBy', 'name email') 
        .sort({ createdAt: -1 }); 
      res.status(200).json(criteria);
    } catch (error) {
      console.error('Get All Criteria API Error:', error);
      res.status(500).json({ message: 'Server Error fetching evaluation criteria' });
    }
  }
  // --- Handle POST: Create criteria (Admin only) ---
  else if (req.method === 'POST') {
    // Requires Admin role
    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create criteria' });
    }
    const userId = session.user.id;

    const { name, description, weight } = req.body;
    if (!name || !description || weight === undefined) {
      return res.status(400).json({ message: 'Missing required fields: name, description, weight' });
    }

    try {
      const newCriteria = new EvaluationCriteria({
        name,
        description,
        weight,
        createdBy: userId, // Use authenticated user ID
      });
      const savedCriteria = await newCriteria.save();
      res.status(201).json(savedCriteria);
    } catch (error) {
        console.error('Create Criteria API Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: `Criteria with name '${name}' already exists` });
        }
        res.status(500).json({ message: 'Server Error creating evaluation criteria' });
    }
  }
  // --- Handle Other Methods ---
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 