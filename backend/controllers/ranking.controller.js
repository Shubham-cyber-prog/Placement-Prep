import PracticeProblem from "../models/PracticeProblem.js";
import User from "../models/User.js";

// Points mapping based on difficulty
const POINTS = {
    easy: 3,
    medium: 7,
    hard: 10,
    tough: 10
};

// Helper function to get date range
const getDateRange = (type) => {
    const now = new Date();
    let startDate;

    if (type === 'weekly') {
        // Get the start of this week (Monday)
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
    } else if (type === 'monthly') {
        // Get the start of this month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return startDate;
};

// Calculate user score based on solved problems
const calculateUserScore = (problems) => {
    return problems.reduce((total, problem) => {
        const points = POINTS[problem.difficulty.toLowerCase()] || 0;
        return total + points;
    }, 0);
};

// Get rankings for a specific time period
export const getRankings = async (req, res) => {
    try {
        const { type = 'weekly' } = req.query; // 'weekly' or 'monthly'

        if (!['weekly', 'monthly'].includes(type)) {
            return res.status(400).json({ message: "Type must be 'weekly' or 'monthly'" });
        }

        const startDate = getDateRange(type);

        // Get all solved problems within the date range
        const allProblems = await PracticeProblem.find({
            solved: true,
            solvedDate: { $gte: startDate }
        }).populate('user', 'name email');

        // Group problems by user
        const userScores = {};

        allProblems.forEach(problem => {
            const userId = problem.user._id.toString();
            if (!userScores[userId]) {
                userScores[userId] = {
                    userId,
                    name: problem.user.name,
                    email: problem.user.email,
                    score: 0,
                    problemsSolved: 0,
                    problemsByDifficulty: { easy: 0, medium: 0, hard: 0 }
                };
            }
            
            const difficulty = problem.difficulty.toLowerCase();
            const points = POINTS[difficulty] || 0;
            userScores[userId].score += points;
            userScores[userId].problemsSolved += 1;
            userScores[userId].problemsByDifficulty[difficulty] = 
                (userScores[userId].problemsByDifficulty[difficulty] || 0) + 1;
        });

        // Convert to array and sort by score
        let rankings = Object.values(userScores).sort((a, b) => b.score - a.score);

        // Add rank position
        rankings = rankings.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        // Get current user's ranking
        const currentUserRank = rankings.find(r => r.userId === req.user._id.toString());

        res.json({
            type,
            rankings,
            currentUserRank: currentUserRank || null,
            totalUsers: rankings.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current user's ranking details
export const getUserRankingDetails = async (req, res) => {
    try {
        const { type = 'weekly' } = req.query;

        if (!['weekly', 'monthly'].includes(type)) {
            return res.status(400).json({ message: "Type must be 'weekly' or 'monthly'" });
        }

        const startDate = getDateRange(type);

        // Get current user's solved problems in the period
        const userProblems = await PracticeProblem.find({
            user: req.user._id,
            solved: true,
            solvedDate: { $gte: startDate }
        });

        const userScore = calculateUserScore(userProblems);

        // Get all problems in the period to calculate ranking
        const allProblems = await PracticeProblem.find({
            solved: true,
            solvedDate: { $gte: startDate }
        }).populate('user', '_id name email');

        // Calculate all user scores
        const userScores = {};
        allProblems.forEach(problem => {
            const userId = problem.user._id.toString();
            if (!userScores[userId]) {
                userScores[userId] = {
                    userId,
                    name: problem.user.name,
                    score: 0,
                    problemsSolved: 0
                };
            }
            const points = POINTS[problem.difficulty.toLowerCase()] || 0;
            userScores[userId].score += points;
            userScores[userId].problemsSolved += 1;
        });

        // Sort and find ranking
        const sortedUsers = Object.values(userScores).sort((a, b) => b.score - a.score);
        const userRank = sortedUsers.findIndex(u => u.userId === req.user._id.toString()) + 1;
        const totalUsers = sortedUsers.length;

        // Get nearby users in ranking
        const userIndex = userRank - 1;
        const nearbyUsers = sortedUsers.slice(
            Math.max(0, userIndex - 2),
            Math.min(sortedUsers.length, userIndex + 3)
        );

        res.json({
            type,
            currentUser: {
                score: userScore,
                problemsSolved: userProblems.length,
                rank: userRank,
                totalUsers,
                percentile: ((totalUsers - userRank) / totalUsers * 100).toFixed(1)
            },
            nearbyUsers,
            problemsByDifficulty: {
                easy: userProblems.filter(p => p.difficulty.toLowerCase() === 'easy').length,
                medium: userProblems.filter(p => p.difficulty.toLowerCase() === 'medium').length,
                hard: userProblems.filter(p => p.difficulty.toLowerCase() === 'hard' || p.difficulty.toLowerCase() === 'tough').length
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
