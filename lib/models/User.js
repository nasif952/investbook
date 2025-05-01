import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Keep password hidden by default
    },
    role: {
      type: String,
      enum: ['startup', 'sales', 'admin'],
      default: 'startup',
    },
    // Changed profile structure slightly for Next.js simplicity if needed, or keep as is
    name: { // Moved name out of profile for direct access
      type: String,
      required: [true, 'Please add a name'],
    },
    phone: String, // Moved phone out of profile
    position: String, // Moved position out of profile
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Ensure next() is called
});

// Match user entered password to hashed password in database
// Note: This method is less needed if using bcrypt.compare directly in API route
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Avoid recompiling the model if it already exists
export default mongoose.models.User || mongoose.model('User', UserSchema); 