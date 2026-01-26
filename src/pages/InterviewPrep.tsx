import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Timer, CheckCircle2, ChevronRight, ChevronLeft, Flag, 
  Maximize2, Calculator, Edit3, X, BarChart3, RefreshCcw, 
  Home, Award, Zap, Brain, ShieldAlert, Terminal, Lock, VideoOff,
  Cpu, Database, Network, Globe, Code2, Layers, BookOpen,Cake,
  Users, Cloud, Server, Code, GitBranch, Cctv, AlertTriangle,
  Hash, Clock, TrendingUp, Filter, Search, Settings, Bell,
  Download, Upload, Share2, Volume2, VolumeX, Eye, EyeOff,
  Camera, Mic, MicOff, Wifi, WifiOff, Battery, BatteryCharging,
  Video, MessageSquare, ThumbsUp, ThumbsDown, Star, Calendar,
  Target, TrendingDown, Users as UsersIcon, Briefcase, 
  DollarSign, MapPin, Globe as GlobeIcon, GitPullRequest,
  Type, Database as DatabaseIcon, Cpu as CpuIcon, Terminal as TerminalIcon,
  FileCode, BrainCircuit, Mic as MicIcon, Video as VideoIcon,
  CalendarDays, BellRing, DownloadCloud, Share, Heart,
  Settings as SettingsIcon, HelpCircle, ExternalLink,
  PauseCircle, PlayCircle, SkipForward, SkipBack,
  Volume1, Maximize, Minimize, MoreVertical, Eye as EyeIcon,
  Clipboard, Copy, Check, AlertCircle, Info, FileText,
  Play, Pause, StopCircle, Square, ListChecks, GitCompare,
  Cpu as Chip, Network as NetworkIcon, HardDrive, Shield,
  Code as CodeIcon, Database as DatabaseIcon2, Cloud as CloudIcon,
  Smartphone, Monitor, Smartphone as MobileIcon, Link, Key,
  UserCheck, MessageCircle, FileQuestion, Puzzle, TestTube,
  GitFork, GitMerge, Server as ServerIcon, Workflow, Radio,
  Cable, Router, Wrench, Hammer, FileBarChart, LineChart,
  PieChart, Activity, Cpu as CpuIcon2, MemoryStick, HardDrive as StorageIcon,
  Sparkles, Lightbulb, TrendingUp as TrendingUpIcon, Target as TargetIcon,
  Coffee, Rocket, ShieldCheck, GitCommit, Cpu as CPUIcon,
  Database as DatabaseIcon3, Wifi as WifiIcon, Layout,
  Package, Layers as LayersIcon, BookOpen as BookOpenIcon,
  GitBranch as GitBranchIcon, Cctv as CctvIcon, Workflow as WorkflowIcon,
  FileBarChart as FileBarChartIcon, LineChart as LineChartIcon,
  Book, GitPullRequest as GitPullRequestIcon, Shield as ShieldIcon,
  Building, Factory, Brain as BrainIcon, Globe2, Cpu as CpuIcon3,
  DatabaseZap, LayoutDashboard, Smartphone as SmartphoneIcon,
  Monitor as MonitorIcon, TerminalSquare, Network as NetworkIcon2,
  Database as DatabaseIcon4, CodeSquare, BookMarked, BookKey,
  BookCopy, FileStack, FileSpreadsheet, FileCode2, FileJson,
  FileOutput, FileInput, FileCheck, FileX, FileSearch,
  FileText as FileTextIcon, FileImage, FileVideo, FileAudio,
  BookOpenCheck, BookOpenText, GraduationCap, School,
  Rocket as RocketIcon, TrendingUp as TrendingUpIcon2,
  TrendingDown as TrendingDownIcon, Award as AwardIcon,
  Trophy, Medal, Crown, ShieldPlus, ShieldOff, ShieldQuestion,
  Languages, Palette, Music, Film, Gamepad2, PaintBucket,
  ShoppingCart, CreditCard, Wallet, Banknote, Coins,
  BarChart4, LineChart as LineChartIcon2, PieChart as PieChartIcon2,
  Activity as ActivityIcon, Target as TargetIcon2, Flag as FlagIcon,
  Map, Navigation, Compass, Mountain, CloudRain,
  Sun, Moon, Wind, Thermometer, Droplets, Umbrella,
  Calendar as CalendarIcon, Clock as ClockIcon, Timer as TimerIcon,
  CalendarClock, AlarmClock, Watch, Bell as BellIcon,
  BellRing as BellRingIcon, Megaphone, MessageSquare as MessageSquareIcon,
  MessageCircle as MessageCircleIcon, Mail, Phone, PhoneCall,
  PhoneForwarded, PhoneMissed, PhoneOff, Video as VideoIcon2,
  Voicemail, Send, Inbox, Archive, Mailbox, MailOpen,
  PhoneIncoming, PhoneOutgoing
} from "lucide-react";
import { toast } from "sonner";

// --- INTERVIEW PREPARATION TYPES ---
interface CodingQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  category: string;
  tags: string[];
  initialCode: string;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
  hints: string[];
  solution: string;
  timeLimit: number;
  memoryLimit: number;
}

interface InterviewQuestion {
  id: number;
  category: "Technical" | "Behavioral" | "System Design" | "Coding" | "HR" | "Case Study" | "Core CS" | "Databases" | "Web Dev" | "Design" | "Prep" | "DevOps" | "DSA" | "Advanced" | "Mixed";
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  question: string;
  expectedAnswer?: string;
  tips?: string[];
  followUpQuestions?: string[];
  evaluationCriteria?: string[];
  code?: string;
  testCases?: any[];
  constraints?: string[];
}

interface CompanyInterview {
  id: number;
  name: string;
  logo: string;
  package: string;
  location: string;
  difficulty: string;
  rounds: number;
  questions: InterviewQuestion[];
  codingQuestions: CodingQuestion[];
  preparationTime: number;
  successRate: number;
  tags: string[];
  recentHires?: number;
  color: string;
  icon: any;
}

interface InterviewSession {
  id: string;
  companyId: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  startTime: Date;
  duration: number;
  score?: number;
  feedback?: string;
  recordingUrl?: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  rating: number;
  icon: any;
  type: string;
  color: string;
  url: string;
  category: string;
  features: string[];
  difficulty?: string;
}

interface AITip {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: any;
  priority: "high" | "medium" | "low";
  actionSteps: string[];
}

// --- CODING QUESTION DATABASE ---
const CODING_QUESTIONS: CodingQuestion[] = [
  {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    category: "Arrays",
    tags: ["Array", "Hash Table"],
    initialCode: `function twoSum(nums, target) {
  // Your code here
}`,
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
      { input: "[3,3], 6", expectedOutput: "[0,1]" }
    ],
    hints: [
      "Use a hash map to store previously seen numbers",
      "Check if complement exists in the map",
      "Time complexity O(n), space complexity O(n)"
    ],
    solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    timeLimit: 2,
    memoryLimit: 256
  },
  {
    id: 2,
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list and return the reversed head.",
    difficulty: "Medium",
    category: "Linked List",
    tags: ["Linked List", "Recursion"],
    initialCode: `function reverseList(head) {
  // Your code here
}`,
    testCases: [
      { input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]" },
      { input: "[1,2]", expectedOutput: "[2,1]" },
      { input: "[]", expectedOutput: "[]" }
    ],
    hints: [
      "Use three pointers: prev, current, next",
      "Iterate through the list and reverse pointers",
      "Both iterative and recursive solutions work"
    ],
    solution: `function reverseList(head) {
  let prev = null;
  let current = head;
  while (current !== null) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  return prev;
}`,
    timeLimit: 3,
    memoryLimit: 256
  },
  {
    id: 3,
    title: "Merge Intervals",
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
    difficulty: "Medium",
    category: "Intervals",
    tags: ["Array", "Sorting"],
    initialCode: `function merge(intervals) {
  // Your code here
}`,
    testCases: [
      { input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
      { input: "[[1,4],[4,5]]", expectedOutput: "[[1,5]]" }
    ],
    hints: [
      "Sort intervals by start time",
      "Check for overlaps with last merged interval",
      "Use result array to store merged intervals"
    ],
    solution: `function merge(intervals) {
  if (intervals.length === 0) return [];
  
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    const current = intervals[i];
    
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      result.push(current);
    }
  }
  
  return result;
}`,
    timeLimit: 3,
    memoryLimit: 256
  },
  {
    id: 4,
    title: "Longest Palindromic Substring",
    description: "Given a string s, return the longest palindromic substring in s.",
    difficulty: "Hard",
    category: "String",
    tags: ["String", "Dynamic Programming"],
    initialCode: `function longestPalindrome(s) {
  // Your code here
}`,
    testCases: [
      { input: '"babad"', expectedOutput: '"bab"' },
      { input: '"cbbd"', expectedOutput: '"bb"' }
    ],
    hints: [
      "Expand around center approach",
      "Handle both odd and even length palindromes",
      "Time complexity O(n²)"
    ],
    solution: `function longestPalindrome(s) {
  let start = 0, end = 0;
  
  for (let i = 0; i < s.length; i++) {
    const len1 = expandAroundCenter(s, i, i);
    const len2 = expandAroundCenter(s, i, i + 1);
    const len = Math.max(len1, len2);
    
    if (len > end - start) {
      start = i - Math.floor((len - 1) / 2);
      end = i + Math.floor(len / 2);
    }
  }
  
  return s.substring(start, end + 1);
}

function expandAroundCenter(s, left, right) {
  while (left >= 0 && right < s.length && s[left] === s[right]) {
    left--;
    right++;
  }
  return right - left - 1;
}`,
    timeLimit: 5,
    memoryLimit: 512
  }
];

// --- COMPREHENSIVE RESOURCES DATABASE ---
const RESOURCES: Resource[] = [
  // Core CS Resources
  { 
    id: 1, 
    title: "OS: Three Easy Pieces", 
    description: "Best free operating systems book covering processes, threads, memory management, and file systems.", 
    rating: 4.9, 
    icon: Cpu, 
    type: "Free Book",
    color: "from-blue-500 to-cyan-500",
    url: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
    category: "Core CS",
    features: ["Free PDF", "550 pages", "Practical examples", "Exercises included"],
    difficulty: "Beginner to Advanced"
  },
  { 
    id: 2, 
    title: "Computer Networks: Top Down", 
    description: "Learn networking fundamentals, protocols, and internet architecture with practical labs.", 
    rating: 4.8, 
    icon: Network, 
    type: "Textbook",
    color: "from-green-500 to-emerald-500",
    url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
    category: "Core CS",
    features: ["Video lectures", "Wireshark labs", "Interactive quizzes", "Case studies"],
    difficulty: "Intermediate"
  },
  { 
    id: 3, 
    title: "CS50's Introduction to CS", 
    description: "Harvard's famous computer science course covering algorithms, data structures, and programming.", 
    rating: 4.9, 
    icon: GraduationCap, 
    type: "Free Course",
    color: "from-purple-500 to-pink-500",
    url: "https://cs50.harvard.edu/",
    category: "Core CS",
    features: ["Harvard certified", "12 weeks", "Problem sets", "Community support"],
    difficulty: "Beginner"
  },
  { 
    id: 4, 
    title: "MIT OpenCourseWare: Algorithms", 
    description: "MIT's legendary algorithms course with video lectures, assignments, and exams.", 
    rating: 4.9, 
    icon: Brain, 
    type: "University Course",
    color: "from-red-500 to-orange-500",
    url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/",
    category: "Core CS",
    features: ["MIT lectures", "Problem sets", "Exams with solutions", "Video lectures"],
    difficulty: "Advanced"
  },

  // Databases Resources
  { 
    id: 5, 
    title: "SQL Bolt", 
    description: "Interactive SQL tutorial with exercises to learn SQL from basic to advanced queries.", 
    rating: 4.7, 
    icon: Database, 
    type: "Interactive Tutorial",
    color: "from-yellow-500 to-amber-500",
    url: "https://sqlbolt.com/",
    category: "Databases",
    features: ["Interactive exercises", "No setup required", "Progress tracking", "Real-time feedback"],
    difficulty: "Beginner"
  },
  { 
    id: 6, 
    title: "MongoDB University", 
    description: "Free courses on MongoDB, NoSQL databases, and data modeling for modern applications.", 
    rating: 4.8, 
    icon: DatabaseZap, 
    type: "Certification",
    color: "from-green-600 to-emerald-600",
    url: "https://university.mongodb.com/",
    category: "Databases",
    features: ["Free certification", "Hands-on labs", "Industry recognized", "Expert instructors"],
    difficulty: "Intermediate"
  },
  { 
    id: 7, 
    title: "Database Internals", 
    description: "Deep dive into how databases work internally - storage engines, indexing, and transactions.", 
    rating: 4.8, 
    icon: Book, 
    type: "Book",
    color: "from-indigo-500 to-purple-500",
    url: "https://www.databass.dev/",
    category: "Databases",
    features: ["Advanced topics", "Code examples", "System design", "Performance optimization"],
    difficulty: "Advanced"
  },
  { 
    id: 8, 
    title: "PostgreSQL Exercises", 
    description: "Learn PostgreSQL with hundreds of exercises covering basic to advanced SQL queries.", 
    rating: 4.6, 
    icon: DatabaseIcon2, 
    type: "Practice Platform",
    color: "from-blue-600 to-cyan-600",
    url: "https://pgexercises.com/",
    category: "Databases",
    features: ["500+ exercises", "Real datasets", "Community solutions", "Performance tips"],
    difficulty: "All Levels"
  },

  // Web Dev Resources
  { 
    id: 9, 
    title: "MDN Web Docs", 
    description: "Complete reference for web technologies - HTML, CSS, JavaScript, and Web APIs.", 
    rating: 4.9, 
    icon: Globe, 
    type: "Documentation",
    color: "from-blue-700 to-indigo-700",
    url: "https://developer.mozilla.org/",
    category: "Web Dev",
    features: ["Official docs", "Live examples", "Browser compatibility", "Tutorials"],
    difficulty: "All Levels"
  },
  { 
    id: 10, 
    title: "React Docs Beta", 
    description: "Official React documentation with interactive examples and new features overview.", 
    rating: 4.8, 
    icon: Code2, 
    type: "Official Docs",
    color: "from-cyan-500 to-blue-500",
    url: "https://beta.reactjs.org/",
    category: "Web Dev",
    features: ["Interactive tutorials", "Hooks guide", "Best practices", "Migration guides"],
    difficulty: "Intermediate"
  },
  { 
    id: 11, 
    title: "Frontend Masters", 
    description: "Professional frontend development courses by industry experts with hands-on projects.", 
    rating: 4.9, 
    icon: Monitor, 
    type: "Premium Platform",
    color: "from-purple-600 to-pink-600",
    url: "https://frontendmasters.com/",
    category: "Web Dev",
    features: ["Expert instructors", "Project-based", "Career paths", "Community access"],
    difficulty: "Intermediate to Advanced"
  },
  { 
    id: 12, 
    title: "JavaScript.info", 
    description: "Modern JavaScript tutorial from basics to advanced topics with interactive exercises.", 
    rating: 4.8, 
    icon: CodeSquare, 
    type: "Tutorial",
    color: "from-yellow-600 to-orange-600",
    url: "https://javascript.info/",
    category: "Web Dev",
    features: ["Modern JS", "Interactive examples", "Quizzes", "Regular updates"],
    difficulty: "All Levels"
  },

  // Design Resources
  { 
    id: 13, 
    title: "System Design Primer", 
    description: "Learn how to design large-scale systems with interview questions and solutions.", 
    rating: 4.9, 
    icon: Cpu, 
    type: "GitHub Resource",
    color: "from-gray-700 to-gray-900",
    url: "https://github.com/donnemartin/system-design-primer",
    category: "Design",
    features: ["200k+ stars", "Real examples", "Interview questions", "Best practices"],
    difficulty: "Intermediate to Advanced"
  },
  { 
    id: 14, 
    title: "Designing Data-Intensive Applications", 
    description: "The definitive guide to building reliable, scalable, and maintainable applications.", 
    rating: 4.9, 
    icon: Database, 
    type: "Book",
    color: "from-red-700 to-rose-700",
    url: "https://dataintensive.net/",
    category: "Design",
    features: ["Industry standard", "Case studies", "Practical advice", "Architecture patterns"],
    difficulty: "Advanced"
  },
  { 
    id: 15, 
    title: "ByteByteGo System Design", 
    description: "Visual system design course with diagrams, examples, and real-world architectures.", 
    rating: 4.8, 
    icon: Layout, 
    type: "Visual Course",
    color: "from-blue-800 to-cyan-800",
    url: "https://bytebytego.com/",
    category: "Design",
    features: ["Visual learning", "Real architectures", "Interview prep", "Newsletter"],
    difficulty: "Intermediate"
  },
  { 
    id: 16, 
    title: "Architecture Patterns with Python", 
    description: "Learn clean architecture, DDD, and testing patterns for Python applications.", 
    rating: 4.7, 
    icon: BookOpen, 
    type: "Free Book",
    color: "from-green-700 to-emerald-700",
    url: "https://www.cosmicpython.com/",
    category: "Design",
    features: ["Free online", "Code examples", "Testing patterns", "Best practices"],
    difficulty: "Intermediate"
  },

  // Prep Resources
  { 
    id: 17, 
    title: "Tech Interview Handbook", 
    description: "Complete guide to tech interviews with coding, system design, and behavioral prep.", 
    rating: 4.8, 
    icon: BookOpenCheck, 
    type: "Handbook",
    color: "from-orange-500 to-red-500",
    url: "https://www.techinterviewhandbook.org/",
    category: "Prep",
    features: ["Comprehensive guide", "Salary negotiation", "Resume tips", "Company guides"],
    difficulty: "All Levels"
  },
  { 
    id: 18, 
    title: "Interviewing.io", 
    description: "Practice technical interviews anonymously with engineers from top companies.", 
    rating: 4.7, 
    icon: Users, 
    type: "Platform",
    color: "from-rose-500 to-pink-500",
    url: "https://interviewing.io/",
    category: "Prep",
    features: ["Mock interviews", "Anonymous practice", "Real feedback", "Company connections"],
    difficulty: "All Levels"
  },
  { 
    id: 19, 
    title: "Pramp", 
    description: "Free peer-to-peer mock interviews for coding, system design, and behavioral rounds.", 
    rating: 4.6, 
    icon: MessageSquare, 
    type: "Free Platform",
    color: "from-cyan-600 to-blue-600",
    url: "https://www.pramp.com/",
    category: "Prep",
    features: ["Free mock interviews", "Peer practice", "Video calls", "Feedback exchange"],
    difficulty: "All Levels"
  },
  { 
    id: 20, 
    title: "LeetCode Discuss: Interview Experiences", 
    description: "Read real interview experiences from candidates at FAANG and other top companies.", 
    rating: 4.7, 
    icon: MessageCircle, 
    type: "Community",
    color: "from-yellow-600 to-amber-600",
    url: "https://leetcode.com/discuss/interview-experience",
    category: "Prep",
    features: ["Real experiences", "Company specific", "Question lists", "Tips and tricks"],
    difficulty: "All Levels"
  },

  // DevOps Resources
  { 
    id: 21, 
    title: "Kubernetes.io Docs", 
    description: "Official Kubernetes documentation with tutorials, concepts, and API references.", 
    rating: 4.8, 
    icon: Cloud, 
    type: "Official Docs",
    color: "from-blue-600 to-indigo-600",
    url: "https://kubernetes.io/docs/home/",
    category: "DevOps",
    features: ["Official docs", "Tutorials", "Best practices", "API reference"],
    difficulty: "Intermediate to Advanced"
  },
  { 
    id: 22, 
    title: "Docker Mastery", 
    description: "Complete Docker course with hands-on labs, best practices, and real projects.", 
    rating: 4.8, 
    icon: Package, 
    type: "Course",
    color: "from-blue-500 to-cyan-500",
    url: "https://www.udemy.com/course/docker-mastery/",
    category: "DevOps",
    features: ["Hands-on labs", "Real projects", "Best practices", "Community support"],
    difficulty: "Beginner to Intermediate"
  },
  { 
    id: 23, 
    title: "AWS Training", 
    description: "Free AWS training and certification resources from Amazon Web Services.", 
    rating: 4.8, 
    icon: CloudIcon, 
    type: "Free Training",
    color: "from-orange-500 to-yellow-500",
    url: "https://aws.amazon.com/training/",
    category: "DevOps",
    features: ["Free courses", "Certification prep", "Hands-on labs", "Official content"],
    difficulty: "All Levels"
  },
  { 
    id: 24, 
    title: "Google Cloud Skills Boost", 
    description: "Free Google Cloud training with labs, quests, and skill badges.", 
    rating: 4.7, 
    icon: Cloud, 
    type: "Free Training",
    color: "from-blue-500 to-green-500",
    url: "https://www.cloudskillsboost.google/",
    category: "DevOps",
    features: ["Free credits", "Hands-on labs", "Skill badges", "Certification prep"],
    difficulty: "All Levels"
  },

  // DSA Resources
  { 
    id: 25, 
    title: "NeetCode 150", 
    description: "Curated 150 LeetCode problems covering all major patterns with video solutions.", 
    rating: 4.8, 
    icon: FileCode, 
    type: "Problem Set",
    color: "from-purple-500 to-pink-500",
    url: "https://neetcode.io/practice",
    category: "DSA",
    features: ["150 problems", "Video solutions", "Pattern-based", "Progress tracking"],
    difficulty: "All Levels"
  },
  { 
    id: 26, 
    title: "LeetCode Patterns", 
    description: "Master 14 coding patterns to solve any coding interview question efficiently.", 
    rating: 4.6, 
    icon: Puzzle, 
    type: "Course",
    color: "from-yellow-500 to-amber-500",
    url: "https://www.educative.io/courses/grokking-the-coding-interview",
    category: "DSA",
    features: ["Pattern-based", "Visual explanations", "Multiple languages", "Progress tracking"],
    difficulty: "Intermediate"
  },
  { 
    id: 27, 
    title: "Algorithms, Part I & II", 
    description: "Princeton's algorithms course covering data structures, algorithms, and analysis.", 
    rating: 4.9, 
    icon: BrainCircuit, 
    type: "University Course",
    color: "from-orange-600 to-red-600",
    url: "https://www.coursera.org/learn/algorithms-part1",
    category: "DSA",
    features: ["Princeton course", "Java examples", "Theory + practice", "Certificate"],
    difficulty: "Intermediate to Advanced"
  },
  { 
    id: 28, 
    title: "Visualgo", 
    description: "Visualize data structures and algorithms through animation for better understanding.", 
    rating: 4.7, 
    icon: Activity, 
    type: "Visual Tool",
    color: "from-green-500 to-teal-500",
    url: "https://visualgo.net/",
    category: "DSA",
    features: ["Visual animations", "Step-by-step", "Multiple languages", "Quiz mode"],
    difficulty: "Beginner to Intermediate"
  },

  // Advanced Resources
  { 
    id: 29, 
    title: "Fast.ai", 
    description: "Free practical deep learning courses for coders with no machine learning background.", 
    rating: 4.9, 
    icon: Brain, 
    type: "Free Course",
    color: "from-purple-600 to-pink-600",
    url: "https://www.fast.ai/",
    category: "Advanced",
    features: ["Free courses", "Practical focus", "Cutting-edge", "Community forum"],
    difficulty: "Intermediate"
  },
  { 
    id: 30, 
    title: "Blockchain Basics", 
    description: "Learn blockchain fundamentals, smart contracts, and decentralized applications.", 
    rating: 4.7, 
    icon: Link, 
    type: "Course",
    color: "from-gray-700 to-gray-900",
    url: "https://www.coursera.org/learn/blockchain-basics",
    category: "Advanced",
    features: ["IBM course", "Hands-on labs", "Smart contracts", "Certificate"],
    difficulty: "Intermediate"
  },
  { 
    id: 31, 
    title: "Quantum Computing for Developers", 
    description: "Introduction to quantum computing with Qiskit and practical programming exercises.", 
    rating: 4.6, 
    icon: Cpu, 
    type: "Course",
    color: "from-indigo-600 to-purple-600",
    url: "https://qiskit.org/learn/",
    category: "Advanced",
    features: ["IBM Qiskit", "Quantum circuits", "Real quantum computers", "Community"],
    difficulty: "Advanced"
  },
  { 
    id: 32, 
    title: "Game Development with Unity", 
    description: "Complete guide to game development using Unity engine and C# programming.", 
    rating: 4.8, 
    icon: Gamepad2, 
    type: "Learning Path",
    color: "from-gray-600 to-black",
    url: "https://learn.unity.com/",
    category: "Advanced",
    features: ["Free courses", "Project-based", "Asset store", "Community support"],
    difficulty: "Beginner to Advanced"
  },

  // Mixed Resources
  { 
    id: 33, 
    title: "Cracking the Coding Interview", 
    description: "189 programming questions and solutions for technical interview preparation.", 
    rating: 4.8, 
    icon: Target, 
    type: "Book",
    color: "from-cyan-500 to-blue-500",
    url: "https://www.crackingthecodinginterview.com/",
    category: "Mixed",
    features: ["189 questions", "Detailed solutions", "Company-specific", "Behavioral tips"],
    difficulty: "All Levels"
  },
  { 
    id: 34, 
    title: "Elements of Programming Interviews", 
    description: "Comprehensive programming interview preparation with 300+ problems and solutions.", 
    rating: 4.8, 
    icon: BookKey, 
    type: "Book",
    color: "from-red-500 to-orange-500",
    url: "https://elementsofprogramminginterviews.com/",
    category: "Mixed",
    features: ["300+ problems", "Multiple languages", "Company questions", "Solution patterns"],
    difficulty: "Advanced"
  },
  { 
    id: 35, 
    title: "Blind 75", 
    description: "75 most frequently asked coding interview problems from top tech companies.", 
    rating: 4.7, 
    icon: TargetIcon, 
    type: "Problem Set",
    color: "from-green-500 to-emerald-500",
    url: "https://www.teamblind.com/post/New-Year-Gift---Curated-List-of-Top-75-LeetCode-Questions-to-Save-Your-Time-OaM1orEU",
    category: "Mixed",
    features: ["75 essential", "Company frequency", "Time efficient", "Priority order"],
    difficulty: "All Levels"
  },
  { 
    id: 36, 
    title: "Interview Cake", 
    description: "Interview preparation course focusing on problem-solving strategies and patterns.", 
    rating: 4.8, 
    icon: Cake, 
    type: "Course",
    color: "from-pink-500 to-rose-500",
    url: "https://www.interviewcake.com/",
    category: "Mixed",
    features: ["Step-by-step", "Hint system", "Real questions", "Company focused"],
    difficulty: "Intermediate"
  }
];

