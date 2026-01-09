import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, CheckCircle, Clock, Star } from "lucide-react";
import Loader from "@/components/Loader";

const topics = [
  { id: 1, name: "Arrays", count: 80, solved: 45 },
  { id: 2, name: "Strings", count: 50, solved: 30 },
  { id: 3, name: "Linked Lists", count: 40, solved: 20 },
  { id: 4, name: "Trees", count: 45, solved: 15 },
  { id: 5, name: "Graphs", count: 35, solved: 10 },
  { id: 6, name: "Dynamic Programming", count: 60, solved: 12 },
  { id: 7, name: "Recursion", count: 30, solved: 25 },
  { id: 8, name: "Sorting", count: 25, solved: 20 },
];

const problems = [
  { id: 1, title: "Two Sum", difficulty: "Easy", topic: "Arrays", solved: true, starred: true },
  { id: 2, title: "Reverse Linked List", difficulty: "Easy", topic: "Linked Lists", solved: true, starred: false },
  { id: 3, title: "Binary Tree Inorder", difficulty: "Medium", topic: "Trees", solved: false, starred: true },
  { id: 4, title: "Longest Substring", difficulty: "Medium", topic: "Strings", solved: false, starred: false },
  { id: 5, title: "Merge K Sorted Lists", difficulty: "Hard", topic: "Linked Lists", solved: false, starred: true },
  { id: 6, title: "Coin Change", difficulty: "Medium", topic: "DP", solved: true, starred: false },
];

const difficultyColors = {
  Easy: "text-success bg-success/10",
  Medium: "text-warning bg-warning/10",
  Hard: "text-destructive bg-destructive/10",
};

const DSA = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">DSA Practice</h1>
          <p className="text-muted-foreground">Master Data Structures & Algorithms</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search problems..."
              className="pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {topics.map((topic, index) => (
          <motion.button
            key={topic.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
            className={`p-4 rounded-xl text-center transition-all ${
              selectedTopic === topic.name
                ? "bg-primary text-primary-foreground"
                : "glass hover:border-primary/50"
            }`}
          >
            <p className="font-semibold text-sm">{topic.name}</p>
            <p className="text-xs opacity-70 mt-1">
              {topic.solved}/{topic.count}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Problems List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Problems</h3>
        </div>
        
        <div className="divide-y divide-border/30">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                {problem.solved ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-foreground">{problem.title}</p>
                <p className="text-xs text-muted-foreground">{problem.topic}</p>
              </div>
              
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColors[problem.difficulty as keyof typeof difficultyColors]}`}>
                {problem.difficulty}
              </span>
              
              <button className="p-1">
                <Star
                  className={`w-4 h-4 ${
                    problem.starred ? "text-warning fill-warning" : "text-muted-foreground"
                  }`}
                />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Demo Loader */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader text="Loading problems..." />
        </div>
      )}
    </div>
  );
};

export default DSA;
