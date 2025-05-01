import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '../../../lib/db';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        await connectDB();

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        const user = await User.findOne({ email: credentials.email }).select('+password'); // Ensure password is selected

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isMatch) {
          throw new Error('Invalid password');
        }

        // Update lastLogin timestamp (optional, consider error handling)
        try {
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false }); // Save without full validation if only updating lastLogin
        } catch (err) {
          console.error("Failed to update lastLogin:", err);
        }
        
        console.log("Credentials valid, returning user", { _id: user._id, email: user.email, role: user.role, name: user.profile?.name }); // Log what's returned
        
        // Return necessary user info for JWT/session callbacks
        // Ensure _id is included
        return {
          id: user._id.toString(), // Convert ObjectId to string
          email: user.email,
          role: user.role,
          name: user.profile?.name // Get name from profile
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // The user object is only passed on initial sign-in
      if (user) {
        token.sub = user.id; // Standard JWT subject claim (user ID)
        token.role = user.role;
        token.email = user.email; // Include email if needed
        token.name = user.name;   // Include name (from profile)
      }
      return token;
    },
    async session({ session, token, user }) {
      // Add info from the token (populated by jwt callback) to the session object
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.email = token.email; // Ensure email is passed if needed
      session.user.name = token.name;   // Pass name from token
      // Do NOT include password or other sensitive info
      return session;
    }
  },
  session: {
    strategy: 'jwt', // Use JWT for session management
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for JWT signing
  pages: {
    signIn: '/login', // Redirect users to /login if unauthorized
    // error: '/auth/error', // Optional: Custom error page
  },
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions); 