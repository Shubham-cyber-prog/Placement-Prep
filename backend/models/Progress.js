import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  // Skill Proficiency Tracking
  skillProficiency: [{
    skillName: {
      type: String,
      required: true,
      enum: ['Data Structures', 'System Design', 'Frontend', 'Backend', 'Databases', 'Algorithms']
    },
    proficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    history: [{
      proficiency: Number,
      date: { 
        type: Date, 
        default: Date.now 
      }
    }]
  }],
  
  // Test History
  testHistory: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    testName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0
    },
    totalScore: {
      type: Number,
      required: true,
      min: 1
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100
    },
    duration: {
      type: Number, // in minutes
      min: 0
    },
    date: { 
      type: Date, 
      default: Date.now 
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard']
    },
    topics: [String],
    timePerQuestion: Number // in seconds
  }],
  
  // Daily/Weekly Tracking
  dailyStats: {
    questionsSolved: { 
      type: Number, 
      default: 0 
    },
    timeSpent: { 
      type: Number, 
      default: 0 
    }, // in minutes
    accuracy: { 
      type: Number, 
      default: 0 
    },
    streak: { 
      type: Number, 
      default: 0 
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  
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
    unlocked: { 
      type: Boolean, 
      default: false 
    },
    unlockedAt: Date,
    progress: { 
      type: Number, 
      default: 0 
    },
    totalRequired: { 
      type: Number, 
      default: 1 
    }
  }],
  
  // Study Analytics
  studyAnalytics: {
    totalQuestionsAttempted: { 
      type: Number, 
      default: 0 
    },
    totalTestsTaken: { 
      type: Number, 
      default: 0 
    },
    averageAccuracy: { 
      type: Number, 
      default: 0 
    },
    averageTimePerQuestion: { 
      type: Number, 
      default: 0 
    },
    consistencyScore: { 
      type: Number, 
      default: 0 
    },
    estimatedReadiness: { 
      type: Number, 
      default: 0 
    },
    strongestTopics: [{
      topic: String,
      score: Number
    }],
    weakAreas: [{
      topic: String,
      score: Number
    }]
  },
  
  // Career Projection
  careerProjection: {
    productCompanies: {
      matchPercentage: { 
        type: Number, 
        default: 0 
      },
      readinessLevel: { 
        type: Number, 
        default: 0 
      },
      estimatedMonths: { 
        type: Number, 
        default: 12 
      }
    },
    earlyStartups: {
      matchPercentage: { 
        type: Number, 
        default: 0 
      },
      readinessLevel: { 
        type: Number, 
        default: 0 
      },
      estimatedMonths: { 
        type: Number, 
        default: 6 
      }
    },
    quantTrading: {
      matchPercentage: { 
        type: Number, 
        default: 0 
      },
      readinessLevel: { 
        type: Number, 
        default: 0 
      },
      estimatedMonths: { 
        type: Number, 
        default: 18 
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true 
  }
});

// Indexes for better query performance
progressSchema.index({ userId: 1, 'testHistory.date': -1 });
progressSchema.index({ 'skillProficiency.skillName': 1 });
progressSchema.index({ 'achievements.unlocked': 1 });
progressSchema.index({ 'dailyStats.lastActive': -1 });

// Virtual for consistency days
progressSchema.virtual('consistencyDays').get(function() {
  if (!this.dailyStats.lastActive) return 0;
  
  const today = new Date();
  const lastActive = new Date(this.dailyStats.lastActive);
  const diffTime = Math.abs(today - lastActive);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.min(this.dailyStats.streak || 0, diffDays === 0 ? this.dailyStats.streak + 1 : 1);
});

// Pre-save middleware
progressSchema.pre('save', function(next) {
  // Update lastActive timestamp
  this.dailyStats.lastActive = new Date();
  
  // Calculate accuracy if not provided
  if (this.testHistory.length > 0) {
    const latestTest = this.testHistory[this.testHistory.length - 1];
    if (!latestTest.accuracy && latestTest.totalScore > 0) {
      latestTest.accuracy = (latestTest.score / latestTest.totalScore) * 100;
    }
  }
  
  // Recalculate analytics
  this.updateAnalytics();
  
  next();
});

// Method to update daily streak
progressSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = this.dailyStats.lastActive;
  
  if (!lastActive) {
    this.dailyStats.streak = 1;
  } else {
    const lastActiveDate = new Date(lastActive);
    lastActiveDate.setHours(0, 0, 0, 0);
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((todayDate - lastActiveDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day
      this.dailyStats.streak += 1;
    } else if (diffDays > 1) {
      // Streak broken
      this.dailyStats.streak = 1;
    }
    // diffDays === 0 means same day, keep streak as is
  }
  
  this.dailyStats.lastActive = today;
  return this.dailyStats.streak;
};

