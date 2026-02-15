import Activity from "../models/Activity.js";
import TestSession from "../models/TestSession.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import mongoose from "mongoose";

class ActivityService {
  // Record a new activity
  async recordActivity(userId, activityData) {
    try {
      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Create activity
      const activity = new Activity({
        userId,
        ...activityData,
        createdAt: new Date()
      });
      
      await activity.save();
      
      // Update user's last active
      user.lastActive = new Date();
      await user.save();
      
      return activity;
    } catch (error) {
      console.error("ActivityService - recordActivity error:", error);
      throw error;
    }
  }
  
  // Record test session
  async recordTestSession(userId, sessionData) {
    try {
      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Create test session
      const session = new TestSession({
        userId,
        ...sessionData,
        startTime: sessionData.startTime || new Date(),
        endTime: sessionData.endTime || new Date(),
        status: sessionData.status || "completed",
        createdAt: new Date()
      });
      
      // Calculate performance if not provided
      if (!session.performance && session.questions) {
        session.calculatePerformance();
      }
      
      await session.save();
      
      // Update user's last active
      user.lastActive = new Date();
      await user.save();
      
      // Also record as activity
      await Activity.create({
        userId,
        activityType: "test_completed",
        metadata: {
          testId: session.testId,
          testName: session.testName,
          testCategory: session.testCategory,
          testDifficulty: session.testDifficulty,
          score: session.scores?.rawScore || 0,
          accuracy: session.performance?.accuracy || 0,
          duration: session.totalDuration
        },
        tags: ["test", session.testCategory.toLowerCase().replace(/\s+/g, "-")]
      });
      
      return session;
    } catch (error) {
      console.error("ActivityService - recordTestSession error:", error);
      throw error;
    }
  }
  
  // Get user activities
  async getUserActivities(userId, filters = {}) {
    try {
      return await Activity.getUserActivities(userId, filters);
    } catch (error) {
      console.error("ActivityService - getUserActivities error:", error);
      throw error;
    }
  }
  
  // Get user test sessions
  async getUserTestSessions(userId, filters = {}) {
    try {
      return await TestSession.getUserTestSessions(userId, filters);
    } catch (error) {
      console.error("ActivityService - getUserTestSessions error:", error);
      throw error;
    }
  }
  
  // Get user performance analytics
  async getUserPerformanceAnalytics(userId, period = "30d") {
    try {
      const endDate = new Date();
      let startDate = new Date();
      
      // Calculate date range based on period
      switch (period) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }
      
      // Get test sessions in period
      const sessions = await TestSession.find({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate },
        status: "completed"
      }).lean();
      
      // Calculate analytics
      const totalTests = sessions.length;
      const totalQuestions = sessions.reduce((sum, session) => 
        sum + (session.performance?.totalQuestions || 0), 0
      );
      const correctAnswers = sessions.reduce((sum, session) => 
        sum + (session.performance?.correctAnswers || 0), 0
      );
      const totalTime = sessions.reduce((sum, session) => 
        sum + (session.totalDuration || 0), 0
      );
      
      const averageAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      const averageTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;
      
      // Calculate category performance
      const categoryPerformance = {};
      sessions.forEach(session => {
        if (session.performance?.categoryAccuracy) {
          Object.entries(session.performance.categoryAccuracy).forEach(([category, accuracy]) => {
            if (!categoryPerformance[category]) {
              categoryPerformance[category] = { total: 0, sum: 0 };
            }
            categoryPerformance[category].total++;
            categoryPerformance[category].sum += accuracy;
          });
        }
      });
      
      const categoryAverages = {};
      Object.entries(categoryPerformance).forEach(([category, data]) => {
        categoryAverages[category] = Math.round(data.sum / data.total);
      });
      
