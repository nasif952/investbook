import mongoose from 'mongoose';

const StartupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User model
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters'],
    },
    foundingDate: {
      type: Date,
      required: [true, 'Please add a founding date'],
    },
    stage: {
      type: String,
      enum: ['idea', 'prototype', 'mvp', 'growth'],
      required: [true, 'Please specify the startup stage'],
    },
    industry: {
      type: String,
      required: [true, 'Please add industry'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    teamSize: {
      type: Number,
      required: [true, 'Please add team size'],
      min: [1, 'Team size must be at least 1'],
    },
    website: String,
    location: String,
    financials: {
      revenue: {
        type: Number,
        default: 0,
      },
      funding: {
        type: Number,
        default: 0,
      },
      burnRate: {
        type: Number,
        default: 0,
      },
    },
    metrics: {
      userBase: {
        type: Number,
        default: 0,
      },
      growthRate: {
        type: Number,
        default: 0,
      },
    },
    documents: [
      {
        name: {
          type: String,
          required: true
        },
        data: {
          type: Buffer,
          required: true
        },
        contentType: {
          type: String,
          required: true
        },
        size: {
          type: Number,
          required: true
        },
        uploadDate: {
          type: Date,
          default: Date.now
        }
      }
    ],
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Avoid recompiling the model
export default mongoose.models.Startup || mongoose.model('Startup', StartupSchema); 