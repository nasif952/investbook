// pages/api/startups/[id].js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from '../../../lib/db';
import Startup from '../../../lib/models/Startup';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { id } = req.query; // Get the startup ID from the dynamic route parameter

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const userRole = session.user.role;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Startup ID format' });
  }

  await connectDB();

  // --- Handle GET for Fetching Startup by ID (Admin/Sales) ---
  if (req.method === 'GET') {
    // Authorization Check
     if (!['admin', 'sales'].includes(userRole)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    try {
      const startup = await Startup.findById(id).populate('userId', 'name email'); 
      if (!startup) {
        return res.status(404).json({ message: 'Startup not found' });
      }
      res.status(200).json(startup);
    } catch (error) {
      console.error('Get Startup by ID API Error:', error);
      if (error.name === 'CastError') {
          return res.status(400).json({ message: 'Invalid Startup ID format' });
      }
      res.status(500).json({ message: 'Server Error fetching startup' });
    }
  }
  // --- Handle PUT for Updating Startup by ID (Requires specific logic/auth) ---
  // else if (req.method === 'PUT') { ... }
  // --- Handle DELETE for Deleting Startup by ID (Requires specific logic/auth) ---
  // else if (req.method === 'DELETE') { ... }
  
  // --- Handle Other Methods ---
  else {
    res.setHeader('Allow', ['GET']); // Adjust allowed methods
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 