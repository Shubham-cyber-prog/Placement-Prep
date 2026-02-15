import Achievement from "../models/Achievement.model.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

// Get all achievements for a user with filters
export const getUserAchievements = async (req, res) => {
    try {
        const { 
            category, 
            rarity, 
            type, 
            sortBy = 'earnedAt', 
            sortOrder = 'desc',
            limit = 50,
            page = 1 
        } = req.query;

        // Build query
        const query = { user: req.user._id, isActive: true };
        
        if (category) query.category = category;
        if (rarity) query.rarity = rarity;
        if (type) query.type = type;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get achievements with pagination
        const achievements = await Achievement.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination info
        const total = await Achievement.countDocuments(query);

        // Get summary statistics
        const summary = await Achievement.getUserSummary(req.user._id);

        // Get recent activity related to achievements
        const recentActivity = await Activity.find({
            user: req.user._id,
            type: { $in: ['achievement_unlocked', 'achievement_progress'] }
        })
        .sort({ createdAt: -1 })
        .limit(5);

        res.json({
            success: true,
            data: {
                achievements,
                summary,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                filters: {
                    categories: await Achievement.distinct('category', { user: req.user._id }),
                    rarities: await Achievement.distinct('rarity', { user: req.user._id }),
                    types: await Achievement.distinct('type', { user: req.user._id })
                },
                recentActivity
            }
        });
    } catch (error) {
        console.error('Error getting achievements:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get specific achievement by ID
export const getAchievementById = async (req, res) => {
    try {
        const achievement = await Achievement.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: "Achievement not found"
            });
        }

        // Get similar achievements
        const similarAchievements = await Achievement.find({
            user: req.user._id,
            category: achievement.category,
            _id: { $ne: achievement._id },
            isActive: true
        })
        .limit(3)
        .sort({ points: -1 });

        res.json({
            success: true,
            data: {
                achievement,
                similarAchievements
            }
        });
    } catch (error) {
        console.error('Error getting achievement:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Award an achievement to a user
export const awardAchievement = async (userId, achievementData) => {
    try {
        const {
            type,
            name,
            description,
            points = 0,
            category = 'participation',
            rarity = 'common',
            icon = 'trophy',
            progress = 100,
            metadata = {}
        } = achievementData;

        // Check if achievement already exists
        const existing = await Achievement.findOne({ 
            user: userId, 
            name,
            isActive: true 
        });
        
        if (existing) {
            // Update progress if needed
            if (progress > existing.progress) {
                existing.progress = progress;
                existing.earnedAt = progress === 100 ? new Date() : existing.earnedAt;
                await existing.save();
                
                if (progress === 100 && existing.progress < 100) {
                    // Record activity for achievement completion
                    await Activity.create({
                        user: userId,
                        type: 'achievement_unlocked',
                        title: `Achievement Unlocked: ${name}`,
                        description: `You've completed the "${name}" achievement!`,
                        metadata: { achievementId: existing._id, points }
                    });
                } else if (progress > existing.progress) {
                    // Record progress update
                    await Activity.create({
                        user: userId,
                        type: 'achievement_progress',
                        title: `Progress Update: ${name}`,
                        description: `You're ${progress}% complete with "${name}"`,
                        metadata: { achievementId: existing._id, progress }
                    });
                }
            }
            return existing;
        }

        // Create new achievement
        const achievement = new Achievement({
            user: userId,
            type,
            name,
            description,
            points,
            category,
            rarity,
            icon,
            progress,
            metadata,
            earnedAt: progress === 100 ? new Date() : null
        });

        await achievement.save();

        // Update user's total points
        if (progress === 100) {
            await User.findByIdAndUpdate(userId, {
                $inc: { 
                    'stats.points': points,
                    'stats.achievementsCount': 1 
                }
            });

            // Record activity
            await Activity.create({
                user: userId,
                type: 'achievement_unlocked',
                title: `Achievement Unlocked: ${name}`,
                description: `Congratulations! You've earned the "${name}" achievement.`,
                metadata: { achievementId: achievement._id, points }
            });
        }

        return achievement;
    } catch (error) {
        console.error('Error awarding achievement:', error);
        return null;
    }
};

// Check and award achievements based on user activity
export const checkAndAwardAchievements = async (userId, userStats, activityType, metadata = {}) => {
    try {
        const awards = [];
        const user = await User.findById(userId);
        
        // Define achievement criteria
        const achievementCriteria = {
            // Consistency achievements
            consistency: {
                '7-Day Streak': {
                    condition: () => userStats.currentStreak >= 7,
                    data: {
                        type: 'streak',
                        name: '7-Day Streak',
                        description: 'Practice for 7 consecutive days',
                        points: 250,
                        category: 'consistency',
                        rarity: 'rare',
                        icon: 'flame'
                    }
                },
                '30-Day Master': {
                    condition: () => userStats.currentStreak >= 30,
                    data: {
                        type: 'streak',
                        name: '30-Day Master',
                        description: 'Practice for 30 consecutive days',
                        points: 500,
                        category: 'consistency',
                        rarity: 'epic',
                        icon: 'crown'
                    }
                },
                'Daily Dedication': {
                    condition: () => userStats.totalDaysPracticed >= 14,
                    data: {
                        type: 'streak',
                        name: 'Daily Dedication',
                        description: 'Practice daily for 14 days',
                        points: 400,
                        category: 'consistency',
                        rarity: 'rare',
                        icon: 'clock'
                    }
                }
            },
            
            // Performance achievements
            performance: {
                'First Steps': {
                    condition: () => userStats.testsTaken >= 1,
                    data: {
                        type: 'badge',
                        name: 'First Steps',
                        description: 'Complete your first practice test',
                        points: 100,
                        category: 'participation',
                        rarity: 'common',
                        icon: 'trophy'
                    }
                },
                'Quick Learner': {
                    condition: () => userStats.averageScore >= 90,
                    data: {
                        type: 'badge',
                        name: 'Quick Learner',
                        description: 'Score above 90% on any test',
                        points: 200,
                        category: 'performance',
                        rarity: 'rare',
                        icon: 'zap'
                    }
                },
                'Perfect Score': {
                    condition: () => userStats.highestScore === 100,
                    data: {
                        type: 'badge',
                        name: 'Perfect Score',
                        description: 'Get 100% on any assessment',
                        points: 800,
                        category: 'performance',
                        rarity: 'legendary',
                        icon: 'sparkles'
                    }
                },
                'Consistent Performer': {
                    condition: () => userStats.averageScore >= 80 && userStats.testsTaken >= 10,
                    data: {
                        type: 'badge',
                        name: 'Consistent Performer',
                        description: 'Maintain 80%+ average across 10+ tests',
                        points: 350,
                        category: 'performance',
                        rarity: 'epic',
                        icon: 'trending'
                    }
                }
            },
            
            // Volume achievements
            volume: {
                'Problem Solver': {
                    condition: () => userStats.questionsSolved >= 50,
                    data: {
                        type: 'milestone',
                        name: 'Problem Solver',
                        description: 'Solve 50+ coding problems',
                        points: 300,
                        category: 'volume',
                        rarity: 'rare',
                        icon: 'check'
                    }
                },
                'Practice Champion': {
                    condition: () => userStats.questionsSolved >= 200,
                    data: {
                        type: 'milestone',
                        name: 'Practice Champion',
                        description: 'Solve 200+ coding problems',
                        points: 750,
                        category: 'volume',
                        rarity: 'epic',
                        icon: 'medal'
                    }
                },
                'Test Taker': {
                    condition: () => userStats.testsTaken >= 10,
                    data: {
                        type: 'milestone',
                        name: 'Test Taker',
                        description: 'Complete 10+ practice tests',
                        points: 300,
                        category: 'volume',
                        rarity: 'rare',
                        icon: 'target'
                    }
                }
            },
            
            // Skill achievements
            skill: {
                'DSA Master': {
                    condition: () => {
                        const dsaProgress = userStats.categoryProgress?.find(c => c.name === 'DSA')?.progress;
                        return dsaProgress >= 80;
                    },
                    data: {
                        type: 'badge',
                        name: 'DSA Master',
                        description: 'Master Data Structures and Algorithms',
                        points: 600,
                        category: 'skill',
                        rarity: 'epic',
                        icon: 'sword'
                    }
                },
                'Aptitude Ace': {
                    condition: () => {
                        const aptitudeProgress = userStats.categoryProgress?.find(c => c.name === 'Aptitude')?.progress;
                        return aptitudeProgress >= 80;
                    },
                    data: {
                        type: 'badge',
                        name: 'Aptitude Ace',
                        description: 'Master all aptitude categories',
                        points: 400,
                        category: 'skill',
                        rarity: 'rare',
                        icon: 'gem'
                    }
                },
                'System Architect': {
                    condition: () => {
                        const designProgress = userStats.categoryProgress?.find(c => c.name === 'System Design')?.progress;
                        return designProgress >= 80;
                    },
                    data: {
                        type: 'badge',
                        name: 'System Architect',
                        description: 'Complete system design challenges',
                        points: 600,
                        category: 'skill',
                        rarity: 'legendary',
                        icon: 'shield'
                    }
                }
            },
            
            // Community achievements
            community: {
                'Community Helper': {
                    condition: () => userStats.helpfulAnswers >= 10,
                    data: {
                        type: 'special',
                        name: 'Community Helper',
                        description: 'Help 10+ other users',
                        points: 350,
                        category: 'community',
                        rarity: 'rare',
                        icon: 'users'
                    }
                },
                'Study Buddy': {
                    condition: () => userStats.groupSessions >= 5,
                    data: {
                        type: 'special',
                        name: 'Study Buddy',
                        description: 'Participate in 5+ group study sessions',
                        points: 300,
                        category: 'community',
                        rarity: 'rare',
                        icon: 'users'
                    }
                }
            }
        };

        // Check each category of achievements
        for (const category of Object.keys(achievementCriteria)) {
            for (const [achievementName, criteria] of Object.entries(achievementCriteria[category])) {
                if (criteria.condition()) {
                    const award = await awardAchievement(userId, criteria.data);
                    if (award) {
                        awards.push(award);
                    }
                }
            }
        }

        // Check for progress-based achievements
        await checkProgressAchievements(userId, userStats, activityType, metadata);

        return awards;
    } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
};

// Check progress-based achievements
export const checkProgressAchievements = async (userId, userStats, activityType, metadata) => {
    try {
        // Get all progress-based achievements for the user
        const progressAchievements = await Achievement.find({
            user: userId,
            progress: { $lt: 100 },
            isActive: true
        });

        for (const achievement of progressAchievements) {
            let newProgress = achievement.progress;
            
            // Update progress based on activity type
            switch (activityType) {
                case 'test_completed':
                    if (achievement.metadata.criteria?.type === 'tests_taken') {
                        newProgress = Math.min(100, (metadata.testsTaken / achievement.metadata.targetValue) * 100);
                    }
                    break;
                    
                case 'question_solved':
                    if (achievement.metadata.criteria?.type === 'questions_solved') {
                        newProgress = Math.min(100, (metadata.questionsSolved / achievement.metadata.targetValue) * 100);
                    }
                    break;
                    
                case 'streak_updated':
                    if (achievement.metadata.criteria?.type === 'streak_days') {
                        newProgress = Math.min(100, (metadata.currentStreak / achievement.metadata.targetValue) * 100);
                    }
                    break;
                    
                case 'category_mastered':
                    if (achievement.metadata.criteria?.type === 'category_progress') {
                        newProgress = Math.min(100, metadata.progress);
                    }
                    break;
            }
            
            if (newProgress > achievement.progress) {
                achievement.progress = newProgress;
                if (newProgress === 100) {
                    achievement.earnedAt = new Date();
                    
                    // Update user points
                    await User.findByIdAndUpdate(userId, {
                        $inc: { 'stats.points': achievement.points }
                    });
                    
                    // Record activity
                    await Activity.create({
                        user: userId,
                        type: 'achievement_unlocked',
                        title: `Achievement Unlocked: ${achievement.name}`,
                        description: `Congratulations! You've completed "${achievement.name}"`,
                        metadata: { achievementId: achievement._id, points: achievement.points }
                    });
                }
                await achievement.save();
            }
        }
    } catch (error) {
        console.error('Error checking progress achievements:', error);
    }
};

// Get achievement statistics for dashboard
export const getAchievementStats = async (req, res) => {
    try {
        const summary = await Achievement.getUserSummary(req.user._id);
        
        // Get recent achievements
        const recentAchievements = await Achievement.find({
            user: req.user._id,
            isActive: true,
            progress: 100
        })
        .sort({ earnedAt: -1 })
        .limit(5);
        
        // Get upcoming/close achievements
        const upcomingAchievements = await Achievement.find({
            user: req.user._id,
            isActive: true,
            progress: { $lt: 100, $gt: 0 }
        })
        .sort({ progress: -1 })
        .limit(5);
        
        res.json({
            success: true,
            data: {
                summary,
                recentAchievements,
                upcomingAchievements
            }
        });
    } catch (error) {
        console.error('Error getting achievement stats:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get leaderboard for achievements
export const getAchievementLeaderboard = async (req, res) => {
    try {
        const { timeFrame = 'all', limit = 20 } = req.query;
        
        let dateFilter = {};
        if (timeFrame === 'weekly') {
            dateFilter.earnedAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        } else if (timeFrame === 'monthly') {
            dateFilter.earnedAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
        }
        
        const leaderboard = await Achievement.aggregate([
            { $match: { ...dateFilter, isActive: true, progress: 100 } },
            {
                $group: {
                    _id: '$user',
                    totalPoints: { $sum: '$points' },
                    achievementCount: { $sum: 1 },
                    rareCount: { $sum: { $cond: [{ $eq: ['$rarity', 'rare'] }, 1, 0] } },
                    epicCount: { $sum: { $cond: [{ $eq: ['$rarity', 'epic'] }, 1, 0] } },
                    legendaryCount: { $sum: { $cond: [{ $eq: ['$rarity', 'legendary'] }, 1, 0] } },
                    latestAchievement: { $last: '$earnedAt' }
                }
            },
            { $sort: { totalPoints: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    userId: '$_id',
                    name: '$user.name',
                    avatar: '$user.avatar',
                    totalPoints: 1,
                    achievementCount: 1,
                    rareCount: 1,
                    epicCount: 1,
                    legendaryCount: 1,
                    level: { $floor: { $divide: ['$totalPoints', 500] } },
                    latestAchievement: 1
                }
            }
        ]);
        
        res.json({
            success: true,
            data: {
                leaderboard,
                timeFrame
            }
        });
    } catch (error) {
        console.error('Error getting achievement leaderboard:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};