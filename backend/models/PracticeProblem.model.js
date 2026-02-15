// models/PracticeProblem.model.js
import mongoose from "mongoose";

const practiceProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  testCases: [{
    input: String,
    output: String,
    isHidden: {
      type: Boolean,
      default: false
    }
  }],
  constraints: [{
    type: String
  }],
  solution: {
    type: String
  },
  timeLimit: {
    type: Number,
    default: 2 // seconds
  },
  memoryLimit: {
    type: Number,
    default: 256 // MB
  },
  submissions: {
    type: Number,
    default: 0
  },
  accepted: {
    type: Number,
    default: 0
  },
  acceptanceRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate acceptance rate before saving
practiceProblemSchema.pre('save', function(next) {
  if (this.submissions > 0) {
    this.acceptanceRate = (this.accepted / this.submissions) * 100;
  }
  next();
});

export default mongoose.model("PracticeProblem", practiceProblemSchema);