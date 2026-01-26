import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Timer, CheckCircle2, ChevronRight, ChevronLeft, Flag, 
  Maximize2, Calculator, Edit3, X, BarChart3, RefreshCcw, 
  Home, Award, Zap, Brain, ShieldAlert, Terminal, Lock, 
  Cpu, Database, Network, Globe, Code2, Layers, BookOpen,
  Users, Cloud, Server, Code, GitBranch, Cctv, AlertTriangle,
  Hash, Clock, TrendingUp, Filter, Search, Settings, Bell,
  Download, Upload, Share2, Volume2, VolumeX, Eye, EyeOff,
  Camera, Mic, MicOff, Wifi, WifiOff, Battery, BatteryCharging,
  Briefcase, GraduationCap, Target, Star, Trophy, Medal,
  Building, FileText, HelpCircle, Lightbulb, Puzzle
} from "lucide-react";
import { toast } from "sonner";

// --- TYPES & SYSTEM CONFIG ---
const TOTAL_TESTS = 28;
const QUESTIONS_PER_TEST = 12;

interface Question {
  id: number;
  category: "Quantitative Aptitude" | "Logical Reasoning" | "Verbal Ability" | "Technical Core" | "Coding Concepts" | "Data Structures" | "System Design" | "Behavioral";
  topic: string;
  difficulty: "Medium" | "Hard" | "Advanced";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  tips?: string[];
}

interface TestModule {
  id: number;
  title: string;
  company: string;
  icon: string;
  estimatedTime: number;
  passingScore: number;
  questions: Question[];
  tags: string[];
  difficultyLevel: string;
}

interface PerformanceMetrics {
  speed: number;
  accuracy: number;
  consistency: number;
  categoryBreakdown: Record<string, number>;
}

