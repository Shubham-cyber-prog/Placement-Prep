import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['badge', 'streak', 'milestone', 'special'], 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    category: {
        type: String,
        enum: ['consistency', 'performance', 'volume', 'skill', 'speed', 'community', 'challenge', 'participation'],
        default: 'participation'
    },
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    icon: {
        type: String,
        default: 'trophy'
    },
    points: { 
        type: Number, 
        default: 0 
    },
    progress: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    metadata: {
        criteria: Object,
        targetValue: Number,
        currentValue: Number,
        unlockCondition: String
    },
    earnedAt: { 
        type: Date, 
        default: Date.now 
    },
    expiresAt: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

// Indexes for efficient queries
achievementSchema.index({ user: 1, type: 1 });
achievementSchema.index({ user: 1, category: 1 });
achievementSchema.index({ user: 1, earnedAt: -1 });
achievementSchema.index({ user: 1, rarity: 1 });
achievementSchema.index({ user: 1, isActive: 1 });

// Static method to get user's achievement summary
achievementSchema.statics.getUserSummary = async function(userId) {
    const achievements = await this.find({ user: userId, isActive: true });
    
    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const unlockedCount = achievements.length;
    
    // Group by category
    const byCategory = achievements.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1;
        return acc;
    }, {});
    
    // Group by rarity
    const byRarity = achievements.reduce((acc, a) => {
        acc[a.rarity] = (acc[a.rarity] || 0) + 1;
        return acc;
    }, {});
    
    // Calculate level based on total points
    const level = Math.floor(totalPoints / 500) + 1;
    const pointsToNextLevel = level * 500 - totalPoints;
    
    return {
        totalPoints,
        unlockedCount,
        level,
        pointsToNextLevel,
        byCategory,
        byRarity,
        latestAchievements: achievements.slice(0, 5),
        topAchievements: achievements
            .sort((a, b) => b.points - a.points)
            .slice(0, 3)
    };
};

// Instance method to check if achievement is recent
achievementSchema.methods.isRecent = function() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.earnedAt > sevenDaysAgo;
};

// Instance method to get formatted earned date
achievementSchema.methods.getFormattedDate = function() {
    return this.earnedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export default mongoose.model("Achievement", achievementSchema);