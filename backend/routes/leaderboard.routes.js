import express from "express";
import mongoose from "mongoose";
import {authMiddleware} from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Progress from "../models/Progress.js";
import PracticeProblem from "../models/PracticeProblem.model.js";

const router = express.Router();

// Get leaderboard data with filters
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { 
      type = 'overall', // overall, weekly, monthly, dsa, aptitude, interview
      timeFrame = 'all', // all, week, month, year
      page = 1,
      limit = 20
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get all users with their progress data
    const users = await User.find({ isActive: true }).lean();
    
    // Get all progress data
    const progressData = await Progress.find().lean();
    
    // Get all solved problems
    const solvedProblems = await PracticeProblem.find({ solved: true }).lean();

    // Build leaderboard data by aggregating all sources
    let leaderboardMap = new Map();

    // Process users and their progress
    for (const user of users) {
      const userId = user._id.toString();
      
      // Find user's progress
      const userProgress = progressData.find(p => p.user?.toString() === userId || p.userId?.toString() === userId);
      
      // Find user's solved problems
      const userProblems = solvedProblems.filter(p => 
        p.user?.toString() === userId || p.solvedBy?.toString() === userId
      );

      // Calculate statistics
      const testsTaken = userProgress?.testHistory?.length || 0;
      const problemsSolved = user.totalProblemsSolved || userProblems.length || 0;
      
      // Calculate average score from test history
      let averageScore = 0;
      if (userProgress?.testHistory?.length > 0) {
        const totalScore = userProgress.testHistory.reduce((sum, test) => sum + (test.accuracy || test.score || 0), 0);
        averageScore = totalScore / userProgress.testHistory.length;
      }

      // Calculate total score (problems * 10 + tests * 5)
      const totalScore = (problemsSolved * 10) + (testsTaken * 5);

      // Calculate category performance
      const categoryPerformance = {};
      if (userProgress?.testHistory) {
        userProgress.testHistory.forEach(test => {
          const category = test.category || 'General';
          if (!categoryPerformance[category]) {
            categoryPerformance[category] = {
              tests: 0,
              totalScore: 0,
              averageScore: 0
            };
          }
          categoryPerformance[category].tests++;
          categoryPerformance[category].totalScore += (test.accuracy || test.score || 0);
        });
      }

      // Calculate skill levels from progress
      const skillLevels = userProgress?.skillProficiency?.map(skill => ({
        skill: skill.skillName || skill.skill,
        level: Math.floor((skill.proficiency || 0) / 20) + 1,
        progress: skill.proficiency || 0
      })) || [];

      // Calculate monthly problems solved
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const monthlyProblems = userProblems.filter(p => 
        p.solvedAt && new Date(p.solvedAt) >= startOfMonth
      ).length;

      leaderboardMap.set(userId, {
        _id: userId,
        name: user.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        avatar: user.avatar || user.avatarUrl,
        totalScore,
        problemsSolved,
        testsTaken,
        averageScore: averageScore.toFixed(1),
        currentStreak: user.currentStreak || userProgress?.dailyStats?.streak || 0,
        longestStreak: user.longestStreak || userProgress?.dailyStats?.longestStreak || 0,
        level: user.level || 1,
        badges: user.badges || [],
        categoryPerformance,
        skillLevels,
        monthlySolved: monthlyProblems,
        monthlyPoints: monthlyProblems * 10,
        lastActive: user.lastActive || userProgress?.updatedAt || new Date()
      });
    }

    // Convert map to array
    let leaderboardArray = Array.from(leaderboardMap.values());

    // Apply time frame filter
    if (timeFrame !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeFrame) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Filter users who were active in the time frame
      leaderboardArray = leaderboardArray.filter(user => 
        new Date(user.lastActive) >= startDate
      );
    }

    // Sort based on type
    switch (type) {
      case 'weekly':
        leaderboardArray.sort((a, b) => {
          if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
          return b.longestStreak - a.longestStreak;
        });
        break;
      
      case 'monthly':
        leaderboardArray.sort((a, b) => {
          if (b.monthlySolved !== a.monthlySolved) return b.monthlySolved - a.monthlySolved;
          return b.currentStreak - a.currentStreak;
        });
        break;
      
      case 'dsa':
      case 'aptitude':
      case 'interview':
        // Filter users with category performance
        const categoryMap = {
          dsa: 'DSA',
          aptitude: 'Aptitude',
          interview: 'Interview'
        };
        const targetCategory = categoryMap[type];
        
        leaderboardArray = leaderboardArray.filter(user => 
          user.categoryPerformance[targetCategory]
        );
        
        leaderboardArray.sort((a, b) => {
          const aCat = a.categoryPerformance[targetCategory] || { averageScore: 0, tests: 0 };
          const bCat = b.categoryPerformance[targetCategory] || { averageScore: 0, tests: 0 };
          
          if (bCat.averageScore !== aCat.averageScore) return bCat.averageScore - aCat.averageScore;
          return bCat.tests - aCat.tests;
        });
        break;
      
      default:
        leaderboardArray.sort((a, b) => {
          if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
          if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
          return b.averageScore - a.averageScore;
        });
    }

    // Filter out users with no activity
    if (type !== 'weekly') {
      leaderboardArray = leaderboardArray.filter(user => 
        user.problemsSolved > 0 || user.testsTaken > 0
      );
    }

    // Calculate total participants
    const totalParticipants = leaderboardArray.length;

    // Apply pagination
    const paginatedLeaderboard = leaderboardArray.slice(skip, skip + parseInt(limit));

    // Get current user's rank
    const currentUserId = req.user._id.toString();
    const userRankIndex = leaderboardArray.findIndex(u => u._id.toString() === currentUserId);
    
    let userRank = null;
    if (userRankIndex !== -1) {
      const rank = userRankIndex + 1;
      const total = totalParticipants;
      userRank = {
        rank,
        total,
        percentile: ((total - rank) / total * 100).toFixed(1)
      };
    }

    res.json({
      success: true,
      data: {
        rankings: paginatedLeaderboard,
        userRank,
        totalParticipants,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalParticipants / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
      error: error.message
    });
  }
});

