import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Activity from '../models/Activity.js';
import TestSession from '../models/TestSession.js';

dotenv.config();

async function cleanupOldActivities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete activities older than 1 year (except permanent)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const activityResult = await Activity.deleteMany({
      createdAt: { $lt: oneYearAgo },
      retentionPeriod: { $ne: 'permanent' }
    });

    console.log(`Deleted ${activityResult.deletedCount} old activities`);

    // Archive test sessions older than 2 years
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const sessionResult = await TestSession.updateMany(
      {
        createdAt: { $lt: twoYearsAgo },
        isArchived: false
      },
      {
        $set: {
          isArchived: true,
          archiveReason: 'auto_archive_2_years'
        }
      }
    );

    console.log(`Archived ${sessionResult.modifiedCount} old test sessions`);

    // Update user analytics
    await updateUserAnalytics();

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
}

async function updateUserAnalytics() {
  // Update user statistics based on recent activities
  console.log('Updating user analytics...');
  // Implementation for updating user stats
}

// Run cleanup
cleanupOldActivities();