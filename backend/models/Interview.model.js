import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'system-design', 'hr', 'mock', 'ai'],
    required: true
  },
  company: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  questions: [{
    question: String,
    answer: String,
    evaluation: {
      score: Number,
      feedback: String,
      suggestions: [String]
    },
    timeTaken: Number,
    category: String,
    difficulty: String
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    strengths: [String],
    areasToImprove: [String],
    overallFeedback: String,
    recommendedResources: [String]
  },
  recordingUrl: String,
  aiAnalysis: {
    sentiment: String,
    confidence: Number,
    communicationScore: Number,
    technicalScore: Number,
    behavioralScore: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

interviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Interview', interviewSchema);