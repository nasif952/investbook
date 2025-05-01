import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from '../../../lib/db';
import User from '../../../lib/models/User';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const userId = session.user.id;

  // Ensure userId is valid before proceeding
  if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format in session' });
  }

  await connectDB();

  // --- Handle GET: Fetch user profile ---
  if (req.method === 'GET') {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Return relevant fields, including the nested profile
      res.status(200).json({
        email: user.email,
        role: user.role,
        profile: user.profile
      });
    } catch (error) {
      console.error('Get Profile API Error:', error);
      res.status(500).json({ message: 'Server Error fetching profile' });
    }
  }
  // --- Handle PUT: Update user profile ---
  else if (req.method === 'PUT') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { profile, /* other fields like email if allowed */ } = req.body;

      // Update profile fields if provided
      if (profile) {
        if (profile.name !== undefined) user.profile.name = profile.name;
        if (profile.phone !== undefined) user.profile.phone = profile.phone;
        if (profile.position !== undefined) user.profile.position = profile.position;
        // Add more profile fields here if needed
      }
      
      // Handle password change separately if needed (requires current password)
      // Handle email change separately if needed (might require verification)

      const updatedUser = await user.save();
      
      // Return updated info (excluding password)
      res.status(200).json({
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile
      });

    } catch (error) {
      console.error('Update Profile API Error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server Error updating profile' });
    }
  }
  // --- Handle Other Methods ---
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 