      return {
        totalTests,
        totalQuestions,
        averageAccuracy: Math.round(averageAccuracy * 10) / 10,
        averageTimePerQuestion: Math.round(averageTimePerQuestion),
        categoryPerformance: categoryAverages,
        timeAnalysis: {
          totalStudyTime: totalTime,
          averageSessionTime: totalTests > 0 ? Math.round(totalTime / totalTests) : 0
        },
        period: {
          start: startDate,
          end: endDate,
          days: Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
        }
      };
    } catch (error) {
      console.error("ActivityService - getUserPerformanceAnalytics error:", error);
      throw error;
    }
  }
  
  // Get platform analytics (admin)
  async getPlatformAnalytics(filters = {}) {
    try {
      const { period = "30d" } = filters;
      const endDate = new Date();
      let startDate = new Date();
      
      switch (period) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      // Get platform statistics
      const [
        totalUsers,
        newUsers,
        activeUsers,
        totalTests,
        totalActivities,
        averageTestScore
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: startDate } }),
        TestSession.distinct("userId", { createdAt: { $gte: startDate } }).then(ids => ids.length),
        TestSession.countDocuments({ createdAt: { $gte: startDate } }),
        Activity.countDocuments({ createdAt: { $gte: startDate } }),
        TestSession.aggregate([
          { $match: { createdAt: { $gte: startDate }, status: "completed" } },
          { $group: { _id: null, avgScore: { $avg: "$scores.normalizedScore" } } }
        ])
      ]);
      
      // Get top performing users
      const topUsers = await TestSession.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: "completed" } },
        { $group: { 
          _id: "$userId", 
          avgScore: { $avg: "$scores.normalizedScore" },
          totalTests: { $sum: 1 }
        }},
        { $sort: { avgScore: -1 } },
        { $limit: 10 },
        { $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }},
        { $unwind: "$user" },
        { $project: {
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          avgScore: { $round: ["$avgScore", 2] },
          totalTests: 1
        }}
      ]);
      
      // Get activity trends
      const activityTrends = await Activity.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]);
      
      return {
        users: {
          total: totalUsers,
          new: newUsers,
          active: activeUsers,
          growthRate: totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0
        },
        tests: {
          total: totalTests,
          averageScore: averageTestScore[0]?.avgScore || 0,
          completionRate: 95 // This would need more complex calculation
        },
        activities: {
          total: totalActivities,
          trends: activityTrends
        },
        topUsers,
        period: {
          start: startDate,
          end: endDate,
          name: period
        },
        timestamp: new Date()
      };
    } catch (error) {
      console.error("ActivityService - getPlatformAnalytics error:", error);
      throw error;
    }
  }
  
  // Get activity summary for dashboard
  async getActivitySummary(userId, period = "7d") {
    try {
      const endDate = new Date();
      let startDate = new Date();
      
      switch (period) {
        case "24h":
          startDate.setDate(endDate.getDate() - 1);
          break;
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
      }
      
      // Get daily activity counts
      const dailyActivity = await Activity.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            types: { $addToSet: "$activityType" }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      // Get test summary
      const testSummary = await TestSession.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate, $lte: endDate },
            status: "completed"
          }
        },
        {
          $group: {
            _id: null,
            totalTests: { $sum: 1 },
            avgScore: { $avg: "$scores.normalizedScore" },
            totalTime: { $sum: "$totalDuration" },
            avgAccuracy: { $avg: "$performance.accuracy" }
          }
        }
      ]);
      
      // Get top activities
      const topActivities = await Activity.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$activityType",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      
      // Calculate streak
      const streak = await this.calculateStreak(userId);
      
      return {
        period,
        startDate,
        endDate,
        dailyActivity,
        testSummary: testSummary[0] || {
          totalTests: 0,
          avgScore: 0,
          totalTime: 0,
          avgAccuracy: 0
        },
        topActivities,
        streak,
        totalActivities: dailyActivity.reduce((sum, day) => sum + day.count, 0)
      };
    } catch (error) {
      console.error("ActivityService - getActivitySummary error:", error);
      throw error;
    }
  }
  
  // Get activity heatmap
  async getActivityHeatmap(userId, year) {
    try {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      
      const activities = await Activity.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Format for heatmap
      const heatmapData = {};
      activities.forEach(activity => {
        heatmapData[activity._id] = activity.count;
      });
      
      return {
        year,
        data: heatmapData,
        maxCount: activities.length > 0 ? Math.max(...activities.map(a => a.count)) : 0,
        totalDays: activities.length,
        totalActivities: activities.reduce((sum, a) => sum + a.count, 0)
      };
    } catch (error) {
      console.error("ActivityService - getActivityHeatmap error:", error);
      throw error;
    }
  }
  
  // Process batch activities
  async processBatchActivities(activities) {
    try {
      // Validate all activities have userId
      const invalidActivities = activities.filter(a => !a.userId);
      if (invalidActivities.length > 0) {
        throw new Error(`${invalidActivities.length} activities missing userId`);
      }
      
      // Insert all activities
      const result = await Activity.insertMany(activities);
      
      return {
        success: true,
        count: result.length,
        insertedIds: result.map(r => r._id)
      };
    } catch (error) {
      console.error("ActivityService - processBatchActivities error:", error);
      throw error;
    }
  }
  
  // Calculate streak for user
  async calculateStreak(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streak = 0;
      let currentDate = today;
      let hasActivityToday = false;
      
      // Check today's activity
      const startOfToday = new Date(currentDate);
      const endOfToday = new Date(currentDate);
      endOfToday.setHours(23, 59, 59, 999);
      
      const todayActivity = await Activity.findOne({
        userId,
        createdAt: { $gte: startOfToday, $lte: endOfToday }
      });
      
      if (todayActivity) {
        hasActivityToday = true;
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      // Check consecutive previous days
      while (streak < 365) { // Maximum streak check
        const startOfDay = new Date(currentDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(currentDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const hasActivity = await Activity.findOne({
          userId,
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        
        if (!hasActivity) break;
        
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      return {
        streak,
        hasActivityToday,
        lastActive: await this.getLastActiveDate(userId)
      };
    } catch (error) {
      console.error("ActivityService - calculateStreak error:", error);
      return { streak: 0, hasActivityToday: false };
    }
  }
  
  // Get user's last active date
  async getLastActiveDate(userId) {
    try {
      const lastActivity = await Activity.findOne({ userId })
        .sort({ createdAt: -1 })
        .select("createdAt")
        .lean();
      
      return lastActivity?.createdAt || null;
    } catch (error) {
      console.error("ActivityService - getLastActiveDate error:", error);
      return null;
    }
  }
  
  // Cleanup old test sessions
  async cleanupOldTestSessions(retentionDays) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const result = await TestSession.updateMany(
        { 
          createdAt: { $lt: cutoffDate },
          isArchived: { $ne: true }
        },
        { 
          $set: { 
            isArchived: true,
            archiveReason: "automatic_cleanup"
          } 
        }
      );
      
      return {
        archived: result.modifiedCount,
        cutoffDate
      };
    } catch (error) {
      console.error("ActivityService - cleanupOldTestSessions error:", error);
      throw error;
    }
  }
  
  // Export user activities
  async exportActivities(userId, format = "json", filters = {}) {
    try {
      const { activities } = await this.getUserActivities(userId, {
        ...filters,
        limit: 1000 // Limit exports
      });
      
      if (format === "csv") {
        return this.convertToCSV(activities);
      }
      
      return activities;
    } catch (error) {
      console.error("ActivityService - exportActivities error:", error);
      throw error;
    }
  }
  
  // Convert activities to CSV
  convertToCSV(activities) {
    if (!activities || activities.length === 0) {
      return "Timestamp,Activity Type,Details\n";
    }
    
    const headers = ["Timestamp", "Activity Type", "Test Name", "Category", "Score", "Accuracy", "Duration"];
    const rows = activities.map(activity => {
      const metadata = activity.metadata || {};
      return [
        new Date(activity.createdAt).toISOString(),
        activity.activityType,
        metadata.testName || "",
        metadata.testCategory || "",
        metadata.score || "",
        metadata.accuracy || "",
        metadata.timeSpent || ""
      ].map(cell => `"${cell}"`).join(",");
    });
    
    return [headers.join(","), ...rows].join("\n");
  }
}

export default new ActivityService();