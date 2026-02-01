import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  },
  
  dailyStats: {
    streak: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    dailyGoalsCompleted: {
      type: Number,
      default: 0
    }
  },
  
  skillProficiency: [{
    skillName: {
      type: String,
      required: true,
      enum: [
        "Data Structures",
        "Algorithms", 
        "System Design",
        "Frontend",
        "Backend",
        "Databases",
        "Networking",
        "Security",
        "Testing",
        "DevOps",
        "Cloud Computing",
        "Mobile Development",
        "Machine Learning",
        "Data Science",
        "Product Management"
      ]
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
      date: Date
    }]
  }],
  
  testHistory: [{
    testId: String,
    testName: String,
    category: String,
    difficulty: String,
    score: Number,
    totalScore: Number,
    accuracy: Number,
    duration: Number,
    date: {
      type: Date,
      default: Date.now
    },
    topics: [String]
  }],
  
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
      min: 1,
      max: 5,
      default: 1
    },
    weakAreas: [{
      topic: String,
      score: Number,
      improvementNeeded: Number
    }],
    strongAreas: [{
      topic: String,
      score: Number
    }]
  },
  
  careerProjection: {
    productCompanies: {
      matchPercentage: {
        type: Number,
        default: 0
      },
      readinessLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
      },
      estimatedMonths: {
        type: Number,
        default: 6
      }
    },
    earlyStartups: {
      matchPercentage: {
        type: Number,
        default: 0
      },
      readinessLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
      },
      estimatedMonths: {
        type: Number,
        default: 4
      }
    },
    quantTrading: {
      matchPercentage: {
        type: Number,
        default: 0
      },
      readinessLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
      },
      estimatedMonths: {
        type: Number,
        default: 8
      }
    }
  },
  
  achievements: [{
    achievementId: String,
    title: String,
    description: String,
    icon: String,
    unlocked: {
      type: Boolean,
      default: false
    },
    unlockedAt: Date,
    progress: Number,
    totalRequired: Number
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
progressSchema.index({ userId: 1 });
progressSchema.index({ "skillProficiency.skillName": 1 });

// Pre-save middleware
progressSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  
  // Update study analytics
  if (this.testHistory && this.testHistory.length > 0) {
    this.updateStudyAnalytics();
  }
  
  // Update career projections based on skills
  if (this.skillProficiency && this.skillProficiency.length > 0) {
    this.updateCareerProjections();
  }
  
  next();
});

// Instance method to add test result
progressSchema.methods.addTestResult = function(testData) {
  const {
    testName,
    category,
    score,
    totalScore,
    accuracy,
    duration,
    difficulty,
    topics,
    timePerQuestion
  } = testData;
  
  const newTest = {
    testId: `test_${Date.now()}`,
    testName: testName || "Practice Test",
    category: category || "General",
    difficulty: difficulty || "Medium",
    score: Math.max(0, score || 0),
    totalScore: Math.max(1, totalScore || 10),
    accuracy: Math.min(100, Math.max(0, accuracy || 0)),
    duration: Math.max(0, duration || 0),
    date: new Date(),
    topics: topics || []
  };
  
  this.testHistory.push(newTest);
  
  // Update daily stats for streak
  const today = new Date().toDateString();
  const lastActive = new Date(this.dailyStats.lastActive).toDateString();
  
  if (today !== lastActive) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (yesterday.toDateString() === lastActive) {
      this.dailyStats.streak += 1;
    } else {
      this.dailyStats.streak = 1;
    }
    
    this.dailyStats.lastActive = new Date();
  }
  
  return newTest;
};

// Instance method to update study analytics
progressSchema.methods.updateStudyAnalytics = function() {
  const tests = this.testHistory;
  
  if (tests.length === 0) return;
  
  // Calculate totals
  const totalTests = tests.length;
  const totalQuestions = tests.reduce((sum, test) => sum + (test.totalScore || 0), 0);
  const totalCorrect = tests.reduce((sum, test) => sum + (test.score || 0), 0);
  const totalDuration = tests.reduce((sum, test) => sum + (test.duration || 0), 0);
  
  // Calculate averages
  const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  const averageTimePerQuestion = totalQuestions > 0 ? totalDuration / totalQuestions : 0;
  
  // Calculate consistency (based on variance in scores)
  const accuracies = tests.map(t => t.accuracy || 0);
  const meanAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  const variance = accuracies.reduce((a, b) => a + Math.pow(b - meanAccuracy, 2), 0) / accuracies.length;
  const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));
  
  // Update analytics
  this.studyAnalytics = {
    totalQuestionsAttempted: totalQuestions,
    totalTestsTaken: totalTests,
    averageAccuracy: Math.round(averageAccuracy * 10) / 10,
    averageTimePerQuestion: Math.round(averageTimePerQuestion),
    consistencyScore: Math.round(consistencyScore),
    estimatedReadiness: this.calculateReadinessLevel(averageAccuracy, consistencyScore),
    weakAreas: this.identifyWeakAreas(tests),
    strongAreas: this.identifyStrongAreas(tests)
  };
};

// Instance method to calculate readiness level
progressSchema.methods.calculateReadinessLevel = function(averageAccuracy, consistencyScore) {
  const combinedScore = (averageAccuracy * 0.7) + (consistencyScore * 0.3);
  
  if (combinedScore >= 90) return 5;
  if (combinedScore >= 80) return 4;
  if (combinedScore >= 70) return 3;
  if (combinedScore >= 60) return 2;
  return 1;
};

