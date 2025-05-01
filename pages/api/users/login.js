// Example: pages/api/users/login.js
// We will populate this later with logic from userController.loginUser
import connectDB from '../../../lib/db'; // Adjust path
import User from '../../../lib/models/User'; // Adjust path
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectDB(); // Ensure DB connection

  const { email, password } = req.body;

  try {
    // --- Logic from userController.loginUser START ---
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d', // Example expiration
        });

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token, // Send token back
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
    // --- Logic from userController.loginUser END ---

  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({ message: 'Server Error during login' });
  }
} 