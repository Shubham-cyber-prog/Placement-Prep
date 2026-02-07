import Recommendation from "../models/Recommendation.model.js";
import Progress from "../models/Progress.model.js";
import PracticeProblem from "../models/PracticeProblem.js";
import Topic from "../models/Topic.js";

// Simple AI logic: Analyze user progress to identify weak areas and recommend targeted problems
const analyzeUserProgress = async (userId) => {
    // Get user's progress data
    const progress = await Progress.find({ user: userId }).populate('topic').populate('problem');

    // Calculate completion rates by difficulty
    const difficultyStats = { Easy: { total: 0, completed: 0 }, Medium: { total: 0, completed: 0 }, Hard: { total: 0, completed: 0 } };
    const topicStats = {};

    progress.forEach(p => {
        const diff = p.difficulty;
        difficultyStats[diff].total++;
        if (p.completionStatus === 'completed') {
            difficultyStats[diff].completed++;
        }

        const topicId = p.topic._id.toString();
        if (!topicStats[topicId]) {
            topicStats[topicId] = { name: p.topic.name, total: 0, completed: 0 };
        }
        topicStats[topicId].total++;
        if (p.completionStatus === 'completed') {
            topicStats[topicId].completed++;
        }
    });

    // Identify weak areas: difficulties with low completion rate (<50%)
    const weakDifficulties = Object.keys(difficultyStats).filter(diff =>
        difficultyStats[diff].total > 0 && (difficultyStats[diff].completed / difficultyStats[diff].total) < 0.5
    );

    // Identify weak topics: topics with low completion rate (<50%)
    const weakTopics = Object.keys(topicStats).filter(topicId =>
        topicStats[topicId].total > 0 && (topicStats[topicId].completed / topicStats[topicId].total) < 0.5
    );

    return { weakDifficulties, weakTopics, progress };
};

// Generate personalized learning path
const createPersonalizedPath = async (userId) => {
    const { weakDifficulties, weakTopics, progress } = await analyzeUserProgress(userId);

    const path = {
        user: userId,
        weakAreas: { difficulties: weakDifficulties, topics: weakTopics },
        recommendations: [],
        timeline: [],
        estimatedTime: 0
    };

    // Recommend problems based on weak areas
    for (const diff of weakDifficulties) {
        const problems = await PracticeProblem.find({ difficulty: diff }).limit(5); // Recommend 5 problems per weak difficulty
        problems.forEach(problem => {
            path.recommendations.push({
                type: 'problem',
                item: problem,
                reason: `Strengthen ${diff} problem-solving skills`,
                priority: 'high'
            });
            path.timeline.push({
                item: problem.title,
                type: 'practice',
                estimatedTime: 30 // minutes
            });
            path.estimatedTime += 30;
        });
    }

    // Recommend topics
    for (const topicId of weakTopics) {
        const topic = await Topic.findById(topicId);
        path.recommendations.push({
            type: 'topic',
            item: topic,
            reason: `Focus on ${topic.name} concepts`,
            priority: 'medium'
        });
        path.timeline.push({
            item: topic.name,
            type: 'study',
            estimatedTime: 60 // minutes
        });
        path.estimatedTime += 60;
    }

    return path;
};

export const getRecommendations = async (req, res, next) => {
    try {
        const recommendations = await Recommendation.find({ user: req.user._id, isActive: true })
            .populate('recommendedItem')
            .sort({ confidence: -1 });

        res.json(recommendations);
    } catch (error) {
        next(error);
    }
};

export const refreshRecommendations = async (req, res, next) => {
    try {
        // Deactivate old recommendations
        await Recommendation.updateMany({ user: req.user._id }, { isActive: false });

        // Generate new recommendations based on progress
        const { weakDifficulties, weakTopics } = await analyzeUserProgress(req.user._id);

        const newRecommendations = [];

        for (const diff of weakDifficulties) {
            const problems = await PracticeProblem.find({ difficulty: diff }).limit(3);
            problems.forEach(problem => {
                newRecommendations.push({
                    user: req.user._id,
                    type: 'problem',
                    recommendedItem: problem._id,
                    reason: `Improve ${diff} problem-solving`,
                    confidence: 0.7
                });
            });
        }

        for (const topicId of weakTopics) {
            newRecommendations.push({
                user: req.user._id,
                type: 'topic',
                recommendedItem: topicId,
                reason: `Study ${topicId} topic`,
                confidence: 0.6
            });
        }

        await Recommendation.insertMany(newRecommendations);

        res.json({ message: "Recommendations refreshed", count: newRecommendations.length });
    } catch (error) {
        next(error);
    }
};

export const generatePersonalizedPath = async (req, res, next) => {
    try {
        const path = await createPersonalizedPath(req.user._id);
        res.json(path);
    } catch (error) {
        next(error);
    }
};