// --- AI TIPS DATABASE ---
const AI_TIPS: AITip[] = [
  {
    id: 1,
    title: "Master the STAR Method",
    description: "Use Situation, Task, Action, Result to structure behavioral answers effectively",
    category: "Behavioral",
    icon: Target,
    priority: "high",
    actionSteps: [
      "Describe a specific situation with context",
      "Explain your task or responsibility clearly",
      "Detail the actions you took step by step",
      "Quantify the results achieved with metrics"
    ]
  },
  {
    id: 2,
    title: "Think Aloud During Coding",
    description: "Verbalize your thought process while solving problems to demonstrate problem-solving skills",
    category: "Coding",
    icon: Brain,
    priority: "high",
    actionSteps: [
      "Restate the problem in your own words",
      "Discuss edge cases and constraints upfront",
      "Explain time/space complexity trade-offs",
      "Walk through test cases before implementing"
    ]
  },
  {
    id: 3,
    title: "Ask Clarifying Questions",
    description: "Always clarify requirements before solving to avoid misunderstandings",
    category: "System Design",
    icon: HelpCircle,
    priority: "medium",
    actionSteps: [
      "Ask about scale requirements (users, requests)",
      "Clarify functional and non-functional requirements",
      "Identify constraints and assumptions",
      "Discuss priorities and trade-offs"
    ]
  },
  {
    id: 4,
    title: "Practice Time Management",
    description: "Allocate time wisely across different question types during interviews",
    category: "Prep",
    icon: Timer,
    priority: "medium",
    actionSteps: [
      "Spend 5 minutes understanding the problem",
      "Allocate 15 minutes for solution design",
      "Leave 5 minutes for testing and edge cases",
      "Save 5 minutes for discussion and questions"
    ]
  },
  {
    id: 5,
    title: "Use Whiteboard Effectively",
    description: "Structure your whiteboard or virtual board properly for maximum clarity",
    category: "Technical",
    icon: Edit3,
    priority: "low",
    actionSteps: [
      "Divide space for problem statement",
      "Allocate area for solution design",
      "Leave room for test cases and examples",
      "Keep space for complexity analysis"
    ]
  },
  {
    id: 6,
    title: "Master System Design Fundamentals",
    description: "Focus on core system design principles before diving into specifics",
    category: "System Design",
    icon: Cpu,
    priority: "high",
    actionSteps: [
      "Start with requirements gathering",
      "Design high-level architecture first",
      "Identify components and their interactions",
      "Discuss scalability and trade-offs"
    ]
  }
];

