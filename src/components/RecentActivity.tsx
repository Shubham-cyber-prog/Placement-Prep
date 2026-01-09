import { motion } from "framer-motion";
import { CheckCircle2, Code2, Brain, FileText, Trophy } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "dsa",
    title: "Solved Two Sum Problem",
    time: "2 hours ago",
    icon: Code2,
    color: "text-success",
  },
  {
    id: 2,
    type: "aptitude",
    title: "Completed Time & Work Quiz",
    time: "4 hours ago",
    icon: Brain,
    color: "text-info",
  },
  {
    id: 3,
    type: "resume",
    title: "Updated Resume",
    time: "Yesterday",
    icon: FileText,
    color: "text-warning",
  },
  {
    id: 4,
    type: "test",
    title: "Mock Test Completed - 85%",
    time: "2 days ago",
    icon: Trophy,
    color: "text-primary",
  },
  {
    id: 5,
    type: "dsa",
    title: "Solved Binary Search Tree",
    time: "3 days ago",
    icon: Code2,
    color: "text-success",
  },
];

const RecentActivity = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className={`p-2 rounded-lg bg-muted/50 ${activity.color}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentActivity;
