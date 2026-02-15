import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, CheckCircle, Clock, Star, XCircle, 
  BookOpen, Trophy, Target, Zap, ChevronRight, Briefcase,
  TrendingUp, Users, Award, Brain, Cpu, Lock, Unlock, Flame,
  BarChart3, Hash, List, Network, GitBranch, Table,
  MessageSquare, FileCode, Terminal, Code, RotateCcw
} from "lucide-react";
import Loader from "@/components/Loader";
import { useToast } from "@/hooks/use-toast";

// Complete DSA Topics
const topics = [
  { id: 1, name: "Arrays", count: 120, solved: 7, icon: <Table className="w-5 h-5" />, color: "bg-blue-500/20 text-blue-500" },
  { id: 2, name: "Strings", count: 85, solved: 6, icon: <MessageSquare className="w-5 h-5" />, color: "bg-green-500/20 text-green-500" },
  { id: 3, name: "Linked Lists", count: 65, solved: 5, icon: <List className="w-5 h-5" />, color: "bg-purple-500/20 text-purple-500" },
  { id: 4, name: "Trees", count: 90, solved: 6, icon: <GitBranch className="w-5 h-5" />, color: "bg-emerald-500/20 text-emerald-500" },
  { id: 5, name: "Graphs", count: 75, solved: 5, icon: <Network className="w-5 h-5" />, color: "bg-orange-500/20 text-orange-500" },
  { id: 6, name: "Dynamic Programming", count: 110, solved: 7, icon: <Zap className="w-5 h-5" />, color: "bg-red-500/20 text-red-500" },
  { id: 7, name: "Recursion", count: 45, solved: 0, icon: <GitBranch className="w-5 h-5" />, color: "bg-cyan-500/20 text-cyan-500" },
  { id: 8, name: "Sorting & Searching", count: 55, solved: 0, icon: <Filter className="w-5 h-5" />, color: "bg-pink-500/20 text-pink-500" },
  { id: 9, name: "Greedy", count: 40, solved: 1, icon: <TrendingUp className="w-5 h-5" />, color: "bg-yellow-500/20 text-yellow-500" },
  { id: 10, name: "Backtracking", count: 35, solved: 0, icon: <RotateCcw className="w-5 h-5" />, color: "bg-indigo-500/20 text-indigo-500" },
  { id: 11, name: "Stack & Queue", count: 50, solved: 1, icon: <List className="w-5 h-5" />, color: "bg-teal-500/20 text-teal-500" },
  { id: 12, name: "Heap", count: 30, solved: 3, icon: <BarChart3 className="w-5 h-5" />, color: "bg-rose-500/20 text-rose-500" },
  { id: 13, name: "Hash Table", count: 40, solved: 1, icon: <Hash className="w-5 h-5" />, color: "bg-amber-500/20 text-amber-500" },
  { id: 14, name: "Trie", count: 20, solved: 3, icon: <FileCode className="w-5 h-5" />, color: "bg-lime-500/20 text-lime-500" },
  { id: 15, name: "Segment Tree", count: 25, solved: 0, icon: <Code className="w-5 h-5" />, color: "bg-violet-500/20 text-violet-500" },
  { id: 16, name: "Bit Manipulation", count: 35, solved: 0, icon: <Terminal className="w-5 h-5" />, color: "bg-fuchsia-500/20 text-fuchsia-500" },
];