// --- INTERVIEW QUESTION DATABASE ---
const generateInterviewDataset = (): CompanyInterview[] => {
  const companies: CompanyInterview[] = [];
  
  const companyList = [
    { name: "Google", logo: "🔍", package: "₹45L", location: "Bangalore", difficulty: "Hard", rounds: 5, color: "from-blue-500 to-cyan-500", icon: Globe },
    { name: "Microsoft", logo: "🪟", package: "₹38L", location: "Hyderabad", difficulty: "Hard", rounds: 4, color: "from-green-500 to-emerald-500", icon: Cpu },
    { name: "Amazon", logo: "📦", package: "₹42L", location: "Bangalore", difficulty: "Hard", rounds: 5, color: "from-yellow-500 to-orange-500", icon: Cloud },
    { name: "Meta", logo: "👥", package: "₹50L", location: "Remote", difficulty: "Expert", rounds: 6, color: "from-blue-600 to-indigo-600", icon: Users },
    { name: "Apple", logo: "🍎", package: "₹48L", location: "Bangalore", difficulty: "Expert", rounds: 5, color: "from-gray-700 to-gray-900", icon: Monitor },
    { name: "Netflix", logo: "🎬", package: "₹55L", location: "Remote", difficulty: "Expert", rounds: 4, color: "from-red-600 to-red-800", icon: Video },
    { name: "Goldman Sachs", logo: "💰", package: "₹35L", location: "Mumbai", difficulty: "Hard", rounds: 5, color: "from-yellow-600 to-yellow-800", icon: Briefcase },
    { name: "McKinsey", logo: "💼", package: "₹40L", location: "Delhi", difficulty: "Expert", rounds: 6, color: "from-blue-700 to-blue-900", icon: BarChart3 }
  ];

  const topics = {
    "Core CS": ["OS", "Networking", "DBMS", "Computer Architecture", "Distributed Systems"],
    "Databases": ["SQL", "NoSQL", "Indexing", "Transactions", "Sharding"],
    "Web Dev": ["React", "Node.js", "HTTP", "REST APIs", "Web Security"],
    "Design": ["System Design", "UI/UX", "API Design", "Scalability", "Microservices"],
    "Prep": ["Resume", "Behavioral", "Salary Negotiation", "Portfolio", "Mock Interviews"],
    "DevOps": ["Docker", "Kubernetes", "CI/CD", "AWS", "Monitoring"],
    "DSA": ["Arrays", "Trees", "Graphs", "Dynamic Programming", "Backtracking"],
    "Advanced": ["Machine Learning", "Blockchain", "Quantum", "AR/VR", "IoT"],
    "Mixed": ["Problem Solving", "Debugging", "Code Review", "Technical Communication", "Leadership"]
  };

  const questionTemplates = {
    "Core CS": [
      "Explain the difference between process and thread with examples",
      "How does virtual memory work in modern operating systems?",
      "Describe the TCP/IP protocol stack layers and their functions",
      "What are the ACID properties in database transactions?",
      "Explain cache coherence in multiprocessor systems"
    ],
    "Databases": [
      "Compare SQL vs NoSQL databases for a social media application",
      "How would you optimize a slow-running SQL query?",
      "Explain different types of database indexing strategies",
      "Design a database schema for an e-commerce platform",
      "What is database sharding and when would you use it?"
    ],
    "Web Dev": [
      "Explain the React component lifecycle methods",
      "How does Node.js handle asynchronous operations?",
      "Design a REST API for a ride-sharing service",
      "What are common web security vulnerabilities and how to prevent them?",
      "Optimize a web application for performance"
    ],
    "Design": [
      "Design URL shortening service like Bitly",
      "Architect a real-time chat application",
      "Design a recommendation system for Netflix",
      "Create scalable video streaming architecture",
      "Design a distributed key-value store"
    ],
    "DSA": [
      "Implement binary search tree operations",
      "Find the shortest path in a weighted graph",
      "Solve the knapsack problem using dynamic programming",
      "Implement LRU cache data structure",
      "Find all permutations of a string"
    ],
    "Advanced": [
      "Explain how a convolutional neural network works",
      "Design a blockchain transaction system",
      "Create a quantum computing algorithm for search",
      "Design an AR navigation system",
      "Implement a IoT device communication protocol"
    ],
    "Mixed": [
      "Debug a memory leak in a web application",
      "Review this code for best practices",
      "Explain your approach to a complex technical problem",
      "Design a testing strategy for a microservices architecture",
      "Lead a technical project from conception to deployment"
    ]
  };

  for (let i = 0; i < companyList.length; i++) {
    const company = companyList[i];
    const questions: InterviewQuestion[] = [];
    
    // Add technical questions
    for (let q = 0; q < 8; q++) {
      const categories = Object.keys(topics);
      const category = categories[q % categories.length] as InterviewQuestion["category"];
      const topic = topics[category][q % topics[category].length];
      const difficulty = company.difficulty === "Expert" ? "Expert" : 
                       company.difficulty === "Hard" ? "Hard" : 
                       q < 3 ? "Medium" : q < 6 ? "Hard" : "Expert";
      
      const template = questionTemplates[category]?.[q % (questionTemplates[category]?.length || 5)] || 
                       `Explain ${topic} in detail`;
      
      questions.push({
        id: i * 100 + q,
        category,
        topic,
        difficulty,
        question: template,
        expectedAnswer: `Comprehensive answer covering ${topic} fundamentals, real-world applications, trade-offs, and ${company.name}'s specific requirements. Include examples from your experience.`,
        tips: [
          "Structure your answer with clear sections",
          "Use diagrams or visual explanations",
          "Discuss trade-offs and alternatives",
          "Reference industry best practices",
          "Provide real-world examples"
        ],
        followUpQuestions: [
          "How would you handle edge cases?",
          "What metrics would you track for this solution?",
          "How does this scale to millions of users?",
          "What are the failure modes and how to mitigate them?"
        ],
        evaluationCriteria: [
          "Technical depth and accuracy",
          "Problem-solving approach",
          "Communication clarity",
          "Real-world application",
          "System thinking"
        ],
        constraints: q % 3 === 0 ? ["O(n) time complexity", "O(1) space complexity"] : undefined
      });
    }
    
    // Add coding questions
    for (let q = 0; q < 3; q++) {
      questions.push({
        id: i * 100 + 8 + q,
        category: "Coding",
        topic: CODING_QUESTIONS[q].title,
        difficulty: CODING_QUESTIONS[q].difficulty,
        question: CODING_QUESTIONS[q].description,
        expectedAnswer: `Optimal solution: ${CODING_QUESTIONS[q].solution}`,
        tips: CODING_QUESTIONS[q].hints,
        evaluationCriteria: [
          "Correctness and edge cases",
          "Time and space complexity",
          "Code readability and style",
          "Testing approach"
        ],
        code: CODING_QUESTIONS[q].initialCode,
        testCases: CODING_QUESTIONS[q].testCases
      });
    }

    companies.push({
      id: i + 1,
      name: company.name,
      logo: company.logo,
      package: company.package,
      location: company.location,
      difficulty: company.difficulty,
      rounds: company.rounds,
      questions,
      codingQuestions: CODING_QUESTIONS.slice(0, 2 + (i % 3)),
      preparationTime: [60, 90, 120][i % 3],
      successRate: [25, 30, 35, 40][i % 4],
      tags: ["Tech", company.difficulty, company.location.split(',')[0], ...Object.keys(topics).slice(i % 3, i % 3 + 2)],
      recentHires: Math.floor(Math.random() * 50) + 10,
      color: company.color,
      icon: company.icon
    });
  }

  return companies;
};

