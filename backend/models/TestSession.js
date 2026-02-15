import mongoose from "mongoose";

const testSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  testId: {
    type: String,
    required: true,
    index: true
  },
  
  testName: {
    type: String,
    required: true
  },
  
  testCategory: {
    type: String,
    required: true,
    enum: [
      "Quantitative Aptitude",
      "Logical Reasoning", 
      "Verbal Ability",
      "Technical Core",
      "Coding Concepts",
      "Data Structures",
      "System Design",
      "Behavioral",
      "General"
    ]
  },
  
  testDifficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard", "Advanced"],
    default: "Medium"
  },
  
  testTags: [String],
  
  status: {
    type: String,
    enum: ["in_progress", "completed", "paused", "abandoned", "timed_out"],
    default: "completed"
  },
  
  startTime: {
    type: Date,
    default: Date.now
  },
  
  endTime: Date,
  
  totalDuration: Number,
  
  questions: [{
    questionId: String,
    questionIndex: Number,
    category: String,
    difficulty: String,
    userAnswer: Number,
    correctAnswer: Number,
    timeSpent: Number,
    isFlagged: Boolean,
    isReviewed: Boolean,
    isCorrect: Boolean
  }],
  
  performance: {
    totalQuestions: Number,
    answeredQuestions: Number,
    correctAnswers: Number,
    incorrectAnswers: Number,
    skippedQuestions: Number,
    flaggedQuestions: Number,
    averageTimePerQuestion: Number,
    accuracy: Number,
    categoryAccuracy: mongoose.Schema.Types.Mixed,
    difficultyAccuracy: mongoose.Schema.Types.Mixed
  },
  
  scores: {
    rawScore: Number,
    normalizedScore: Number,
    percentile: Number,
    passingScore: Number,
    isPassed: Boolean
  },
  
  insights: [{
    type: String,
    title: String,
    description: String,
    recommendation: String,
    priority: String
  }],
  
  recommendations: [{
    skill: String,
    resourceType: String,
    resourceId: String,
    reason: String,
    priority: Number
  }],
  
  environment: {
    browser: String,
    os: String,
    device: String,
    screenResolution: String,
    networkType: String
  },
  
  isArchived: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
testSessionSchema.index({ userId: 1, testCategory: 1 });
testSessionSchema.index({ "scores.normalizedScore": -1 });
testSessionSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate performance
testSessionSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  
  if (!this.endTime && this.status === "completed") {
    this.endTime = new Date();
  }
  
  if (this.endTime && this.startTime) {
    this.totalDuration = Math.floor((this.endTime - this.startTime) / 1000); // in seconds
  }
  
  // Auto-calculate performance if not provided
  if (!this.performance && this.questions && this.questions.length > 0) {
    this.calculatePerformance();
  }
  
  next();
});

// Instance method to calculate performance
testSessionSchema.methods.calculatePerformance = function() {
  const questions = this.questions || [];
  
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(q => q.userAnswer !== undefined && q.userAnswer !== null).length;
  const correctAnswers = questions.filter(q => q.isCorrect).length;
  const incorrectAnswers = answeredQuestions - correctAnswers;
  const skippedQuestions = totalQuestions - answeredQuestions;
  const flaggedQuestions = questions.filter(q => q.isFlagged).length;
  
  const totalTime = questions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);
  const avgTimePerQuestion = answeredQuestions > 0 ? totalTime / answeredQuestions : 0;
  
  const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
  
  // Calculate category accuracy
  const categoryStats = {};
  questions.forEach(q => {
    if (q.category) {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { total: 0, correct: 0 };
      }
      categoryStats[q.category].total++;
      if (q.isCorrect) categoryStats[q.category].correct++;
    }
  });
  
  const categoryAccuracy = {};
  Object.keys(categoryStats).forEach(cat => {
    categoryAccuracy[cat] = categoryStats[cat].total > 0 
      ? (categoryStats[cat].correct / categoryStats[cat].total) * 100 
      : 0;
  });
  
  // Calculate difficulty accuracy
  const difficultyStats = {};
  questions.forEach(q => {
    if (q.difficulty) {
      if (!difficultyStats[q.difficulty]) {
        difficultyStats[q.difficulty] = { total: 0, correct: 0 };
      }
      difficultyStats[q.difficulty].total++;
      if (q.isCorrect) difficultyStats[q.difficulty].correct++;
    }
  });
  
  const difficultyAccuracy = {};
  Object.keys(difficultyStats).forEach(diff => {
    difficultyAccuracy[diff] = difficultyStats[diff].total > 0
      ? (difficultyStats[diff].correct / difficultyStats[diff].total) * 100
      : 0;
  });
  
  this.performance = {
    totalQuestions,
    answeredQuestions,
    correctAnswers,
    incorrectAnswers,
    skippedQuestions,
    flaggedQuestions,
    averageTimePerQuestion: Math.round(avgTimePerQuestion),
    accuracy: Math.round(accuracy),
    categoryAccuracy,
    difficultyAccuracy
  };
  
  // Calculate scores
  this.scores = this.scores || {};
  this.scores.rawScore = correctAnswers;
  this.scores.normalizedScore = Math.round(accuracy);
  this.scores.passingScore = this.scores.passingScore || 70;
  this.scores.isPassed = this.scores.normalizedScore >= this.scores.passingScore;
  
  return this;
};

// Static method to get user test sessions
testSessionSchema.statics.getUserTestSessions = async function(userId, filters = {}) {
  const {
    startDate,
    endDate,
    testCategory,
    status,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = filters;
  
  const query = { userId };
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  if (testCategory) query.testCategory = testCategory;
  if (status) query.status = status;
  
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  
  const [sessions, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    sessions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const TestSession = mongoose.model("TestSession", testSessionSchema);
export default TestSession;