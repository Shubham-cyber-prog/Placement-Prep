import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, CheckCircle, Clock, Star, XCircle, BookOpen } from "lucide-react";
import Loader from "@/components/Loader";

// Static Data (Unchanged)
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
  { id: 6, title: "Coin Change", difficulty: "Medium", topic: "Dynamic Programming", solved: true, starred: false },
];

const difficultyColors = {
  Easy: "text-success bg-success/10",
  Medium: "text-warning bg-warning/10",
  Hard: "text-destructive bg-destructive/10",
};

const DSA = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading] = useState(false);

  // Memoized filter logic
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic = selectedTopic ? problem.topic === selectedTopic : true;
      return matchesSearch && matchesTopic;
    });
  }, [searchTerm, selectedTopic]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground italic uppercase tracking-tighter">DSA Practice</h1>
          <p className="text-muted-foreground text-sm">Master Data Structures & Algorithms</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => {setSearchTerm(""); setSelectedTopic(null);}}
            className="p-2 rounded-xl glass hover:bg-muted transition-colors text-muted-foreground"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {topics.map((topic, index) => (
          <motion.button
            key={topic.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
            className={`p-4 rounded-xl text-center transition-all border ${
              selectedTopic === topic.name
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                : "glass border-transparent hover:border-primary/50"
            }`}
          >
            <p className="font-bold text-[11px] uppercase tracking-tight leading-none mb-1 truncate">{topic.name}</p>
            <p className="text-[10px] font-black opacity-60">{topic.solved}/{topic.count}</p>
          </motion.button>
        ))}
      </div>

      {/* Problems Container */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-white/5 flex justify-between items-center">
          <h3 className="font-bold text-xs uppercase tracking-widest text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Problems Found ({filteredProblems.length})
          </h3>
        </div>
        
        {/* Problems List with Stabilized Layout */}
        <div className="flex flex-col">
          <AnimatePresence initial={false} mode="popLayout">
            {filteredProblems.map((problem) => (
              <motion.div
                key={problem.id}
                layout // Smooths the position change of surrounding items
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/dsa/problem/${problem.id}`)}
                className="flex items-center gap-4 p-4 border-b border-border/30 last:border-0 hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-muted/50 flex items-center justify-center border border-white/5 group-hover:border-primary/30">
                  {problem.solved ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground opacity-50" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {problem.title}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    {problem.topic}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-current/20 ${difficultyColors[problem.difficulty as keyof typeof difficultyColors]}`}>
                    {problem.difficulty}
                  </span>
                  
                  <button className="p-1 transition-transform hover:scale-110">
                    <Star
                      className={`w-4 h-4 ${
                        problem.starred ? "text-warning fill-warning" : "text-muted-foreground opacity-30"
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          <AnimatePresence>
            {filteredProblems.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <XCircle className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No matching problems found</p>
                <button 
                  onClick={() => {setSearchTerm(""); setSelectedTopic(null);}}
                  className="mt-4 text-[10px] font-black uppercase text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Demo Loader */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader text="Accessing Archive..." />
        </div>
      )}
    </div>
  );
};

export default DSA;