// 50 Unique DSA Problems with detailed data
const problems = [
  // Arrays (7 problems)
  { id: 1, title: "Two Sum", difficulty: "Easy", topic: "Arrays", solved: true, starred: true, timeLimit: 2000, spaceLimit: "O(n)", acceptance: 49.3, frequency: 95, companies: ["Google", "Amazon", "Meta"] },
  { id: 2, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topic: "Arrays", solved: false, starred: false, timeLimit: 2000, spaceLimit: "O(1)", acceptance: 54.2, frequency: 85, companies: ["Bloomberg", "Goldman Sachs"] },
  { id: 3, title: "Contains Duplicate", difficulty: "Easy", topic: "Arrays", solved: true, starred: false, timeLimit: 1000, spaceLimit: "O(n)", acceptance: 61.8, frequency: 70, companies: ["Adobe", "Apple"] },
  { id: 4, title: "Product of Array Except Self", difficulty: "Medium", topic: "Arrays", solved: false, starred: true, timeLimit: 2000, spaceLimit: "O(1)", acceptance: 63.5, frequency: 90, companies: ["Facebook", "Microsoft"] },
  { id: 5, title: "Maximum Subarray", difficulty: "Medium", topic: "Arrays", solved: true, starred: false, timeLimit: 1000, spaceLimit: "O(1)", acceptance: 49.8, frequency: 88, companies: ["Amazon", "LinkedIn"] },
  { id: 6, title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", topic: "Arrays", solved: false, starred: false, timeLimit: 1500, spaceLimit: "O(1)", acceptance: 47.3, frequency: 75, companies: ["Google", "Uber"] },
  { id: 7, title: "Search in Rotated Sorted Array", difficulty: "Medium", topic: "Arrays", solved: true, starred: true, timeLimit: 1500, spaceLimit: "O(1)", acceptance: 38.6, frequency: 82, companies: ["Microsoft", "Apple"] },
  
  // Strings (6 problems)
  { id: 8, title: "Valid Palindrome", difficulty: "Easy", topic: "Strings", solved: true, starred: false, timeLimit: 1000, spaceLimit: "O(1)", acceptance: 42.8, frequency: 65, companies: ["Facebook", "Google"] },
  { id: 9, title: "Valid Anagram", difficulty: "Easy", topic: "Strings", solved: true, starred: false, timeLimit: 1000, spaceLimit: "O(1)", acceptance: 61.2, frequency: 78, companies: ["Amazon", "Microsoft"] },
  { id: 10, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topic: "Strings", solved: false, starred: true, timeLimit: 2000, spaceLimit: "O(n)", acceptance: 33.8, frequency: 92, companies: ["Amazon", "Bloomberg"] },
  { id: 11, title: "Longest Palindromic Substring", difficulty: "Medium", topic: "Strings", solved: false, starred: false, timeLimit: 2000, spaceLimit: "O(1)", acceptance: 31.4, frequency: 85, companies: ["Google", "Apple"] },
  { id: 12, title: "String to Integer (atoi)", difficulty: "Medium", topic: "Strings", solved: false, starred: false, timeLimit: 1000, spaceLimit: "O(1)", acceptance: 16.7, frequency: 68, companies: ["Amazon", "Microsoft"] },
  { id: 13, title: "Group Anagrams", difficulty: "Medium", topic: "Strings", solved: true, starred: true, timeLimit: 1500, spaceLimit: "O(nk)", acceptance: 64.2, frequency: 80, companies: ["Facebook", "Uber"] },
  
  // Linked Lists (5 problems)
  { id: 14, title: "Reverse Linked List", difficulty: "Easy", topic: "Linked Lists", solved: true, starred: false, timeLimit: 1000, spaceLimit: "O(1)", acceptance: 71.3, frequency: 88, companies: ["Microsoft", "Amazon"] },
  { id: 15, title: "Merge Two Sorted Lists", difficulty: "Easy", topic: "Linked Lists", solved: true, starred: false, timeLimit: 1000, spaceLimit: "O(1)", acceptance: 62.4, frequency: 82, companies: ["Google", "Facebook"] },
  { id: 16, title: "Linked List Cycle", difficulty: "Easy", topic: "Linked Lists", solved: false, starred: false, timeLimit: 1000, spaceLimit: "O(1)", acceptance: 45.9, frequency: 75, companies: ["Amazon", "Microsoft"] },
  { id: 17, title: "Merge k Sorted Lists", difficulty: "Hard", topic: "Linked Lists", solved: false, starred: true, timeLimit: 2000, spaceLimit: "O(1)", acceptance: 47.2, frequency: 90, companies: ["Google", "Airbnb"] },
  { id: 18, title: "Copy List with Random Pointer", difficulty: "Medium", topic: "Linked Lists", solved: false, starred: false, timeLimit: 1500, spaceLimit: "O(n)", acceptance: 48.6, frequency: 72, companies: ["Amazon", "Facebook"] },
  
  // Trees (6 problems)
  { id: 19, title: "Maximum Depth of Binary Tree", difficulty: "Easy", topic: "Trees", solved: true, starred: false, timeLimit: 1000, spaceLimit: "O(h)", acceptance: 73.8, frequency: 78, companies: ["Google", "Amazon"] },
  { id: 20, title: "Validate Binary Search Tree", difficulty: "Medium", topic: "Trees", solved: false, starred: true, timeLimit: 1500, spaceLimit: "O(h)", acceptance: 31.2, frequency: 85, companies: ["Facebook", "Microsoft"] },
  { id: 21, title: "Binary Tree Level Order Traversal", difficulty: "Medium", topic: "Trees", solved: true, starred: false, timeLimit: 1500, spaceLimit: "O(n)", acceptance: 64.5, frequency: 80, companies: ["Amazon", "Bloomberg"] },
  { id: 22, title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", topic: "Trees", solved: false, starred: true, timeLimit: 2000, spaceLimit: "O(n)", acceptance: 56.4, frequency: 88, companies: ["Google", "LinkedIn"] },
  { id: 23, title: "Construct Binary Tree from Preorder and Inorder", difficulty: "Medium", topic: "Trees", solved: false, starred: false, timeLimit: 1500, spaceLimit: "O(n)", acceptance: 58.9, frequency: 72, companies: ["Microsoft", "Amazon"] },
  { id: 24, title: "Lowest Common Ancestor of BST", difficulty: "Easy", topic: "Trees", solved: true, starred: false, timeLimit: 1000, spaceLimit: "O(h)", acceptance: 55.6, frequency: 68, companies: ["Facebook", "Google"] },
  
  // Dynamic Programming (7 problems)
  { id: 25, title: "Climbing Stairs", difficulty: "Easy", topic: "Dynamic Programming", solved: true, starred: false, timeLimit: 1000, spaceLimit: "O(n)", acceptance: 51.3, frequency: 82, companies: ["Amazon", "Adobe"] },
  { id: 26, title: "Coin Change", difficulty: "Medium", topic: "Dynamic Programming", solved: false, starred: true, timeLimit: 2000, spaceLimit: "O(amount)", acceptance: 41.7, frequency: 92, companies: ["Google", "Goldman Sachs"] },
  { id: 27, title: "Longest Increasing Subsequence", difficulty: "Medium", topic: "Dynamic Programming", solved: false, starred: false, timeLimit: 1500, spaceLimit: "O(n)", acceptance: 53.8, frequency: 85, companies: ["Microsoft", "Amazon"] },
  { id: 28, title: "Word Break", difficulty: "Medium", topic: "Dynamic Programming", solved: false, starred: false, timeLimit: 1500, spaceLimit: "O(n²)", acceptance: 45.2, frequency: 78, companies: ["Facebook", "Google"] },
  { id: 29, title: "House Robber", difficulty: "Medium", topic: "Dynamic Programming", solved: true, starred: true, timeLimit: 1000, spaceLimit: "O(1)", acceptance: 49.6, frequency: 80, companies: ["Google", "Microsoft"] },
  { id: 30, title: "Unique Paths", difficulty: "Medium", topic: "Dynamic Programming", solved: false, starred: false, timeLimit: 1000, spaceLimit: "O(n)", acceptance: 62.4, frequency: 75, companies: ["Amazon", "Bloomberg"] },
  { id: 31, title: "Maximum Product Subarray", difficulty: "Medium", topic: "Dynamic Programming", solved: false, starred: true, timeLimit: 1500, spaceLimit: "O(1)", acceptance: 35.8, frequency: 82, companies: ["LinkedIn", "Amazon"] },
  
  // Graphs (5 problems)
  { id: 32, title: "Number of Islands", difficulty: "Medium", topic: "Graphs", solved: false, starred: true, timeLimit: 2000, spaceLimit: "O(mn)", acceptance: 57.9, frequency: 90, companies: ["Amazon", "Google"] },
  { id: 33, title: "Course Schedule", difficulty: "Medium", topic: "Graphs", solved: false, starred: false, timeLimit: 1500, spaceLimit: "O(V+E)", acceptance: 45.3, frequency: 85, companies: ["Microsoft", "Facebook"] },
  { id: 34, title: "Clone Graph", difficulty: "Medium", topic: "Graphs", solved: false, starred: true, timeLimit: 1500, spaceLimit: "O(V+E)", acceptance: 48.7, frequency: 78, companies: ["Google", "Uber"] },
  { id: 35, title: "Word Ladder", difficulty: "Hard", topic: "Graphs", solved: false, starred: false, timeLimit: 2000, spaceLimit: "O(M²N)", acceptance: 36.4, frequency: 88, companies: ["Amazon", "LinkedIn"] },
  { id: 36, title: "Alien Dictionary", difficulty: "Hard", topic: "Graphs", solved: false, starred: true, timeLimit: 2000, spaceLimit: "O(V+E)", acceptance: 34.9, frequency: 72, companies: ["Google", "Airbnb"] },
  
  // Additional problems (37-50)
  { id: 37, title: "Trapping Rain Water", difficulty: "Hard", topic: "Arrays", solved: false, starred: true, timeLimit: 2000, spaceLimit: "O(1)", acceptance: 57.6, frequency: 95, companies: ["Google", "Facebook"] },
  { id: 38, title: "Find Median from Data Stream", difficulty: "Hard", topic: "Heap", solved: false, starred: false, timeLimit: 1500, spaceLimit: "O(n)", acceptance: 51.2, frequency: 85, companies: ["Amazon", "Microsoft"] },
  { id: 39, title: "Kth Largest Element in Array", difficulty: "Medium", topic: "Heap", solved: true, starred: true, timeLimit: 1000, spaceLimit: "O(k)", acceptance: 64.8, frequency: 82, companies: ["Facebook", "Google"] },
  { id: 40, title: "Task Scheduler", difficulty: "Medium", topic: "Greedy", solved: false, starred: false, timeLimit: 1500, spaceLimit: "O(n)", acceptance: 52.7, frequency: 78, companies: ["Google", "Uber"] },
  { id: 41, title: "LRU Cache", difficulty: "Medium", topic: "Hash Table", solved: false, starred: true, timeLimit: 1000, spaceLimit: "O(capacity)", acceptance: 40.3, frequency: 92, companies: ["Amazon", "Microsoft"] },
  { id: 42, title: "Minimum Window Substring", difficulty: "Hard", topic: "Strings", solved: false, starred: false, timeLimit: 2000, spaceLimit: "O(n)", acceptance: 39.5, frequency: 88, companies: ["Facebook", "LinkedIn"] },
  { id: 43, title: "Edit Distance", difficulty: "Hard", topic: "Dynamic Programming", solved: false, starred: true, timeLimit: 2000, spaceLimit: "O(mn)", acceptance: 48.2, frequency: 85, companies: ["Google", "Amazon"] },
  { id: 44, title: "Regular Expression Matching", difficulty: "Hard", topic: "Dynamic Programming", solved: false, starred: false, timeLimit: 2000, spaceLimit: "O(mn)", acceptance: 27.6, frequency: 78, companies: ["Facebook", "Uber"] },
  { id: 45, title: "Wildcard Matching", difficulty: "Hard", topic: "Dynamic Programming", solved: false, starred: true, timeLimit: 2000, spaceLimit: "O(mn)", acceptance: 26.8, frequency: 72, companies: ["Google", "Microsoft"] },
  { id: 46, title: "Sliding Window Maximum", difficulty: "Hard", topic: "Heap", solved: false, starred: false, timeLimit: 1500, spaceLimit: "O(n)", acceptance: 45.3, frequency: 82, companies: ["Amazon", "Google"] },
  { id: 47, title: "Basic Calculator", difficulty: "Hard", topic: "Stack & Queue", solved: false, starred: true, timeLimit: 1500, spaceLimit: "O(n)", acceptance: 38.7, frequency: 75, companies: ["Facebook", "Microsoft"] },
  { id: 48, title: "Implement Trie (Prefix Tree)", difficulty: "Medium", topic: "Trie", solved: true, starred: false, timeLimit: 1000, spaceLimit: "O(n)", acceptance: 59.4, frequency: 80, companies: ["Google", "Amazon"] },
  { id: 49, title: "Design Add and Search Words Data Structure", difficulty: "Medium", topic: "Trie", solved: false, starred: true, timeLimit: 1500, spaceLimit: "O(n)", acceptance: 43.2, frequency: 78, companies: ["Amazon", "Microsoft"] },
  { id: 50, title: "Word Search II", difficulty: "Hard", topic: "Trie", solved: false, starred: false, timeLimit: 2000, spaceLimit: "O(mn)", acceptance: 36.8, frequency: 85, companies: ["Facebook", "Uber"] },
];

const difficultyColors = {
  Easy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  Hard: "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

interface DSAStats {
  totalProblems: number;
  solvedProblems: number;
  accuracy: number;
  streak: number;
  rank: number;
  topicsMastered: number;
}

const DSA = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DSAStats>({
    totalProblems: problems.length,
    solvedProblems: problems.filter(p => p.solved).length,
    accuracy: 78,
    streak: 12,
    rank: 245,
    topicsMastered: 6
  });
  const [userActivity] = useState([
    { action: 'solve', problemTitle: 'Two Sum', timeAgo: '2h ago' },
    { action: 'attempt', problemTitle: 'Trapping Rain Water', timeAgo: '4h ago' },
    { action: 'star', problemTitle: 'LRU Cache', timeAgo: '1d ago' }
  ]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleProblemClick = (problemId: number) => {
    console.log(`Navigating to problem ${problemId}`);
    navigate(`/dsa/problem/${problemId}`);
  };

  const toggleStar = async (problemId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const problem = problems.find(p => p.id === problemId);
    if (problem) {
      problem.starred = !problem.starred;
      
      toast({
        title: problem.starred ? "Problem starred" : "Problem unstarred",
        description: `"${problem.title}" ${problem.starred ? 'added to' : 'removed from'} favorites`,
      });
    }
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic = selectedTopic ? problem.topic === selectedTopic : true;
      return matchesSearch && matchesTopic;
    });
  }, [searchTerm, selectedTopic]);

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return <CheckCircle className="w-3 h-3" />;
      case 'Medium': return <Clock className="w-3 h-3" />;
      case 'Hard': return <Flame className="w-3 h-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader text="Loading DSA Portal..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground italic uppercase tracking-tighter flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                DSA Practice Arena
              </h1>
              <p className="text-muted-foreground text-sm">Master Data Structures & Algorithms for Technical Interviews</p>
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

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rank</span>
              </div>
              <p className="text-2xl font-black">#{stats.rank}</p>
              <p className="text-[10px] text-muted-foreground">Top 5% globally</p>
            </div>
            
            <div className="glass p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Solved</span>
              </div>
              <p className="text-2xl font-black">{stats.solvedProblems}</p>
              <p className="text-[10px] text-muted-foreground">of {stats.totalProblems} problems</p>
            </div>
            
            <div className="glass p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Accuracy</span>
              </div>
              <p className="text-2xl font-black">{stats.accuracy}%</p>
              <p className="text-[10px] text-muted-foreground">Last 30 days</p>
            </div>
            
            <div className="glass p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Streak</span>
              </div>
              <p className="text-2xl font-black">{stats.streak} days</p>
              <p className="text-[10px] text-muted-foreground">Current streak</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="lg:w-1/3">
          <div className="glass p-6 rounded-2xl border border-white/5 h-full">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              Weekly Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                  <span>Problems Solved</span>
                  <span className="text-muted-foreground">12/35</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "34%" }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                  <span>Time Spent</span>
                  <span className="text-muted-foreground">8h 42m</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                  <span>Topics Covered</span>
                  <span className="text-muted-foreground">6/16</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "37.5%" }}
                    className="h-full bg-purple-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Recent Activity</h4>
              <div className="space-y-2">
                {userActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 text-[10px]">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.action === 'solve' ? 'bg-emerald-500' :
                      activity.action === 'attempt' ? 'bg-amber-500' : 'bg-primary'
                    }`} />
                    <span className="truncate">{activity.problemTitle}</span>
                    <span className="text-muted-foreground ml-auto">{activity.timeAgo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {topics.map((topic, index) => (
          <motion.button
            key={topic.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
            className={`p-4 rounded-xl text-center transition-all border group ${
              selectedTopic === topic.name
                ? `${topic.color.replace('20', '50')} border-current shadow-lg shadow-current/20`
                : "glass border-transparent hover:border-current/50"
            }`}
          >
            <div className="mb-2 flex justify-center">
              <div className={`p-2 rounded-lg ${selectedTopic === topic.name ? 'bg-current/20' : 'bg-white/5'}`}>
                {topic.icon}
              </div>
            </div>
            <p className="font-bold text-[11px] uppercase tracking-tight leading-none mb-1 truncate">{topic.name}</p>
            <p className="text-[10px] font-black opacity-60">{topic.solved}/{topic.count}</p>
          </motion.button>
        ))}
      </div>

      {/* Problems Container */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-white/5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-xs uppercase tracking-widest text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Problems Found ({filteredProblems.length})
            </h3>
            {selectedTopic && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                {selectedTopic}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Sort by: <span className="text-foreground">Difficulty</span>
            </span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <AnimatePresence initial={false} mode="popLayout">
            {filteredProblems.map((problem) => (
              <motion.div
                key={problem.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleProblemClick(problem.id)}
                className="flex items-center gap-4 p-4 border-b border-border/30 last:border-0 hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${
                  problem.solved 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                    : "bg-muted/50 border-white/5 text-muted-foreground opacity-50"
                } group-hover:border-primary/30 transition-colors`}>
                  {problem.solved ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {problem.title}
                    </p>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-muted-foreground">Acceptance:</span>
                      <span className="font-bold">{problem.acceptance}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      {problem.topic}
                    </p>
                    <div className="flex items-center gap-1 text-[10px]">
                      <Cpu className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{problem.timeLimit}ms</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-muted-foreground">Space:</span>
                      <span className="font-mono">{problem.spaceLimit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {problem.companies?.slice(0, 2).map((comp, idx) => (
                        <span key={idx} className="text-[8px] font-bold uppercase bg-white/5 px-2 py-0.5 rounded">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                    difficultyColors[problem.difficulty as keyof typeof difficultyColors]
                  }`}>
                    <div className="flex items-center gap-1">
                      {getDifficultyIcon(problem.difficulty)}
                      {problem.difficulty}
                    </div>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500"
                        style={{ width: `${problem.frequency}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold">
                      {problem.frequency}%
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => toggleStar(problem.id, e)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        problem.starred ? "text-amber-500 fill-amber-500" : "text-muted-foreground opacity-30"
                      }`}
                    />
                  </button>
                  
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

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
        </div>
      </div>

      {/* Advanced Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Practice Mode */}
        <div className="glass p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-black uppercase tracking-widest">Practice Modes</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors group">
              <Clock className="w-6 h-6 text-primary mb-2" />
              <span className="text-[10px] font-bold uppercase">Timed</span>
              <span className="text-[8px] text-muted-foreground mt-1">Speed Run</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors group">
              <Brain className="w-6 h-6 text-emerald-500 mb-2" />
              <span className="text-[10px] font-bold uppercase">Pattern</span>
              <span className="text-[8px] text-muted-foreground mt-1">Learn Types</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors group">
              <Target className="w-6 h-6 text-amber-500 mb-2" />
              <span className="text-[10px] font-bold uppercase">Mock</span>
              <span className="text-[8px] text-muted-foreground mt-1">Interview</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors group">
              <Users className="w-6 h-6 text-purple-500 mb-2" />
              <span className="text-[10px] font-bold uppercase">Group</span>
              <span className="text-[8px] text-muted-foreground mt-1">Study</span>
            </button>
          </div>
        </div>

        {/* Company Tags */}
        <div className="glass p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-black uppercase tracking-widest">Company Focus</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "FAANG", count: 42, color: "bg-orange-500/20 text-orange-500" },
              { name: "MAANG", count: 38, color: "bg-blue-500/20 text-blue-500" },
              { name: "Unicorn", count: 25, color: "bg-purple-500/20 text-purple-500" },
              { name: "Finance", count: 18, color: "bg-emerald-500/20 text-emerald-500" },
            ].map((company) => (
              <button key={company.name} className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${company.color.split(' ')[0]}`} />
                  <span className="text-[11px] font-bold">{company.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black">{company.count}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </button>
            ))}
          </div>
          <button className="w-full mt-4 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors">
            View Company Problems
          </button>
        </div>

        {/* Achievement Card */}
        <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 rounded-2xl border border-primary/20 flex flex-col justify-between relative overflow-hidden group">
          <Award className="absolute -right-4 -top-4 w-24 h-24 text-primary/10 rotate-12 group-hover:scale-110 transition-transform" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-tighter">Achievements</h3>
            </div>
            <p className="text-3xl font-black text-primary">{stats.topicsMastered}/16</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">Topics Mastered</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`aspect-square rounded-lg flex items-center justify-center ${
                i <= stats.topicsMastered 
                  ? 'bg-primary/30 border border-primary/50' 
                  : 'bg-white/5 border border-white/10'
              }`}>
                {i <= stats.topicsMastered ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground opacity-50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSA;