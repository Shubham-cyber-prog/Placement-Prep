import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  activityType: {
    type: String,
    required: true,
    enum: [
      // Test activities
      "test_started", "test_completed", "test_paused", "test_resumed",
      "question_answered", "question_flagged", "question_reviewed",
      "test_submitted", "test_reset",
      
      // Learning activities
      "video_watched", "article_read", "course_started", "course_completed",
      "concept_mastered", "topic_studied",
      
      // Progress activities
      "skill_improved", "level_up", "achievement_unlocked", "streak_maintained",
      "daily_goal_completed", "weekly_goal_completed",
      
      // User activities
      "profile_updated", "preferences_changed", "subscription_upgraded",
      
      // System activities
      "login", "logout", "session_started", "session_ended"
    ]
  },
  
  metadata: {
    testId: String,
    testName: String,
    testCategory: String,
    testDifficulty: String,
    questionId: String,
    questionIndex: Number,
    answerSelected: Number,
    correctAnswer: Number,
    timeSpent: Number,
    score: Number,
    accuracy: Number,
    skillName: String,
    skillLevel: Number,
    achievementId: String,
    achievementName: String,
    streakCount: Number,
    duration: Number,
    completionPercentage: Number,
    ipAddress: String,
    userAgent: String,
    deviceType: String
  },
  
  performanceMetrics: {
    speed: Number,
    accuracy: Number,
    consistency: Number,
    engagement: Number
  },
  
  tags: [String],
  
  visibility: {
    type: String,
    enum: ["public", "private", "friends_only"],
    default: "private"
  },
  
  context: {
    sessionId: String,
    batchId: String,
    learningPath: String,
    currentModule: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  isAnalyzed: {
    type: Boolean,
    default: false
  },
  
  retentionPeriod: {
    type: String,
    enum: ["7d", "30d", "90d", "1y", "permanent"],
    default: "1y"
  }
}, {
  timestamps: true
});

// Indexes for better performance
activitySchema.index({ userId: 1, activityType: 1 });
activitySchema.index({ "metadata.testCategory": 1 });
activitySchema.index({ createdAt: -1 });

// Virtual for activity age in days
activitySchema.virtual("ageInDays").get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
activitySchema.pre("save", function(next) {
  this.updatedAt = new Date();
  
  // Auto-generate tags based on activity type
  if (!this.tags || this.tags.length === 0) {
    this.tags = [];
    
    if (this.activityType.includes("test")) {
      this.tags.push("test");
    }
    
    if (this.activityType.includes("question")) {
      this.tags.push("question");
    }
    
    if (this.activityType.includes("skill")) {
      this.tags.push("skill");
    }
    
    if (this.metadata?.testCategory) {
      this.tags.push(this.metadata.testCategory.toLowerCase());
    }
    
    if (this.metadata?.skillName) {
      this.tags.push(this.metadata.skillName.toLowerCase().replace(/\s+/g, "-"));
    }
  }
  
  next();
});

// Instance methods
activitySchema.methods.getActivityDetails = function() {
  const details = {
    type: this.activityType,
    timestamp: this.createdAt,
    user: this.userId
  };
  
  if (this.metadata) {
    Object.assign(details, this.metadata);
  }
  
  return details;
};

// Static methods
activitySchema.statics.getUserActivities = async function(userId, filters = {}) {
  const {
    startDate,
    endDate,
    activityType,
    tags,
    page = 1,
    limit = 50,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = filters;
  
  const query = { userId };
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  if (activityType) query.activityType = activityType;
  if (tags && tags.length > 0) query.tags = { $in: tags };
  
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  
  const [activities, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    activities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;