import Progress from "../models/Progress.model.js";
import PracticeProblem from "../models/PracticeProblem.js";
import Topic from "../models/Topic.js";
import { awardAchievement } from "./achievement.controller.js";

export const getUserProgress = async (req, res, next) => {
    try {
        const progress = await Progress.find({ user: req.user._id })
            .populate('topic', 'name')
            .populate('problem', 'title difficulty')
            .sort({ updatedAt: -1 });

        // Aggregate stats
        const stats = {
            totalProblems: await PracticeProblem.countDocuments({ user: req.user._id }),
            solvedProblems: await PracticeProblem.countDocuments({ user: req.user._id, solved: true }),
            totalTimeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
            totalPoints: progress.reduce((sum, p) => sum + p.pointsEarned, 0),
            topicProgress: {}
        };

        // Group by topic
        const topicStats = await Progress.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: "$topic",
                    totalProblems: { $sum: 1 },
                    solvedProblems: { $sum: { $cond: [{ $eq: ["$completionStatus", "completed"] }, 1, 0] } },
                    totalTime: { $sum: "$timeSpent" },
                    totalPoints: { $sum: "$pointsEarned" }
                }
            },
            {
                $lookup: {
                    from: "topics",
                    localField: "_id",
                    foreignField: "_id",
                    as: "topicInfo"
                }
            },
            { $unwind: "$topicInfo" },
            {
                $project: {
                    topicName: "$topicInfo.name",
                    totalProblems: 1,
                    solvedProblems: 1,
                    totalTime: 1,
                    totalPoints: 1
                }
            }
        ]);

        stats.topicProgress = topicStats;

        res.json({ progress, stats });
    } catch (error) {
        next(error);
    }
};

export const logProgress = async (req, res, next) => {
    try {
        const { problemId, timeSpent, completionStatus, attempts } = req.body;

        const problem = await PracticeProblem.findOne({ _id: problemId, user: req.user._id });
        if (!problem) {
            const error = new Error("Problem not found");
            error.statusCode = 404;
            return next(error);
        }

        // Calculate points based on difficulty
        const difficultyPoints = { 'Easy': 10, 'Medium': 20, 'Hard': 30 };
        const pointsEarned = difficultyPoints[problem.difficulty] || 10;

        const progressData = {
            user: req.user._id,
            topic: problem.topic,
            problem: problemId,
            difficulty: problem.difficulty,
            timeSpent: timeSpent || 0,
            attempts: attempts || 1,
            pointsEarned: completionStatus === 'completed' ? pointsEarned : 0,
            completionStatus: completionStatus || 'started'
        };

        if (completionStatus === 'completed') {
            progressData.completedAt = new Date();
        }

        const progress = await Progress.findOneAndUpdate(
            { user: req.user._id, problem: problemId },
            progressData,
            { upsert: true, new: true }
        ).populate('topic', 'name').populate('problem', 'title difficulty');

        // Check for achievements if problem was completed
        if (completionStatus === 'completed') {
            await checkAndAwardAchievements(req.user._id, problem);
        }

        res.json(progress);
    } catch (error) {
        next(error);
    }
};

export const updateProgressTime = async (req, res, next) => {
    try {
        const { problemId, additionalTime } = req.body;

        const progress = await Progress.findOneAndUpdate(
            { user: req.user._id, problem: problemId },
            { $inc: { timeSpent: additionalTime } },
            { new: true }
        );

        if (!progress) {
            const error = new Error("Progress entry not found");
            error.statusCode = 404;
            return next(error);
        }

        res.json(progress);
    } catch (error) {
        next(error);
    }
};

// Achievement checking logic
const checkAndAwardAchievements = async (userId, problem) => {
    try {
        // Get user's total solved problems
        const solvedCount = await Progress.countDocuments({
            user: userId,
            completionStatus: 'completed'
        });

        // First solve achievement
        if (solvedCount === 1) {
            await awardAchievement(userId, 'badge', 'First Steps', 'Solved your first problem!', 10);
        }

        // Problem solver milestones
        const milestones = [5, 10, 25, 50, 100];
        for (const milestone of milestones) {
            if (solvedCount === milestone) {
                await awardAchievement(userId, 'badge', `${milestone} Problems Solved`, `Solved ${milestone} problems!`, milestone * 2);
                break;
            }
        }

        // Difficulty-specific achievements
        const difficultyCount = await Progress.countDocuments({
            user: userId,
            completionStatus: 'completed',
            difficulty: problem.difficulty
        });

        if (difficultyCount === 1) {
            await awardAchievement(userId, 'badge', `First ${problem.difficulty} Problem`, `Solved your first ${problem.difficulty.toLowerCase()} problem!`, 5);
        }

        // Streak achievements (simplified - check consecutive days)
        // This would need more complex logic for actual streaks

    } catch (error) {
        console.error('Error checking achievements:', error);
    }
};