// Method to add test result
progressSchema.methods.addTestResult = async function(testData) {
  // Generate testId if not provided
  if (!testData.testId) {
    testData.testId = new mongoose.Types.ObjectId();
  }
  
  // Calculate accuracy if not provided
  if (!testData.accuracy && testData.totalScore > 0) {
    testData.accuracy = (testData.score / testData.totalScore) * 100;
  }
  
  // Set date if not provided
  if (!testData.date) {
    testData.date = new Date();
  }
  
  // Add to test history
  this.testHistory.push(testData);
  
  // Update daily stats
  this.dailyStats.questionsSolved += testData.totalScore || 0;
  this.dailyStats.timeSpent += testData.duration || 0;
  
  // Update streak
  this.updateStreak();
  
  // Update skill proficiency if test has topics
  if (testData.topics && testData.topics.length > 0) {
    this.updateSkillProficiency(testData.topics, testData.accuracy || 0);
  }
  
  // Update achievements
  await this.checkAchievements();
  
  // Update analytics
  this.updateAnalytics();
  
  await this.save();
  return this;
};

// Method to update skill proficiency
progressSchema.methods.updateSkillProficiency = function(topics, accuracy) {
  const proficiencyIncrease = accuracy / 20; // 5% per 100% accuracy
  
  topics.forEach(topic => {
    const skillIndex = this.skillProficiency.findIndex(s => s.skillName === topic);
    
    if (skillIndex >= 0) {
      // Update existing skill
      const currentProficiency = this.skillProficiency[skillIndex].proficiency;
      const newProficiency = Math.min(100, currentProficiency + proficiencyIncrease);
      
      this.skillProficiency[skillIndex].proficiency = newProficiency;
      this.skillProficiency[skillIndex].lastUpdated = new Date();
      this.skillProficiency[skillIndex].history.push({
        proficiency: newProficiency,
        date: new Date()
      });
      
      // Keep only last 10 history entries
      if (this.skillProficiency[skillIndex].history.length > 10) {
        this.skillProficiency[skillIndex].history = this.skillProficiency[skillIndex].history.slice(-10);
      }
    } else {
      // Add new skill
      this.skillProficiency.push({
        skillName: topic,
        proficiency: proficiencyIncrease,
        lastUpdated: new Date(),
        history: [{
          proficiency: proficiencyIncrease,
          date: new Date()
        }]
      });
    }
  });
};

// Method to update analytics
progressSchema.methods.updateAnalytics = function() {
  const tests = this.testHistory;
  
  if (tests.length === 0) return;
  
  // Calculate averages
  const totalAccuracy = tests.reduce((sum, test) => sum + (test.accuracy || 0), 0);
  const totalTime = tests.reduce((sum, test) => sum + (test.timePerQuestion || 0), 0);
  const totalQuestions = tests.reduce((sum, test) => sum + (test.totalScore || 0), 0);
  
  this.studyAnalytics.totalTestsTaken = tests.length;
  this.studyAnalytics.totalQuestionsAttempted = totalQuestions;
  this.studyAnalytics.averageAccuracy = totalAccuracy / tests.length;
  this.studyAnalytics.averageTimePerQuestion = totalTime / tests.length;
  
  // Calculate consistency score (based on last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentTests = tests.filter(test => new Date(test.date) >= thirtyDaysAgo);
  const uniqueDays = new Set(recentTests.map(test => 
    new Date(test.date).toDateString()
  )).size;
  
  this.studyAnalytics.consistencyScore = Math.min(100, (uniqueDays / 30) * 100);
  
  // Update estimated readiness (1-5 scale based on average accuracy)
  this.studyAnalytics.estimatedReadiness = Math.min(
    5,
    Math.floor(this.studyAnalytics.averageAccuracy / 20) + 1
  );
  
  // Update strongest topics and weak areas
  this.updateTopicAnalysis();
  
  // Update career projection
  this.updateCareerProjection();
};

// Method to update topic analysis
progressSchema.methods.updateTopicAnalysis = function() {
  const topicScores = {};
  
  // Collect all topics and their average scores
  this.testHistory.forEach(test => {
    if (test.topics && test.accuracy) {
      test.topics.forEach(topic => {
        if (!topicScores[topic]) {
          topicScores[topic] = { total: 0, count: 0 };
        }
        topicScores[topic].total += test.accuracy;
        topicScores[topic].count += 1;
      });
    }
  });
  
  // Calculate averages and sort
  const topicAverages = Object.entries(topicScores).map(([topic, data]) => ({
    topic,
    score: data.total / data.count
  })).sort((a, b) => b.score - a.score);
  
  // Set strongest topics (top 3)
  this.studyAnalytics.strongestTopics = topicAverages.slice(0, 3);
  
  // Set weak areas (bottom 3)
  this.studyAnalytics.weakAreas = topicAverages.slice(-3).reverse();
};

