import mongoose from 'mongoose';

const EvaluationCriteriaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name for the criteria'],
      trim: true,
      unique: true, // Assuming criteria names should be unique
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    weight: {
      type: Number,
      required: [true, 'Please add a weight'],
      default: 1,
      min: [0, 'Weight cannot be negative'], // Add basic validation
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Avoid recompiling the model
export default mongoose.models.EvaluationCriteria || mongoose.model('EvaluationCriteria', EvaluationCriteriaSchema); 