// --- COMPREHENSIVE PLACEMENT QUESTION GENERATOR ---
const generatePlacementDataset = (): TestModule[] => {
  const modules: TestModule[] = [];
  
  const companies = [
    { name: "FAANG Core Test", icon: "🏆", time: 60, tags: ["FAANG", "Product Based", "High Package"], difficulty: "Advanced" },
    { name: "Quantitative Mastery", icon: "🧮", time: 45, tags: ["Aptitude", "Math", "Calculations"], difficulty: "Medium" },
    { name: "Logical Reasoning Pro", icon: "🎯", time: 50, tags: ["Puzzles", "Patterns", "Analysis"], difficulty: "Hard" },
    { name: "Coding Interview Prep", icon: "💻", time: 55, tags: ["Algorithms", "Coding", "Problem Solving"], difficulty: "Hard" },
    { name: "Data Structures Expert", icon: "📊", time: 60, tags: ["DSA", "Complexity", "Implementation"], difficulty: "Advanced" },
    { name: "System Design Round", icon: "🏗️", time: 65, tags: ["Architecture", "Scalability", "Design"], difficulty: "Advanced" },
    { name: "Verbal Ability Test", icon: "📝", time: 40, tags: ["Grammar", "Comprehension", "Vocabulary"], difficulty: "Medium" },
    { name: "Behavioral Interview", icon: "🤝", time: 35, tags: ["HR", "Soft Skills", "Scenarios"], difficulty: "Medium" },
    { name: "Startup Interview", icon: "🚀", time: 50, tags: ["Startup", "Fast-paced", "Generalist"], difficulty: "Hard" },
    { name: "Product Manager Test", icon: "📱", time: 55, tags: ["Product", "Strategy", "Case Study"], difficulty: "Advanced" },
    { name: "Quant Finance Prep", icon: "💰", time: 60, tags: ["Finance", "Statistics", "Probability"], difficulty: "Advanced" },
    { name: "Consulting Case Prep", icon: "💼", time: 65, tags: ["Consulting", "Case", "Analysis"], difficulty: "Advanced" },
    { name: "Frontend Interview", icon: "🎨", time: 50, tags: ["Frontend", "JavaScript", "React"], difficulty: "Hard" },
    { name: "Backend Interview", icon: "⚙️", time: 55, tags: ["Backend", "APIs", "Databases"], difficulty: "Hard" },
    { name: "Full Stack Test", icon: "🔄", time: 60, tags: ["Full Stack", "End-to-End", "DevOps"], difficulty: "Advanced" },
    { name: "Cloud Engineer Prep", icon: "☁️", time: 50, tags: ["Cloud", "AWS", "Infrastructure"], difficulty: "Hard" },
    { name: "DevOps Interview", icon: "🔧", time: 45, tags: ["DevOps", "CI/CD", "Infrastructure"], difficulty: "Hard" },
    { name: "Data Science Test", icon: "📈", time: 60, tags: ["ML", "Statistics", "Python"], difficulty: "Advanced" },
    { name: "Machine Learning Prep", icon: "🤖", time: 65, tags: ["ML", "AI", "Models"], difficulty: "Advanced" },
    { name: "Database Expert Test", icon: "🗄️", time: 50, tags: ["SQL", "NoSQL", "Optimization"], difficulty: "Hard" },
    { name: "Mobile Dev Interview", icon: "📱", time: 45, tags: ["Mobile", "iOS", "Android"], difficulty: "Hard" },
    { name: "Cybersecurity Prep", icon: "🔒", time: 55, tags: ["Security", "Networking", "Ethics"], difficulty: "Advanced" },
    { name: "Leadership Round", icon: "👑", time: 40, tags: ["Leadership", "Management", "Team"], difficulty: "Hard" },
    { name: "Communication Skills", icon: "🗣️", time: 35, tags: ["Communication", "Presentation", "Email"], difficulty: "Medium" },
    { name: "Time Management Test", icon: "⏱️", time: 45, tags: ["Time", "Pressure", "Efficiency"], difficulty: "Medium" },
    { name: "Critical Thinking", icon: "💭", time: 50, tags: ["Analysis", "Evaluation", "Decision"], difficulty: "Hard" },
    { name: "Problem Solving Pro", icon: "🧩", time: 55, tags: ["Problem", "Solution", "Approach"], difficulty: "Advanced" },
    { name: "Final Comprehensive", icon: "🎖️", time: 75, tags: ["Comprehensive", "All Topics", "Final"], difficulty: "Advanced" }
  ];

  const categories: Question["category"][] = [
    "Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", 
    "Technical Core", "Coding Concepts", "Data Structures", 
    "System Design", "Behavioral"
  ];

  const topics = {
    "Quantitative Aptitude": [
      "Percentage Calculations", "Profit and Loss", "Time and Work", 
      "Time Speed Distance", "Probability", "Permutations", 
      "Averages", "Ratio and Proportion", "Simple Interest", 
      "Compound Interest", "Algebra", "Geometry", 
      "Trigonometry", "Number Systems", "Data Interpretation"
    ],
    "Logical Reasoning": [
      "Blood Relations", "Direction Sense", "Sitting Arrangement", 
      "Coding-Decoding", "Series Completion", "Analogy", 
      "Classification", "Syllogism", "Statement Conclusion", 
      "Logical Deduction", "Puzzles", "Critical Reasoning", 
      "Data Sufficiency", "Course of Action", "Cause and Effect"
    ],
    "Verbal Ability": [
      "Reading Comprehension", "Sentence Correction", 
      "Para Jumbles", "Error Spotting", "Vocabulary", 
      "Synonyms and Antonyms", "Idioms and Phrases", 
      "Active Passive Voice", "Direct Indirect Speech", 
      "Fill in the Blanks", "Cloze Test", "Sentence Completion", 
      "Paragraph Summary", "Critical Reasoning", "Essay Writing"
    ],
    "Technical Core": [
      "Operating Systems", "Computer Networks", "DBMS Concepts", 
      "OOPS Principles", "Software Engineering", "Compiler Design", 
      "Computer Architecture", "Microprocessors", "Digital Logic", 
      "Theory of Computation", "Computer Graphics", "Web Technologies", 
      "Cyber Security", "Cloud Computing", "Big Data"
    ],
    "Coding Concepts": [
      "Time Complexity", "Space Complexity", "Recursion", 
      "Dynamic Programming", "Greedy Algorithms", "Backtracking", 
      "Divide and Conquer", "Sorting Algorithms", "Searching Algorithms", 
      "Graph Algorithms", "Tree Algorithms", "String Algorithms", 
      "Bit Manipulation", "Mathematical Algorithms", "Pattern Matching"
    ],
    "Data Structures": [
      "Arrays", "Linked Lists", "Stacks", "Queues", 
      "Hash Tables", "Trees", "Binary Trees", "BST", 
      "Heaps", "Graphs", "Tries", "Segment Trees", 
      "Fenwick Trees", "Disjoint Sets", "Advanced Structures"
    ],
    "System Design": [
      "Scalability", "Load Balancing", "Caching Strategies", 
      "Database Design", "API Design", "Microservices", 
      "Distributed Systems", "Message Queues", "CDN", 
      "Rate Limiting", "Consistency Models", "Partitioning", 
      "Replication", "Monitoring", "Failure Handling"
    ],
    "Behavioral": [
      "Leadership Scenarios", "Conflict Resolution", 
      "Team Management", "Project Planning", "Communication", 
      "Work Ethics", "Stress Management", "Decision Making", 
      "Problem Solving Approach", "Career Goals", 
      "Strengths and Weaknesses", "Company Research", 
      "Situational Judgement", "Motivation Factors", "Feedback Handling"
    ]
  };

  const questionTemplates = {
    "Quantitative Aptitude": [
      "If {x} increases by {y}%, then decreases by {z}%, what's the net change?",
      "A can complete work in {a} days, B in {b} days. Together they complete in?",
      "What is the probability of {scenario} given {condition}?",
      "The ratio of {x} to {y} is {r1}:{r2}. If {z} is added, what's new ratio?",
      "Find the sum of series: {series}",
      "A train of length {l}m passes a pole in {t} seconds. Speed is?",
      "The compound interest on {p} at {r}% for {n} years is?",
      "Solve for x: {equation}",
      "Area of a {shape} with dimensions {d1} and {d2} is?",
      "In how many ways can {items} be arranged under {condition}?"
    ],
    "Logical Reasoning": [
      "If {statement1}, and {statement2}, then what follows?",
      "Which pattern continues the sequence: {sequence}?",
      "A is north of B, B is east of C. What's A relative to C?",
      "Decode the pattern: {code}",
      "Find the odd one out: {options}",
      "Complete the analogy: {analogy}",
      "Based on the passage, which conclusion is valid?",
      "What must be true if {condition} holds?",
      "Arrange these in logical order: {items}",
      "Which argument is strongest for {scenario}?"
    ],
    "Verbal Ability": [
      "Choose the most appropriate word for the blank: {sentence}",
      "Identify the grammatical error in: {sentence}",
      "What is the main idea of the passage?",
      "Which word is closest in meaning to {word}?",
      "Rearrange the sentences to form a coherent paragraph",
      "Choose the correctly spelled word",
      "Select the most suitable idiom for the situation",
      "What tone does the author adopt in the passage?",
      "Which option best summarizes the argument?",
      "Choose the most formal alternative"
    ],
    "Technical Core": [
      "What happens during {process} in {system}?",
      "Explain the concept of {concept} with example",
      "Compare {tech1} and {tech2} in terms of {aspect}",
      "What is the purpose of {protocol} in {context}?",
      "How does {algorithm} achieve {goal}?",
      "What are the ACID properties in DBMS?",
      "Explain {architecture} pattern with benefits",
      "What causes {issue} in {system} and how to resolve?",
      "How does {technology} improve {metric}?",
      "What are the trade-offs in {design_choice}?"
    ],
    "Coding Concepts": [
      "What is time complexity of {algorithm} for {input}?",
      "How would you optimize {code} for {constraint}?",
      "Write pseudocode for {problem}",
      "What data structure is best for {scenario} and why?",
      "Explain the approach for solving {problem}",
      "What edge cases should be considered for {problem}?",
      "How does {algorithm} handle {case}?",
      "Compare {algo1} and {algo2} for {use_case}",
      "What is the recurrence relation for {problem}?",
      "How to modify {algorithm} for {requirement}?"
    ],
    "Data Structures": [
      "When to use {ds1} vs {ds2}?",
      "How does {operation} work in {ds}?",
      "What is the space complexity of {ds} storing {n} elements?",
      "Implement {operation} for {ds}",
      "What are the advantages of {ds} over {alternative}?",
      "How to handle {issue} in {ds} implementation?",
      "Explain the rotation operation in {tree_type}",
      "What is the traversal order for {pattern}?",
      "How to find {element} in {ds} efficiently?",
      "What balancing mechanism does {ds} use?"
    ],
    "System Design": [
      "How would you design {system} for {scale} users?",
      "What components are needed for {feature}?",
      "How to ensure {requirement} in distributed system?",
      "What database would you choose for {data_type} and why?",
      "How to handle {failure} in {system}?",
      "What caching strategy for {access_pattern}?",
      "How to scale {component} horizontally?",
      "What monitoring metrics for {service}?",
      "How to design API for {functionality}?",
      "What security measures for {data_sensitivity}?"
    ],
    "Behavioral": [
      "Describe a time when you {scenario}",
      "How would you handle {situation} with {people}?",
      "What is your approach to {task} under {constraint}?",
      "Tell me about a project where you {action}",
      "How do you prioritize {multiple_tasks}?",
      "What would you do if {problem} occurred?",
      "How do you ensure {quality} in your work?",
      "Describe your leadership style with example",
      "How do you handle feedback that you disagree with?",
      "Where do you see yourself in {years} years?"
    ]
  };

  // Generate completely unique questions
  let questionId = 0;
  
  for (let t = 0; t < TOTAL_TESTS; t++) {
    const company = companies[t % companies.length];
    const questions: Question[] = [];
    
    for (let q = 0; q < QUESTIONS_PER_TEST; q++) {
      questionId++;
      const cat = categories[q % categories.length];
      const topic = topics[cat][(t + q) % topics[cat].length];
      const difficulty = company.difficulty === "Advanced" ? "Advanced" : 
                        company.difficulty === "Hard" ? "Hard" : "Medium";
      
      // Generate unique values for each question
      const uniqueValues = {
        x: Math.floor(Math.random() * 100) + 10,
        y: Math.floor(Math.random() * 30) + 5,
        z: Math.floor(Math.random() * 25) + 5,
        a: Math.floor(Math.random() * 20) + 5,
        b: Math.floor(Math.random() * 25) + 5,
        r1: Math.floor(Math.random() * 5) + 1,
        r2: Math.floor(Math.random() * 5) + 1,
        l: Math.floor(Math.random() * 300) + 100,
        t: Math.floor(Math.random() * 20) + 5,
        p: Math.floor(Math.random() * 10000) + 1000,
        r: Math.floor(Math.random() * 15) + 5,
        n: Math.floor(Math.random() * 5) + 1
      };

      // Select template and fill with unique values
      const template = questionTemplates[cat][q % questionTemplates[cat].length];
      let questionText = template;
      
      // Replace placeholders with unique values
      Object.entries(uniqueValues).forEach(([key, value]) => {
        questionText = questionText.replace(`{${key}}`, value.toString());
      });

      // Generate unique options for each question
      const options: string[] = [];
      const correctIndex = Math.floor(Math.random() * 4);
      
      switch(cat) {
        case "Quantitative Aptitude":
          const base = Math.floor(Math.random() * 100) + 50;
          options.push(
            `${(base * 0.85).toFixed(2)}`,
            `${(base * 1.15).toFixed(2)}`,
            `${(base * 0.92).toFixed(2)}`,
            `${(base * 1.08).toFixed(2)}`
          );
          options[correctIndex] = `${(base * 1.05).toFixed(2)}`;
          break;
          
        case "Logical Reasoning":
          options.push(
            "North-East",
            "South-West", 
            "North-West",
            "South-East"
          );
          options[correctIndex] = "North-East";
          break;
          
        case "Verbal Ability":
          options.push(
            "Ubiquitous",
            "Pervasive",
            "Omnipresent",
            "Widespread"
          );
          options[correctIndex] = "Ubiquitous";
          break;
          
        case "Technical Core":
          options.push(
            "Deadlock Prevention",
            "Memory Management",
            "Process Synchronization",
            "CPU Scheduling"
          );
          options[correctIndex] = "Process Synchronization";
          break;
          
        case "Coding Concepts":
          options.push(
            "O(n log n)",
            "O(n²)",
            "O(n)",
            "O(log n)"
          );
          options[correctIndex] = "O(n log n)";
          break;
          
        case "Data Structures":
          options.push(
            "Hash Table",
            "Binary Search Tree",
            "Linked List",
            "Array"
          );
          options[correctIndex] = "Hash Table";
          break;
          
        case "System Design":
          options.push(
            "Consistent Hashing",
            "Load Balancing",
            "Database Sharding",
            "Caching Layer"
          );
          options[correctIndex] = "Consistent Hashing";
          break;
          
        case "Behavioral":
          options.push(
            "Analyze the problem thoroughly before proposing solutions",
            "Delegate the issue to a team member",
            "Immediately implement the most obvious solution",
            "Escalate to management immediately"
          );
          options[correctIndex] = "Analyze the problem thoroughly before proposing solutions";
          break;
      }

      questions.push({
        id: questionId,
        category: cat,
        topic: topic,
        difficulty: difficulty,
        question: `${questionText} (Test ${t + 1}, Q${q + 1})`,
        options: options,
        correctAnswer: correctIndex,
        explanation: `This question tests your understanding of ${topic}. The correct approach involves ${cat === "Quantitative Aptitude" ? "applying the appropriate formula" : cat === "Logical Reasoning" ? "identifying the logical pattern" : cat === "Technical Core" ? "understanding the core concept" : "analyzing the scenario correctly"}. Always consider alternative approaches and validate your answer.`,
        tips: [
          "Read the question carefully before attempting",
          "Eliminate obviously wrong options first",
          "Manage your time effectively",
          "Double-check calculations if applicable"
        ]
      });
    }

    modules.push({
      id: t + 1,
      title: `${company.name} #${t + 1}`,
      company: company.name,
      icon: company.icon,
      estimatedTime: company.time,
      passingScore: Math.floor(QUESTIONS_PER_TEST * 0.75), // 75% passing
      questions,
      tags: [...company.tags, categories[t % categories.length]],
      difficultyLevel: company.difficulty
    });
  }

  return modules;
};

