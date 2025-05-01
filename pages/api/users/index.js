import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; // Adjust path as needed
import connectDB from '../../../lib/db'; // Adjust path
import User from '../../../lib/models/User'; // Adjust path
import bcrypt from 'bcryptjs'; // Needed if hashing password here, but model does it
import jwt from 'jsonwebtoken'; // Needed for token generation
// import { protect, authorize } from '../../../lib/middleware/auth'; // Need to adapt middleware later

// Utility to generate JWT token (can likely be removed if relying on next-auth session)
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: '30d',
//   });
// };

export default async function handler(req, res) {
  // Get session MUST be the first step for protected routes
  const session = await getServerSession(req, res, authOptions);

  await connectDB(); // Ensure DB connection

  // --- Handle POST for Registration (Public Route - No session needed initially) ---
  if (req.method === 'POST') {
    const { email, password, name, role, phone, position } = req.body;

    // Basic validation 
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Missing required fields: email, password, name' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    // Allow admin to specify role, otherwise default
    const assignedRole = (session?.user?.role === 'admin' && role) ? role : 'startup';
    if (role && !['startup', 'sales', 'admin'].includes(assignedRole)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    try {
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const user = await User.create({
        email,
        password,
        name,
        phone: phone || '',
        position: position || '',
        role: assignedRole,
      });

      if (user) {
        // Return created user data (excluding password)
        // Consider NOT returning a token here, let user login separately after register
        // Or, sign them in using next-auth programmatically if desired
        res.status(201).json({
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          position: user.position,
          // token: generateToken(user._id), // Removed: Let next-auth handle sessions
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' }); 
      }
    } catch (error) {
        console.error('Registration API Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server Error during registration' });
    }
  }
  // --- Handle GET for Fetching Users (Admin Only) ---
  else if (req.method === 'GET') {
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
       return res.status(403).json({ message: 'Not authorized' });
    }
    
    try {
      const users = await User.find({}); // Find all users
      res.status(200).json(users);
    } catch (error) {
      console.error('Get Users API Error:', error);
      res.status(500).json({ message: 'Server Error fetching users' });
    }
  }
  // --- Handle Other Methods ---
  else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 