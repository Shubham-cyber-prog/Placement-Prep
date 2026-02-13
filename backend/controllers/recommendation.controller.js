import Recommendation from "../models/Recommendation.model.js";
import Progress from "../models/Progress.js";
import PracticeProblem from "../models/PracticeProblem.model.js";
import Topic from "../models/Topic.js";
import User from "../models/User.js";

// Analyze user progress with enhanced metrics
const analyzeUserProgress = async (userId) => {
    // Get user's progress with populated data
    const progress = await Progress.find({ user: userId })
        .populate('topic')
        .populate('problem')
        .lean();

    // Get user's profile for preferences
    const user = await User.findById(userId).lean();

    // Initialize stats
    const difficultyStats = { 
        Easy: { total: 0, completed: 0, avgTime: 0, totalTime: 0 },
        Medium: { total: 0, completed: 0, avgTime: 0, totalTime: 0 },
        Hard: { total: 0, completed: 0, avgTime: 0, totalTime: 0 } 
    };
    
    const topicStats = {};
    const recentActivity = [];

    // Calculate completion rates and performance metrics
    progress.forEach(p => {
        const diff = p.difficulty;
        if (difficultyStats[diff]) {
            difficultyStats[diff].total++;
            if (p.completionStatus === 'completed') {
                difficultyStats[diff].completed++;
                if (p.timeSpent) {
                    difficultyStats[diff].totalTime += p.timeSpent;
                }
            }
        }

        if (p.topic) {
            const topicId = p.topic._id.toString();
            if (!topicStats[topicId]) {
                topicStats[topicId] = { 
                    name: p.topic.name, 
                    total: 0, 
                    completed: 0,
                    avgScore: 0,
                    totalScore: 0
                };
            }
            topicStats[topicId].total++;
            if (p.completionStatus === 'completed') {
                topicStats[topicId].completed++;
                if (p.score) {
                    topicStats[topicId].totalScore += p.score;
                }
            }
        }

        // Track recent activity (last 30 days)
        if (new Date(p.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
            recentActivity.push(p);
        }
    });

    // Calculate averages
    Object.keys(difficultyStats).forEach(diff => {
        if (difficultyStats[diff].completed > 0) {
            difficultyStats[diff].avgTime = 
                difficultyStats[diff].totalTime / difficultyStats[diff].completed;
        }
    });

    Object.keys(topicStats).forEach(topicId => {
        if (topicStats[topicId].completed > 0) {
            topicStats[topicId].avgScore = 
                topicStats[topicId].totalScore / topicStats[topicId].completed;
        }
    });

    // Identify weak areas based on multiple factors
    const weakDifficulties = Object.keys(difficultyStats).filter(diff => {
        const stats = difficultyStats[diff];
        // Consider difficulty weak if:
        // 1. Completion rate < 60% AND there are attempts
        // 2. Average time is significantly higher than expected (if data available)
        return stats.total > 0 && (stats.completed / stats.total) < 0.6;
    });

    const weakTopics = Object.keys(topicStats).filter(topicId => {
        const stats = topicStats[topicId];
        // Consider topic weak if completion rate < 60% or avg score < 70%
        return stats.total > 0 && (
            (stats.completed / stats.total) < 0.6 || 
            (stats.avgScore && stats.avgScore < 70)
        );
    });

    // Identify strengths (topics with high performance)
    const strongTopics = Object.keys(topicStats).filter(topicId => {
        const stats = topicStats[topicId];
        return stats.total > 0 && 
               (stats.completed / stats.total) >= 0.8 && 
               (!stats.avgScore || stats.avgScore >= 85);
    });

    // Calculate learning pace
    const learningPace = recentActivity.length > 0 
        ? recentActivity.reduce((sum, p) => sum + (p.timeSpent || 30), 0) / recentActivity.length 
        : 30; // Default 30 minutes per item

    return { 
        weakDifficulties, 
        weakTopics, 
        strongTopics,
        difficultyStats,
        topicStats,
        learningPace,
        progress: progress,
        userPreferences: user?.preferences || {}
    };
};

// Generate personalized learning path with enhanced logic
const createPersonalizedPath = async (userId) => {
    const { 
        weakDifficulties, 
        weakTopics, 
        strongTopics,
        difficultyStats,
        topicStats,
        learningPace,
        progress,
        userPreferences 
    } = await analyzeUserProgress(userId);

    // Get user's completed problems to avoid repetition
    const completedProblemIds = progress
        .filter(p => p.completionStatus === 'completed' && p.problem)
        .map(p => p.problem?._id)
        .filter(Boolean);

    const path = {
        user: userId,
        weakAreas: { 
            difficulties: weakDifficulties, 
            topics: weakTopics.map(topicId => topicStats[topicId]?.name || topicId)
        },
        recommendations: [],
        timeline: [],
        estimatedTime: 0,
        stats: {
            totalCompleted: progress.filter(p => p.completionStatus === 'completed').length,
            totalAttempts: progress.length,
            strongTopics: strongTopics.map(topicId => topicStats[topicId]?.name)
        }
    };

    // Priority 1: Recommend problems for weak difficulties
    for (const diff of weakDifficulties) {
        // Find problems that are not completed and match the difficulty
        const problems = await PracticeProblem.find({ 
            difficulty: diff,
            _id: { $nin: completedProblemIds }
        })
        .limit(3) // Limit to 3 per difficulty
        .populate('topic')
        .lean();

        problems.forEach(problem => {
            path.recommendations.push({
                type: 'problem',
                item: {
                    _id: problem._id,
                    title: problem.title,
                    difficulty: problem.difficulty,
                    topic: problem.topic?.name
                },
                reason: `Strengthen your ${diff} problem-solving skills. ${
                    problem.topic ? `Focus on ${problem.topic.name} concepts.` : ''
                }`,
                priority: 'high',
                estimatedTime: diff === 'Easy' ? 20 : diff === 'Medium' ? 35 : 45
            });

            path.timeline.push({
                item: problem.title,
                type: 'practice',
                estimatedTime: diff === 'Easy' ? 20 : diff === 'Medium' ? 35 : 45
            });
            
            path.estimatedTime += diff === 'Easy' ? 20 : diff === 'Medium' ? 35 : 45;
        });
    }

    // Priority 2: Recommend topic study for weak topics
    for (const topicId of weakTopics) {
        const topic = await Topic.findById(topicId).lean();
        if (topic) {
            // Find relevant problems for this topic at appropriate difficulty
            const relevantProblems = await PracticeProblem.find({
                topic: topicId,
                _id: { $nin: completedProblemIds }
            })
            .limit(2)
            .lean();

            // Add topic study recommendation
            path.recommendations.push({
                type: 'topic',
                item: {
                    _id: topic._id,
                    name: topic.name,
                    description: topic.description
                },
                reason: `Master ${topic.name} fundamentals to improve your understanding`,
                priority: 'medium',
                estimatedTime: 60
            });

            path.timeline.push({
                item: `${topic.name} - Study`,
                type: 'study',
                estimatedTime: 60
            });
            
            path.estimatedTime += 60;

            // Add related problems
            relevantProblems.forEach(problem => {
                path.recommendations.push({
                    type: 'problem',
                    item: {
                        _id: problem._id,
                        title: problem.title,
                        difficulty: problem.difficulty
                    },
                    reason: `Practice ${problem.difficulty} problems in ${topic.name}`,
                    priority: 'medium',
                    estimatedTime: problem.difficulty === 'Easy' ? 20 : 
                                   problem.difficulty === 'Medium' ? 35 : 45
                });

                path.timeline.push({
                    item: problem.title,
                    type: 'practice',
                    estimatedTime: problem.difficulty === 'Easy' ? 20 : 
                                   problem.difficulty === 'Medium' ? 35 : 45
                });
                
                path.estimatedTime += problem.difficulty === 'Easy' ? 20 : 
                                     problem.difficulty === 'Medium' ? 35 : 45;
            });
        }
    }

    // Priority 3: Challenge recommendations for strong topics
    if (strongTopics.length > 0) {
        const challengingProblems = await PracticeProblem.find({
            topic: { $in: strongTopics },
            difficulty: 'Hard',
            _id: { $nin: completedProblemIds }
        })
        .limit(2)
        .populate('topic')
        .lean();

        challengingProblems.forEach(problem => {
            path.recommendations.push({
                type: 'problem',
                item: {
                    _id: problem._id,
                    title: problem.title,
                    difficulty: 'Hard',
                    topic: problem.topic?.name
                },
                reason: `Challenge yourself with advanced ${problem.topic?.name} problems`,
                priority: 'low',
                estimatedTime: 50
            });

            path.timeline.push({
                item: problem.title,
                type: 'challenge',
                estimatedTime: 50
            });
            
            path.estimatedTime += 50;
        });
    }

    // Sort recommendations by priority
    path.recommendations.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Limit total recommendations to avoid overwhelm
    if (path.recommendations.length > 10) {
        path.recommendations = path.recommendations.slice(0, 10);
    }

    // Adjust timeline based on learning pace
    path.timeline = path.timeline.slice(0, 7); // Max 7 items in timeline
    path.estimatedTime = Math.round(path.estimatedTime / learningPace * 30); // Normalize based on user's pace

    return path;
};

// Get recommendations with pagination and filtering
export const getRecommendations = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, type, priority } = req.query;
        const query = { user: req.user._id, isActive: true };

        if (type) query.type = type;
        if (priority) query.priority = priority;

        const recommendations = await Recommendation.find(query)
            .populate('recommendedItem')
            .sort({ confidence: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await Recommendation.countDocuments(query);

        res.json({
            recommendations,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        next(error);
    }
};

// Refresh recommendations with enhanced logic
export const refreshRecommendations = async (req, res, next) => {
    try {
        // Deactivate old recommendations
        await Recommendation.updateMany(
            { user: req.user._id }, 
            { isActive: false }
        );

        // Generate new recommendations based on current progress
        const { weakDifficulties, weakTopics, strongTopics } = 
            await analyzeUserProgress(req.user._id);

        const newRecommendations = [];

        // Generate recommendations for weak difficulties
        for (const diff of weakDifficulties) {
            const problems = await PracticeProblem.find({ difficulty: diff })
                .limit(3)
                .lean();

            problems.forEach(problem => {
                newRecommendations.push({
                    user: req.user._id,
                    type: 'problem',
                    recommendedItem: problem._id,
                    reason: `Improve your ${diff} problem-solving skills`,
                    confidence: 0.8,
                    priority: 'high'
                });
            });
        }

        // Generate recommendations for weak topics
        for (const topicId of weakTopics) {
            const topic = await Topic.findById(topicId).lean();
            
            newRecommendations.push({
                user: req.user._id,
                type: 'topic',
                recommendedItem: topicId,
                reason: `Review ${topic?.name || 'topic'} fundamentals`,
                confidence: 0.7,
                priority: 'medium'
            });

            // Add related problems
            const problems = await PracticeProblem.find({ topic: topicId })
                .limit(2)
                .lean();

            problems.forEach(problem => {
                newRecommendations.push({
                    user: req.user._id,
                    type: 'problem',
                    recommendedItem: problem._id,
                    reason: `Practice ${problem.difficulty} problems in ${topic?.name}`,
                    confidence: 0.6,
                    priority: 'medium'
                });
            });
        }

        // Add challenge recommendations for strong topics
        for (const topicId of strongTopics.slice(0, 2)) {
            const problems = await PracticeProblem.find({ 
                topic: topicId,
                difficulty: 'Hard'
            })
            .limit(1)
            .lean();

            problems.forEach(problem => {
                newRecommendations.push({
                    user: req.user._id,
                    type: 'problem',
                    recommendedItem: problem._id,
                    reason: 'Challenge yourself with advanced problems',
                    confidence: 0.5,
                    priority: 'low'
                });
            });
        }

        if (newRecommendations.length > 0) {
            await Recommendation.insertMany(newRecommendations);
        }

        res.json({ 
            message: "Recommendations refreshed successfully", 
            count: newRecommendations.length 
        });
    } catch (error) {
        next(error);
    }
};

// Generate personalized learning path endpoint
export const generatePersonalizedPath = async (req, res, next) => {
    try {
        const path = await createPersonalizedPath(req.user._id);
        
        // Save the generated path to user's history
        await Recommendation.updateMany(
            { user: req.user._id, isActive: true },
            { isActive: false }
        );

        res.json(path);
    } catch (error) {
        console.error('Error generating personalized path:', error);
        next(error);
    }
};

// Batch progress endpoint
export const getBatchProgress = async (req, res, next) => {
    try {
        const { itemIds } = req.body;
        
        if (!itemIds || !Array.isArray(itemIds)) {
            return res.status(400).json({ message: 'Invalid item IDs' });
        }

        const progress = await Progress.find({
            user: req.user._id,
            $or: [
                { problem: { $in: itemIds } },
                { topic: { $in: itemIds } }
            ]
        }).lean();

        const progressMap = {};
        progress.forEach(p => {
            const itemId = p.problem || p.topic;
            if (itemId) {
                progressMap[itemId.toString()] = p.completionStatus;
            }
        });

        res.json({ progress: progressMap });
    } catch (error) {
        next(error);
    }
};

// Update progress endpoint
export const updateProgress = async (req, res, next) => {
    try {
        const { itemId, status } = req.body;

        if (!itemId || !status) {
            return res.status(400).json({ message: 'Item ID and status are required' });
        }

        const progress = await Progress.findOneAndUpdate(
            {
                user: req.user._id,
                $or: [
                    { problem: itemId },
                    { topic: itemId }
                ]
            },
            {
                completionStatus: status,
                completedAt: status === 'completed' ? new Date() : null
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, progress });
    } catch (error) {
        next(error);
    }
};