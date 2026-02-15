import { motion } from "framer-motion";
import { CheckCircle, XCircle, Zap, Target, Award } from "lucide-react";

const RecentActivity = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-6">Recent Activity</h3>
        <p className="text-gray-400 text-center py-8">No recent activity</p>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'test_taken':
        return CheckCircle;
      case 'question_solved':
        return Zap;
      case 'streak_milestone':
        return Award;
      case 'achievement_unlocked':
        return Award;
      default:
        return Target;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'test_taken':
        return 'text-green-500';
      case 'question_solved':
        return 'text-blue-500';
      case 'streak_milestone':
        return 'text-orange-500';
      case 'achievement_unlocked':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all"
            >
              <div className={`p-2 rounded-lg ${getActivityColor(activity.type).replace('text', 'bg')}/20`}>
                <Icon className={`w-4 h-4 ${getActivityColor(activity.type)}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-xs text-gray-400">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;