// Get user statistics
router.get("/user/:userId/stats", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get user progress
    const progress = await Progress.findOne({ 
      $or: [{ user: userId }, { userId: userId }]
    }).lean();

    // Get solved problems
    const problems = await PracticeProblem.find({ 
      $or: [{ user: userId }, { solvedBy: userId }],
      solved: true 
    }).populate('topic', 'name').lean();

    // Group problems by topic/category
    const categoryMap = {};
    problems.forEach(problem => {
      const topicName = problem.topic?.name || 'Uncategorized';
      if (!categoryMap[topicName]) {
        categoryMap[topicName] = {
          solved: 0,
          total: 0,
          difficulty: {}
        };
      }
      categoryMap[topicName].solved++;
      categoryMap[topicName].difficulty[problem.difficulty] = 
        (categoryMap[topicName].difficulty[problem.difficulty] || 0) + 1;
    });

    const categoryPerformance = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      problemsSolved: data.solved,
      difficulty: data.difficulty
    }));

    // Get test history from progress
    const testHistory = progress?.testHistory || [];
    
    // Calculate average accuracy
    const averageAccuracy = testHistory.length > 0
      ? testHistory.reduce((sum, test) => sum + (test.accuracy || test.score || 0), 0) / testHistory.length
      : 0;

    // Calculate statistics
    const stats = {
      totalScore: (user.totalProblemsSolved || problems.length) * 10 + testHistory.length * 5,
      currentStreak: user.currentStreak || progress?.dailyStats?.streak || 0,
      longestStreak: user.longestStreak || progress?.dailyStats?.longestStreak || 0,
      problemsSolved: user.totalProblemsSolved || problems.length,
      testsTaken: testHistory.length,
      averageAccuracy: averageAccuracy.toFixed(1),
      badges: user.badges || [],
      level: user.level || 1,
      categoryPerformance,
      skillLevels: progress?.skillProficiency?.map(skill => ({
        category: skill.skillName || skill.skill,
        level: Math.floor((skill.proficiency || 0) / 20) + 1,
        progress: skill.proficiency || 0
      })) || []
    };

    // Calculate user's rank
    const allUsers = await User.find({ isActive: true }).lean();
    const allProgress = await Progress.find().lean();
    
    const userScores = allUsers.map(u => {
      const userProgress = allProgress.find(p => 
        p.user?.toString() === u._id.toString() || p.userId?.toString() === u._id.toString()
      );
      const userProblems = problems.filter(p => 
        p.user?.toString() === u._id.toString() || p.solvedBy?.toString() === u._id.toString()
      );
      
      return {
        userId: u._id,
        score: (u.totalProblemsSolved || userProblems.length) * 10 + (userProgress?.testHistory?.length || 0) * 5
      };
    });

    userScores.sort((a, b) => b.score - a.score);
    const rankIndex = userScores.findIndex(u => u.userId.toString() === userId);
    const rank = rankIndex !== -1 ? rankIndex + 1 : 'N/A';
    const total = userScores.length;

    stats.rank = {
      rank,
      total,
      percentile: rank !== 'N/A' ? ((total - rank) / total * 100).toFixed(1) : 0
    };

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || user.avatarUrl,
          level: user.level || 1,
          badges: user.badges || []
        },
        stats,
        recentTests: testHistory.slice(0, 5).map(test => ({
          testName: test.testName || 'Practice Test',
          category: test.category || 'General',
          score: test.accuracy || test.score || 0,
          date: test.date || test.createdAt,
          difficulty: test.difficulty || 'Medium'
        })),
        recentProblems: problems.slice(0, 5).map(problem => ({
          title: problem.title || problem.name,
          topic: problem.topic?.name || 'General',
          difficulty: problem.difficulty,
          solvedAt: problem.solvedAt || problem.solvedDate
        }))
      }
    });
  } catch (error) {
    console.error("User stats fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
      error: error.message
    });
  }
});