// Method to update career projection
progressSchema.methods.updateCareerProjection = function() {
  const baseScore = this.studyAnalytics.averageAccuracy;
  const consistency = this.studyAnalytics.consistencyScore;
  
  // Weighted score considering both accuracy and consistency
  const weightedScore = (baseScore * 0.7) + (consistency * 0.3);
  
  this.careerProjection = {
    productCompanies: {
      matchPercentage: Math.min(100, Math.round(weightedScore * 1.1)),
      readinessLevel: Math.min(5, Math.floor(weightedScore / 20) + 1),
      estimatedMonths: Math.max(1, Math.floor(12 - (weightedScore / 10)))
    },
    earlyStartups: {
      matchPercentage: Math.min(100, Math.round(weightedScore * 0.9)),
      readinessLevel: Math.min(5, Math.floor(weightedScore / 25) + 1),
      estimatedMonths: Math.max(1, Math.floor(6 - (weightedScore / 20)))
    },
    quantTrading: {
      matchPercentage: Math.min(100, Math.round(weightedScore * 0.7)),
      readinessLevel: Math.min(5, Math.floor(weightedScore / 30) + 1),
      estimatedMonths: Math.max(1, Math.floor(18 - (weightedScore / 15)))
    }
  };
};

// Method to check and update achievements
progressSchema.methods.checkAchievements = async function() {
  const achievements = this.achievements;
  
  // First test achievement
  const firstTest = achievements.find(a => a.achievementId === 'first_test');
  if (firstTest && !firstTest.unlocked && this.testHistory.length >= 1) {
    firstTest.unlocked = true;
    firstTest.unlockedAt = new Date();
    firstTest.progress = 1;
  }
  
  // 7-day streak achievement
  const streak7 = achievements.find(a => a.achievementId === 'streak_7');
  if (streak7) {
    streak7.progress = Math.min(7, this.dailyStats.streak || 0);
    if (this.dailyStats.streak >= 7 && !streak7.unlocked) {
      streak7.unlocked = true;
      streak7.unlockedAt = new Date();
    }
  }
  
  // Perfect score achievement
  const perfectScore = achievements.find(a => a.achievementId === 'perfect_score');
  if (perfectScore) {
    const perfectTests = this.testHistory.filter(test => test.accuracy === 100);
    perfectScore.progress = perfectTests.length;
    if (perfectTests.length >= 1 && !perfectScore.unlocked) {
      perfectScore.unlocked = true;
      perfectScore.unlockedAt = new Date();
    }
  }
  
  // Algorithm ace achievement
  const algorithmAce = achievements.find(a => a.achievementId === 'algorithm_ace');
  if (algorithmAce) {
    const dsaTests = this.testHistory.filter(test => 
      test.topics && test.topics.includes('Data Structures') && test.accuracy === 100
    );
    algorithmAce.progress = dsaTests.length;
    if (dsaTests.length >= 1 && !algorithmAce.unlocked) {
      algorithmAce.unlocked = true;
      algorithmAce.unlockedAt = new Date();
    }
  }
  
  await this.save();
};

// Static method to get user progress
progressSchema.statics.getUserProgress = async function(userId) {
  let progress = await this.findOne({ userId });
  
  if (!progress) {
    progress = await this.createDefaultProgress(userId);
  }
  
  // Ensure analytics are up to date
  progress.updateAnalytics();
  
  await progress.save();
  return progress;
};

