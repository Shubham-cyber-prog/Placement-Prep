import ActivityService from "../services/activityService.js";
import Activity from "../models/Activity.js";
import TestSession from "../models/TestSession.js";

class ActivityController {
  // Record a new activity
  async recordActivity(req, res) {
    try {
      const userId = req.user._id || req.user.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }
      
      const activityData = req.body;
      
      // Basic validation
      if (!activityData.activityType) {
        return res.status(400).json({
          success: false,
          message: "Activity type is required"
        });
      }
      
      const activity = await ActivityService.recordActivity(userId, activityData);
      
      res.status(201).json({
        success: true,
        message: "Activity recorded successfully",
        data: activity
      });
    } catch (error) {
      console.error("Error recording activity:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to record activity",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
  
  // Record test session
  async recordTestSession(req, res) {
    try {
      const userId = req.user._id || req.user.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }
      
      const sessionData = req.body;
      
      // Basic validation
      if (!sessionData.testId || !sessionData.testName || !sessionData.testCategory) {
        return res.status(400).json({
          success: false,
          message: "Test ID, name, and category are required"
        });
      }
      
      const session = await ActivityService.recordTestSession(userId, sessionData);
      
      res.status(201).json({
        success: true,
        message: "Test session recorded successfully",
        data: session
      });
    } catch (error) {
      console.error("Error recording test session:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to record test session",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
  
  // Get user activities
  async getUserActivities(req, res) {
    try {
      const userId = req.user._id || req.user.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }
      
      const filters = {
        activityType: req.query.activityType,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        tags: req.query.tags ? req.query.tags.split(",") : [],
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc"
      };
      
      const result = await ActivityService.getUserActivities(userId, filters);
      
      res.status(200).json({
        success: true,
        data: result.activities,
        pagination: result.pagination,
        total: result.pagination.total
      });
    } catch (error) {
      console.error("Error fetching user activities:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch activities",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
  
  // Get user test sessions
  async getUserTestSessions(req, res) {
    try {
      const userId = req.user._id || req.user.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }
      
      const filters = {
        testId: req.query.testId,
        status: req.query.status,
        testCategory: req.query.testCategory || req.query.category,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc"
      };
      
      const result = await ActivityService.getUserTestSessions(userId, filters);
      
      res.status(200).json({
        success: true,
        data: result.sessions,
        pagination: result.pagination,
        total: result.pagination.total
      });
    } catch (error) {
      console.error("Error fetching test sessions:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch test sessions",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
  
  // Get user performance analytics
  async getUserPerformanceAnalytics(req, res) {
    try {
      const userId = req.user._id || req.user.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }
      
      const { period = "30d" } = req.query;
      
      const analytics = await ActivityService.getUserPerformanceAnalytics(userId, period);
      
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error("Error fetching performance analytics:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch performance analytics",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
  
  // Get platform analytics (admin only)
  async getPlatformAnalytics(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required."
        });
      }
      
      const filters = {
        period: req.query.period || "30d"
      };
      
      const analytics = await ActivityService.getPlatformAnalytics(filters);
      
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error("Error fetching platform analytics:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch platform analytics",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
  
  // Get user activity summary for dashboard
  async getActivitySummary(req, res) {
    try {
      const userId = req.user._id || req.user.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }
      
      const { period = "7d" } = req.query;
      
      const summary = await ActivityService.getActivitySummary(userId, period);
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error("Error fetching activity summary:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch activity summary"
      });
    }
  }
  
  // Get user activity heatmap
  async getActivityHeatmap(req, res) {
    try {
      const userId = req.user._id || req.user.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }
      
      const { year = new Date().getFullYear() } = req.query;
      
      const heatmap = await ActivityService.getActivityHeatmap(userId, year);
      
      res.status(200).json({
        success: true,
        data: heatmap
      });
    } catch (error) {
      console.error("Error fetching activity heatmap:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch activity heatmap"
      });
    }
  }
  
  // Process batch activities
  async processBatchActivities(req, res) {
    try {
      const userId = req.user._id || req.user.userId;
      const { activities } = req.body;
      
      if (!Array.isArray(activities) || activities.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Activities array is required and must not be empty"
        });
      }
      
      // Add userId to activities if not provided
      const activitiesWithUserId = activities.map(activity => ({
        ...activity,
        userId: activity.userId || userId
      }));
      
      const result = await ActivityService.processBatchActivities(activitiesWithUserId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error("Error processing batch activities:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to process batch activities"
      });
    }
  }
  
  // Export user activity data
  async exportActivities(req, res) {
    try {
      const userId = req.user._id || req.user.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }
      
      const { format = "json", startDate, endDate } = req.query;
      
      const filters = { startDate, endDate };
      
      if (format === "csv") {
        const csv = await ActivityService.exportActivities(userId, "csv", filters);
        
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=activities_${userId}_${Date.now()}.csv`);
        return res.send(csv);
      }
      
      const activities = await ActivityService.exportActivities(userId, "json", filters);
      
      res.status(200).json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error("Error exporting activities:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to export activities"
      });
    }
  }
  
  // Cleanup old activities (admin only)
  async cleanupActivities(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }
      
      const { retentionDays = 365, dryRun = false } = req.body;
      
      if (dryRun) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        
        const count = await Activity.countDocuments({
          createdAt: { $lt: cutoffDate },
          retentionPeriod: { $ne: "permanent" }
        });
        
        return res.status(200).json({
          success: true,
          message: `Dry run: Would delete ${count} activities older than ${retentionDays} days`,
          count,
          cutoffDate
        });
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const result = await Activity.deleteMany({
        createdAt: { $lt: cutoffDate },
        retentionPeriod: { $ne: "permanent" }
      });
      
      // Also cleanup test sessions
      const sessionResult = await ActivityService.cleanupOldTestSessions(retentionDays);
      
      res.status(200).json({
        success: true,
        message: "Cleanup completed",
        activitiesDeleted: result.deletedCount,
        sessionsArchived: sessionResult.archived,
        cutoffDate
      });
    } catch (error) {
      console.error("Error during cleanup:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Cleanup failed"
      });
    }
  }
}

export default new ActivityController();