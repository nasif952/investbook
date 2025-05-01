import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from '../../../lib/db';
import Startup from '../../../lib/models/Startup';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Authorization: Only startup users have a profile endpoint like this
  if (session.user.role !== 'startup') {
     return res.status(403).json({ message: 'Only startup users can access their profile here' });
  }

  const userId = session.user.id; // Get user ID from session

  await connectDB();

  // --- Handle GET for Fetching Logged-in User's Startup Profile ---
  if (req.method === 'GET') {
    try {
      const startup = await Startup.findOne({ userId: userId });
      if (!startup) {
        return res.status(404).json({ message: 'Startup profile not found for this user.' });
      }
      res.status(200).json(startup);
    } catch (error) {
      console.error('Get Startup Profile API Error:', error);
      res.status(500).json({ message: 'Server Error fetching startup profile' });
    }
  }
  // --- Handle PUT for Updating Logged-in User's Startup Profile ---
  else if (req.method === 'PUT') {
    try {
      // Use findOneAndUpdate for atomic update and validation
      const updatedStartup = await Startup.findOneAndUpdate(
        { userId: userId }, // Find the startup by the logged-in user's ID
        { $set: req.body }, // Apply the updates from the request body ($set handles nested fields)
        {
          new: true, // Return the updated document
          runValidators: true, // Ensure schema validation is run
          context: 'query' // Important for some validators, good practice
        }
      );

      if (!updatedStartup) {
        return res.status(404).json({ message: 'Startup profile not found to update' });
      }

      res.status(200).json(updatedStartup);

    } catch (error) {
      console.error('Update Startup Profile API Error:', error);
        if (error.name === 'ValidationError') {
            // Provide more specific validation error details if possible
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
              message: 'Validation Error', 
              errors: messages.length > 0 ? messages : ['Invalid input data'] 
            });
        }
      res.status(500).json({ message: 'Server Error updating startup profile' });
    }
  }
  // --- Handle Other Methods ---
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 