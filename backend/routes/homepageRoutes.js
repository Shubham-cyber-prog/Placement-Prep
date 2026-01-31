import express from "express";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import UserStats from "../models/UserStats.js";

const router = express.Router();

// Get homepage stats (Public)
router.get("/stats", async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total tests
    const totalTestsResult = await Progress.aggregate([
      { 
        $group: { 
          _id: null, 
          totalTests: { $sum: { $size: "$testHistory" } } 
        } 
      }
    ]);
    
    // Get total questions solved
    const totalQuestionsResult = await Progress.aggregate([
      { 
        $group: { 
          _id: null, 
          totalQuestions: { $sum: "$studyAnalytics.totalQuestionsAttempted" } 
        } 
      }
    ]);
    
    // Get active users in last 24 hours
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Get recent achievements
    const recentAchievements = await getRecentAchievements();
    
    // Get trending categories
    const trendingCategories = await getTrendingCategories();

    const stats = {
      platformStats: {
        totalUsers,
        totalTests: totalTestsResult[0]?.totalTests || 0,
        totalQuestions: totalQuestionsResult[0]?.totalQuestions || 0,
        activeToday: activeUsers,
        averageAccuracy: await getAverageAccuracy()
      },
      recentAchievements,
      trendingCategories,
      topPerformers: await getTopPerformers(5)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching homepage stats:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching homepage statistics"
    });
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const { period = 'weekly', limit = 10 } = req.query;
    
    // Get top users based on consistency score
    const topStats = await UserStats.find()
      .populate('userId', 'name email avatarUrl')
      .sort({ consistencyScore: -1, averageScore: -1 })
      .limit(parseInt(limit));
    
    const rankings = topStats.map((stat, index) => ({
      userId: stat.userId._id,
      name: stat.userId.name || `User ${index + 1}`,
      avatarUrl: stat.userId.avatarUrl,
      score: stat.consistencyScore,
      rank: index + 1,
      change: getRankChange(index, stat.previousRank),
      stats: {
        testsTaken: stat.totalTests,
        averageScore: stat.averageScore,
        streak: stat.currentStreak,
        questionsSolved: stat.totalQuestions
      }
    }));
    
    res.status(200).json({
      success: true,
      data: {
        period,
        startDate: getPeriodStartDate(period),
        endDate: new Date(),
        rankings,
        totalParticipants: await UserStats.countDocuments()
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard"
    });
  }
});

// Get mentorship requests (Protected in real app, simplified here)
router.get("/mentorship/requests", async (req, res) => {
  try {
    // Simplified - return empty array or mock data
    res.status(200).json({
      success: true,
      data: {
        requests: [],
        total: 0
      }
    });
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching mentorship requests"
    });
  }
});

// Get mentors list
router.get("/mentorship/mentors", async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' })
      .select('name email avatarUrl profile.bio profile.skills profile.experience')
      .limit(10);
    
    res.status(200).json({
      success: true,
      data: {
        mentors,
        total: mentors.length
      }
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching mentors"
    });
  }
});

// Helper functions
async function getRecentAchievements() {
  const recentStats = await UserStats.find()
    .populate('userId', 'name')
    .sort({ updatedAt: -1 })
    .limit(5);
  
  return recentStats
    .filter(stat => stat.achievements && stat.achievements.length > 0)
    .flatMap(stat => 
      stat.achievements.slice(0, 2).map(achievement => ({
        userId: stat.userId._id,
        userName: stat.userId.name,
        achievement: {
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          unlockedAt: achievement.unlockedAt
        }
      }))
    );
}

async function getTrendingCategories() {
  const categoryStats = await Progress.aggregate([
    { $unwind: "$testHistory" },
    {
      $group: {
        _id: "$testHistory.category",
        totalTests: { $sum: 1 },
        averageScore: { $avg: "$testHistory.accuracy" }
      }
    },
    { $sort: { totalTests: -1 } },
    { $limit: 5 }
  ]);
  
  return categoryStats.map(cat => ({
    _id: cat._id,
    totalTests: cat.totalTests,
    averageScore: Math.round(cat.averageScore || 0)
  }));
}

async function getTopPerformers(limit) {
  const topStats = await UserStats.find()
    .populate('userId', 'name avatarUrl')
    .sort({ consistencyScore: -1 })
    .limit(limit);
  
  return topStats.map(stat => ({
    userId: stat.userId._id,
    name: stat.userId.name,
    avatarUrl: stat.userId.avatarUrl,
    consistencyScore: stat.consistencyScore,
    testsTaken: stat.totalTests,
    streak: stat.currentStreak
  }));
}

async function getAverageAccuracy() {
  const result = await UserStats.aggregate([
    {
      $group: {
        _id: null,
        avgAccuracy: { $avg: "$averageScore" }
      }
    }
  ]);
  
  return Math.round(result[0]?.avgAccuracy || 0);
}

function getRankChange(currentRank, previousRank) {
  if (!previousRank) return 'new';
  if (currentRank < previousRank) return 'up';
  if (currentRank > previousRank) return 'down';
  return 'same';
}

function getPeriodStartDate(period) {
  const now = new Date();
  switch (period) {
    case 'daily':
      return new Date(now.setHours(0, 0, 0, 0));
    case 'weekly':
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(now.setDate(diff));
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    default:
      return new Date(now.getFullYear(), 0, 1); // Year start
  }
}

export default router;