// Static method to create default progress
progressSchema.statics.createDefaultProgress = async function(userId) {
  // Check if user is demo user
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  const isDemoUser = user && user.email === 'demo@placementprep.com';
  
  const defaultAchievements = [
    {
      achievementId: 'first_test',
      title: 'First Step',
      description: 'Complete your first practice test',
      icon: 'Target',
      unlocked: isDemoUser,
      unlockedAt: isDemoUser ? new Date('2026-01-01') : null,
      progress: isDemoUser ? 1 : 0,
      totalRequired: 1
    },
    {
      achievementId: 'streak_7',
      title: 'Consistent Learner',
      description: 'Maintain a 7-day practice streak',
      icon: 'Calendar',
      unlocked: isDemoUser,
      unlockedAt: isDemoUser ? new Date('2026-01-07') : null,
      progress: isDemoUser ? 14 : 0,
      totalRequired: 7
    },
    {
      achievementId: 'algorithm_ace',
      title: 'Algorithm Ace',
      description: 'Score 100% on DSA test',
      icon: 'Terminal',
      unlocked: isDemoUser,
      unlockedAt: isDemoUser ? new Date('2026-01-10') : null,
      progress: isDemoUser ? 1 : 0,
      totalRequired: 1
    },
    {
      achievementId: 'perfect_score',
      title: 'Perfectionist',
      description: 'Achieve 100% accuracy on any test',
      icon: 'Star',
      unlocked: isDemoUser,
      unlockedAt: isDemoUser ? new Date('2026-01-10') : null,
      progress: isDemoUser ? 1 : 0,
      totalRequired: 1
    }
  ];
  
  const defaultProgress = {
    userId,
    skillProficiency: [
      { skillName: 'Data Structures', proficiency: isDemoUser ? 85 : 0, lastUpdated: new Date(), history: [] },
      { skillName: 'System Design', proficiency: isDemoUser ? 62 : 0, lastUpdated: new Date(), history: [] },
      { skillName: 'Frontend', proficiency: isDemoUser ? 94 : 0, lastUpdated: new Date(), history: [] },
      { skillName: 'Backend', proficiency: isDemoUser ? 45 : 0, lastUpdated: new Date(), history: [] }
    ],
    testHistory: isDemoUser ? [
      {
        testId: new mongoose.Types.ObjectId(),
        testName: 'DSA Fundamentals',
        category: 'Technical',
        score: 8,
        totalScore: 10,
        accuracy: 80,
        duration: 12,
        date: new Date('2026-01-15'),
        difficulty: 'Medium',
        topics: ['Data Structures', 'Algorithms'],
        timePerQuestion: 72
      },
      {
        testId: new mongoose.Types.ObjectId(),
        testName: 'System Design Expert',
        category: 'Architecture',
        score: 7,
        totalScore: 10,
        accuracy: 70,
        duration: 25,
        date: new Date('2026-01-12'),
        difficulty: 'Hard',
        topics: ['System Design', 'Scalability'],
        timePerQuestion: 150
      },
      {
        testId: new mongoose.Types.ObjectId(),
        testName: 'React Mastery',
        category: 'Frontend',
        score: 10,
        totalScore: 10,
        accuracy: 100,
        duration: 8,
        date: new Date('2026-01-10'),
        difficulty: 'Easy',
        topics: ['Frontend', 'React'],
        timePerQuestion: 48
      }
    ] : [],
    dailyStats: {
      questionsSolved: isDemoUser ? 30 : 0,
      timeSpent: isDemoUser ? 45 : 0,
      accuracy: isDemoUser ? 83.3 : 0,
      streak: isDemoUser ? 14 : 0,
      lastActive: new Date()
    },
    achievements: defaultAchievements,
    studyAnalytics: {
      totalQuestionsAttempted: isDemoUser ? 30 : 0,
      totalTestsTaken: isDemoUser ? 3 : 0,
      averageAccuracy: isDemoUser ? 83.3 : 0,
      averageTimePerQuestion: isDemoUser ? 90 : 0,
      consistencyScore: isDemoUser ? 92 : 0,
      estimatedReadiness: isDemoUser ? 4 : 0,
      strongestTopics: isDemoUser ? [
        { topic: 'React', score: 94 },
        { topic: 'Data Structures', score: 85 }
      ] : [],
      weakAreas: isDemoUser ? [
        { topic: 'Backend', score: 45 },
        { topic: 'System Design', score: 62 }
      ] : []
    },
    careerProjection: {
      productCompanies: { 
        matchPercentage: isDemoUser ? 94 : 0, 
        readinessLevel: isDemoUser ? 4 : 0, 
        estimatedMonths: isDemoUser ? 2 : 12 
      },
      earlyStartups: { 
        matchPercentage: isDemoUser ? 78 : 0, 
        readinessLevel: isDemoUser ? 3 : 0, 
        estimatedMonths: isDemoUser ? 1 : 6 
      },
      quantTrading: { 
        matchPercentage: isDemoUser ? 42 : 0, 
        readinessLevel: isDemoUser ? 2 : 0, 
        estimatedMonths: isDemoUser ? 4 : 18 
      }
    }
  };
  
  const progress = await this.create(defaultProgress);
  
  // Initialize analytics
  progress.updateAnalytics();
  
  await progress.save();
  return progress;
};

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;