const INTERVIEW_DATASET = generateInterviewDataset();

const InterviewPreparationPlatform = () => {
  // --- STATE MANAGEMENT ---
  const [selectedCompany, setSelectedCompany] = useState<CompanyInterview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [userCode, setUserCode] = useState<Record<number, string>>({});
  const [scores, setScores] = useState<Record<number, number>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [practiceMode, setPracticeMode] = useState<"timed" | "untimed" | "mock">("untimed");
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"questions" | "coding">("questions");
  const [codeOutput, setCodeOutput] = useState<string>("");
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    technical: 0,
    problemSolving: 0,
    communication: 0,
    overall: 0
  });
  const [activeAITip, setActiveAITip] = useState<AITip>(AI_TIPS[0]);
  
  // --- REFS ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  
  // --- INTERVIEW FUNCTIONS ---
  const startInterview = (company: CompanyInterview) => {
    setSelectedCompany(company);
    setInterviewSession({
      id: Date.now().toString(),
      companyId: company.id,
      status: "in-progress",
      startTime: new Date(),
      duration: company.preparationTime * 60
    });
    setIsInterviewActive(true);
    setTimeLeft(company.preparationTime * 60);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setUserCode({});
    setScores({});
    setActiveTab("questions");
    
    toast.success(`Starting ${company.name} interview practice`);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: isCameraEnabled 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setInterviewSession(prev => prev ? {
          ...prev,
          recordingUrl: url
        } : null);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info("Recording started");
    } catch (error) {
      toast.error("Failed to access media devices");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Recording saved");
    }
  };

  const submitAnswer = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Simulate AI scoring with detailed feedback
    const score = Math.floor(Math.random() * 30) + 70;
    setScores(prev => ({ ...prev, [questionId]: score }));
    
    // Generate AI feedback
    const feedbacks = [
      "Great answer! You've covered all the key points. Consider adding more real-world examples.",
      "Good structure. Try to be more specific with your examples and quantify your achievements.",
      "Well done! Your explanation is clear. You could improve by discussing trade-offs more thoroughly.",
      "Solid answer. To make it excellent, add more technical depth and mention recent industry trends."
    ];
    
    setAiFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)]);
    
    toast.success("Answer submitted with AI feedback!");
  };

  const runCode = () => {
    if (!selectedCompany) return;
    
    const currentQuestion = selectedCompany.questions[currentQuestionIndex];
    if (currentQuestion.category !== "Coding") return;
    
    setIsCodeRunning(true);
    setCodeOutput("Running tests...\n");
    
    // Simulate code execution with detailed output
    setTimeout(() => {
      const code = userCode[currentQuestion.id] || currentQuestion.code || "";
      const passed = Math.random() > 0.3;
      
      if (passed) {
        setCodeOutput(prev => prev + 
          "✓ Test 1: Passed (2ms)\n" +
          "✓ Test 2: Passed (1ms)\n" +
          "✓ Test 3: Passed (3ms)\n" +
          "✓ Test 4: Passed (2ms)\n" +
          "✓ Test 5: Passed (1ms)\n\n" +
          "✅ All test cases passed!\n" +
          "✓ Time complexity: O(n)\n" +
          "✓ Space complexity: O(1)\n" +
          "✓ Memory usage: 45.6MB\n\n" +
          "🎉 Excellent solution!"
        );
      } else {
        setCodeOutput(prev => prev + 
          "✓ Test 1: Passed (2ms)\n" +
          "✗ Test 2: Failed (3ms)\n" +
          "✓ Test 3: Passed (1ms)\n" +
          "✓ Test 4: Passed (2ms)\n\n" +
          "Input: [2,7,11,15], 9\n" +
          "Expected: [0,1]\n" +
          "Got: [1,2]\n\n" +
          "❌ Edge case not handled: duplicate values\n" +
          "💡 Hint: Check your loop boundaries"
        );
      }
      
      setIsCodeRunning(false);
    }, 1500);
  };

  const submitCode = () => {
    const currentQuestion = selectedCompany?.questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    const score = Math.floor(Math.random() * 20) + 80;
    setScores(prev => ({ ...prev, [currentQuestion.id]: score }));
    
    toast.success("Code submitted! AI evaluation in progress...");
    
    setTimeout(() => {
      setAiFeedback(
        "✅ Code submitted successfully!\n\n" +
        "📊 Evaluation Results:\n" +
        "✓ Correctness: 95/100\n" +
        "✓ Time complexity: O(n)\n" +
        "✓ Space complexity: O(1)\n" +
        "✓ Edge cases handled: 5/5\n" +
        "✓ Code style: Excellent\n" +
        "✓ Readability: Good\n\n" +
        "💡 Suggestions:\n" +
        "- Add more comments for complex logic\n" +
        "- Consider using early returns\n" +
        "- Test with larger input sizes\n\n" +
        "Overall score: 92/100 🎯"
      );
    }, 2000);
  };

  const endInterview = () => {
    if (isRecording) stopRecording();
    
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length || 0;
    
    // Calculate performance metrics
    const technical = Math.floor(Math.random() * 30) + 70;
    const problemSolving = Math.floor(Math.random() * 30) + 65;
    const communication = Math.floor(Math.random() * 30) + 75;
    
    setPerformanceData({
      technical,
      problemSolving,
      communication,
      overall: Math.round(totalScore)
    });
    
    setInterviewSession(prev => prev ? {
      ...prev,
      status: "completed",
      score: Math.round(totalScore),
      feedback: `Great job! Your performance was ${totalScore >= 80 ? 'excellent' : totalScore >= 60 ? 'good' : 'needs improvement'}. ${totalScore >= 80 ? 'You are well prepared for the actual interview!' : 'Focus on system design questions and coding optimization.'}`
    } : null);
    
    setIsInterviewActive(false);
    setShowFeedback(true);
    
    toast.success("Interview completed! View your feedback.");
  };

  const openResource = (resource: Resource) => {
    setSelectedResource(resource);
    toast.info(`Opening ${resource.title}`);
  };

  const getAITip = () => {
    const randomTip = AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)];
    setActiveAITip(randomTip);
    setShowTips(true);
  };

  // --- FILTERED COMPANIES ---
  const filteredCompanies = useMemo(() => {
    return INTERVIEW_DATASET.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          company.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          company.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || company.tags.includes(selectedCategory);
      const matchesDifficulty = difficultyFilter === "All" || company.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, difficultyFilter]);

  // --- FILTERED RESOURCES ---
  const filteredResources = useMemo(() => {
    if (selectedCategory === "All") return RESOURCES;
    return RESOURCES.filter(resource => resource.category === selectedCategory);
  }, [selectedCategory]);

  // --- CODING CATEGORIES ---
  const codingCategories = [
    { name: "All", icon: Layers, count: RESOURCES.length, color: "bg-gradient-to-r from-gray-500 to-gray-700" },
    { name: "Core CS", icon: CpuIcon2, count: RESOURCES.filter(r => r.category === "Core CS").length, color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
    { name: "Databases", icon: DatabaseIcon2, count: RESOURCES.filter(r => r.category === "Databases").length, color: "bg-gradient-to-r from-green-500 to-emerald-500" },
    { name: "Web Dev", icon: CodeIcon, count: RESOURCES.filter(r => r.category === "Web Dev").length, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { name: "Design", icon: LayersIcon, count: RESOURCES.filter(r => r.category === "Design").length, color: "bg-gradient-to-r from-pink-500 to-rose-500" },
    { name: "Prep", icon: Briefcase, count: RESOURCES.filter(r => r.category === "Prep").length, color: "bg-gradient-to-r from-yellow-500 to-amber-500" },
    { name: "DevOps", icon: ServerIcon, count: RESOURCES.filter(r => r.category === "DevOps").length, color: "bg-gradient-to-r from-indigo-500 to-purple-500" },
    { name: "DSA", icon: BrainCircuit, count: RESOURCES.filter(r => r.category === "DSA").length, color: "bg-gradient-to-r from-cyan-500 to-blue-500" },
    { name: "Advanced", icon: Zap, count: RESOURCES.filter(r => r.category === "Advanced").length, color: "bg-gradient-to-r from-red-500 to-orange-500" },
    { name: "Mixed", icon: GitMerge, count: RESOURCES.filter(r => r.category === "Mixed").length, color: "bg-gradient-to-r from-emerald-500 to-teal-500" }
  ];

  // --- ANALYTICS DATA ---
  const analyticsData = {
    weeklyProgress: [65, 70, 75, 80, 85, 88, 90],
    categoryPerformance: [
      { name: "DSA", score: 85 },
      { name: "System Design", score: 75 },
      { name: "Behavioral", score: 90 },
      { name: "Coding", score: 82 },
      { name: "Core CS", score: 78 }
    ],
    mockInterviews: [
      { date: "Jan 1", score: 75 },
      { date: "Jan 8", score: 80 },
      { date: "Jan 15", score: 85 },
      { date: "Jan 22", score: 88 },
      { date: "Jan 29", score: 92 }
    ]
  };

  // --- RENDER ---
  if (!selectedCompany && !isInterviewActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI-Powered Interview Prep
                </h1>
                <p className="text-gray-400 mt-2">Practice with real questions from top companies</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowAnalytics(true)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl hover:from-gray-700 hover:to-gray-800 flex items-center gap-2 transition-all"
                >
                  <BarChart3 size={18} />
                  <span>Analytics</span>
                </button>
                <button 
                  onClick={() => {
                    setActiveAITip(AI_TIPS[0]);
                    setShowTips(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-700 hover:to-blue-700 flex items-center gap-2 transition-all"
                >
                  <Brain size={18} />
                  <span>AI Tips</span>
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/30 transition-all">
                <div className="text-2xl font-bold text-cyan-400">{INTERVIEW_DATASET.length}</div>
                <div className="text-sm text-gray-400">Companies</div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-all">
                <div className="text-2xl font-bold text-green-400">{RESOURCES.length}</div>
                <div className="text-sm text-gray-400">Resources</div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-yellow-500/30 transition-all">
                <div className="text-2xl font-bold text-yellow-400">₹45L</div>
                <div className="text-sm text-gray-400">Avg Package</div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all">
                <div className="text-2xl font-bold text-purple-400">85%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
            </div>
          </header>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Categories */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Filter size={20} />
                  Categories
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {codingCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        selectedCategory === category.name 
                          ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30' 
                          : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <category.icon size={20} />
                        </div>
                        <div>
                          <span className="font-medium block">{category.name}</span>
                          <span className="text-xs text-gray-400">{category.count} resources</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Practice Mode */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Practice Mode</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setPracticeMode("untimed")}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      practiceMode === "untimed" 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-500' 
                        : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Untimed Practice</div>
                        <div className="text-sm text-gray-300">Learn at your own pace</div>
                      </div>
                      <Clock size={20} />
                    </div>
                  </button>
                  <button
                    onClick={() => setPracticeMode("timed")}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      practiceMode === "timed" 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-500' 
                        : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Timed Practice</div>
                        <div className="text-sm text-gray-300">Simulate real interview</div>
                      </div>
                      <Timer size={20} />
                    </div>
                  </button>
                  <button
                    onClick={() => setPracticeMode("mock")}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      practiceMode === "mock" 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-500' 
                        : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Mock Interview</div>
                        <div className="text-sm text-gray-300">Full interview simulation</div>
                      </div>
                      <Video size={20} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700 mt-6">
                <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Daily Streak</span>
                      <span className="text-cyan-400">7 days 🔥</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Questions Solved</span>
                      <span className="text-green-400">45/150</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-1/3"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Avg Score</span>
                      <span className="text-yellow-400">82%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 w-4/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Companies & Resources */}
            <div className="lg:col-span-2">
              {/* Search & Filters */}
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search companies, resources, or topics..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all"
                    >
                      <option value="All">All Levels</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <button 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                        setDifficultyFilter("All");
                      }}
                      className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-all"
                    >
                      <RefreshCcw size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {filteredCompanies.map(company => (
                  <motion.div
                    key={company.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`bg-gradient-to-br ${company.color} border border-gray-700 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-cyan-500/10`}
                    onClick={() => startInterview(company)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{company.logo}</div>
                        <div>
                          <h3 className="font-bold text-lg">{company.name}</h3>
                          <p className="text-sm text-gray-300">{company.location}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        company.difficulty === "Expert" ? 'bg-red-500/30 text-red-300' :
                        company.difficulty === "Hard" ? 'bg-orange-500/30 text-orange-300' :
                        'bg-green-500/30 text-green-300'
                      }`}>
                        {company.difficulty}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} />
                          <span className="text-gray-300">Package:</span>
                          <span className="font-bold text-yellow-300">{company.package}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersIcon size={14} />
                          <span className="text-gray-300">Rounds:</span>
                          <span>{company.rounds}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {company.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-black/30 text-xs rounded-lg">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="pt-3 border-t border-white/20">
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>Success Rate: {company.successRate}%</span>
                          <span>{company.preparationTime} min</span>
                        </div>
                        <div className="h-1.5 bg-black/30 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-white transition-all duration-500"
                            style={{ width: `${company.successRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Resources Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Recommended Resources</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{filteredResources.length} resources</span>
                    <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">
                      {selectedCategory === "All" ? "All Categories" : selectedCategory}
                    </span>
                  </div>
                </div>
                
                {filteredResources.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-8 border border-gray-700 text-center">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">No Resources Found</h3>
                    <p className="text-gray-400">Try selecting a different category or check back later for more resources.</p>
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all"
                    >
                      Show All Resources
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredResources.map(resource => (
                      <motion.div
                        key={resource.id}
                        whileHover={{ y: -2 }}
                        className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700 rounded-2xl p-5 cursor-pointer hover:border-cyan-500/30 transition-all"
                        onClick={() => openResource(resource)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${resource.color}`}>
                              <resource.icon size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold">{resource.title}</h3>
                              <div className="flex items-center gap-1 text-sm text-yellow-400">
                                <Star size={12} fill="currentColor" />
                                <span>{resource.rating}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            resource.type === "Free Book" || resource.type === "Free Course" || resource.type === "Free Training" 
                              ? 'bg-green-500/20 text-green-400' :
                            resource.type === "Premium Platform" || resource.type === "Course" 
                              ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-cyan-500/20 text-cyan-400'
                          }`}>
                            {resource.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{resource.description}</p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {resource.features.slice(0, 2).map((feature, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-800/50 text-xs rounded-lg">
                              {feature}
                            </span>
                          ))}
                          {resource.difficulty && (
                            <span className="px-2 py-1 bg-gray-800/50 text-xs rounded-lg">
                              {resource.difficulty}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openResource(resource);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg hover:from-gray-700 hover:to-gray-800 text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={14} />
                          Open Resource
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Resource Categories Summary */}
                <div className="mt-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700">
                  <h3 className="font-bold text-lg mb-4">Resource Categories Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {codingCategories.filter(cat => cat.name !== "All").map(category => (
                      <div key={category.name} className="text-center p-3 bg-gray-800/50 rounded-xl">
                        <div className={`p-2 rounded-lg ${category.color} inline-flex mb-2`}>
                          <category.icon size={20} />
                        </div>
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-gray-400">{category.count} resources</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Modal */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAnalytics(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Your Performance Analytics</h2>
                  <button onClick={() => setShowAnalytics(false)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weekly Progress */}
                  <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-lg mb-4">Weekly Progress</h3>
                    <div className="h-48 flex items-end justify-between">
                      {analyticsData.weeklyProgress.map((score, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div 
                            className="w-8 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg transition-all duration-500"
                            style={{ height: `${score}%` }}
                          />
                          <div className="mt-2 text-xs text-gray-400">Day {i+1}</div>
                          <div className="text-xs font-bold">{score}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Performance */}
                  <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-lg mb-4">Category Performance</h3>
                    <div className="space-y-4">
                      {analyticsData.categoryPerformance.map((cat, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{cat.name}</span>
                            <span className="font-bold">{cat.score}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                              style={{ width: `${cat.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock Interview Progress */}
                  <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-700 md:col-span-2">
                    <h3 className="font-bold text-lg mb-4">Mock Interview Progress</h3>
                    <div className="flex items-end h-32">
                      {analyticsData.mockInterviews.map((interview, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center mx-1">
                          <div 
                            className="w-full bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg transition-all duration-500"
                            style={{ height: `${interview.score}%` }}
                          />
                          <div className="mt-2 text-xs text-gray-400">{interview.date}</div>
                          <div className="text-xs font-bold">{interview.score}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Improvement Tips */}
                  <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-5 rounded-xl border border-cyan-500/30 md:col-span-2">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Sparkles size={20} />
                      AI Improvement Suggestions
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 size={16} className="text-green-400" />
                        Focus on system design questions - your weakest area
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 size={16} className="text-green-400" />
                        Practice more coding questions with time limits
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 size={16} className="text-green-400" />
                        Review behavioral questions using STAR method
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 size={16} className="text-green-400" />
                        Take 2 mock interviews this week
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resource Modal */}
        <AnimatePresence>
          {selectedResource && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedResource(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 p-6 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${selectedResource.color}`}>
                      <selectedResource.icon size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedResource.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-sm text-yellow-400">
                          <Star size={14} fill="currentColor" />
                          <span>{selectedResource.rating}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full">
                          {selectedResource.type}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">
                          {selectedResource.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedResource(null)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-400">{selectedResource.description}</p>
                  
                  <div>
                    <h4 className="font-bold mb-2 text-gray-300">Features:</h4>
                    <ul className="space-y-2">
                      {selectedResource.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-400">
                          <CheckCircle2 size={16} className="text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedResource.difficulty && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Difficulty:</span>
                      <span className="px-2 py-1 bg-gray-800 rounded text-sm">
                        {selectedResource.difficulty}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-700">
                    <a
                      href={selectedResource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-center hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(selectedResource.url, '_blank');
                      }}
                    >
                      <ExternalLink size={18} />
                      Access Resource
                    </a>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Opens in new tab • {selectedResource.type.includes("Free") ? "Free resource" : "May require payment"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Tips Modal */}
        <AnimatePresence>
          {showTips && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowTips(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 p-6 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600">
                      <Brain size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">AI Interview Tips</h2>
                      <p className="text-sm text-gray-400">Personalized recommendations based on your performance</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={getAITip}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
                    >
                      <RefreshCcw size={20} />
                    </button>
                    <button onClick={() => setShowTips(false)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-5 rounded-xl border border-cyan-500/30">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        activeAITip.priority === "high" ? "bg-red-500/20 text-red-400" :
                        activeAITip.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        <activeAITip.icon size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{activeAITip.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            activeAITip.priority === "high" ? "bg-red-500/30 text-red-300" :
                            activeAITip.priority === "medium" ? "bg-yellow-500/30 text-yellow-300" :
                            "bg-green-500/30 text-green-300"
                          }`}>
                            {activeAITip.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <p className="text-gray-400 mb-4">{activeAITip.description}</p>
                        <div>
                          <h4 className="font-bold mb-2 text-gray-300">Action Steps:</h4>
                          <ul className="space-y-2">
                            {activeAITip.actionSteps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2 text-gray-400">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* More Tips */}
                  <div>
                    <h4 className="font-bold mb-3 text-gray-300">More AI Tips</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {AI_TIPS.filter(tip => tip.id !== activeAITip.id).slice(0, 4).map(tip => (
                        <button
                          key={tip.id}
                          onClick={() => setActiveAITip(tip)}
                          className="p-3 bg-gray-800/50 rounded-xl text-left hover:bg-gray-700/50 transition-all"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-2 rounded-lg ${
                              tip.priority === "high" ? "bg-red-500/20" :
                              tip.priority === "medium" ? "bg-yellow-500/20" :
                              "bg-green-500/20"
                            }`}>
                              <tip.icon size={16} />
                            </div>
                            <div>
                              <span className="font-medium text-sm">{tip.title}</span>
                              <div className="text-xs text-gray-500">{tip.category}</div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{tip.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowTips(false);
                      toast.success("AI tips saved to your learning plan!");
                    }}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    Add to Learning Plan
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (isInterviewActive && selectedCompany) {
    const currentQuestion = selectedCompany.questions[currentQuestionIndex];
    const isCodingQuestion = currentQuestion.category === "Coding";
    const progress = ((currentQuestionIndex + 1) / selectedCompany.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100">
        {/* Top Bar */}
        <nav className="h-16 border-b border-gray-800 px-4 md:px-6 flex items-center justify-between bg-gray-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (confirm("Are you sure you want to leave? Your progress will be lost.")) {
                  setIsInterviewActive(false);
                  setSelectedCompany(null);
                }
              }}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <Home size={20} />
            </button>
            <div>
              <h2 className="font-bold">{selectedCompany.name} Interview</h2>
              <p className="text-xs text-gray-500">Question {currentQuestionIndex + 1} of {selectedCompany.questions.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Tabs */}
            <div className="flex bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("questions")}
                className={`px-4 py-1 rounded-lg transition-all ${
                  activeTab === "questions" 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600' 
                    : 'hover:bg-gray-700'
                }`}
              >
                Questions
              </button>
              <button
                onClick={() => setActiveTab("coding")}
                className={`px-4 py-1 rounded-lg transition-all ${
                  activeTab === "coding" 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600' 
                    : 'hover:bg-gray-700'
                }`}
              >
                Coding
              </button>
            </div>
            
            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
              timeLeft < 300 
                ? 'border-red-500 bg-red-500/10 text-red-400 animate-pulse' 
                : 'border-gray-700 bg-gray-800'
            }`}>
              <Timer size={18} />
              <span className="text-xl font-mono font-bold">
                {Math.floor(timeLeft / 3600).toString().padStart(2, '0')}:
                {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            
            <button 
              onClick={endInterview}
              className="px-4 md:px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all"
            >
              End Interview
            </button>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
          {/* Left Panel - Questions List */}
          <div className="lg:w-80 border-r border-gray-800 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Questions List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Questions</h3>
                  <span className="text-xs text-gray-500">{selectedCompany.questions.length} total</span>
                </div>
                <div className="space-y-2">
                  {selectedCompany.questions.map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(i)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        currentQuestionIndex === i 
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' 
                          : userAnswers[q.id] 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
                            : 'bg-gray-800/50 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Q{i + 1}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            q.difficulty === "Expert" ? 'bg-red-500/20 text-red-400' :
                            q.difficulty === "Hard" ? 'bg-orange-500/20 text-orange-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {q.category === "Coding" && <Code size={12} />}
                          {userAnswers[q.id] && (
                            <CheckCircle2 size={16} className="text-green-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">{q.topic}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl text-center border border-gray-700">
                  <div className="text-xl font-bold text-green-400">
                    {Object.keys(userAnswers).length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Answered</div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl text-center border border-gray-700">
                  <div className="text-xl font-bold text-yellow-400">
                    {scores[currentQuestion.id] || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Score</div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl text-center border border-gray-700">
                  <div className="text-xl font-bold text-blue-400">
                    {selectedCompany.questions.length - Object.keys(userAnswers).length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Remaining</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-4 rounded-xl border border-gray-700">
                <h4 className="font-bold text-sm mb-3">Quick Actions</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setIsMicEnabled(!isMicEnabled)}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      isMicEnabled 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                    <span className="text-xs">{isMicEnabled ? 'Mic On' : 'Mic Off'}</span>
                  </button>
                  <button
                    onClick={() => setIsCameraEnabled(!isCameraEnabled)}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      isCameraEnabled 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {isCameraEnabled ? <Camera size={16} /> : <VideoOff size={16} />}
                    <span className="text-xs">{isCameraEnabled ? 'Cam On' : 'Cam Off'}</span>
                  </button>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      isRecording 
                        ? 'bg-gradient-to-r from-red-600 to-pink-600' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-xs">Recording</span>
                      </>
                    ) : (
                      <>
                        <Video size={16} />
                        <span className="text-xs">Record</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Question Header */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    currentQuestion.difficulty === "Expert" ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    currentQuestion.difficulty === "Hard" ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-sm border border-gray-700">
                    {currentQuestion.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400 border border-gray-700">
                    {currentQuestion.topic}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-6 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                  {currentQuestion.question}
                </h2>

                {currentQuestion.constraints && (
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700 mb-6">
                    <h4 className="font-bold text-sm mb-2 text-gray-400 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Constraints:
                    </h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {currentQuestion.constraints.map((constraint, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full flex-shrink-0" />
                          {constraint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Answer Input - Conditional Rendering */}
              {isCodingQuestion ? (
                <div className="space-y-6">
                  {/* Code Editor */}
                  <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-700 overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                      <div className="flex items-center gap-2">
                        <Code size={16} />
                        <span className="font-mono text-sm">solution.js</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={runCode}
                          disabled={isCodeRunning}
                          className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 text-sm flex items-center gap-2 disabled:opacity-50 transition-all"
                        >
                          {isCodeRunning ? (
                            <>
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play size={14} />
                              Run Code
                            </>
                          )}
                        </button>
                        <button
                          onClick={submitCode}
                          className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-700 hover:to-blue-700 text-sm transition-all"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                    <textarea
                      ref={codeEditorRef}
                      value={userCode[currentQuestion.id] || currentQuestion.code || ""}
                      onChange={(e) => setUserCode(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                      className="w-full h-96 font-mono text-sm bg-transparent text-white p-4 resize-none focus:outline-none focus:ring-0"
                      spellCheck={false}
                      placeholder="// Write your solution here..."
                    />
                  </div>

                  {/* Test Cases */}
                  {currentQuestion.testCases && (
                    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-5 rounded-xl border border-gray-700">
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <FileQuestion size={18} />
                        Test Cases
                      </h3>
                      <div className="space-y-3">
                        {currentQuestion.testCases.map((testCase, i) => (
                          <div key={i} className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${
                                codeOutput.includes("✓ All test cases passed") ? "bg-green-500" : "bg-gray-600"
                              }`} />
                              <span className="text-gray-400">Test Case {i + 1}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                                <div className="text-gray-500">Input</div>
                                <div className="font-mono text-gray-300">{testCase.input}</div>
                              </div>
                              <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                                <div className="text-gray-500">Expected Output</div>
                                <div className="font-mono text-gray-300">{testCase.expectedOutput}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Output Console */}
                  <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-700 overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                      <span className="font-mono text-sm">Output</span>
                    </div>
                    <pre className="p-4 font-mono text-sm h-32 overflow-y-auto whitespace-pre-wrap bg-black/20">
                      {codeOutput || "// Run your code to see output here..."}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Answer Input */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-400 mb-3">
                      Your Answer
                    </label>
                    <textarea
                      value={userAnswers[currentQuestion.id] || ''}
                      onChange={(e) => submitAnswer(currentQuestion.id, e.target.value)}
                      className="w-full h-64 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 resize-none transition-all"
                      placeholder="Type your answer here... You can also speak your answer if recording is enabled."
                    />
                    
                    {userAnswers[currentQuestion.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-400 font-medium flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            Answer Submitted
                          </span>
                          <span className="text-lg font-bold text-yellow-400">
                            Score: {scores[currentQuestion.id] || 0}/100
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">Great job! Your answer has been saved and evaluated.</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Tips & Expected Answer */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-5 rounded-xl border border-gray-700">
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Brain size={18} />
                        Tips for This Question
                      </h3>
                      <ul className="space-y-2">
                        {currentQuestion.tips?.map((tip, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-5 rounded-xl border border-gray-700">
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Target size={18} />
                        Expected Answer Structure
                      </h3>
                      <p className="text-sm text-gray-400">
                        {currentQuestion.expectedAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl hover:from-gray-700 hover:to-gray-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-all border border-gray-700"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={getAITip}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-700 hover:to-blue-700 flex items-center gap-2 transition-all"
                  >
                    <HelpCircle size={18} />
                    Get AI Help
                  </button>
                  
                  <button
                    onClick={() => {
                      if (currentQuestionIndex < selectedCompany.questions.length - 1) {
                        setCurrentQuestionIndex(prev => prev + 1);
                      } else {
                        endInterview();
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-700 hover:to-blue-700 flex items-center gap-2 transition-all"
                  >
                    {currentQuestionIndex === selectedCompany.questions.length - 1 ? (
                      <>
                        Finish Interview
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
              </div>
            </div>
          </div>

          {/* Right Panel - Resources & AI */}
          <div className="lg:w-96 border-l border-gray-800 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Video Feed Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-500">Video Feed</h3>
                <button
                  onClick={() => setShowVideoFeed(!showVideoFeed)}
                  className={`px-3 py-1 rounded-lg text-xs ${
                    showVideoFeed 
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {showVideoFeed ? 'Hide' : 'Show'} Feed
                </button>
              </div>

              {showVideoFeed && (
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-gray-700">
                  <div className="aspect-video relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!isCameraEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <Camera size={48} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {isRecording ? "Recording..." : "Preview"}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isMicEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className={`w-2 h-2 rounded-full ${isCameraEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Resources */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-500">Recommended Resources</h3>
                  <span className="text-xs text-gray-500">For this topic</span>
                </div>
                <div className="space-y-2">
                  {RESOURCES.filter(r => r.category === currentQuestion.category || 
                                        (currentQuestion.category === "Coding" && r.category === "DSA") ||
                                        (currentQuestion.category === "Technical" && r.category === "Core CS"))
                    .slice(0, 3).map(resource => (
                    <button
                      key={resource.id}
                      onClick={() => openResource(resource)}
                      className="w-full text-left p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl hover:from-gray-700/50 hover:to-gray-800/50 transition-all border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${resource.color}`}>
                          <resource.icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{resource.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-gray-400">{resource.type}</div>
                            <div className="flex items-center gap-1 text-xs text-yellow-400">
                              <Star size={10} fill="currentColor" />
                              <span>{resource.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {currentQuestion.category && (
                    <button
                      onClick={() => {
                        setSelectedCategory(currentQuestion.category);
                        setIsInterviewActive(false);
                        setSelectedCompany(null);
                      }}
                      className="w-full text-center p-2 text-sm text-cyan-400 hover:text-cyan-300 transition-all"
                    >
                      View all {currentQuestion.category} resources →
                    </button>
                  )}
                </div>
              </div>

              {/* AI Feedback */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <BrainCircuit size={18} />
                    AI Feedback
                  </h3>
                  <button
                    onClick={getAITip}
                    className="text-xs px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30"
                  >
                    Get Tips
                  </button>
                </div>
                <div className="text-sm text-gray-400 space-y-3">
                  <div className="min-h-20">
                    {aiFeedback ? (
                      <div className="space-y-2">
                        {aiFeedback.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    ) : (
                      <p>Submit your answer to get AI feedback on content, structure, and delivery.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Confidence Level</span>
                      <span>75%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-3/4 transition-all duration-500" />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const feedbacks = [
                        "🎯 Your answer shows good technical depth. Improve by adding more real-world examples.",
                        "💡 Great structure! Try to quantify your achievements with metrics and numbers.",
                        "🚀 Well explained. Consider discussing alternative solutions and their trade-offs.",
                        "✨ Good communication. Add more industry-specific terminology to sound more experienced."
                      ];
                      setAiFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)]);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-400 rounded-lg hover:from-cyan-600/30 hover:to-blue-600/30 transition-all"
                  >
                    Get Detailed Analysis
                  </button>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-4 rounded-xl border border-gray-700">
                <h3 className="font-bold text-sm mb-3">Quick Interview Tips</h3>
                <ul className="text-xs text-gray-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Speak clearly and maintain eye contact
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Structure answers with STAR method
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Ask clarifying questions when unsure
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Think aloud during problem solving
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Practice with time limits
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse shadow-lg z-50 cursor-pointer"
            onClick={stopRecording}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
            Recording • Click to save
          </motion.div>
        )}
      </div>
    );
  }

  if (showFeedback && interviewSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 p-6 md:p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <Award className="w-20 h-20 text-cyan-500 mx-auto mb-4" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-black" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Interview Complete!
            </h2>
            <p className="text-gray-400">Great job completing the {selectedCompany?.name} interview</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-6 rounded-xl text-center border border-cyan-500/30">
              <p className="text-sm text-gray-400 mb-2">Final Score</p>
              <p className="text-4xl font-bold text-cyan-500">{interviewSession.score || 0}/100</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-xl text-center border border-green-500/30">
              <p className="text-sm text-gray-400 mb-2">Questions Answered</p>
              <p className="text-4xl font-bold text-white">{Object.keys(userAnswers).length}/{selectedCompany?.questions.length}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-xl text-center border border-yellow-500/30">
              <p className="text-sm text-gray-400 mb-2">Performance</p>
              <p className="text-2xl font-bold text-yellow-400">
                {interviewSession.score && interviewSession.score >= 80 ? 'Excellent 🎯' :
                 interviewSession.score && interviewSession.score >= 60 ? 'Good 👍' : 'Needs Practice 📚'}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-6 rounded-xl mb-8 border border-gray-700">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Brain size={20} />
              AI Feedback Summary
            </h3>
            <p className="text-gray-400 mb-6">{interviewSession.feedback}</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Technical Knowledge</span>
                  <span className="text-green-400">{performanceData.technical}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000" style={{ width: `${performanceData.technical}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Problem Solving</span>
                  <span className="text-yellow-400">{performanceData.problemSolving}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000" style={{ width: `${performanceData.problemSolving}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Communication</span>
                  <span className="text-cyan-400">{performanceData.communication}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000" style={{ width: `${performanceData.communication}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-5 rounded-xl border border-purple-500/30 mb-8">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Sparkles size={20} />
              AI Improvement Suggestions
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                Focus on system design questions - your weakest area at {performanceData.problemSolving}%
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                Practice more coding questions with time limits
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                Review behavioral questions using STAR method
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                Check out recommended resources for {selectedCompany?.name} specific prep
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setShowFeedback(false);
                setIsInterviewActive(false);
                setSelectedCompany(null);
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Practice Another Interview
              <RefreshCcw size={18} />
            </button>
            <button
              onClick={() => {
                if (interviewSession.recordingUrl) {
                  const a = document.createElement('a');
                  a.href = interviewSession.recordingUrl;
                  a.download = `interview-${selectedCompany?.name}-${Date.now()}.webm`;
                  a.click();
                  toast.success("Recording downloaded!");
                } else {
                  toast.info("No recording available");
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all flex items-center justify-center gap-2 border border-gray-700"
            >
              <Download size={18} />
              Download Recording
            </button>
            <button
              onClick={() => {
                setShowFeedback(false);
                setIsInterviewActive(false);
                setSelectedCompany(null);
                setSelectedCategory(selectedCompany?.tags[3] || "DSA");
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen size={18} />
              Study Resources
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default InterviewPreparationPlatform;