// Add test result to user's progress (for recording tests)
router.post("/record-test", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { testName, category, score, accuracy, duration, difficulty } = req.body;

    let progress = await Progress.findOne({ 
      $or: [{ user: userId }, { userId: userId }]
    });

    if (!progress) {
      // Create default progress if doesn't exist
      progress = new Progress({
        user: userId,
        userId: userId,
        testHistory: [],
        skillProficiency: [],
        dailyStats: { streak: 0, lastActive: new Date() },
        studyAnalytics: {
          totalTestsTaken: 0,
          totalQuestionsAttempted: 0,
          averageAccuracy: 0,
          averageTimePerQuestion: 0
        }
      });
    }

    // Add test to history
    progress.testHistory.push({
      testName: testName || 'Practice Test',
      category: category || 'General',
      score: score || 0,
      accuracy: accuracy || score || 0,
      duration: duration || 0,
      difficulty: difficulty || 'Medium',
      date: new Date()
    });

    // Update analytics
    progress.studyAnalytics.totalTestsTaken = progress.testHistory.length;
    
    const totalAccuracy = progress.testHistory.reduce((sum, test) => 
      sum + (test.accuracy || test.score || 0), 0
    );
    progress.studyAnalytics.averageAccuracy = totalAccuracy / progress.testHistory.length;

    // Update streak
    const lastActive = progress.dailyStats.lastActive || new Date(0);
    const today = new Date();
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      progress.dailyStats.streak += 1;
    } else if (diffDays > 1) {
      progress.dailyStats.streak = 1;
    }
    
    progress.dailyStats.lastActive = today;
    
    if (progress.dailyStats.streak > progress.dailyStats.longestStreak) {
      progress.dailyStats.longestStreak = progress.dailyStats.streak;
    }

    await progress.save();

    // Update user's streak
    await User.findByIdAndUpdate(userId, {
      currentStreak: progress.dailyStats.streak,
      longestStreak: progress.dailyStats.longestStreak,
      lastActive: today
    });

    res.json({
      success: true,
      message: "Test recorded successfully",
      data: {
        streak: progress.dailyStats.streak,
        testsTaken: progress.testHistory.length,
        averageAccuracy: progress.studyAnalytics.averageAccuracy
      }
    });
  } catch (error) {
    console.error("Error recording test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record test",
      error: error.message
    });
  }
});

export default router;