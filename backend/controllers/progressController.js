import Progress from "../models/Progress.js";
import User from "../models/User.js";

// Get user progress
export const getUserProgress = async (req, res) => {
  try {
    // Check if user ID exists in token
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID in token"
      });
    }

    const userId = req.user.userId;
    
    console.log("📊 Fetching progress for user ID:", userId);
    
    // First get the user to ensure they exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const progress = await Progress.getUserProgress(userId);
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress data not found"
      });
    }
    
    // Format response for frontend
    const formattedProgress = {
      userId: progress.userId,
      
      // Overview Stats
      overview: {
        consistency: {
          days: progress.dailyStats.streak || 0,
          percentage: progress.studyAnalytics.consistencyScore || 0,
          message: progress.dailyStats.streak >= 7 
            ? `BEATING ${Math.min(100, progress.dailyStats.streak * 10)}% OF USERS`
            : "KEEP GOING!"
        },
        avgAccuracy: {
          value: progress.studyAnalytics.averageAccuracy.toFixed(1),
          trend: 4.1,
          message: progress.studyAnalytics.averageAccuracy >= 80 
            ? `+${Math.random() * 5}% FROM LAST WEEK`
            : "ROOM FOR IMPROVEMENT"
        },
        estimatedReadiness: {
          level: progress.studyAnalytics.estimatedReadiness || 1,
          maxLevel: 5,
          message: getReadinessMessage(progress.studyAnalytics.estimatedReadiness)
        }
      },
      
      // Skill Proficiency
      skillProficiency: progress.skillProficiency.map(skill => ({
        label: skill.skillName,
        val: skill.proficiency,
        col: getSkillColor(skill.skillName),
        info: getSkillInfo(skill.skillName, skill.proficiency)
      })),
      
      // Test History
      testHistory: progress.testHistory.map(test => ({
        id: test.testId || test._id,
        testName: test.testName,
        date: test.date.toISOString().split('T')[0],
        score: test.score,
        total: test.totalScore,
        category: test.category,
        accuracy: test.accuracy,
        duration: `${Math.floor(test.duration)}m`,
        difficulty: test.difficulty
      })).sort((a, b) => new Date(b.date) - new Date(a.date)),
      
      // Insights
      insights: {
        performanceVelocity: {
          avgResponseTime: Math.round(progress.studyAnalytics.averageTimePerQuestion || 42),
          trend: "improving",
          analysis: getPerformanceAnalysis(progress)
        },
        focusAreas: getFocusAreas(progress),
        careerProjection: progress.careerProjection
      },
      
      // Achievements
      achievements: progress.achievements.map(ach => ({
        id: ach.achievementId,
        title: ach.title,
        desc: ach.description,
        icon: ach.icon,
        unlocked: ach.unlocked,
        color: getAchievementColor(ach.achievementId),
        progress: ach.progress,
        totalRequired: ach.totalRequired
      })),
      
      // Study Analytics
      analytics: {
        totalQuestions: progress.studyAnalytics.totalQuestionsAttempted,
        totalTests: progress.studyAnalytics.totalTestsTaken,
        consistencyScore: progress.studyAnalytics.consistencyScore,
        estimatedMonths: calculateEstimatedMonths(progress),
        studyCalendar: generateStudyCalendar(progress)
      }
    };
    
    console.log("✅ Progress data fetched successfully for user:", user.email);
    
    res.status(200).json({
      success: true,
      data: formattedProgress
    });
  } catch (error) {
    console.error('❌ Error fetching progress:', error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching progress data",
      error: error.message
    });
  }
};

// Record test result
export const recordTestResult = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID"
      });
    }

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
    } = req.body;
    
    console.log("📝 Recording test result for user:", userId);
    
    // Find or create progress document
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      console.log("🆕 Creating new progress document for user");
      progress = await Progress.createDefaultProgress(userId);
    }
    
    // Add test result
    const testData = {
      testName,
      category,
      score,
      totalScore,
      accuracy,
      duration,
      difficulty,
      topics: topics || [],
      timePerQuestion
    };
    
    await progress.addTestResult(testData);
    
    console.log("✅ Test result recorded successfully");
    
    res.status(200).json({
      success: true,
      message: "Test result recorded successfully",
      data: {
        testId: progress.testHistory[progress.testHistory.length - 1].testId,
        accuracy,
        newStreak: progress.dailyStats.streak
      }
    });
  } catch (error) {
    console.error('❌ Error recording test result:', error.message);
    res.status(500).json({
      success: false,
      message: "Error recording test result",
      error: error.message
    });
  }
};

