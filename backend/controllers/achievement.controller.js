import Achievement from "../models/Achievement.model.js";

// Get all achievements for a user
export const getUserAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find({ user: req.user._id })
            .sort({ earnedAt: -1 });

        res.json({
            achievements,
            totalAchievements: achievements.length,
            totalPoints: achievements.reduce((sum, a) => sum + a.points, 0)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Award an achievement to a user (internal function)
export const awardAchievement = async (userId, type, name, description, points = 0) => {
    try {
        // Check if achievement already exists
        const existing = await Achievement.findOne({ user: userId, name });
        if (existing) return null;

        const achievement = new Achievement({
            user: userId,
            type,
            name,
            description,
            points
        });

        await achievement.save();
        return achievement;
    } catch (error) {
        console.error('Error awarding achievement:', error);
        return null;
    }
};