// Instance method to identify weak areas
progressSchema.methods.identifyWeakAreas = function(tests) {
  const categoryPerformance = {};
  
  tests.forEach(test => {
    if (test.category && test.accuracy !== undefined) {
      if (!categoryPerformance[test.category]) {
        categoryPerformance[test.category] = {
          total: 0,
          sum: 0
        };
      }
      categoryPerformance[test.category].total++;
      categoryPerformance[test.category].sum += test.accuracy;
    }
  });
  
  const weakAreas = Object.entries(categoryPerformance)
    .filter(([_, data]) => data.sum / data.total < 70)
    .map(([category, data]) => ({
      topic: category,
      score: Math.round(data.sum / data.total),
      improvementNeeded: 70 - Math.round(data.sum / data.total)
    }))
    .slice(0, 3);
  
  return weakAreas;
};

// Instance method to identify strong areas
progressSchema.methods.identifyStrongAreas = function(tests) {
  const categoryPerformance = {};
  
  tests.forEach(test => {
    if (test.category && test.accuracy !== undefined) {
      if (!categoryPerformance[test.category]) {
        categoryPerformance[test.category] = {
          total: 0,
          sum: 0
        };
      }
      categoryPerformance[test.category].total++;
      categoryPerformance[test.category].sum += test.accuracy;
    }
  });
  
  const strongAreas = Object.entries(categoryPerformance)
    .filter(([_, data]) => data.sum / data.total >= 80)
    .map(([category, data]) => ({
      topic: category,
      score: Math.round(data.sum / data.total)
    }))
    .slice(0, 3);
  
  return strongAreas;
};

// Instance method to update career projections
progressSchema.methods.updateCareerProjections = function() {
  const skills = this.skillProficiency;
  
  if (!skills || skills.length === 0) return;
  
  // Calculate average proficiency
  const avgProficiency = skills.reduce((sum, skill) => sum + skill.proficiency, 0) / skills.length;
  
  // Product companies weight technical skills heavily
  const productCompanyScore = avgProficiency * 0.8 + this.studyAnalytics.consistencyScore * 0.2;
  
  // Startups value versatility and speed
  const startupScore = avgProficiency * 0.6 + (100 / Math.max(1, this.studyAnalytics.averageTimePerQuestion)) * 0.4;
  
  // Quant trading values high accuracy and specific skills
  const algorithmSkills = skills.filter(s => 
    ["Algorithms", "Data Structures", "Machine Learning", "Data Science"].includes(s.skillName)
  );
  const quantScore = algorithmSkills.length > 0 
    ? algorithmSkills.reduce((sum, skill) => sum + skill.proficiency, 0) / algorithmSkills.length 
    : avgProficiency * 0.5;
  
  // Update projections
  this.careerProjection = {
    productCompanies: {
      matchPercentage: Math.min(100, Math.round(productCompanyScore)),
      readinessLevel: Math.min(5, Math.ceil(productCompanyScore / 20)),
      estimatedMonths: Math.max(1, Math.ceil((100 - productCompanyScore) / 10))
    },
    earlyStartups: {
      matchPercentage: Math.min(100, Math.round(startupScore)),
      readinessLevel: Math.min(5, Math.ceil(startupScore / 20)),
      estimatedMonths: Math.max(1, Math.ceil((100 - startupScore) / 15))
    },
    quantTrading: {
      matchPercentage: Math.min(100, Math.round(quantScore)),
      readinessLevel: Math.min(5, Math.ceil(quantScore / 20)),
      estimatedMonths: Math.max(1, Math.ceil((100 - quantScore) / 8))
    }
  };
};

// Static method to create default progress
progressSchema.statics.createDefaultProgress = async function(userId) {
  const defaultAchievements = [
    {
      achievementId: "first_test",
      title: "First Test Completed",
      description: "Complete your first practice test",
      icon: "Trophy",
      unlocked: false,
      progress: 0,
      totalRequired: 1
    },
    {
      achievementId: "streak_3",
      title: "3-Day Streak",
      description: "Practice for 3 consecutive days",
      icon: "Flame",
      unlocked: false,
      progress: 0,
      totalRequired: 3
    },
    {
      achievementId: "accuracy_80",
      title: "Accuracy Master",
      description: "Achieve 80% accuracy in a test",
      icon: "Target",
      unlocked: false,
      progress: 0,
      totalRequired: 1
    }
  ];
  
  const defaultSkills = [
    { skillName: "Data Structures", proficiency: 0 },
    { skillName: "Algorithms", proficiency: 0 },
    { skillName: "System Design", proficiency: 0 },
    { skillName: "Frontend", proficiency: 0 },
    { skillName: "Backend", proficiency: 0 }
  ];
  
  const progress = new this({
    userId,
    dailyStats: {
      streak: 0,
      lastActive: new Date()
    },
    skillProficiency: defaultSkills,
    testHistory: [],
    studyAnalytics: {
      totalQuestionsAttempted: 0,
      totalTestsTaken: 0,
      averageAccuracy: 0,
      averageTimePerQuestion: 0,
      consistencyScore: 0,
      estimatedReadiness: 1,
      weakAreas: [],
      strongAreas: []
    },
    careerProjection: {
      productCompanies: {
        matchPercentage: 0,
        readinessLevel: 1,
        estimatedMonths: 6
      },
      earlyStartups: {
        matchPercentage: 0,
        readinessLevel: 1,
        estimatedMonths: 4
      },
      quantTrading: {
        matchPercentage: 0,
        readinessLevel: 1,
        estimatedMonths: 8
      }
    },
    achievements: defaultAchievements
  });
  
  await progress.save();
  return progress;
};

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;