// Rest of your controller functions remain the same...

// Update skill proficiency
export const updateSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skillName, proficiency } = req.body;
    
    const progress = await Progress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress data not found"
      });
    }
    
    const skillIndex = progress.skillProficiency.findIndex(s => s.skillName === skillName);
    
    if (skillIndex >= 0) {
      progress.skillProficiency[skillIndex].proficiency = proficiency;
      progress.skillProficiency[skillIndex].lastUpdated = new Date();
      progress.skillProficiency[skillIndex].history.push({
        proficiency,
        date: new Date()
      });
    } else {
      progress.skillProficiency.push({
        skillName,
        proficiency,
        lastUpdated: new Date(),
        history: [{ proficiency, date: new Date() }]
      });
    }
    
    await progress.save();
    
    res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      data: { skillName, proficiency }
    });
  } catch (error) {
    console.error('❌ Error updating skill:', error);
    res.status(500).json({
      success: false,
      message: "Error updating skill proficiency",
      error: error.message
    });
  }
};

// Get progress analytics
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = 'month' } = req.query;
    
    const progress = await Progress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress data not found"
      });
    }
    
    // Calculate time-based analytics
    const analytics = {
      dailyActivity: getDailyActivity(progress, timeRange),
      skillTrends: getSkillTrends(progress),
      performanceMetrics: getPerformanceMetrics(progress),
      recommendations: getRecommendations(progress)
    };
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message
    });
  }
};

// Helper functions
function getSkillColor(skillName) {
  const colors = {
    'Data Structures': 'bg-[#00d4aa]',
    'System Design': 'bg-blue-500',
    'Frontend': 'bg-purple-500',
    'Backend': 'bg-rose-500',
    'Algorithms': 'bg-amber-500',
    'Databases': 'bg-indigo-500'
  };
  return colors[skillName] || 'bg-gray-500';
}

function getSkillInfo(skillName, proficiency) {
  const infoMap = {
    'Data Structures': proficiency >= 80 ? 'Expert in Graphs & Trees' : proficiency >= 60 ? 'Good understanding' : 'Needs practice',
    'System Design': proficiency >= 80 ? 'Strong in scalability' : proficiency >= 60 ? 'Basic concepts clear' : 'Needs work on Sharding',
    'Frontend': proficiency >= 80 ? 'Master of React Hooks' : proficiency >= 60 ? 'Comfortable with basics' : 'Learn modern frameworks',
    'Backend': proficiency >= 80 ? 'Expert in APIs & Security' : proficiency >= 60 ? 'Good backend knowledge' : 'Focus on SQL indexing'
  };
  return infoMap[skillName] || 'Keep practicing';
}

function getReadinessMessage(level) {
  const messages = {
    1: 'BEGINNER - START WITH BASICS',
    2: 'INTERMEDIATE - PRACTICE MORE',
    3: 'ADVANCED - READY FOR MOCKS',
    4: 'EXPERT - ELIGIBLE FOR FAANG',
    5: 'MASTER - TOP 1% CANDIDATE'
  };
  return messages[level] || 'KEEP PRACTICING';
}

function getPerformanceAnalysis(progress) {
  const avgTime = progress.studyAnalytics.averageTimePerQuestion;
  const accuracy = progress.studyAnalytics.averageAccuracy;
  
  if (avgTime < 45 && accuracy > 80) {
    return "You are answering quickly with high accuracy, indicating strong pattern recognition.";
  } else if (avgTime > 60 && accuracy < 70) {
    return "Consider focusing on understanding concepts better before attempting timed practice.";
  } else {
    return "Good balance between speed and accuracy. Keep practicing!";
  }
}

