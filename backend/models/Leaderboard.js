import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'allTime'],
    required: true
  },
  
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  rankings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    rank: {
      type: Number,
      required: true
    },
    change: {
      type: String,
      enum: ['up', 'down', 'same', 'new'],
      default: 'new'
    },
    stats: {
      testsTaken: {
        type: Number,
        default: 0
      },
      averageScore: {
        type: Number,
        default: 0
      },
      streak: {
        type: Number,
        default: 0
      }
    }
  }],
  
  totalParticipants: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
leaderboardSchema.index({ period: 1, startDate: 1, endDate: 1 });
leaderboardSchema.index({ period: 1, isActive: 1 });

// Methods
leaderboardSchema.methods.updateRankings = async function() {
  // This would typically run a cron job to update rankings
  const UserStats = mongoose.model('UserStats');
  const stats = await UserStats.find()
    .populate('userId', 'name email')
    .sort({ consistencyScore: -1, averageScore: -1 })
    .limit(100);

  this.rankings = stats.map((stat, index) => ({
    userId: stat.userId._id,
    name: stat.userId.name,
    score: stat.consistencyScore,
    rank: index + 1,
    stats: {
      testsTaken: stat.totalTests,
      averageScore: stat.averageScore,
      streak: stat.currentStreak
    }
  }));

  this.totalParticipants = stats.length;
  return this.save();
};

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
export default Leaderboard;