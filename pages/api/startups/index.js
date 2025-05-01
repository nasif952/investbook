// pages/api/startups/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from '../../../lib/db';
import Startup from '../../../lib/models/Startup';
import User from '../../../lib/models/User'; // Still needed if populating

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    // Not Signed in
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Now you have access to the user ID and role from the session
  const userId = session.user.id;
  const userRole = session.user.role;

  await connectDB();

  // --- Handle GET for Fetching All Startups (Admin/Sales) ---
  if (req.method === 'GET') {
    // Authorization Check
    if (!['admin', 'sales'].includes(userRole)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    try {
      const startups = await Startup.find({}).populate('userId', 'name email');
      res.status(200).json(startups);
    } catch (error) {
      console.error('Get Startups API Error:', error);
      res.status(500).json({ message: 'Server Error fetching startups' });
    }
  }
  // --- Handle POST for Creating a Startup (Startup Role) ---
  else if (req.method === 'POST') {
    // Authorization Check
    if (userRole !== 'startup') {
      return res.status(403).json({ message: 'Only startup users can create a startup profile' });
    }
    
    // Validation (Basic)
    const { companyName, foundingDate, stage, industry, description, teamSize } = req.body;
    if (!companyName || !foundingDate || !stage || !industry || !description || !teamSize) {
        return res.status(400).json({ message: 'Missing required startup fields' });
    }

    try {
        // Check if user already has a startup
        const existingStartup = await Startup.findOne({ userId: userId });
        if (existingStartup) {
            return res.status(400).json({ message: 'User already has a registered startup' });
        }

        // Create and save the new startup
        const startup = new Startup({
            userId: userId, // Use authenticated user ID from session
            ...req.body, // Spread the rest of the body data
        });

        const createdStartup = await startup.save();
        res.status(201).json(createdStartup);

    } catch (error) {
        console.error('Create Startup API Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error creating startup' });
    }
  }
  // --- Handle Other Methods ---
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 