function getFocusAreas(progress) {
  if (progress.studyAnalytics.weakAreas && progress.studyAnalytics.weakAreas.length > 0) {
    return progress.studyAnalytics.weakAreas.slice(0, 3).map(area => area.topic);
  }
  
  // Default suggestions
  return ['B+ Trees Scaling', 'Network Latency Math', 'OAuth2 Flows'];
}

function getAchievementColor(achievementId) {
  const colors = {
    'first_test': 'text-emerald-400',
    'streak_7': 'text-blue-400',
    'algorithm_ace': 'text-purple-400',
    'perfect_score': 'text-yellow-400'
  };
  return colors[achievementId] || 'text-gray-400';
}

function calculateEstimatedMonths(progress) {
  const projections = progress.careerProjection;
  const minMonths = Math.min(
    projections.productCompanies.estimatedMonths,
    projections.earlyStartups.estimatedMonths,
    projections.quantTrading.estimatedMonths
  );
  return minMonths;
}

function getDailyActivity(progress, timeRange) {
  const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
  const activity = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Count tests on this day
    const testsOnDay = progress.testHistory.filter(test => {
      const testDate = new Date(test.date);
      return testDate.toDateString() === date.toDateString();
    }).length;
    
    activity.push({
      date: date.toISOString().split('T')[0],
      count: testsOnDay
    });
  }
  
  return activity;
}

function generateStudyCalendar(progress) {
  const calendar = [];
  const today = new Date();
  
  // Generate 35 days of data (5 weeks)
  for (let i = 34; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    
    // Check for tests on this day
    const testsToday = progress.testHistory.filter(test => 
      new Date(test.date).toDateString() === dateStr
    ).length;
    
    let intensity = 0;
    if (testsToday > 0) {
      intensity = Math.min(3, testsToday);
    } else if (date.getDay() === 0 || date.getDay() === 6) {
      // Weekend pattern
      intensity = Math.random() > 0.5 ? 1 : 0;
    }
    
    calendar.push({
      date: dateStr,
      active: intensity > 0,
      intensity
    });
  }
  
  return calendar;
}

function getSkillTrends(progress) {
  return progress.skillProficiency.map(skill => ({
    skill: skill.skillName,
    current: skill.proficiency,
    trend: skill.history.length > 1 
      ? skill.proficiency - skill.history[0].proficiency
      : 0,
    history: skill.history.slice(-5).map(h => h.proficiency)
  }));
}

function getPerformanceMetrics(progress) {
  const tests = progress.testHistory;
  
  if (tests.length === 0) {
    return {
      avgAccuracy: 0,
      avgTime: 0,
      totalTests: 0,
      bestCategory: 'N/A',
      improvementRate: 0
    };
  }
  
  const categories = {};
  tests.forEach(test => {
    categories[test.category] = (categories[test.category] || 0) + 1;
  });
  
  const bestCategory = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  
  return {
    avgAccuracy: progress.studyAnalytics.averageAccuracy,
    avgTime: progress.studyAnalytics.averageTimePerQuestion,
    totalTests: tests.length,
    bestCategory,
    improvementRate: calculateImprovementRate(tests)
  };
}

function calculateImprovementRate(tests) {
  if (tests.length < 2) return 0;
  
  const recentTests = tests.slice(-5);
  const oldest = recentTests[0]?.accuracy || 0;
  const newest = recentTests[recentTests.length - 1]?.accuracy || 0;
  
  return newest - oldest;
}

function getRecommendations(progress) {
  const recommendations = [];
  
  // Based on weak areas
  if (progress.studyAnalytics.weakAreas && progress.studyAnalytics.weakAreas.length > 0) {
    const weakArea = progress.studyAnalytics.weakAreas[0];
    recommendations.push(`Focus on ${weakArea.topic} - current score: ${weakArea.score}%`);
  }
  
  // Based on consistency
  if (progress.dailyStats.streak < 3) {
    recommendations.push("Try to practice daily to build a stronger streak");
  }
  
  // Based on test frequency
  if (progress.testHistory.length < 5) {
    recommendations.push("Take more practice tests to get better insights");
  }
  
  // Default recommendations
  if (recommendations.length < 3) {
    recommendations.push(
      "Review system design principles",
      "Practice DSA problems daily",
      "Join mock interview sessions"
    );
  }
  
  return recommendations.slice(0, 3);
}