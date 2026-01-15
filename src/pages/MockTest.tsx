import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Timer, CheckCircle2, ChevronRight, ChevronLeft, Save, 
  Flag, AlertTriangle, Info, BookOpen, Maximize2, 
  Calculator, Edit3, X, History, BarChart3, 
  RefreshCcw, Home, Award, Zap, Brain
} from "lucide-react";
import { toast } from "sonner";

// --- TYPES & INTERFACES ---
interface Question {
  id: number;
  category: "Data Structures" | "Algorithms" | "Frontend" | "Aptitude" | "System Design";
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// --- EXTENDED DATASET ---
const mockQuestions: Question[] = [
  {
    id: 1,
    category: "Data Structures",
    topic: "Stacks & Queues",
    difficulty: "Medium",
    question: "Which of the following operations is not O(1) in a standard Doubly Linked List implementation?",
    options: ["Insert at head", "Delete at tail", "Find middle element", "Insert after a given node"],
    correctAnswer: 2,
    explanation: "Finding the middle element requires a linear scan O(N), whereas pointers allow O(1) for head/tail operations."
  },
  {
    id: 2,
    category: "Frontend",
    topic: "React Lifecycle",
    difficulty: "Easy",
    question: "When using the useEffect hook, what happens if the dependency array is left empty ([])?",
    options: ["It runs on every re-render", "It runs only once after the initial render", "It never runs", "It runs only when props change"],
    correctAnswer: 1,
    explanation: "An empty array tells React that your effect doesn't depend on any values from props or state, so it never needs to re-run."
  },
  {
    id: 3,
    category: "Algorithms",
    topic: "Sorting",
    difficulty: "Hard",
    question: "What is the worst-case time complexity of QuickSort when using the first element as a pivot?",
    options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
    correctAnswer: 2,
    explanation: "In a sorted array, picking the first element as pivot leads to O(n²) because the partitions are highly unbalanced."
  },
  {
    id: 4,
    category: "Aptitude",
    topic: "Probability",
    difficulty: "Medium",
    question: "Two dice are thrown simultaneously. What is the probability of getting a sum of 7?",
    options: ["1/6", "1/12", "5/36", "1/4"],
    correctAnswer: 0,
    explanation: "There are 6 combinations (1,6; 2,5; 3,4; 4,3; 5,2; 6,1) out of 36 total, which simplifies to 1/6."
  },
  {
    id: 5,
    category: "System Design",
    topic: "Caching",
    difficulty: "Hard",
    question: "In a distributed system, what does the 'P' in CAP theorem stand for?",
    options: ["Performance", "Persistence", "Partition Tolerance", "Parallelism"],
    correctAnswer: 2,
    explanation: "Partition Tolerance means the system continues to operate despite an arbitrary number of messages being dropped by the network."
  },
  // Add more questions here to hit 50+ in production
];

// --- COMPONENT ---
const MockTest = () => {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [scratchpad, setScratchpad] = useState("");
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [tabFocusWarnings, setTabFocusWarnings] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [startTime] = useState(Date.now());

  // --- RECOVERY LOGIC (LocalStorage) ---
  useEffect(() => {
    const saved = localStorage.getItem('mock_test_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAnswers(parsed.answers || {});
      setFlagged(parsed.flagged || []);
      setTimeLeft(parsed.timeLeft || 1800);
      toast.info("Session recovered successfully!");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mock_test_session', JSON.stringify({ answers, flagged, timeLeft }));
  }, [answers, flagged, timeLeft]);

  // --- PROCTORING LOGIC ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isSubmitted) {
        setTabFocusWarnings(prev => prev + 1);
        toast.error(`Warning: Tab switching detected! (${tabFocusWarnings + 1}/3)`);
        if (tabFocusWarnings >= 2) submitTest();
      }
    };

    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [tabFocusWarnings, isSubmitted]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      if (timeLeft === 0) submitTest();
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  // --- ACTIONS ---
  const submitTest = () => {
    setIsSubmitted(true);
    localStorage.removeItem('mock_test_session');
    toast.success("Test submitted successfully!");
  };

