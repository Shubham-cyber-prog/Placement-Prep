import mongoose from "mongoose";

const userDashboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Activity Metrics
  dailyActivity: [{
    date: {
      type: Date,
      default: Date.now
    },
    activities: {
      testsTaken: {
        type: Number,
        default: 0
      },
      questionsSolved: {
        type: Number,
        default: 0
      },
      timeSpent: { // in minutes
        type: Number,
        default: 0
      },
      categoriesPracticed: [String]
    }
  }],
  
  // Progress Metrics
  progressMetrics: {
    totalQuestionsSolved: {
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
    }
  },
  
  // Category Performance
  categoryPerformance: [{
    category: {
      type: String,
      enum: ['Data Structures', 'Algorithms', 'System Design', 'Frontend', 'Backend', 'Databases', 'Aptitude', 'Technical Interview', 'Behavioral Interview', 'Coding']
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
    },
    lastPracticed: {
      type: Date
    }
  }],
  
  // Skill Levels
  skillLevels: [{
    skill: {
      type: String,
      required: true
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
    },
    nextMilestone: {
      type: String
    }
  }],
  
  // Recent Activity
  recentActivities: [{
    type: {
      type: String,
      enum: ['test_taken', 'question_solved', 'streak_milestone', 'achievement_unlocked', 'skill_improved']
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Upcoming Events
  upcomingEvents: [{
    type: {
      type: String,
      enum: ['recommended_test', 'skill_review', 'weekly_challenge', 'mock_interview', 'focus_practice', 'streak_maintenance']
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    scheduledTime: Date,
    duration: Number,
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced']
    }
  }],
  
  // Recommendations
  recommendations: [{
    type: {
      type: String,
      enum: ['focus_area', 'practice_test', 'study_material', 'skill_improvement', 'streak_building']
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    actionUrl: String,
    estimatedTime: Number
  }],
  
  // Dashboard Configuration
  widgetPreferences: {
    showLeaderboard: {
      type: Boolean,
      default: true
    },
    showRecentActivity: {
      type: Boolean,
      default: true
    },
    showSkillProgress: {
      type: Boolean,
      default: true
    },
    showUpcomingEvents: {
      type: Boolean,
      default: true
    }
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static Methods
userDashboardSchema.statics.createDefaultDashboard = async function(userId) {
  const defaultSkills = [
    { skill: 'Data Structures', level: 1, progress: 0, nextMilestone: 'Solve 10 problems' },
    { skill: 'Algorithms', level: 1, progress: 0, nextMilestone: 'Solve 10 problems' },
    { skill: 'System Design', level: 1, progress: 0, nextMilestone: 'Complete first design' },
    { skill: 'Aptitude', level: 1, progress: 0, nextMilestone: 'Solve 5 problems' }
  ];

  const defaultCategories = [
    { category: 'Data Structures', questionsAttempted: 0, correctAnswers: 0, averageScore: 0 },
    { category: 'Algorithms', questionsAttempted: 0, correctAnswers: 0, averageScore: 0 },
    { category: 'System Design', questionsAttempted: 0, correctAnswers: 0, averageScore: 0 },
    { category: 'Aptitude', questionsAttempted: 0, correctAnswers: 0, averageScore: 0 }
  ];

  const dashboard = new this({
    userId,
    progressMetrics: {
      totalQuestionsSolved: 0,
      totalTestsTaken: 0,
      averageAccuracy: 0,
      currentStreak: 0,
      longestStreak: 0,
      consistencyScore: 0
    },
    categoryPerformance: defaultCategories,
    skillLevels: defaultSkills,
    recentActivities: [
      {
        type: 'streak_milestone',
        title: 'Welcome to PlacePrep!',
        description: 'Start your first practice session to begin tracking progress',
        timestamp: new Date()
      }
    ],
    widgetPreferences: {
      showLeaderboard: true,
      showRecentActivity: true,
      showSkillProgress: true,
      showUpcomingEvents: true
    }
  });

  await dashboard.save();
  return this.enhanceWithDynamicData(dashboard.toObject());
};

userDashboardSchema.statics.enhanceWithDynamicData = function(dashboard) {
  // Calculate averages for category performance
  dashboard.categoryPerformance.forEach(cp => {
    if (cp.questionsAttempted > 0) {
      cp.averageScore = Math.round((cp.correctAnswers / cp.questionsAttempted) * 100);
    }
  });

  // Calculate overall average
  const totalQuestions = dashboard.progressMetrics.totalQuestionsSolved;
  const correctAnswers = dashboard.categoryPerformance.reduce((sum, cp) => sum + cp.correctAnswers, 0);
  dashboard.progressMetrics.averageAccuracy = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100) 
    : 0;

  // Update skill levels based on category performance
  dashboard.skillLevels.forEach(skill => {
    const category = dashboard.categoryPerformance.find(cp => 
      cp.category.toLowerCase().includes(skill.skill.toLowerCase()) ||
      skill.skill.toLowerCase().includes(cp.category.toLowerCase())
    );
    
    if (category && category.questionsAttempted > 0) {
      skill.progress = category.averageScore;
      skill.level = Math.min(10, Math.floor(category.averageScore / 10) + 1);
      
      const questionsNeeded = Math.max(0, 10 - category.questionsAttempted);
      skill.nextMilestone = questionsNeeded > 0 
        ? `Solve ${questionsNeeded} more problems` 
        : 'Great progress!';
    }
  });

  // Generate upcoming events
  const now = new Date();
  dashboard.upcomingEvents = [];
  
  if (dashboard.progressMetrics.currentStreak > 0) {
    dashboard.upcomingEvents.push({
      type: 'streak_maintenance',
      title: `Maintain ${dashboard.progressMetrics.currentStreak}-day streak`,
      description: 'Practice daily to keep your streak alive',
      scheduledTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      duration: 30,
      difficulty: 'Beginner'
    });
  }

  // Add first test recommendation if no tests taken
  if (dashboard.progressMetrics.totalTestsTaken === 0) {
    dashboard.upcomingEvents.push({
      type: 'recommended_test',
      title: 'Take Your First Test',
      description: 'Start with a basic test to gauge your current level',
      scheduledTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      duration: 30,
      difficulty: 'Beginner'
    });
  }

  // Generate recommendations
  dashboard.recommendations = [];
  
  if (dashboard.progressMetrics.totalTestsTaken < 1) {
    dashboard.recommendations.push({
      type: 'practice_test',
      priority: 'high',
      title: 'Take Your First Practice Test',
      description: 'Start with a basic test to begin tracking your progress',
      actionUrl: '/test/basic',
      estimatedTime: 30
    });
  }
  
  if (dashboard.progressMetrics.currentStreak < 3) {
    dashboard.recommendations.push({
      type: 'streak_building',
      priority: 'medium',
      title: 'Build a 3-Day Streak',
      description: 'Practice for 3 consecutive days to boost consistency',
      actionUrl: '/practice/daily',
      estimatedTime: 15
    });
  }

  return dashboard;
};

const UserDashboard = mongoose.model('UserDashboard', userDashboardSchema);
export default UserDashboard;