import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import UserStats from "../models/UserStats.js";
import UserDashboard from "../models/UserDashboard.js";

const router = express.Router();

// Get dashboard data (Protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user data
    const user = await User.findById(userId).select('name email avatarUrl createdAt role');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get or create user stats
    let userStats = await UserStats.findOne({ userId });
    if (!userStats) {
      userStats = await UserStats.createDefaultStats(userId);
    }

    // Get or create user dashboard
    let userDashboard = await UserDashboard.findOne({ userId });
    if (!userDashboard) {
      userDashboard = await UserDashboard.createDefaultDashboard(userId);
    }

    // Get progress data
    const progress = await Progress.findOne({ userId });
    
    // Calculate stats
    const totalTests = progress?.testHistory?.length || 0;
    const totalQuestions = userStats.totalQuestions || 0;
    const averageScore = userStats.averageScore || 0;
    const currentStreak = userStats.currentStreak || 0;
    const consistencyScore = userStats.consistencyScore || 0;
    
    // Get skill levels from dashboard
    const skillLevels = userDashboard.skillLevels || [];
    
    // Category performance
    const categoryPerformance = userStats.categoryPerformance || [];
    
    // Recent activities
    const recentActivities = userDashboard.recentActivities || [];
    
    // Upcoming events
    const upcomingEvents = userDashboard.upcomingEvents || [];
    
    // Recommendations
    const recommendations = userDashboard.recommendations || [];
    
    // Platform stats
    const totalUsers = await User.countDocuments();
    const totalPlatformTests = await Progress.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$testHistory" } } } }
    ]);
    
    const platformStats = {
      totalUsers,
      totalTests: totalPlatformTests[0]?.total || 0,
      activeToday: await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      questionsSolved: await Progress.aggregate([
        { $group: { _id: null, total: { $sum: "$studyAnalytics.totalQuestionsAttempted" } } }
      ]).then(result => result[0]?.total || 0)
    };
    
    // Leaderboard data
    const leaderboardStats = await UserStats.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: 1,
          name: '$user.name',
          email: '$user.email',
          score: '$consistencyScore',
          testsTaken: '$totalTests',
          averageScore: 1,
          currentStreak: 1
        }
      },
      { $sort: { score: -1 } },
      { $limit: 10 }
    ]);
    
    const response = {
      success: true,
      data: {
        user: {
          name: user.name || 'User',
          email: user.email,
          avatarUrl: user.avatarUrl,
          joinDate: user.createdAt,
          role: user.role
        },
        stats: {
          testsTaken: totalTests,
          questionsSolved: totalQuestions,
          averageScore,
          currentStreak,
          consistencyScore,
          globalRank: userStats.globalRank || 0,
          percentile: userStats.percentile || 0
        },
        categoryPerformance,
        skillLevels,
        recentActivities,
        upcomingEvents,
        recommendations,
        platformStats,
        leaderboard: {
          rankings: leaderboardStats,
          userRank: {
            rank: userStats.globalRank || 0,
            score: consistencyScore,
            testsTaken: totalTests,
            averageScore
          },
          totalParticipants: platformStats.totalUsers
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message
    });
  }
});

// Record activity
router.post("/activity", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, title, description, metadata } = req.body;
    
    const activity = {
      type,
      title,
      description,
      metadata,
      timestamp: new Date()
    };
    
    await UserDashboard.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          recentActivities: {
            $each: [activity],
            $slice: -10 // Keep only last 10 activities
          }
        },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Activity recorded successfully"
    });
  } catch (error) {
    console.error('Error recording activity:', error);
    res.status(500).json({
      success: false,
      message: "Error recording activity"
    });
  }
});

// Get platform stats (Public)
router.get("/platform-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTests = await Progress.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$testHistory" } } } }
    ]);
    const totalQuestions = await Progress.aggregate([
      { $group: { _id: null, total: { $sum: "$studyAnalytics.totalQuestionsAttempted" } } }
    ]);
    const activeToday = await User.countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTests: totalTests[0]?.total || 0,
        totalQuestions: totalQuestions[0]?.total || 0,
        activeToday,
        averageAccuracy: await calculateAverageAccuracy()
      }
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching platform statistics"
    });
  }
});

// Update dashboard preferences
router.put("/preferences", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { widgetPreferences } = req.body;
    
    await UserDashboard.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          widgetPreferences,
          lastUpdated: new Date()
        }
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Preferences updated successfully"
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: "Error updating preferences"
    });
  }
});

// Helper function to calculate average accuracy
async function calculateAverageAccuracy() {
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

export default router;