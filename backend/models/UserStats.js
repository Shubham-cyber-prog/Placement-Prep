import mongoose from "mongoose";

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Overall Stats
  totalQuestions: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  totalTests: {
    type: Number,
    default: 0
  },
  
  // Category-wise Performance
  categoryPerformance: [{
    category: {
      type: String,
      enum: ['Data Structures', 'Algorithms', 'System Design', 'Frontend', 'Backend', 'Databases', 'OOP', 'Networking', 'Security', 'Testing']
    },
    questionsAttempted: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    }
  }],
  
  // Daily Activity
  dailyActivity: [{
    date: {
      type: Date,
      default: Date.now
    },
    questionsSolved: {
      type: Number,
      default: 0
    },
    testsTaken: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0
    }
  }],
  
  // Streaks & Consistency
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  consistencyScore: {
    type: Number,
    default: 0
  },
  
  // Skill Levels
  skillLevels: [{
    skill: {
      type: String,
      enum: ['Data Structures', 'Algorithms', 'System Design', 'Frontend', 'Backend', 'Databases', 'OOP', 'Networking', 'Security', 'Testing']
    },
    level: {
      type: Number,
      min: 1,
      max: 10,
      default: 1
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  
  // Achievements
  achievements: [{
    achievementId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Rankings
  globalRank: {
    type: Number,
    default: 0
  },
  percentile: {
    type: Number,
    default: 0
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userStatsSchema.index({ userId: 1 });
userStatsSchema.index({ globalRank: 1 });
userStatsSchema.index({ consistencyScore: -1 });

// Methods
userStatsSchema.methods.updateStats = function(testResult) {
  this.totalTests += 1;
  this.totalQuestions += testResult.totalQuestions || 0;
  this.correctAnswers += testResult.correctAnswers || 0;
  
  if (testResult.category) {
    const categoryIndex = this.categoryPerformance.findIndex(cp => cp.category === testResult.category);
    if (categoryIndex >= 0) {
      this.categoryPerformance[categoryIndex].questionsAttempted += testResult.totalQuestions || 0;
      this.categoryPerformance[categoryIndex].correctAnswers += testResult.correctAnswers || 0;
    }
  }
  
  this.averageScore = this.totalQuestions > 0 
    ? Math.round((this.correctAnswers / this.totalQuestions) * 100) 
    : 0;
  
  this.lastUpdated = new Date();
  return this.save();
};

// Static Methods
userStatsSchema.statics.getLeaderboard = async function(limit = 10) {
  return this.find()
    .populate('userId', 'name email')
    .sort({ consistencyScore: -1, averageScore: -1 })
    .limit(limit)
    .select('userId totalQuestions averageScore currentStreak consistencyScore globalRank');
};

userStatsSchema.statics.createDefaultStats = function(userId) {
  const defaultSkills = ['Data Structures', 'Algorithms', 'System Design', 'Frontend', 'Backend'].map(skill => ({
    skill,
    level: 1,
    progress: 0
  }));

  const defaultCategories = ['Data Structures', 'Algorithms', 'System Design'].map(category => ({
    category,
    questionsAttempted: 0,
    correctAnswers: 0,
    averageScore: 0
  }));

  return new this({
    userId,
    skillLevels: defaultSkills,
    categoryPerformance: defaultCategories,
    dailyActivity: []
  });
};

const UserStats = mongoose.model('UserStats', userStatsSchema);
export default UserStats;