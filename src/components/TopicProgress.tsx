import { motion } from "framer-motion";

interface TopicProgressProps {
  topics: {
    name: string;
    solved: number;
    total: number;
    color: string;
  }[];
}

const TopicProgress = ({ topics }: TopicProgressProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Topic Progress</h3>

      <div className="space-y-5">
        {topics.map((topic, index) => {
          const percentage = Math.round((topic.solved / topic.total) * 100);
          
          return (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{topic.name}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {topic.solved}/{topic.total}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: topic.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TopicProgress;