const PLACEMENT_DATASET = generatePlacementDataset();

const PlacementMockEngine = () => {
  // --- ENHANCED CORE STATE ---
  const [activeTestId, setActiveTestId] = useState<number | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [proctorLogs, setProctorLogs] = useState<string[]>(["[SYSTEM] Proctor initialized"]);
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    speed: 0,
    accuracy: 0,
    consistency: 0,
    categoryBreakdown: {}
  });
  const [testHistory, setTestHistory] = useState<Array<{testId: number, score: number, date: string, company: string}>>([]);
  
  // --- ENHANCED TOOL STATE ---
  const [showCalc, setShowCalc] = useState(false);
  const [showPad, setShowPad] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [scratchContent, setScratchContent] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const activeTest = useMemo(() => 
    PLACEMENT_DATASET.find(m => m.id === activeTestId), [activeTestId]
  );

  // --- PERSISTENCE & RECOVERY ---
  useEffect(() => {
    const backup = localStorage.getItem('placement_state_v1');
    const history = localStorage.getItem('test_history');
    if (backup && !activeTestId) {
      const data = JSON.parse(backup);
      setActiveTestId(data.activeTestId);
      setAnswers(data.answers);
      setTimeLeft(data.timeLeft);
      setTestHistory(history ? JSON.parse(history) : []);
      toast.success("Previous session restored");
    }
  }, []);

  useEffect(() => {
    if (activeTestId && !isSubmitted) {
      localStorage.setItem('placement_state_v1', JSON.stringify({ 
        activeTestId, 
        answers, 
        timeLeft,
        flagged,
        currentIdx 
      }));
    }
  }, [answers, timeLeft, activeTestId, flagged, currentIdx]);

  // --- PROCTORING SYSTEM ---
  useEffect(() => {
    if (!activeTestId || isSubmitted) return;

    const logEvent = (msg: string, type: "info" | "warning" | "violation" = "info") => {
      const prefix = type === "violation" ? "🔴 VIOLATION" : type === "warning" ? "🟡 WARNING" : "🔵 INFO";
      const logMsg = `${prefix} ${new Date().toLocaleTimeString()}: ${msg}`;
      setProctorLogs(prev => [...prev.slice(-9), logMsg]);
      
      if (type === "violation") {
        toast.error(`PROCTOR: ${msg}`, { duration: 5000 });
      } else if (type === "warning") {
        toast.warning(msg, { duration: 3000 });
      }
    };

    const handleBlur = () => logEvent("Tab switched - focus lost", "violation");
    const handleContext = (e: MouseEvent) => {
      e.preventDefault();
      logEvent("Right-click disabled", "warning");
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        logEvent("Copy/paste disabled", "violation");
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        logEvent("Developer tools blocked", "violation");
      }
    };

    // Timer
    const ticker = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(ticker);
          finalizeTest();
          return 0;
        }
        
        // Performance tracking
        if (prev % 30 === 0) {
          const answered = Object.keys(answers).length;
          const speed = answered / (3600 - prev) * 60;
          setPerformance(p => ({
            ...p,
            speed: Math.round(speed * 10) / 10
          }));
        }
        
        return prev - 1;
      });
    }, 1000);

    // Event listeners
    window.addEventListener('blur', handleBlur);
    window.addEventListener('contextmenu', handleContext);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('contextmenu', handleContext);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(ticker);
    };
  }, [activeTestId, isSubmitted, answers]);

  // --- PERFORMANCE TRACKING ---
  useEffect(() => {
    if (activeTest) {
      const categoryScores: Record<string, { correct: number, total: number }> = {};
      activeTest.questions.forEach(q => {
        if (!categoryScores[q.category]) {
          categoryScores[q.category] = { correct: 0, total: 0 };
        }
        if (answers[q.id] === q.correctAnswer) {
          categoryScores[q.category].correct++;
        }
        categoryScores[q.category].total++;
      });

      const breakdown: Record<string, number> = {};
      Object.entries(categoryScores).forEach(([cat, { correct, total }]) => {
        breakdown[cat] = total > 0 ? Math.round((correct / total) * 100) : 0;
      });

      const accuracy = Object.values(categoryScores).reduce((acc, { correct }) => acc + correct, 0) / 
                      Object.values(categoryScores).reduce((acc, { total }) => acc + total, 0) * 100 || 0;

      setPerformance(p => ({
        ...p,
        accuracy: Math.round(accuracy),
        categoryBreakdown: breakdown
      }));
    }
  }, [answers, activeTest]);

  const finalizeTest = () => {
    setIsSubmitted(true);
    const score = activeTest?.questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0) || 0;
    const newHistory = [...testHistory, {
      testId: activeTestId!,
      score,
      company: activeTest?.company || "",
      date: new Date().toISOString()
    }];
    setTestHistory(newHistory);
    localStorage.setItem('test_history', JSON.stringify(newHistory));
    localStorage.removeItem('placement_state_v1');
    
    toast.success(`Test Complete! Score: ${score}/${QUESTIONS_PER_TEST}`, {
      duration: 5000,
      action: {
        label: 'View Details',
        onClick: () => setShowStats(true)
      }
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const resetTest = () => {
    setAnswers({});
    setFlagged([]);
    setCurrentIdx(0);
    setTimeLeft(3600);
    setIsSubmitted(false);
    setProctorLogs(["[SYSTEM] Test reset"]);
    localStorage.removeItem('placement_state_v1');
    toast.info("Test reset to initial state");
  };

  const filteredTests = PLACEMENT_DATASET.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => test.tags.includes(tag));
    const matchesDifficulty = difficultyFilter === "all" || test.difficultyLevel === difficultyFilter;
    return matchesSearch && matchesTags && matchesDifficulty;
  });

  // --- MAIN RENDER ---
  if (!activeTestId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl font-bold">
                  <span className="text-cyan-400">Placement</span> Prep Pro
                </h1>
                <p className="text-gray-400 mt-2">Master your placement interviews with 336 unique questions</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowStats(true)} className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700">
                  <BarChart3 size={20} />
                </button>
                <button onClick={() => setShowSettings(true)} className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700">
                  <Settings size={20} />
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 font-semibold">LIVE SYSTEM</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{testHistory.length} tests taken</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} />
                <span>Avg Score: {testHistory.length > 0 ? 
                  Math.round(testHistory.reduce((acc, t) => acc + t.score, 0) / testHistory.length) : 0}/12
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} />
                <span>{PLACEMENT_DATASET.length} Mock Tests</span>
              </div>
            </div>
          </header>

          {/* Search & Filters */}
          <div className="mb-8 p-6 bg-gray-800/30 rounded-2xl border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tests by company, topic, or difficulty..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl hover:bg-gray-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {["FAANG", "Quantitative", "Logical", "Coding", "DSA", "System Design", "Behavioral", "Product", "Startup", "Consulting"].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(prev => 
                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                  )}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-gray-900/50 text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Test Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTests.map(test => (
              <motion.div 
                key={test.id}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => setActiveTestId(test.id)}
                className="p-6 rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900/50 to-black cursor-pointer group transition-all"
              >
                {/* Difficulty Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                  test.difficultyLevel === "Advanced" ? 'bg-purple-500/20 text-purple-300' :
                  test.difficultyLevel === "Hard" ? 'bg-red-500/20 text-red-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {test.difficultyLevel}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{test.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {test.company.split(' ')[0]}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span className="text-xs text-gray-500">{test.estimatedTime}min</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-cyan-400">{test.title}</h3>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {test.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Passing: {test.passingScore}/12</span>
                    <span>{QUESTIONS_PER_TEST} questions</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${(test.id % 4 + 1) * 25}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Modal */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowStats(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gray-900 rounded-2xl border border-gray-700 p-8 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">Your Performance</h2>
                  <button onClick={() => setShowStats(false)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                    <X size={20} />
                  </button>
                </div>
                
                {testHistory.length > 0 ? (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-300">Recent Tests</h3>
                    <div className="space-y-3">
                      {testHistory.slice(-5).reverse().map((test, i) => (
                        <div key={i} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{test.company}</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              test.score >= 9 ? 'bg-green-500/20 text-green-400' :
                              test.score >= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {test.score}/12
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            {new Date(test.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Complete a test to see your performance analytics</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (isSubmitted && activeTest) {
    const score = activeTest.questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
    const percentage = Math.round((score / QUESTIONS_PER_TEST) * 100);
    const rank = percentage >= 90 ? "EXCEPTIONAL" : 
                 percentage >= 75 ? "STRONG" : 
                 percentage >= 60 ? "COMPETENT" : "NEEDS IMPROVEMENT";

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full bg-gray-900 border border-gray-700 p-12 rounded-3xl shadow-2xl"
        >
          <div className="text-center mb-10">
            <Award className="w-24 h-24 text-cyan-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-2">Test Complete!</h2>
            <p className="text-gray-400">{activeTest.company}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 text-center">
              <p className="text-sm text-gray-400 mb-2">Score</p>
              <p className="text-5xl font-bold text-cyan-500">{score}/12</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 text-center">
              <p className="text-sm text-gray-400 mb-2">Accuracy</p>
              <p className="text-5xl font-bold text-white">{percentage}%</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 text-center">
              <p className="text-sm text-gray-400 mb-2">Performance</p>
              <p className="text-2xl font-bold text-cyan-400">{rank}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all"
            >
              Take Another Test
            </button>
            <button 
              onClick={() => setShowStats(true)}
              className="px-8 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
            >
              View Analytics
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = activeTest!.questions[currentIdx];
  const progress = ((currentIdx + 1) / QUESTIONS_PER_TEST) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 flex flex-col">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-gray-800 px-6 flex justify-between items-center bg-gray-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTestId(null)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            <Home size={20} />
          </button>
          <div>
            <h2 className="font-bold">{activeTest?.company}</h2>
            <p className="text-xs text-gray-500">Question {currentIdx + 1} of {QUESTIONS_PER_TEST}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
            timeLeft < 300 ? 'border-red-500 bg-red-500/10 text-red-400 animate-pulse' : 
            'border-gray-700 bg-gray-800'
          }`}>
            <Timer size={18} />
            <span className="text-xl font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={finalizeTest}
            className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all"
          >
            Submit Test
          </button>
        </div>
      </nav>

      <div className="flex-grow flex overflow-hidden">
        {/* Side Panel */}
        <aside className="w-64 lg:w-80 border-r border-gray-800 p-6 flex flex-col justify-between bg-gray-900/50 overflow-y-auto">
          <div className="space-y-6">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Navigation */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Questions</h3>
              <div className="grid grid-cols-4 gap-2">
                {activeTest?.questions.map((q, i) => (
                  <button 
                    key={q.id}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-12 rounded-lg font-semibold transition-all relative ${
                      currentIdx === i ? 'bg-cyan-600 text-white shadow-lg' :
                      answers[q.id] !== undefined ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      flagged.includes(q.id) ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                      'bg-gray-800 text-gray-500 hover:bg-gray-700'
                    }`}
                  >
                    {i + 1}
                    {/* Status indicators */}
                    {answers[q.id] !== undefined && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                    {flagged.includes(q.id) && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-800/50 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-green-400">
                  {Object.keys(answers).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Answered</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-yellow-400">
                  {flagged.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Flagged</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-xl text-center">
                <div className="text-xl font-bold text-blue-400">
                  {QUESTIONS_PER_TEST - Object.keys(answers).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Remaining</div>
              </div>
            </div>
          </div>

          {/* Tools */}
          <div className="space-y-4 pt-6 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setShowCalc(!showCalc)}
                className={`p-3 rounded-xl flex items-center justify-center gap-2 ${
                  showCalc ? 'bg-cyan-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <Calculator size={18} />
                <span className="text-sm">Calculator</span>
              </button>
              <button 
                onClick={() => setShowPad(!showPad)}
                className={`p-3 rounded-xl flex items-center justify-center gap-2 ${
                  showPad ? 'bg-cyan-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <Edit3 size={18} />
                <span className="text-sm">Notepad</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {/* Question Header */}
            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  currentQ.difficulty === "Advanced" ? 'bg-purple-500/20 text-purple-400' :
                  currentQ.difficulty === "Hard" ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {currentQ.difficulty}
                </span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                  {currentQ.category}
                </span>
                <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400">
                  {currentQ.topic}
                </span>
              </div>
            </header>

            {/* Question */}
            <div className="mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold leading-relaxed mb-8">
                {currentQ.question}
              </h2>
              
              {/* Options */}
              <div className="space-y-4">
                {currentQ.options.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => setAnswers({...answers, [currentQ.id]: i})}
                    className={`w-full p-6 text-left rounded-xl border transition-all ${
                      answers[currentQ.id] === i 
                        ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg' 
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                        answers[currentQ.id] === i 
                          ? 'bg-cyan-500 text-white' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-lg">{opt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Navigation */}
            <footer className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <button 
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(p => p - 1)}
                  className="px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                <button 
                  onClick={() => currentIdx < QUESTIONS_PER_TEST - 1 ? setCurrentIdx(p => p + 1) : finalizeTest()}
                  className="px-6 py-3 bg-cyan-600 rounded-xl hover:bg-cyan-700 flex items-center gap-2"
                >
                  {currentIdx === QUESTIONS_PER_TEST - 1 ? (
                    <>
                      Finish Test
                      <CheckCircle2 size={18} />
                    </>
                  ) : (
                    <>
                      Next Question
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setFlagged(prev => prev.includes(currentQ.id) ? prev.filter(f => f !== currentQ.id) : [...prev, currentQ.id])}
                  className={`p-3 rounded-xl ${
                    flagged.includes(currentQ.id) 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Flag size={18} />
                </button>
                <button 
                  onClick={resetTest}
                  className="px-4 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 text-sm"
                >
                  Reset Test
                </button>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Floating Tools */}
      <AnimatePresence>
        {showCalc && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-6 right-6 z-40 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-2xl w-72"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold">Calculator</span>
              <button onClick={() => setShowCalc(false)} className="p-1 rounded hover:bg-gray-700">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['C','⌫','%','÷','7','8','9','×','4','5','6','-','1','2','3','+','0','.','='].map(key => (
                <button 
                  key={key}
                  className="h-12 bg-gray-700 rounded-lg hover:bg-gray-600 font-medium"
                >
                  {key}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {showPad && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-6 right-6 z-40 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-2xl w-80"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold">Notepad</span>
              <div className="flex gap-2">
                <button onClick={() => setScratchContent("")} className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">
                  Clear
                </button>
                <button onClick={() => setShowPad(false)} className="p-1 rounded hover:bg-gray-700">
                  <X size={16} />
                </button>
              </div>
            </div>
            <textarea 
              value={scratchContent}
              onChange={(e) => setScratchContent(e.target.value)}
              className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 ring-cyan-500"
              placeholder="Write your notes here..."
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlacementMockEngine;