import mongoose from 'mongoose';

const EvaluationSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: true,
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scores: [
      {
        criterionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'EvaluationCriteria',
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 1,
          max: 10,
        },
      }
    ],
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    comments: String,
    recommendIncubation: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate overall score before save
EvaluationSchema.pre('save', async function (next) {
  // Only calculate if scores are modified or it's a new document
  if (!this.isModified('scores') && !this.isNew) {
      return next();
  }

  if (this.scores && this.scores.length > 0) {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Need to fetch criteria details to get weights
    const criteriaIds = this.scores.map(s => s.criterionId);
    const EvaluationCriteria = mongoose.model('EvaluationCriteria'); // Get model reference

    try {
      const criteriaDetails = await EvaluationCriteria.find({
        _id: { $in: criteriaIds },
        active: true // Only consider active criteria
      }).select('weight'); // Fetch only the weight

      // Create a map for quick lookup: criterionId -> weight
      const weightMap = criteriaDetails.reduce((map, criterion) => {
          map[criterion._id.toString()] = criterion.weight || 0; // Default weight to 0 if missing
          return map;
      }, {});

      // Calculate score using weights from fetched criteria
      this.scores.forEach((scoreItem) => {
        const weight = weightMap[scoreItem.criterionId.toString()] || 0;
        if (weight > 0) { // Only include criteria with weight > 0
            totalWeightedScore += scoreItem.score * weight;
            totalWeight += weight;
        }
      });

      // Avoid division by zero
      const calculatedScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      // Round to a reasonable number of decimal places (e.g., 2)
      this.overallScore = Math.round(calculatedScore * 100) / 100; 
      // Ensure score is within bounds (0-10)
      this.overallScore = Math.max(0, Math.min(10, this.overallScore));

    } catch (error) {
      console.error("Error fetching criteria weights during overall score calculation:", error);
      // Decide how to handle: proceed without score, set to null/0, or pass error
      this.overallScore = undefined; // Or handle error appropriately
      return next(error); // Pass error to Mongoose
    }

  } else {
    // Set overallScore to undefined or 0 if no scores
    this.overallScore = undefined; 
  }
  next();
});

// Avoid recompiling the model
export default mongoose.models.Evaluation || mongoose.model('Evaluation', EvaluationSchema); 