  const toggleFlag = (id: number) => {
    setFlagged(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const calculateScore = () => {
    let score = 0;
    mockQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  const getCategoryStats = () => {
    const stats: Record<string, { total: number, correct: number }> = {};
    mockQuestions.forEach(q => {
      if (!stats[q.category]) stats[q.category] = { total: 0, correct: 0 };
      stats[q.category].total++;
      if (answers[q.id] === q.correctAnswer) stats[q.category].correct++;
    });
    return stats;
  };

  const currentQ = mockQuestions[currentIdx];

  // --- UI SUB-COMPONENTS ---

  const CalculatorModal = () => (
    <motion.div drag initial={{ x: 100, y: 100 }} className="fixed z-[100] bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl w-64">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2"><Calculator className="w-3 h-3" /> Calculator</span>
        <button onClick={() => setShowCalculator(false)}><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(btn => (
          <button key={btn} className="h-10 bg-white/5 rounded-lg hover:bg-primary/20 transition-all font-mono">{btn}</button>
        ))}
      </div>
    </motion.div>
  );

  const ScratchpadModal = () => (
    <motion.div drag initial={{ x: 200, y: 200 }} className="fixed z-[100] bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl w-80">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2"><Edit3 className="w-3 h-3" /> Scratchpad</span>
        <button onClick={() => setShowScratchpad(false)}><X className="w-4 h-4" /></button>
      </div>
      <textarea 
        value={scratchpad}
        onChange={(e) => setScratchpad(e.target.value)}
        className="w-full h-40 bg-black/40 border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 ring-primary/50"
        placeholder="Type notes or logic here..."
      />
    </motion.div>
  );

  // --- RENDER LOGIC ---

  if (isSubmitted) {
    const stats = getCategoryStats();
    const totalScore = calculateScore();
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    return (
      <div className="min-h-screen bg-background p-4 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="glass p-12 rounded-[3rem] text-center border border-success/20 bg-gradient-to-br from-success/5 to-transparent">
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-success" />
             </motion.div>
             <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Analysis Report</h1>
             <p className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.3em]">Evaluation Complete</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="glass p-8 rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Final Score</p>
                <h3 className="text-4xl font-black text-primary">{totalScore} <span className="text-lg text-muted-foreground">/ {mockQuestions.length}</span></h3>
             </div>
             <div className="glass p-8 rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Accuracy</p>
                <h3 className="text-4xl font-black text-blue-400">{Math.round((totalScore/mockQuestions.length)*100)}%</h3>
             </div>
             <div className="glass p-8 rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Time Taken</p>
                <h3 className="text-4xl font-black text-warning">{Math.floor(timeTaken/60)}m {timeTaken%60}s</h3>
             </div>
          </div>

          <div className="glass border border-white/10 rounded-[2.5rem] overflow-hidden">
             <div className="p-8 border-b border-white/5 bg-white/5 flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="font-bold uppercase text-xs tracking-widest">Category Performance</h3>
             </div>
             <div className="p-8 space-y-6">
                {Object.entries(stats).map(([cat, val]) => (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-tight">
                      <span>{cat}</span>
                      <span className="text-primary">{val.correct}/{val.total}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(val.correct/val.total)*100}%` }}
                        className="h-full bg-primary shadow-[0_0_15px_rgba(0,212,170,0.5)]" 
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
             <button onClick={() => window.location.reload()} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <RefreshCcw className="w-4 h-4" /> Retake Test
             </button>
             <button onClick={() => navigate('/dashboard')} className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2">
                <Home className="w-4 h-4" /> Back to Dashboard
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showCalculator && <CalculatorModal />}
      {showScratchpad && <ScratchpadModal />}

      {/* --- TOP BAR --- */}
      <nav className="glass border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-[60] backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h1 className="font-black italic text-lg uppercase leading-none tracking-tighter">Mock_v1</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">PlacementPrep Platform</p>
             </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 ml-6 border-l border-white/10 pl-6">
             <span className="text-[10px] font-black uppercase text-muted-foreground">Status:</span>
             <span className="flex items-center gap-1.5 text-[10px] font-black text-success uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Encrypted Session
             </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`px-5 py-2.5 rounded-2xl border transition-all flex items-center gap-3 ${timeLeft < 300 ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-white/10 bg-white/5'}`}>
             <Timer className={`w-5 h-5 ${timeLeft < 300 ? 'animate-pulse' : 'text-primary'}`} />
             <span className="font-mono font-black text-xl leading-none">{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={submitTest}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black uppercase text-[11px] tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            <Save className="w-4 h-4" /> End Test
          </button>
        </div>
      </nav>

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        {/* --- LEFT SIDEBAR (NAVIGATOR) --- */}
        <aside className="w-full lg:w-80 border-r border-white/5 p-6 space-y-8 overflow-y-auto bg-black/20 custom-scrollbar">
           <div>
              <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-4">Question Grid</h3>
              <div className="grid grid-cols-5 gap-2">
                {mockQuestions.map((q, idx) => {
                  const isCurrent = currentIdx === idx;
                  const isAnswered = answers[q.id] !== undefined;
                  const isFlagged = flagged.includes(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-11 rounded-xl font-bold text-sm transition-all border flex items-center justify-center relative ${
                        isCurrent ? 'bg-primary border-primary scale-110 z-10 shadow-lg shadow-primary/30 text-black' :
                        isFlagged ? 'bg-warning/20 border-warning text-warning' :
                        isAnswered ? 'bg-success/10 border-success/40 text-success' :
                        'bg-white/5 border-white/5 text-muted-foreground hover:border-white/20'
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full border-2 border-background" />}
                    </button>
                  );
                })}
              </div>
           </div>

           <div className="space-y-4 pt-6 border-t border-white/5">
              <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-4">Exam Tools</h3>
              <button 
                onClick={() => setShowCalculator(!showCalculator)}
                className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all text-xs font-bold uppercase tracking-widest ${showCalculator ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                <Calculator className="w-4 h-4" /> Calculator
              </button>
              <button 
                onClick={() => setShowScratchpad(!showScratchpad)}
                className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all text-xs font-bold uppercase tracking-widest ${showScratchpad ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                <Edit3 className="w-4 h-4" /> Scratchpad
              </button>
              <button 
                onClick={() => document.documentElement.requestFullscreen()}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-3"
              >
                <Maximize2 className="w-4 h-4" /> Full Screen
              </button>
           </div>

           <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                 <Zap className="w-3 h-3 text-blue-400" />
                 <h4 className="text-[10px] font-black uppercase text-blue-400">Quick Tip</h4>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                "Hard" difficulty questions are worth more points but take longer. Use the scratchpad for DP logic.
              </p>
           </div>
        </aside>

        {/* --- MAIN QUESTION AREA --- */}
        <main className="flex-grow p-6 md:p-12 overflow-y-auto bg-black/40">
           <div className="max-w-4xl mx-auto space-y-8">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                            {currentQ.category}
                         </span>
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                            currentQ.difficulty === 'Hard' ? 'bg-destructive/10 border-destructive text-destructive' :
                            currentQ.difficulty === 'Medium' ? 'bg-warning/10 border-warning text-warning' :
                            'bg-success/10 border-success text-success'
                         }`}>
                            {currentQ.difficulty}
                         </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-widest">Topic: {currentQ.topic}</p>
                    </div>
                    <button 
                      onClick={() => toggleFlag(currentQ.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-black uppercase text-[10px] transition-all ${
                        flagged.includes(currentQ.id) 
                        ? 'bg-warning text-black border-warning' 
                        : 'bg-white/5 border-white/10 hover:border-white/30 text-muted-foreground'
                      }`}
                    >
                      <Flag className="w-4 h-4" /> {flagged.includes(currentQ.id) ? 'Flagged' : 'Flag Question'}
                    </button>
                  </div>

                  <div className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight text-foreground tracking-tight">
                      {currentQ.question}
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                      {currentQ.options.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setAnswers({ ...answers, [currentQ.id]: i })}
                          className={`group relative overflow-hidden w-full p-8 rounded-[1.75rem] text-left border transition-all flex items-center justify-between ${
                            answers[currentQ.id] === i 
                            ? 'bg-primary border-primary shadow-2xl shadow-primary/10' 
                            : 'bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10'
                          }`}
                        >
                          <div className="relative z-10 flex items-center gap-6">
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${
                              answers[currentQ.id] === i ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30'
                            }`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className={`text-lg font-bold ${answers[currentQ.id] === i ? 'text-black' : 'text-foreground'}`}>
                              {opt}
                            </span>
                          </div>
                          {answers[currentQ.id] === i && (
                            <CheckCircle2 className="w-6 h-6 text-black relative z-10" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* NAVIGATION BUTTONS */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5">
                <button 
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all disabled:opacity-20"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                
                <div className="flex gap-2">
                   {mockQuestions.map((_, i) => (
                     <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${currentIdx === i ? 'bg-primary w-8' : 'bg-white/10'}`} />
                   ))}
                </div>

                <button 
                  onClick={() => currentIdx < mockQuestions.length - 1 ? setCurrentIdx(prev => prev + 1) : submitTest()}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-[0.2em] hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                >
                  {currentIdx === mockQuestions.length - 1 ? "Finish Attempt" : "Save & Next"} <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* WARNING BOX */}
              <div className="p-6 rounded-3xl bg-destructive/5 border border-destructive/20 flex items-start gap-4 text-destructive">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                   <h5 className="text-[11px] font-black uppercase tracking-wider">Security Protocol Active</h5>
                   <p className="text-[10px] opacity-70 mt-1 leading-relaxed">
                     Switching tabs, using DevTools, or exiting full-screen will be logged as proctoring violations. Multi-instance logins detected.
                   </p>
                </div>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default MockTest;