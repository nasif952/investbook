// lib/db.js - Utility for connecting to MongoDB in Next.js API routes
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env.local or Vercel environment variables'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // useNewUrlParser and useUnifiedTopology are deprecated but added for compatibility if needed
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    };

    console.log('Attempting MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB Connected Successfully!');
      return mongoose;
    }).catch(err => {
        console.error('MongoDB Connection Error:', err);
        cached.promise = null; // Reset promise on error
        throw err; // Re-throw error to be caught by API route handler
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Ensure promise is cleared on error
    throw error; // Re-throw error
  }
  
  return cached.conn;
}

export default connectDB; 