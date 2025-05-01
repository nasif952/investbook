import connectDB from '../../../lib/db';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Read name, phone, position directly from body, not nested profile
  const { name, email, password, role = 'startup', phone, position } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields: name, email, password' });
  }
  // Add more validation as needed (e.g., email format, password strength)

  await connectDB();

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user with fields matching the schema (no nested profile)
    const newUser = new User({
      email,
      password: password, // Pass plain text password here
      role,
      name, // Set top-level name
      phone, // Set top-level phone (optional)
      position, // Set top-level position (optional)
      lastLogin: new Date() // Set initial lastLogin
    });

    await newUser.save();

    // Don't return password hash
    const userResponse = {
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        phone: newUser.phone,
        position: newUser.position,
        createdAt: newUser.createdAt
    }

    res.status(201).json({ message: 'User created successfully', user: userResponse });

  } catch (error) {
    console.error('Registration API Error:', error); // Keep detailed logging
    if (error.name === 'ValidationError') {
        // Construct a more informative error message from Mongoose validation errors
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: `Validation Error: ${messages.join('. ')}` });
    }
    // Use the error message if available, otherwise generic server error
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
} 