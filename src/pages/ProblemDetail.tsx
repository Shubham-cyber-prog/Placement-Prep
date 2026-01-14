import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Play, Send, BookOpen, Code2, CheckCircle, 
  Clock, Star, RotateCcw, Lightbulb, MessageSquare, 
  Target, Copy, History, Terminal, Database, Zap, BarChart3, 
  Settings2, ShieldAlert, Cpu, Activity, X, Moon, Sun, Wand2, 
  Briefcase, TrendingUp, Trophy, UserCheck, SearchCode, 
  ShieldCheck, AlertCircle, Gauge, BrainCircuit, DollarSign, Fingerprint, Award, BarChart
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- PROFESSIONAL PLACEMENT ARCHIVE (10 ELITE SESSION NODES) ---
const placementArchive: Record<string, any> = {
  "1": {
    id: "DSA-01", title: "Two Sum", difficulty: "Easy", topic: "Arrays", complexity: "O(n) Time",
    hiringProbability: "94% - FAANG Favorite", recruiterInsight: "Hiring managers check if you reach for a HashMap immediately.",
    managerRedFlags: ["Nested for-loops", "Failing to check for empty input"],
    psychFollowUp: "Interviewer: 'What if the input array was sorted? Could you do this with O(1) space?'",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }],
    constraints: ["2 <= nums.length <= 10^4"],
    starterCode: "function twoSum(nums, target) {\n    \n}",
    solutionCode: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    let diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n};"
  },
  "2": {
    id: "DSA-02", title: "Valid Parentheses", difficulty: "Easy", topic: "Stacks", complexity: "O(n) Time",
    hiringProbability: "88% - Amazon Favorite", recruiterInsight: "Tests your LIFO logic. Ensure you handle strings that only have opening brackets.",
    managerRedFlags: ["Incorrect stack pop order", "Memory leaks in recursion"],
    psychFollowUp: "Interviewer: 'How would you scale this to handle 10 different types of brackets efficiently?'",
    description: "Determine if the input string s containing '()[]{}' is valid.",
    examples: [{ input: "s = '()[]{}'", output: "true" }],
    constraints: ["1 <= s.length <= 10^4"],
    starterCode: "function isValid(s) {\n    \n}",
    solutionCode: "function isValid(s) {\n  const stack = [];\n  const map = {')':'(', '}':'{', ']':'['};\n  for (let char of s) {\n    if (!map[char]) stack.push(char);\n    else if (stack.pop() !== map[char]) return false;\n  }\n  return stack.length === 0;\n};"
  },
  "3": {
    id: "DSA-03", title: "Merge Sorted Lists", difficulty: "Easy", topic: "Linked Lists", complexity: "O(n+m) Time",
    hiringProbability: "82% - Microsoft Core", recruiterInsight: "Focus on pointer manipulation. Don't create unnecessary extra nodes.",
    managerRedFlags: ["Creating a whole new list instead of merging pointers"],
    psychFollowUp: "Interviewer: 'Can you solve this recursively? What are the stack memory implications?'",
    description: "Merge two sorted linked lists into one sorted list.",
    examples: [{ input: "l1 = [1,2,4], l2 = [1,3,4]", output: "[1,1,2,3,4,4]" }],
    constraints: ["Nodes: [0, 50]"],
    starterCode: "function mergeTwoLists(l1, l2) {\n    \n}",
    solutionCode: "function mergeTwoLists(l1, l2) {\n  const dummy = new ListNode(0); let curr = dummy;\n  while (l1 && l2) {\n    if (l1.val < l2.val) { curr.next = l1; l1 = l1.next; }\n    else { curr.next = l2; l2 = l2.next; }\n    curr = curr.next;\n  }\n  curr.next = l1 || l2; return dummy.next;\n};"
  },
  "4": {
    id: "DSA-04", title: "Best Time to Buy/Sell", difficulty: "Easy", topic: "Arrays", complexity: "O(n) Time",
    hiringProbability: "91% - Finance Core", recruiterInsight: "Tests greedy logic. Avoid O(n²) loops at all costs.",
    managerRedFlags: ["Multiple passes through the array", "Resetting profit on every dip"],
    psychFollowUp: "Interviewer: 'What if you could buy and sell multiple times? How does the logic change?'",
    description: "Find the maximum profit you can achieve by buying on one day and selling on another.",
    examples: [{ input: "prices = [7,1,5,3,6,4]", output: "5" }],
    constraints: ["1 <= prices.length <= 10^5"],
    starterCode: "function maxProfit(prices) {\n    \n}",
    solutionCode: "function maxProfit(prices) {\n  let min = Infinity, maxP = 0;\n  for (let p of prices) {\n    min = Math.min(min, p);\n    maxP = Math.max(maxP, p - min);\n  }\n  return maxP;\n};"
  },
  "5": {
    id: "DSA-05", title: "Binary Tree Inorder", difficulty: "Medium", topic: "Trees", complexity: "O(n) Time",
    hiringProbability: "85% - Standard", recruiterInsight: "Essential tree traversal. Managers look for recursive vs iterative trade-offs.",
    managerRedFlags: ["Failing to handle null root", "Incorrect traversal order"],
    psychFollowUp: "Interviewer: 'How would you do this iteratively without recursion to avoid StackOverflow?'",
    description: "Return the inorder traversal of a binary tree's nodes' values.",
    examples: [{ input: "root = [1,null,2,3]", output: "[1,3,2]" }],
    constraints: ["Nodes: [0, 100]"],
    starterCode: "function inorderTraversal(root) {\n    \n}",
    solutionCode: "function inorderTraversal(root) {\n  const res = [];\n  const helper = (n) => {\n    if (!n) return;\n    helper(n.left); res.push(n.val); helper(n.right);\n  };\n  helper(root); return res;\n};"
  },
  "6": {
    id: "DSA-06", title: "Longest Substring", difficulty: "Medium", topic: "Strings", complexity: "O(n) Time",
    hiringProbability: "92% - Senior Logic", recruiterInsight: "Tests sliding window mastery. Crucial for streaming data problems.",
    managerRedFlags: ["Nested loops (O(n²))", "Not updating the left pointer correctly"],
    psychFollowUp: "Interviewer: 'How does your solution change if the character set is strictly ASCII?'",
    description: "Find the length of the longest substring without repeating characters.",
    examples: [{ input: "s = 'abcabcbb'", output: "3" }],
    constraints: ["0 <= s.length <= 5 * 10^4"],
    starterCode: "function lengthOfLongestSubstring(s) {\n    \n}",
    solutionCode: "function lengthOfLongestSubstring(s) {\n  let set = new Set(), l = 0, max = 0;\n  for(let r = 0; r < s.length; r++) {\n    while(set.has(s[r])) { set.delete(s[l]); l++; }\n    set.add(s[r]); max = Math.max(max, r - l + 1);\n  }\n  return max;\n};"
  },
  "7": {
    id: "DSA-07", title: "Merge K Sorted Lists", difficulty: "Hard", topic: "Linked Lists", complexity: "O(N log k)",
    hiringProbability: "95% - High Stake", recruiterInsight: "Tests priority queue usage and divide and conquer logic.",
    managerRedFlags: ["Merging one by one (O(N*k))", "Not handling empty list arrays"],
    psychFollowUp: "Interviewer: 'Explain the time complexity differences between Min-Heap and Divide and Conquer merging.'",
    description: "Merge k sorted linked-lists into one sorted linked-list and return it.",
    examples: [{ input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }],
    constraints: ["k <= 10^4"],
    starterCode: "function mergeKLists(lists) {\n    \n}",
    solutionCode: "function mergeKLists(lists) {\n  if (!lists.length) return null;\n  const merge = (a, b) => {\n    if (!a || !b) return a || b;\n    if (a.val < b.val) { a.next = merge(a.next, b); return a; }\n    else { b.next = merge(a, b.next); return b; }\n  };\n  while(lists.length > 1) lists.push(merge(lists.shift(), lists.shift()));\n  return lists[0];\n};"
  },
  "8": {
    id: "DSA-08", title: "Coin Change", difficulty: "Medium", topic: "DP", complexity: "O(n*m)",
    hiringProbability: "89% - Meta Core", recruiterInsight: "Standard DP transition logic. Candidates must explain the bottom-up approach.",
    managerRedFlags: ["Greedy approach (doesn't work here)", "Ignoring unreachable amounts"],
    psychFollowUp: "Interviewer: 'How would you return the actual coins used, not just the count?'",
    description: "Fewest number of coins that you need to make up that amount.",
    examples: [{ input: "coins = [1,2,5], amount = 11", output: "3" }],
    constraints: ["1 <= amount <= 10^4"],
    starterCode: "function coinChange(coins, amount) {\n    \n}",
    solutionCode: "function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(amount + 1); dp[0] = 0;\n  for(let i=1; i<=amount; i++) {\n    for(let c of coins) if(i >= c) dp[i] = Math.min(dp[i], dp[i-c] + 1);\n  }\n  return dp[amount] > amount ? -1 : dp[amount];\n};"
  },
  "9": {
    id: "DSA-09", title: "Valid Anagram", difficulty: "Easy", topic: "Strings", complexity: "O(n) Time",
    hiringProbability: "70% - Junior Screening", recruiterInsight: "Tests frequency counting logic. Always mention character encoding (Unicode).",
    managerRedFlags: ["Sorting (O(n log n)) when O(n) is possible", "Ignoring space complexity"],
    psychFollowUp: "Interviewer: 'What if the inputs contain Unicode characters? How does your map change?'",
    description: "Return true if t is an anagram of s, and false otherwise.",
    examples: [{ input: "s = 'anagram', t = 'nagaram'", output: "true" }],
    constraints: ["1 <= s.length <= 5 * 10^4"],
    starterCode: "function isAnagram(s, t) {\n    \n}",
    solutionCode: "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (let c of s) count[c] = (count[c] || 0) + 1;\n  for (let c of t) { if (!count[c]) return false; count[c]--; }\n  return true;\n};"
  },
  "10": {
    id: "DSA-10", title: "Subsets", difficulty: "Medium", topic: "Backtracking", complexity: "O(N * 2^N)",
    hiringProbability: "84% - Logic Intensive", recruiterInsight: "Evaluates recursion tree visualization and state cleanup.",
    managerRedFlags: ["Incorrect base case", "Not handling the empty set case"],
    psychFollowUp: "Interviewer: 'How would you handle duplicate numbers in the input array to avoid duplicate subsets?'",
    description: "Given an integer array nums, return all possible subsets (the power set).",
    examples: [{ input: "nums = [1,2,3]", output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]" }],
    constraints: ["1 <= nums.length <= 10"],
    starterCode: "function subsets(nums) {\n    \n}",
    solutionCode: "function subsets(nums) {\n  const res = [];\n  const dfs = (i, path) => {\n    res.push([...path]);\n    for (let j = i; j < nums.length; j++) {\n      path.push(nums[j]); dfs(j + 1, path); path.pop();\n    }\n  };\n  dfs(0, []); return res;\n};"
  }
};

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const problem = placementArchive[id || "1"];

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [code, setCode] = useState(problem?.starterCode || "");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [theme, setTheme] = useState<"cyber" | "slate" | "pro">("cyber"); 
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [satisfaction, setSatisfaction] = useState(100);
  const [marketValue, setMarketValue] = useState(12000);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [codeStats, setCodeStats] = useState({ optimization: 0, architecture: 0, scalability: 0 });

  useEffect(() => {
    let interval: any;
    if (isSessionActive && !isRunning) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
        if (timer > 300) {
          setSatisfaction(prev => Math.max(prev - 0.05, 35));
          setMarketValue(prev => Math.max(prev - 50, 58000));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isRunning, timer]);

  const formatSessionTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const analyzeSimilarity = () => {
    const candidateStr = code.replace(/\s+/g, "");
    const optimalStr = problem.solutionCode.replace(/\s+/g, "");
    let matches = 0;
    for (let i = 0; i < Math.min(candidateStr.length, optimalStr.length); i++) {
        if (candidateStr[i] === optimalStr[i]) matches++;
    }
    setSimilarity(Math.round((matches / optimalStr.length) * 100));
  };

  const executeScreening = () => {
    setIsRunning(true);
    setOutput("> Initializing Technical Screening Hub...\n> Synchronizing candidate implementation...");
    setTimeout(() => {
      setOutput(`> ✅ VERIFICATION SUCCESSFUL\n> Runtime: 12ms\n> Placement Readiness: ELITE\n> Recruiter Sentiment: Positive`);
      setCodeStats({ optimization: 98, architecture: 92, scalability: 95 });
      analyzeSimilarity();
      setIsRunning(false);
    }, 1500);
  };

  const commitToArchive = () => {
    setIsRunning(true);
    setTimeout(() => {
      const commit = {
        date: new Date().toLocaleTimeString(),
        status: "ACCEPTED",
        worth: `$${marketValue.toLocaleString()}`,
        hash: Math.random().toString(36).substring(7).toUpperCase(),
        score: Math.round(satisfaction)
      };
      setSubmissions([commit, ...submissions]);
      setOutput(`> 💠 NODE INTEGRATED: ${commit.hash}\n> Recruiter Satisfaction: ${commit.score}%\n\n> ⚠️ INCOMING INTERVIEWER QUESTION:\n> "${problem.psychFollowUp}"`);
      setIsRunning(false);
    }, 2000);
  };

  const getThemeStyles = () => {
    if (theme === 'slate') return "bg-[#0f172a] text-slate-100 border-slate-800";
    if (theme === 'pro') return "bg-[#f8fafc] text-zinc-900 border-zinc-200";
    return "bg-[#020617] text-slate-300 border-white/10";
  };

  if (!problem) return <div className="h-screen bg-black flex items-center justify-center font-black text-red-500">SESSION ERROR: DATA_NULL</div>;

  return (
    <div className={`h-[calc(100vh-4rem)] flex flex-col transition-all duration-500 font-sans overflow-hidden ${getThemeStyles()}`}>
      <header className={`flex items-center justify-between px-8 py-4 border-b backdrop-blur-xl z-50 shadow-2xl transition-colors ${theme === 'pro' ? 'bg-white/80 border-zinc-200' : 'bg-slate-950/80 border-white/10'}`}>
        <div className="flex items-center gap-8">
          <button onClick={() => navigate("/dsa")} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all group ${theme === 'pro' ? 'text-zinc-400 hover:text-zinc-900' : 'text-slate-500 hover:text-cyan-400'}`}>
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Exit Session
          </button>
          <div className={`h-6 w-[2px] ${theme === 'pro' ? 'bg-zinc-200' : 'bg-slate-800'}`} />
          <div className="flex flex-col">
            <h1 className={`text-xl font-black italic tracking-tighter uppercase flex items-center gap-3 ${theme === 'pro' ? 'text-zinc-900' : 'text-white'}`}>
               <Briefcase size={18} className="text-cyan-500" /> {problem.title}
            </h1>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">CANDIDATE LOG REF: {problem.id}-ALFA</span>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <div className="hidden xl:flex flex-col items-end gap-1">
             <div className="flex items-center gap-2 text-green-500">
                <DollarSign size={14} />
                <span className="text-sm font-mono font-black tracking-tighter animate-pulse">{marketValue.toLocaleString()}</span>
             </div>
             <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.3em]">Projected Market Value</span>
          </div>
          <div className={`flex items-center gap-4 px-6 py-2 rounded-2xl border transition-all duration-700 ${isSessionActive ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'bg-slate-900 border-white/5 text-slate-700'}`}>
            <Clock size={18} className={isSessionActive ? "animate-pulse" : ""} />
            <span className="font-mono text-lg font-black tracking-tighter">{formatSessionTime(timer)}</span>
          </div>
          <button onClick={() => setShowConfig(!showConfig)} className={`p-3 rounded-xl border transition-all active:scale-90 ${theme === 'pro' ? 'bg-zinc-50 border-zinc-200 text-zinc-500' : 'bg-white/5 border-white/5 text-slate-500'}`}>
            <Settings2 size={20} />
          </button>
        </div>
      </header>

      {showConfig && (
        <div className={`absolute right-8 top-20 w-80 border rounded-3xl p-6 backdrop-blur-3xl z-[60] shadow-2xl animate-in slide-in-from-right-4 ${theme === 'pro' ? 'bg-white border-zinc-200 shadow-zinc-300' : 'bg-slate-900 border-white/10 shadow-black'}`}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                <span className={`text-xs font-black uppercase tracking-[0.3em] ${theme === 'pro' ? 'text-zinc-400' : 'text-slate-500'}`}>Visual Configuration</span>
                <button onClick={() => setShowConfig(false)} className="text-slate-500 hover:text-white"><X size={18}/></button>
            </div>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <span className={`text-sm font-black uppercase italic ${theme === 'pro' ? 'text-zinc-900' : 'text-white'}`}>Active Engine</span>
                    <div className="flex bg-black p-1 rounded-xl border border-white/5 gap-1">
                        <button onClick={() => setTheme('cyber')} className={`p-2 rounded-lg transition-all ${theme === 'cyber' ? 'bg-cyan-600 text-white' : 'text-slate-600'}`}><Moon size={16}/></button>
                        <button onClick={() => setTheme('slate')} className={`p-2 rounded-lg transition-all ${theme === 'slate' ? 'bg-slate-700 text-white' : 'text-slate-600'}`}><Fingerprint size={16}/></button>
                        <button onClick={() => setTheme('pro')} className={`p-2 rounded-lg transition-all ${theme === 'pro' ? 'bg-white text-black' : 'text-slate-600'}`}><Sun size={16}/></button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-[#030712]">
        <section className={`overflow-y-auto border-r p-8 custom-scrollbar transition-colors ${theme === 'pro' ? 'bg-white border-zinc-200' : 'bg-slate-950/40 border-white/10'}`}>
          <Tabs defaultValue="brief">
            <TabsList className={`grid w-full grid-cols-4 border p-1.5 rounded-2xl mb-10 h-14 ${theme === 'pro' ? 'bg-zinc-50 border-zinc-200' : 'bg-slate-900 border-white/5'}`}>
              <TabsTrigger value="brief" className="text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-cyan-600 data-[state=active]:text-black transition-all">Brief</TabsTrigger>
              <TabsTrigger value="managers" className="text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-cyan-600 data-[state=active]:text-black">Managers</TabsTrigger>
              <TabsTrigger value="match" className="text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-cyan-600 data-[state=active]:text-black">Match</TabsTrigger>
              <TabsTrigger value="history" className="text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-cyan-600 data-[state=active]:text-black">Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="brief" className="space-y-12 animate-in fade-in">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 italic ${theme === 'pro' ? 'text-zinc-400' : 'text-slate-500'}`}><Target size={14} className="text-cyan-500"/> Core Requirement</h3>
                    <span className="text-[10px] font-black text-white bg-slate-800 px-3 py-1 rounded-lg uppercase tracking-[0.2em]">{problem.difficulty}</span>
                </div>
                <p className={`text-[15px] leading-[1.8] font-medium italic ${theme === 'pro' ? 'text-zinc-600' : 'text-slate-300'}`}>"{problem.description}"</p>
              </div>
              <div className="space-y-6 pb-20">
                <h3 className={`text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 italic ${theme === 'pro' ? 'text-zinc-400' : 'text-slate-500'}`}><Database size={14} className="text-cyan-500"/> System Data Buffers</h3>
                {problem.examples.map((ex: any, idx: number) => (
                  <div key={idx} className={`p-6 rounded-[2.5rem] border font-mono text-[12px] relative overflow-hidden group transition-all ${theme === 'pro' ? 'bg-zinc-50 border-zinc-200' : 'bg-slate-900/80 border-white/5 hover:bg-slate-900'}`}>
                    <div className="absolute top-0 left-0 h-full w-1.5 bg-cyan-500 opacity-20 group-hover:opacity-100 transition-all shadow-[0_0_15px_#22d3ee]" />
                    <p className="mb-4 text-cyan-500 font-black italic text-[10px] uppercase">Buffer #{idx+1} Stream</p>
                    <p className="mb-2 flex gap-4 text-slate-500 font-black uppercase tracking-tighter">INPUT: <span className={theme === 'pro' ? 'text-zinc-900' : 'text-white'}>{ex.input}</span></p>
                    <p className="flex gap-4 text-slate-500 font-black uppercase tracking-tighter">OUTPUT: <span className="text-cyan-600 font-bold">{ex.output}</span></p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="managers" className="space-y-8 animate-in slide-in-from-left-4">
                <div className="bg-cyan-500/5 p-8 rounded-[2.5rem] border border-cyan-500/10">
                    <h3 className="text-cyan-400 font-black text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic"><SearchCode size={18} /> Recruitment Logic</h3>
                    <p className="text-slate-300 text-[14px] leading-relaxed font-medium italic leading-[1.7]">"{problem.recruiterInsight}"</p>
                </div>
                <div className="p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/10">
                    <h3 className="text-red-400 font-black text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic"><AlertCircle size={18} /> Session Red Flags</h3>
                    <ul className="space-y-4">
                        {problem.managerRedFlags.map((flag: string, i: number) => (
                            <li key={i} className="flex gap-3 text-xs text-slate-400 font-medium italic leading-relaxed">
                                <span className="text-red-500 font-black">!</span> {flag}
                            </li>
                        ))}
                    </ul>
                </div>
            </TabsContent>
            <TabsContent value="match" className="animate-in fade-in space-y-6">
                <div className={`p-8 rounded-[2.5rem] border ${theme === 'pro' ? 'bg-zinc-50 border-zinc-200' : 'bg-slate-900/50 border-white/5'}`}>
                   <h3 className="text-xs font-black uppercase text-cyan-500 mb-6 flex items-center gap-3 tracking-widest"><BrainCircuit size={18}/> Similarity Assessment</h3>
                   {similarity === null ? (
                      <div className="flex flex-col items-center py-20 opacity-30">
                        <Zap size={40} className="mb-4 text-slate-500" />
                        <p className="text-slate-500 text-[10px] uppercase font-black italic">Initialize screening to sync match scores</p>
                      </div>
                   ) : (
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-cyan-500" strokeDasharray={440} strokeDashoffset={440 - (440 * (similarity || 0)) / 100} strokeLinecap="round" />
                            </svg>
                            <span className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-3xl font-black ${theme === 'pro' ? 'text-zinc-900' : 'text-white'}`}>{similarity || 0}%</span>
                                <span className="text-[8px] uppercase font-black text-slate-500 tracking-tighter">Architecture Match</span>
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium text-center italic tracking-widest uppercase">Similarity Analysis: Node is {similarity}% architecturally aligned with optimal archive.</p>
                      </div>
                   )}
                </div>
            </TabsContent>
            <TabsContent value="history" className="animate-in fade-in space-y-4">
                {submissions.map((s, i) => (
                    <div key={i} className={`p-5 rounded-[2rem] border flex justify-between items-center transition-all ${theme === 'pro' ? 'bg-zinc-50 border-zinc-200 shadow-sm' : 'bg-slate-900/50 border-white/5'}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                <Award size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'pro' ? 'text-zinc-900' : 'text-white'}`}>Verification: {s.status}</span>
                                <span className="text-[8px] font-mono text-slate-500">{s.date} • REF: {s.hash}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-black text-green-500 block">{s.worth}</span>
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest">Final Valuation</span>
                        </div>
                    </div>
                ))}
            </TabsContent>
          </Tabs>
        </section>

        <section className={`flex flex-col overflow-hidden relative shadow-[-20px_0_40px_rgba(0,0,0,0.5)] ${theme === 'pro' ? 'bg-zinc-50' : 'bg-[#070912]'}`}>
          {!isSessionActive && (
            <div className={`absolute inset-0 z-40 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700 backdrop-blur-3xl ${theme === 'pro' ? 'bg-white/95' : 'bg-[#070912]/95'}`}>
                <div className="w-32 h-32 bg-cyan-500/10 rounded-full flex items-center justify-center mb-10 border border-cyan-500/20 shadow-[0_0_80px_rgba(34,211,238,0.2)]">
                    <ShieldCheck size={60} className="text-cyan-500 animate-pulse"/>
                </div>
                <h2 className={`text-3xl font-black uppercase tracking-tighter mb-4 italic ${theme === 'pro' ? 'text-zinc-900' : 'text-white'}`}>Technical Session Locked</h2>
                <p className="text-slate-500 text-[11px] uppercase font-bold tracking-[0.4em] mb-12 max-w-sm leading-relaxed italic">Initialize technical session to unlock implementation node and start the valuation chronometer.</p>
                <button onClick={() => setIsSessionActive(true)} className="bg-cyan-600 hover:bg-cyan-500 text-black px-16 py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.5em] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4 group">
                    <Zap size={20} className="group-hover:rotate-12 transition-transform"/> Initialize Session
                </button>
            </div>
          )}
          <div className={`flex items-center justify-between px-8 border-b h-16 shadow-lg transition-colors ${theme === 'pro' ? 'bg-white border-zinc-200' : 'bg-slate-900/40 border-white/5'}`}>
            <span className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-3 tracking-[0.4em] italic">
                <Code2 size={16} className="text-cyan-400"/> placement candidate node
            </span>
            <button onClick={() => setCode(problem.starterCode)} className="text-[10px] text-slate-600 hover:text-red-400 transition-all uppercase font-black flex items-center gap-2">
                <RotateCcw size={12}/> wipe node data
            </button>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className={`absolute left-0 top-0 h-full w-14 border-r flex flex-col items-center pt-10 font-mono text-[10px] select-none z-10 transition-colors ${theme === 'pro' ? 'bg-zinc-50 border-zinc-200 text-zinc-400' : 'bg-slate-950/60 border-white/5 text-slate-800'}`}>
              {[...Array(100)].map((_, i) => <div key={i} className="mb-2 leading-none">{i+1}</div>)}
            </div>
            <textarea
              value={code} onChange={(e) => setCode(e.target.value)}
              disabled={!isSessionActive}
              className={`w-full h-full pl-20 p-10 bg-transparent font-mono text-[15px] leading-relaxed resize-none focus:outline-none custom-scrollbar selection:bg-cyan-500/20 transition-all duration-1000 ${theme === 'pro' ? 'text-zinc-900' : 'text-slate-300'}`}
              spellCheck={false}
              placeholder="/** Implementation protocol live. Commencing injection... */"
            />
          </div>
          <div className={`transition-all duration-700 border-t ${output ? 'h-64 opacity-100' : 'h-0 opacity-0'} bg-[#02040a] overflow-hidden shadow-[0_-20px_40px_rgba(0,0,0,0.5)]`}>
            <div className="px-8 py-3 border-b border-white/5 bg-slate-900/60 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic flex items-center gap-4">
                   <Terminal size={14} className="text-cyan-500" /> Assessment Trace Log
                </span>
                <button onClick={() => setOutput("")} className="text-[9px] text-red-500 font-black uppercase hover:opacity-80 tracking-widest">Clear Trace</button>
            </div>
            <div className="p-8 overflow-y-auto h-48 font-mono text-[13px] text-cyan-400/90 leading-relaxed custom-scrollbar italic scroll-smooth">
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
          </div>
          <div className={`p-8 border-t flex gap-6 transition-colors ${theme === 'pro' ? 'bg-zinc-50 border-zinc-200' : 'bg-[#070912] border-white/10'}`}>
            <button onClick={executeScreening} disabled={isRunning || !isSessionActive} className={`flex-1 border py-5 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 disabled:opacity-30 active:scale-95 group ${theme === 'pro' ? 'bg-white border-zinc-200 text-zinc-400 hover:text-zinc-900' : 'bg-slate-900 border-white/10 text-slate-500 hover:text-cyan-400'}`}>
              <Play size={20} className="group-hover:scale-125 transition-transform" /> Start Validation
            </button>
            <button onClick={commitToArchive} disabled={isRunning || !isSessionActive} className="flex-1 bg-cyan-600 text-black py-5 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.5em] shadow-[0_0_40px_rgba(34,211,238,0.2)] hover:bg-cyan-500 transition-all flex items-center justify-center gap-4 disabled:opacity-30 active:scale-95 group">
              <Send size={20} className="group-hover:translate-x-1 transition-transform" /> Commit Scorecard
            </button>
          </div>
        </section>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ProblemDetail;