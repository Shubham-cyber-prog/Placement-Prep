import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Timer, CheckCircle2, ChevronRight, ChevronLeft, Flag, 
  Calculator, Edit3, X, BarChart3, Home, Award, 
  Users, Target, TrendingUp, Search, Settings, Lock,
  Clock, Award as AwardIcon
} from "lucide-react";
import { toast } from "sonner";

// --- API CONFIG ---
const API_BASE_URL = import.meta.env?.VITE_API_URL || 
                     import.meta.env?.REACT_APP_API_URL || 
                     'http://localhost:5000/api';

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

// --- ENHANCED API SERVICE ---
const apiService = {
  // Get auth token from localStorage
  getToken: () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user?.token;
      } catch {
        return null;
      }
    }
    return null;
  },

  // Get refresh token
  getRefreshToken: () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user?.refreshToken;
      } catch {
        return null;
      }
    }
    return null;
  },

  // API request helper
  request: async (endpoint: string, options: RequestInit = {}) => {
    const token = apiService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const newToken = await apiService.refreshToken();
        if (newToken) {
          // Retry with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
          
          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || `HTTP ${retryResponse.status}`);
          }
          return await retryResponse.json();
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Token refresh method
  refreshToken: async () => {
    const refreshToken = apiService.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data.success) {
        // Update localStorage with new tokens
        const currentUser = localStorage.getItem('user');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          user.token = data.data.token;
          user.refreshToken = data.data.refreshToken;
          localStorage.setItem('user', JSON.stringify(user));
        }
        return data.data.token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid session
      localStorage.removeItem('user');
    }
    return null;
  },

  // Auth methods
  login: async (email: string, password: string) => {
    const response = await apiService.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.success) {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.removeItem('guest_session'); // Clear any guest session
    }
    return response;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await apiService.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (response.success) {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.removeItem('guest_session'); // Clear any guest session
    }
    return response;
  },

  demoLogin: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/demo-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Demo login failed');
      }

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        localStorage.removeItem('guest_session'); // Clear any guest session
        return data;
      }
      throw new Error(data.message || 'Demo login failed');
    } catch (error) {
      console.error('Demo login error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    return await apiService.request('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('guest_session');
    localStorage.removeItem('placement_state_v1');
  },

  // Test activities methods
  recordTestStart: async (testId: number, testName: string, category: string, difficulty: string) => {
    return await apiService.request('/activities/record', {
      method: 'POST',
      body: JSON.stringify({
        activityType: 'test_started',
        metadata: {
          testId: testId.toString(),
          testName,
          testCategory: category,
          testDifficulty: difficulty,
          startTime: new Date().toISOString(),
        },
        tags: ['test', 'started', category.toLowerCase()],
      }),
    });
  },

  recordQuestionAnswered: async (testId: number, questionId: number, questionIndex: number, 
                                 answerSelected: number, correctAnswer: number, 
                                 timeSpent: number, category: string, difficulty: string) => {
    return await apiService.request('/activities/record', {
      method: 'POST',
      body: JSON.stringify({
        activityType: 'question_answered',
        metadata: {
          testId: testId.toString(),
          questionId: questionId.toString(),
          questionIndex,
          answerSelected,
          correctAnswer,
          timeSpent,
          category,
          difficulty,
          isCorrect: answerSelected === correctAnswer,
        },
        tags: ['question', 'answered', category.toLowerCase()],
      }),
    });
  },

  recordQuestionFlagged: async (testId: number, questionId: number) => {
    return await apiService.request('/activities/record', {
      method: 'POST',
      body: JSON.stringify({
        activityType: 'question_flagged',
        metadata: {
          testId: testId.toString(),
          questionId: questionId.toString(),
        },
        tags: ['question', 'flagged'],
      }),
    });
  },

  recordTestCompleted: async (testSessionData: any) => {
    return await apiService.request('/activities/test-session', {
      method: 'POST',
      body: JSON.stringify(testSessionData),
    });
  },

  getUserTestSessions: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await apiService.request(`/activities/test-sessions?${queryParams}`);
  },

  getPerformanceAnalytics: async (period = '30d') => {
    return await apiService.request(`/activities/analytics?period=${period}`);
  },
};

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

  // Helper functions
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);

  // Quantitative Aptitude Questions (12 unique)
  const quantitativeQuestions = [
    {
      generate: () => {
        const x = randomInt(15, 40);
        const y = randomInt(10, 35);
        const net = ((1 + x/100) * (1 - y/100) - 1) * 100;
        return {
          question: `If the price of a laptop increases by ${x}% and then decreases by ${y}%, what is the net percentage change in price?`,
          correct: `${net.toFixed(2)}%`,
          options: [
            `${(net * 1.2).toFixed(2)}%`,
            `${(net * 0.8).toFixed(2)}%`,
            `${net.toFixed(2)}%`,
            `${(x - y).toFixed(2)}%`
          ]
        };
      }
    },
    {
      generate: () => {
        const a = randomInt(8, 15);
        const b = randomInt(12, 20);
        const days = 1 / (1/a + 1/b);
        return {
          question: `Person A can complete a project in ${a} days. Person B can complete the same project in ${b} days. If they work together, how many days will it take to complete the project?`,
          correct: `${days.toFixed(1)} days`,
          options: [
            `${(a + b)/2} days`,
            `${Math.min(a, b)} days`,
            `${days.toFixed(1)} days`,
            `${Math.max(a, b)} days`
          ]
        };
      }
    },
    {
      generate: () => {
        const prob = (4/52) * (3/51);
        return {
          question: "What is the probability of drawing two aces consecutively from a standard deck of 52 cards without replacement?",
          correct: prob.toFixed(6),
          options: [
            "1/169",
            "1/221",
            prob.toFixed(6),
            "4/663"
          ]
        };
      }
    },
    {
      generate: () => {
        const r1 = randomInt(3, 7);
        const r2 = randomInt(2, 6);
        const diff = Math.abs(r1 - r2) * randomInt(3, 6);
        const total = (r1 + r2) * (diff / Math.abs(r1 - r2));
        return {
          question: `The ratio of boys to girls in a classroom is ${r1}:${r2}. If there are ${diff} more boys than girls, how many students are in the class?`,
          correct: Math.round(total).toString(),
          options: [
            `${Math.round(total * 0.8)}`,
            `${Math.round(total * 1.2)}`,
            Math.round(total).toString(),
            `${Math.round(total * 1.5)}`
          ]
        };
      }
    },
    {
      generate: () => {
        const n = randomInt(10, 20);
        const a = randomInt(5, 15);
        const d = randomInt(2, 8);
        const sum = (n/2) * (2*a + (n-1)*d);
        return {
          question: `Find the sum of the first ${n} terms of the arithmetic series: ${a} + ${a+d} + ${a+2*d} + ...`,
          correct: Math.round(sum).toString(),
          options: [
            `${Math.round(sum * 0.9)}`,
            `${Math.round(sum * 1.1)}`,
            Math.round(sum).toString(),
            `${a * n}`
          ]
        };
      }
    },
    {
      generate: () => {
        const l = randomInt(150, 250);
        const t = randomInt(6, 12);
        const speed = (l/t) * 3.6;
        return {
          question: `A train of length ${l} meters passes a telegraph pole in ${t} seconds. What is the speed of the train in km/h?`,
          correct: `${speed.toFixed(1)} km/h`,
          options: [
            `${(speed * 0.8).toFixed(1)} km/h`,
            `${(speed * 1.2).toFixed(1)} km/h`,
            `${speed.toFixed(1)} km/h`,
            `${(l/t * 2.237).toFixed(1)} km/h`
          ]
        };
      }
    },
    {
      generate: () => {
        const p = randomInt(5000, 15000);
        const r = randomInt(8, 15);
        const n = randomInt(2, 5);
        const ci = p * Math.pow(1 + r/100, n) - p;
        return {
          question: `Calculate the compound interest on ₹${p} at ${r}% per annum for ${n} years, compounded annually.`,
          correct: `₹${Math.round(ci)}`,
          options: [
            `₹${Math.round(ci * 0.9)}`,
            `₹${Math.round(ci * 1.1)}`,
            `₹${Math.round(ci)}`,
            `₹${Math.round((p * r * n)/100)}`
          ]
        };
      }
    },
    {
      generate: () => {
        const a = randomInt(1, 5);
        const b = randomInt(-10, 10);
        const c = randomInt(-8, 8);
        const discriminant = b*b - 4*a*c;
        const nature = discriminant > 0 ? "Real and distinct" : 
                      discriminant === 0 ? "Real and equal" : "Complex";
        return {
          question: `For the quadratic equation ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0, what is the nature of its roots?`,
          correct: nature,
          options: [
            "Real and distinct",
            "Real and equal",
            "Complex",
            "No real roots"
          ]
        };
      }
    },
    {
      generate: () => {
        const r = randomInt(7, 15);
        const area = Math.PI * r * r;
        return {
          question: `A circular garden has a radius of ${r} meters. What is the area of the garden?`,
          correct: `${area.toFixed(2)} m²`,
          options: [
            `${(area * 0.95).toFixed(2)} m²`,
            `${(area * 1.05).toFixed(2)} m²`,
            `${area.toFixed(2)} m²`,
            `${(2 * Math.PI * r).toFixed(2)} m²`
          ]
        };
      }
    },
    {
      generate: () => {
        const n = randomInt(7, 10);
        const k = randomInt(2, 4);
        const ways = factorial(n - k + 1) * factorial(k);
        return {
          question: `In how many ways can ${n} different books be arranged on a shelf if ${k} particular books must always be together?`,
          correct: Math.round(ways).toString(),
          options: [
            `${Math.round(ways * 0.8)}`,
            `${Math.round(ways * 1.2)}`,
            Math.round(ways).toString(),
            `${factorial(n)}`
          ]
        };
      }
    },
    {
      generate: () => {
        const p = randomInt(8000, 12000);
        const q = randomInt(8000, 12000);
        const r1 = randomInt(9, 12);
        const r2 = randomInt(9, 12);
        const si = (p * r1 * 2) / 100;
        const ci = q * Math.pow(1 + r2/100, 2) - q;
        const diff = Math.abs(si - ci);
        return {
          question: `Mr. X invests ₹${p} at ${r1}% simple interest and ₹${q} at ${r2}% compound interest. After 2 years, what is the difference between the two interests?`,
          correct: `₹${Math.round(diff)}`,
          options: [
            `₹${Math.round(diff * 0.9)}`,
            `₹${Math.round(diff * 1.1)}`,
            `₹${Math.round(diff)}`,
            `₹${Math.round((p * r1 * 2)/100 + (q * r2 * 2)/100)}`
          ]
        };
      }
    },
    {
      generate: () => {
        const a = 0.3010; // log10(2)
        const b = 0.4771; // log10(3)
        const log72 = 3*a + 2*b;
        return {
          question: "If log₁₀2 = 0.3010 and log₁₀3 = 0.4771, what is the value of log₁₀72?",
          correct: log72.toFixed(4),
          options: [
            "1.8572",
            "1.7321",
            log72.toFixed(4),
            "1.9542"
          ]
        };
      }
    }
  ];

  // Logical Reasoning Questions (12 unique)
  const logicalQuestions = [
    {
      question: "If all software engineers are logical thinkers, and some logical thinkers are good at mathematics, which conclusion must be true?",
      correct: "Some software engineers may be good at mathematics",
      options: [
        "All software engineers are good at mathematics",
        "No software engineers are good at mathematics",
        "Some software engineers may be good at mathematics",
        "All logical thinkers are software engineers"
      ]
    },
    {
      question: "Which number should come next in the sequence: 2, 6, 12, 20, 30, ?",
      correct: "42",
      options: ["36", "40", "42", "44"]
    },
    {
      question: "Point A is 5km north of Point B. Point B is 3km east of Point C. In which direction is Point A from Point C?",
      correct: "North-East",
      options: ["North-East", "South-West", "North-West", "South-East"]
    },
    {
      question: "If in a certain code language, CAT is written as 3120 and DOG is written as 4157, how would you write RAT in the same code?",
      correct: "18120",
      options: ["18119", "18120", "18121", "19120"]
    },
    {
      question: "Find the odd one out: Square, Circle, Triangle, Rectangle",
      correct: "Circle",
      options: ["Square", "Circle", "Triangle", "Rectangle"]
    },
    {
      question: "Complete the analogy: Doctor is to Hospital as Teacher is to _____",
      correct: "School",
      options: ["Classroom", "School", "Students", "Education"]
    },
    {
      question: "Based on the statement: 'All successful entrepreneurs take calculated risks. Some risk-takers are innovative.' Which conclusion logically follows?",
      correct: "Some successful entrepreneurs may be innovative",
      options: [
        "All innovative people are entrepreneurs",
        "No entrepreneurs are innovative",
        "Some successful entrepreneurs may be innovative",
        "All risk-takers are successful"
      ]
    },
    {
      question: "If 'No managers are programmers' and 'Some programmers are creative', what must be true?",
      correct: "Some creative people are not managers",
      options: [
        "All creative people are programmers",
        "No creative people are managers",
        "Some creative people are not managers",
        "All managers are creative"
      ]
    },
    {
      question: "Arrange these events in logical order: 1. Interview 2. Job Offer 3. Resume Submission 4. Selection Process 5. Application",
      correct: "5,3,1,4,2",
      options: [
        "5,3,1,4,2",
        "3,5,1,4,2",
        "5,1,3,4,2",
        "1,3,5,4,2"
      ]
    },
    {
      question: "Which is the strongest argument for implementing flexible work hours?",
      correct: "Increases employee satisfaction and productivity",
      options: [
        "Everyone likes sleeping late",
        "It reduces office space costs",
        "Increases employee satisfaction and productivity",
        "Managers have less work"
      ]
    },
    {
      question: "If RED is coded as 27 (R=18, E=5, D=4: 18+5+4=27) and BLUE is coded as 40, how is GREEN coded using the same pattern?",
      correct: "49",
      options: ["45", "49", "52", "56"]
    },
    {
      question: "Which pattern does not belong with the others: △△○, □□△, ○○□, △△△",
      correct: "△△△",
      options: ["△△○", "□□△", "○○□", "△△△"]
    }
  ];

  // Verbal Ability Questions (12 unique)
  const verbalQuestions = [
    {
      question: "Choose the most appropriate word: The team's ______ efforts led to the successful completion of the project ahead of schedule.",
      correct: "diligent",
      options: ["diligent", "lazy", "casual", "apathetic"]
    },
    {
      question: "Identify the grammatical error: 'The committee members has reached a unanimous decision on the matter.'",
      correct: "has reached",
      options: ["The committee", "members has", "has reached", "a unanimous decision"]
    },
    {
      question: "What is the central theme of a passage discussing the impact of artificial intelligence on job markets?",
      correct: "AI creates new opportunities while disrupting traditional roles",
      options: [
        "AI will eliminate all human jobs",
        "AI has no significant impact",
        "AI creates new opportunities while disrupting traditional roles",
        "Only manual labor is affected by AI"
      ]
    },
    {
      question: "Which word is most similar in meaning to 'Ubiquitous'?",
      correct: "Omnipresent",
      options: ["Rare", "Omnipresent", "Hidden", "Temporary"]
    },
    {
      question: "Rearrange these sentences to form a coherent paragraph: A. Consequently, employee productivity increased significantly. B. The company introduced flexible working hours. C. This change addressed work-life balance concerns. D. Initially, there was some resistance from management.",
      correct: "D,B,C,A",
      options: ["B,C,D,A", "D,B,C,A", "A,B,C,D", "C,D,B,A"]
    },
    {
      question: "Choose the correctly spelled word:",
      correct: "Entrepreneur",
      options: ["Enterpreneur", "Entrepreneur", "Entreprenuer", "Enterprenuer"]
    },
    {
      question: "Select the most appropriate idiom: 'After months of preparation, the startup finally ______ when they secured their first major client.'",
      correct: "got off the ground",
      options: ["bit the bullet", "got off the ground", "beat around the bush", "spilled the beans"]
    },
    {
      question: "What is the author's tone in an article criticizing excessive social media use?",
      correct: "Concerned and cautionary",
      options: ["Joyful and celebratory", "Concerned and cautionary", "Indifferent and neutral", "Sarcastic and mocking"]
    },
    {
      question: "Which option best summarizes an argument about renewable energy adoption?",
      correct: "Government incentives combined with technological advances accelerate renewable energy transition",
      options: [
        "Renewable energy is too expensive to implement",
        "Only solar power is worth investing in",
        "Government incentives combined with technological advances accelerate renewable energy transition",
        "Traditional energy sources will always dominate"
      ]
    },
    {
      question: "Choose the most formal alternative to: 'We need to finish this report quickly.'",
      correct: "We must complete this report expeditiously",
      options: [
        "We gotta wrap up this report fast",
        "We need to hurry up with this report",
        "We must complete this report expeditiously",
        "Let's get this report done quick"
      ]
    },
    {
      question: "Identify the sentence with correct parallel structure:",
      correct: "The manager praised the team for their dedication, hard work, and innovative solutions",
      options: [
        "The manager praised the team for their dedication, working hard, and innovative solutions",
        "The manager praised the team for dedication, their hard work, and coming up with innovative solutions",
        "The manager praised the team for their dedication, hard work, and innovative solutions",
        "The manager praised the team for being dedicated, hard work, and innovative"
      ]
    },
    {
      question: "Which word is an antonym of 'Ephemeral'?",
      correct: "Permanent",
      options: ["Temporary", "Brief", "Permanent", "Fleeting"]
    }
  ];

  // Technical Core Questions (12 unique)
  const technicalQuestions = [
    {
      question: "What occurs during a context switch in an operating system?",
      correct: "The CPU saves the state of the current process and loads the state of the next process",
      options: [
        "The operating system restarts",
        "All memory is cleared",
        "The CPU saves the state of the current process and loads the state of the next process",
        "The hard drive is formatted"
      ]
    },
    {
      question: "Explain the concept of polymorphism in Object-Oriented Programming with an example:",
      correct: "The same method name can have different implementations in parent and child classes",
      options: [
        "Creating multiple objects from the same class",
        "The same method name can have different implementations in parent and child classes",
        "Hiding implementation details from the user",
        "Combining data and methods into a single unit"
      ]
    },
    {
      question: "Compare TCP and UDP protocols in terms of reliability:",
      correct: "TCP provides reliable, ordered delivery with acknowledgment; UDP is faster but unreliable",
      options: [
        "Both are equally reliable",
        "TCP is unreliable; UDP is reliable",
        "TCP provides reliable, ordered delivery with acknowledgment; UDP is faster but unreliable",
        "Neither protocol is reliable"
      ]
    },
    {
      question: "What is the primary purpose of DNS (Domain Name System) in computer networks?",
      correct: "To translate domain names into IP addresses",
      options: [
        "To encrypt internet communications",
        "To translate domain names into IP addresses",
        "To manage network hardware",
        "To control internet speed"
      ]
    },
    {
      question: "How does Dijkstra's algorithm find the shortest path in a graph?",
      correct: "Uses a greedy approach with a priority queue to explore nodes by minimum distance",
      options: [
        "Randomly selects paths until the shortest is found",
        "Uses brute force to check all possible paths",
        "Uses a greedy approach with a priority queue to explore nodes by minimum distance",
        "Uses genetic algorithms to evolve the best path"
      ]
    },
    {
      question: "What do the ACID properties ensure in database transactions?",
      correct: "Atomicity, Consistency, Isolation, and Durability for reliable transactions",
      options: [
        "Availability, Consistency, Integrity, and Durability",
        "Atomicity, Consistency, Isolation, and Durability for reliable transactions",
        "Accuracy, Completeness, Integrity, and Durability",
        "Atomicity, Concurrency, Isolation, and Durability"
      ]
    },
    {
      question: "Explain the MVC (Model-View-Controller) architectural pattern and its benefits:",
      correct: "Separates application into Model (data), View (UI), and Controller (logic) for maintainability",
      options: [
        "Combines all application logic into a single component",
        "Only used for frontend development",
        "Separates application into Model (data), View (UI), and Controller (logic) for maintainability",
        "A database-only architecture"
      ]
    },
    {
      question: "What causes a deadlock in operating systems and how can it be prevented?",
      correct: "Circular wait condition; prevention methods include resource ordering and timeout mechanisms",
      options: [
        "Insufficient memory; add more RAM",
        "Circular wait condition; prevention methods include resource ordering and timeout mechanisms",
        "Too many processes; reduce process count",
        "Network issues; improve bandwidth"
      ]
    },
    {
      question: "How does caching improve system performance in web applications?",
      correct: "Reduces database load by storing frequently accessed data in memory",
      options: [
        "Increases memory usage unnecessarily",
        "Slows down response time",
        "Reduces database load by storing frequently accessed data in memory",
        "Eliminates the need for databases entirely"
      ]
    },
    {
      question: "What are the trade-offs between microservices and monolithic architectures?",
      correct: "Microservices offer scalability and independence but add complexity; monoliths are simpler but harder to scale",
      options: [
        "Microservices are always better than monoliths",
        "Monoliths are always better than microservices",
        "Microservices offer scalability and independence but add complexity; monoliths are simpler but harder to scale",
        "There are no significant differences between them"
      ]
    },
    {
      question: "What is virtualization and what are its primary benefits in cloud computing?",
      correct: "Creating virtual versions of resources; improves utilization, isolation, and flexibility",
      options: [
        "Making software run faster",
        "Creating virtual versions of resources; improves utilization, isolation, and flexibility",
        "Reducing security measures",
        "Increasing hardware costs"
      ]
    },
    {
      question: "How does garbage collection work in languages like Java and what problem does it solve?",
      correct: "Automatically reclaims memory from unused objects, preventing memory leaks",
      options: [
        "Manually deletes unused variables",
        "Automatically reclaims memory from unused objects, preventing memory leaks",
        "Increases memory usage for better performance",
        "Only works with array data structures"
      ]
    }
  ];

  // Coding Concepts Questions (12 unique)
  const codingQuestions = [
    {
      question: "What is the worst-case time complexity of merge sort for an array of n elements?",
      correct: "O(n log n)",
      options: ["O(n)", "O(n²)", "O(log n)", "O(n log n)"]
    },
    {
      question: "How would you optimize a recursive function that calculates Fibonacci numbers to avoid exponential time complexity?",
      correct: "Use memoization (top-down) or dynamic programming (bottom-up)",
      options: [
        "Increase recursion depth limit",
        "Use memoization (top-down) or dynamic programming (bottom-up)",
        "Convert to iterative with multiple loops",
        "Use global variables to store results"
      ]
    },
    {
      question: "Write pseudocode for binary search algorithm:",
      correct: "While low ≤ high: mid = (low+high)/2; if arr[mid]==target return mid; else adjust low or high",
      options: [
        "Check each element sequentially until found",
        "Sort the array first, then check middle",
        "While low ≤ high: mid = (low+high)/2; if arr[mid]==target return mid; else adjust low or high",
        "Use hash table to store all elements"
      ]
    },
    {
      question: "Which data structure is most efficient for implementing an LRU (Least Recently Used) cache?",
      correct: "Hash map combined with doubly linked list",
      options: [
        "Array",
        "Stack",
        "Hash map combined with doubly linked list",
        "Binary search tree"
      ]
    },
    {
      question: "Explain the optimal approach for solving the 'Two Sum' problem (find two numbers that add to target):",
      correct: "Use a hash map to store numbers and check for complement in O(n) time",
      options: [
        "Check all pairs using nested loops O(n²)",
        "Sort array and use two pointers O(n log n)",
        "Use a hash map to store numbers and check for complement in O(n) time",
        "Use recursion with backtracking"
      ]
    },
    {
      question: "What edge cases should be considered when implementing a function to check if a string is a palindrome?",
      correct: "Empty string, single character, case sensitivity, spaces, punctuation, and Unicode characters",
      options: [
        "Only uppercase letters matter",
        "Empty string, single character, case sensitivity, spaces, punctuation, and Unicode characters",
        "Only alphanumeric characters",
        "Only strings with even length"
      ]
    },
    {
      question: "How does quicksort perform on an already sorted array without proper pivot selection?",
      correct: "Degenerates to O(n²) time complexity due to unbalanced partitions",
      options: [
        "Performs in O(n) time",
        "Degenerates to O(n²) time complexity due to unbalanced partitions",
        "Always runs in O(n log n) time",
        "Faster than merge sort on sorted arrays"
      ]
    },
    {
      question: "Compare Depth-First Search (DFS) and Breadth-First Search (BFS) for graph traversal:",
      correct: "DFS uses stack/recursion, good for path finding; BFS uses queue, good for shortest path",
      options: [
        "DFS is always better than BFS",
        "BFS is always better than DFS",
        "DFS uses stack/recursion, good for path finding; BFS uses queue, good for shortest path",
        "Both are identical in time and space complexity"
      ]
    },
    {
      question: "What is the recurrence relation for the Tower of Hanoi problem with n disks?",
      correct: "T(n) = 2T(n-1) + 1",
      options: [
        "T(n) = T(n-1) + n",
        "T(n) = 2T(n-1) + 1",
        "T(n) = T(n/2) + 1",
        "T(n) = nT(n-1)"
      ]
    },
    {
      question: "How would you modify binary search to work on a rotated sorted array?",
      correct: "Find pivot point first, then search in the appropriate sorted half",
      options: [
        "Sort the array first, then do regular binary search",
        "Find pivot point first, then search in the appropriate sorted half",
        "Use linear search instead",
        "Convert to hash table for O(1) lookup"
      ]
    },
    {
      question: "What is tail recursion and why is it optimized by compilers?",
      correct: "Recursive call is the last operation; compiler can reuse stack frame for efficiency",
      options: [
        "Recursive call is the first operation",
        "Recursive call is the last operation; compiler can reuse stack frame for efficiency",
        "Multiple recursive calls in the same function",
        "Recursion without base case"
      ]
    },
    {
      question: "How does dynamic programming solve problems with overlapping subproblems?",
      correct: "Stores results of subproblems in a table/memo to avoid redundant computations",
      options: [
        "Solves each subproblem repeatedly",
        "Stores results of subproblems in a table/memo to avoid redundant computations",
        "Uses random selection of subproblems",
        "Divides problem but doesn't combine solutions"
      ]
    }
  ];

  // Data Structures Questions (12 unique)
  const dsQuestions = [
    {
      question: "When would you choose a hash table over a binary search tree for storing data?",
      correct: "When you need O(1) average-case lookups and don't need ordered traversal",
      options: [
        "Always choose hash table",
        "Always choose binary search tree",
        "When you need O(1) average-case lookups and don't need ordered traversal",
        "When you need to maintain data in sorted order"
      ]
    },
    {
      question: "How does insertion work in a red-black tree to maintain balance?",
      correct: "Insert as in BST, then recolor and rotate nodes to maintain red-black properties",
      options: [
        "Insert randomly and rebalance later",
        "Insert as in BST, then recolor and rotate nodes to maintain red-black properties",
        "Only insert at leaf nodes without rebalancing",
        "Rebuild entire tree after each insertion"
      ]
    },
    {
      question: "What is the space complexity of a trie data structure storing n words with average length l?",
      correct: "O(n*l) in worst case, but can be optimized with compression",
      options: ["O(n)", "O(l)", "O(n*l) in worst case, but can be optimized with compression", "O(1)"]
    },
    {
      question: "Implement the enqueue operation for a circular queue with fixed size:",
      correct: "Check if queue is full, add element at rear, update rear = (rear+1)%size",
      options: [
        "Always add at front and shift all elements",
        "Check if queue is full, add element at rear, update rear = (rear+1)%size",
        "Remove oldest element first, then add new element",
        "Double the size if queue is full"
      ]
    },
    {
      question: "What are the advantages of linked lists over arrays?",
      correct: "Dynamic size, efficient insertions/deletions at any position, no wasted memory",
      options: [
        "Better cache locality",
        "Random access to elements",
        "Dynamic size, efficient insertions/deletions at any position, no wasted memory",
        "Fixed size for memory efficiency"
      ]
    },
    {
      question: "How does separate chaining handle collisions in hash tables?",
      correct: "Uses linked lists at each bucket to store multiple key-value pairs with same hash",
      options: [
        "Ignores collisions and overwrites data",
        "Reduces hash table size",
        "Uses linked lists at each bucket to store multiple key-value pairs with same hash",
        "Uses only perfect hash functions to avoid collisions"
      ]
    },
    {
      question: "Explain rotation operations in AVL trees for maintaining balance:",
      correct: "Left, right, left-right, and right-left rotations based on balance factors",
      options: [
        "Only left rotations are needed",
        "Only right rotations are needed",
        "Left, right, left-right, and right-left rotations based on balance factors",
        "No rotations are necessary in AVL trees"
      ]
    },
    {
      question: "What is the traversal order for Breadth-First Search (BFS) on a complete binary tree?",
      correct: "Level by level from root to leaves",
      options: [
        "Root, left subtree, right subtree",
        "Left subtree, root, right subtree",
        "Level by level from root to leaves",
        "Right subtree, left subtree, root"
      ]
    },
    {
      question: "How can you find the kth smallest element in a Binary Search Tree efficiently?",
      correct: "In-order traversal while maintaining a counter",
      options: [
        "Sort all elements and pick kth",
        "In-order traversal while maintaining a counter",
        "Random selection until kth smallest is found",
        "Post-order traversal with recursion"
      ]
    },
    {
      question: "What probabilistic balancing mechanism does a skip list use?",
      correct: "Randomized levels with coin flipping to determine node heights",
      options: [
        "Rotation operations like balanced trees",
        "Randomized levels with coin flipping to determine node heights",
        "Periodic rebuilding of entire structure",
        "No balancing mechanism"
      ]
    },
    {
      question: "When is a segment tree data structure particularly useful?",
      correct: "For range queries and updates on arrays with O(log n) operations",
      options: [
        "Simple element lookup in unsorted data",
        "For range queries and updates on arrays with O(log n) operations",
        "Storing sorted data for binary search",
        "Implementing key-value dictionaries"
      ]
    },
    {
      question: "How does the union-find (disjoint set) data structure work with path compression?",
      correct: "Forest of trees where find operation compresses paths to root for efficiency",
      options: [
        "Uses arrays for direct access",
        "Uses linked lists for connectivity",
        "Forest of trees where find operation compresses paths to root for efficiency",
        "Uses hash tables for quick lookups"
      ]
    }
  ];

  // System Design Questions (12 unique)
  const systemDesignQuestions = [
    {
      question: "How would you design a URL shortening service like TinyURL that handles millions of requests?",
      correct: "Generate unique short codes, use distributed database, implement caching with LRU, use CDN for scaling",
      options: [
        "Store all URLs in a single text file",
        "Generate unique short codes, use distributed database, implement caching with LRU, use CDN for scaling",
        "Use sequential numbers for all URLs",
        "No database needed, just compute hashes"
      ]
    },
    {
      question: "What components would you need for a real-time chat application supporting thousands of concurrent users?",
      correct: "WebSocket servers, message queue, distributed database, caching layer, load balancer",
      options: [
        "Only a single database server",
        "WebSocket servers, message queue, distributed database, caching layer, load balancer",
        "Static HTML files only",
        "Email server for notifications"
      ]
    },
    {
      question: "How would you ensure strong consistency in a globally distributed database system?",
      correct: "Use consensus protocols like Paxos or Raft, implement quorum-based reads/writes",
      options: [
        "Use a single master database",
        "Use consensus protocols like Paxos or Raft, implement quorum-based reads/writes",
        "No consistency guarantees needed",
        "Randomly select nodes for each operation"
      ]
    },
    {
      question: "Which database would you choose for storing and querying time-series data (like IoT sensor readings) and why?",
      correct: "Time-series database like InfluxDB for efficient time-based queries and compression",
      options: [
        "Traditional relational database",
        "Time-series database like InfluxDB for efficient time-based queries and compression",
        "Document database like MongoDB",
        "Graph database like Neo4j"
      ]
    },
    {
      question: "How would you handle server failures in a microservices architecture to maintain availability?",
      correct: "Implement circuit breakers, retries with exponential backoff, fallback mechanisms, health checks",
      options: [
        "Restart all services manually",
        "Implement circuit breakers, retries with exponential backoff, fallback mechanisms, health checks",
        "Ignore failures and continue operation",
        "Use only a single service to avoid failures"
      ]
    },
    {
      question: "What caching strategy would you implement for a social media news feed serving millions of users?",
      correct: "Cache personalized feeds with TTL, use write-through cache for new posts, implement cache warming",
      options: [
        "Cache everything permanently",
        "Cache personalized feeds with TTL, use write-through cache for new posts, implement cache warming",
        "No caching needed for feeds",
        "Cache only user profile pictures"
      ]
    },
    {
      question: "How can you scale database read operations horizontally to handle increased traffic?",
      correct: "Use read replicas with asynchronous replication, implement connection pooling, monitor replication lag",
      options: [
        "Buy a bigger single server",
        "Use read replicas with asynchronous replication, implement connection pooling, monitor replication lag",
        "Scale vertically only",
        "Use in-memory databases exclusively"
      ]
    },
    {
      question: "What key metrics would you monitor for an API gateway handling millions of requests per day?",
      correct: "Request rate, latency (p50, p95, p99), error rate, throughput, availability, concurrent connections",
      options: [
        "Only CPU usage",
        "Request rate, latency (p50, p95, p99), error rate, throughput, availability, concurrent connections",
        "Only memory usage",
        "Only disk space"
      ]
    },
    {
      question: "How would you design a RESTful API for an e-commerce product catalog with filtering, sorting, and pagination?",
      correct: "Resource-based endpoints, proper HTTP methods, versioning, query parameters for filters, pagination with cursors",
      options: [
        "Single endpoint returning all data",
        "Resource-based endpoints, proper HTTP methods, versioning, query parameters for filters, pagination with cursors",
        "Only GET requests for all operations",
        "No authentication required"
      ]
    },
    {
      question: "What security measures would you implement for a user authentication system handling sensitive financial data?",
      correct: "Hashed passwords with salt, JWT tokens with short expiry, rate limiting, 2FA, security headers, audit logging",
      options: [
        "Store passwords in plain text",
        "Hashed passwords with salt, JWT tokens with short expiry, rate limiting, 2FA, security headers, audit logging",
        "No encryption needed",
        "Single password for all users"
      ]
    },
    {
      question: "How would you implement search functionality for an e-commerce site with millions of products?",
      correct: "Use Elasticsearch with indexing, analyzers, relevance scoring, autocomplete, and faceted search",
      options: [
        "Database LIKE queries on product names",
        "Use Elasticsearch with indexing, analyzers, relevance scoring, autocomplete, and faceted search",
        "Manual search by category only",
        "No search functionality needed"
      ]
    },
    {
      question: "What architecture would you use for handling large file uploads (like videos) at scale?",
      correct: "CDN for distribution, object storage (S3), async processing queues, resumable uploads, progress tracking",
      options: [
        "Store files directly in database",
        "CDN for distribution, object storage (S3), async processing queues, resumable uploads, progress tracking",
        "Email files as attachments",
        "Local server storage only"
      ]
    }
  ];

  // Behavioral Questions (12 unique)
  const behavioralQuestions = [
    {
      question: "Describe a situation where you had to meet a tight deadline. How did you prioritize tasks and ensure timely delivery?",
      correct: "Prioritized critical path items, communicated with stakeholders, broke down work, delivered incrementally",
      options: [
        "Worked 24/7 without breaks",
        "Prioritized critical path items, communicated with stakeholders, broke down work, delivered incrementally",
        "Asked for deadline extension immediately",
        "Focused only on easy tasks first"
      ]
    },
    {
      question: "How would you handle a disagreement with a team member about technical implementation?",
      correct: "Listen to their perspective, present data/evidence, find common ground, seek compromise or third opinion",
      options: [
        "Insist on your approach forcefully",
        "Complain to manager without discussion",
        "Listen to their perspective, present data/evidence, find common ground, seek compromise or third opinion",
        "Avoid the person and implement your way"
      ]
    },
    {
      question: "What is your approach to learning a new technology or framework quickly for a project requirement?",
      correct: "Hands-on projects, official documentation, online courses, community forums, pair programming",
      options: [
        "Read one book cover to cover",
        "Hands-on projects, official documentation, online courses, community forums, pair programming",
        "Wait for formal training",
        "Trial and error without guidance"
      ]
    },
    {
      question: "Tell me about a time you took initiative to improve a process or system without being asked.",
      correct: "Identified inefficiency, researched solutions, proposed improvement, implemented, measured results",
      options: [
        "Always waited for instructions",
        "Identified inefficiency, researched solutions, proposed improvement, implemented, measured results",
        "Complained about problems without solutions",
        "Implemented changes without approval"
      ]
    },
    {
      question: "How do you prioritize when you receive multiple urgent requests from different stakeholders simultaneously?",
      correct: "Assess business impact and urgency, communicate timelines transparently, negotiate priorities if needed",
      options: [
        "Work on easiest tasks first",
        "Assess business impact and urgency, communicate timelines transparently, negotiate priorities if needed",
        "Try to do everything at once",
        "Choose randomly which to work on"
      ]
    },
    {
      question: "What would you do if you discovered a critical security vulnerability in production code?",
      correct: "Assess severity, contain if possible, notify security team, fix urgently, deploy patch, conduct root cause analysis",
      options: [
        "Ignore it and hope no one notices",
        "Assess severity, contain if possible, notify security team, fix urgently, deploy patch, conduct root cause analysis",
        "Wait for next scheduled release",
        "Blame the original developer"
      ]
    },
    {
      question: "How do you ensure code quality and maintainability in a team development environment?",
      correct: "Code reviews, automated testing, coding standards, continuous integration, documentation, pair programming",
      options: [
        "No reviews needed if code works",
        "Code reviews, automated testing, coding standards, continuous integration, documentation, pair programming",
        "Only manager reviews code",
        "Test only after deployment"
      ]
    },
    {
      question: "Describe your leadership style when guiding a team through a challenging project.",
      correct: "Servant leadership: empower team members, remove obstacles, provide guidance, lead by example",
      options: [
        "Command and control style",
        "Servant leadership: empower team members, remove obstacles, provide guidance, lead by example",
        "Hands-off, let team figure everything out",
        "Delegate all responsibilities"
      ]
    },
    {
      question: "How do you handle constructive criticism or feedback that you initially disagree with?",
      correct: "Listen actively without defensiveness, ask clarifying questions, reflect objectively, respond professionally",
      options: [
        "Argue immediately to defend your position",
        "Listen actively without defensiveness, ask clarifying questions, reflect objectively, respond professionally",
        "Ignore the feedback completely",
        "Take it personally and get upset"
      ]
    },
    {
      question: "Where do you see your career progressing in the next 3-5 years?",
      correct: "Technical leadership role, mentoring junior developers, contributing to architecture, driving innovation",
      options: [
        "Same position with same responsibilities",
        "Technical leadership role, mentoring junior developers, contributing to architecture, driving innovation",
        "Completely different industry",
        "Management only, no technical work"
      ]
    },
    {
      question: "How do you stay motivated when working on repetitive or mundane tasks?",
      correct: "Find patterns to automate, set small milestones, focus on bigger purpose, take regular breaks",
      options: [
        "Complain constantly to colleagues",
        "Find patterns to automate, set small milestones, focus on bigger purpose, take regular breaks",
        "Skip the tasks when possible",
        "Do them quickly without attention to detail"
      ]
    },
    {
      question: "What do you believe are the most important qualities for effective teamwork?",
      correct: "Clear communication, mutual respect, shared goals, psychological safety, accountability, adaptability",
      options: [
        "Only technical skills matter",
        "Clear communication, mutual respect, shared goals, psychological safety, accountability, adaptability",
        "Everyone thinking alike",
        "Working independently in silos"
      ]
    }
  ];

  // Map categories to their question sets
  const categoryQuestions = {
    "Quantitative Aptitude": quantitativeQuestions,
    "Logical Reasoning": logicalQuestions,
    "Verbal Ability": verbalQuestions,
    "Technical Core": technicalQuestions,
    "Coding Concepts": codingQuestions,
    "Data Structures": dsQuestions,
    "System Design": systemDesignQuestions,
    "Behavioral": behavioralQuestions
  };

  // Get topics for each category
  const getTopicForCategory = (category: string, index: number): string => {
    const topics: Record<string, string[]> = {
      "Quantitative Aptitude": ["Percentage", "Work & Time", "Probability", "Ratio", "Series", "Speed", "Interest", "Algebra", "Geometry", "Permutations", "Investments", "Logarithms"],
      "Logical Reasoning": ["Syllogism", "Series", "Direction", "Coding", "Classification", "Analogy", "Deduction", "Logical Order", "Arguments", "Pattern", "Shapes", "Relations"],
      "Verbal Ability": ["Vocabulary", "Grammar", "Comprehension", "Synonyms", "Paragraph", "Spelling", "Idioms", "Tone", "Summary", "Formality", "Parallelism", "Antonyms"],
      "Technical Core": ["OS", "OOP", "Networking", "DNS", "Algorithms", "DBMS", "Architecture", "Deadlock", "Caching", "Microservices", "Virtualization", "Memory"],
      "Coding Concepts": ["Complexity", "Optimization", "Search", "Data Structures", "Problem Solving", "Edge Cases", "Sorting", "Graphs", "Recurrence", "Search Modified", "Recursion", "DP"],
      "Data Structures": ["Comparison", "Balanced Trees", "Trie", "Queue", "Linked List", "Hashing", "AVL", "Traversal", "BST", "Skip List", "Segment Tree", "Union-Find"],
      "System Design": ["URL Shortener", "Chat App", "Consistency", "Database", "Failure", "Caching", "Scaling", "Monitoring", "API Design", "Security", "Search", "File Upload"],
      "Behavioral": ["Deadline", "Conflict", "Learning", "Initiative", "Prioritization", "Problem", "Quality", "Leadership", "Feedback", "Career", "Motivation", "Teamwork"]
    };
    
    return topics[category]?.[index % topics[category].length] || category.split(' ')[0] + " Concepts";
  };

  let questionId = 0;
  
  for (let t = 0; t < TOTAL_TESTS; t++) {
    const company = companies[t % companies.length];
    const questions: Question[] = [];
    
    for (let q = 0; q < QUESTIONS_PER_TEST; q++) {
      questionId++;
      const cat = categories[q % categories.length];
      const questionSet = categoryQuestions[cat];
      const questionIndex = q % questionSet.length;
      
      const difficulty = company.difficulty === "Advanced" ? "Advanced" : 
                        company.difficulty === "Hard" ? "Hard" : "Medium";
      
      let questionData;
      
      // Handle quantitative questions specially since they need generation
      if (cat === "Quantitative Aptitude") {
        questionData = quantitativeQuestions[questionIndex].generate();
      } else {
        // For other categories, use static questions
        questionData = questionSet[questionIndex];
      }
      
      const correctIndex = Math.floor(Math.random() * 4);
      const options = [...questionData.options];
      
      // Ensure correct answer is at correctIndex
      const correctAnswer = questionData.correct;
      const currentCorrectIndex = options.indexOf(correctAnswer);
      
      if (currentCorrectIndex !== -1 && currentCorrectIndex !== correctIndex) {
        // Swap positions
        [options[currentCorrectIndex], options[correctIndex]] = 
        [options[correctIndex], options[currentCorrectIndex]];
      }
      
      // Get topic
      const topic = getTopicForCategory(cat, questionIndex);
      
      questions.push({
        id: questionId,
        category: cat,
        topic: topic,
        difficulty: difficulty,
        question: `${questionData.question} (Test ${t + 1}, Q${q + 1})`,
        options: options,
        correctAnswer: correctIndex,
        explanation: `This question tests your understanding of ${cat.toLowerCase()} concepts. ${
          cat === "Quantitative Aptitude" ? "Apply appropriate mathematical formulas and verify your calculations." :
          cat === "Logical Reasoning" ? "Identify patterns and logical relationships between elements." :
          cat === "Verbal Ability" ? "Consider context, grammar rules, and vocabulary nuances." :
          cat === "Technical Core" ? "Understand fundamental computer science principles and their practical applications." :
          cat === "Coding Concepts" ? "Analyze time/space complexity and choose appropriate algorithm design patterns." :
          cat === "Data Structures" ? "Select optimal data structures based on operation requirements and constraints." :
          cat === "System Design" ? "Consider scalability, reliability, security, and trade-offs in architectural decisions." :
          "Reflect on professional experiences and demonstrate effective soft skills and problem-solving approaches."
        } Always consider alternative approaches and validate your reasoning.`,
        tips: [
          "Read the question carefully before attempting",
          "Eliminate obviously incorrect options first",
          "Manage your time effectively across questions",
          "Double-check calculations and logic before finalizing"
        ]
      });
    }

    modules.push({
      id: t + 1,
      title: `${company.name} #${t + 1}`,
      company: company.name,
      icon: company.icon,
      estimatedTime: company.time,
      passingScore: Math.floor(QUESTIONS_PER_TEST * 0.75),
      questions,
      tags: [...company.tags, categories[t % categories.length]],
      difficultyLevel: company.difficulty
    });
  }

  return modules;
};

const PLACEMENT_DATASET = generatePlacementDataset();

const PlacementMockEngine = () => {
  // --- CORE STATE ---
  const [activeTestId, setActiveTestId] = useState<number | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    speed: 0,
    accuracy: 0,
    consistency: 0,
    categoryBreakdown: {}
  });
  const [testHistory, setTestHistory] = useState<Array<{testId: number, score: number, date: string, company: string}>>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- TOOL STATE ---
  const [showCalc, setShowCalc] = useState(false);
  const [showPad, setShowPad] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [scratchContent, setScratchContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const activeTest = useMemo(() => 
    PLACEMENT_DATASET.find(m => m.id === activeTestId), [activeTestId]
  );

  // --- AUTHENTICATION & SESSION MANAGEMENT ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for regular user session
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            
            // If it's a demo/login user with token
            if (parsedUser?.token) {
              // Verify token by making a simple API call
              try {
                const response = await apiService.getCurrentUser();
                if (response.success) {
                  setUser(response.data);
                  await loadUserData();
                  return;
                }
              } catch (error) {
                console.log('Token validation failed, checking guest session');
              }
            }
            
            // If token validation failed but we have user data, use it
            if (parsedUser?.user || parsedUser?.name || parsedUser?.email) {
              setUser(parsedUser.user || parsedUser);
              await loadUserData();
              return;
            }
          } catch (parseError) {
            console.error('Failed to parse user data:', parseError);
          }
        }
        
        // Check for guest session
        const guestData = localStorage.getItem('guest_session');
        if (guestData) {
          try {
            const guestSession = JSON.parse(guestData);
            const sessionAge = Date.now() - (guestSession.timestamp || 0);
            // Guest session valid for 24 hours
            if (sessionAge < 24 * 60 * 60 * 1000) {
              setUser({ guest: true, ...guestSession });
              await loadGuestHistory();
              return;
            }
          } catch (guestError) {
            console.error('Failed to parse guest session:', guestError);
          }
        }
        
        // No valid session found
        setUser(null);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (e.g., logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && !e.newValue) {
        setUser(null);
      }
      if (e.key === 'guest_session' && !e.newValue) {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleGuestMode = () => {
    const guestSession = {
      guest: true,
      timestamp: Date.now(),
      sessionId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    localStorage.setItem('guest_session', JSON.stringify(guestSession));
    setUser(guestSession);
    toast.success("Continuing as guest. Progress will be saved locally for 24 hours.");
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    setActiveTestId(null);
    toast.success("Logged out successfully");
  };

  const loadGuestHistory = async () => {
    try {
      const history = localStorage.getItem('test_history');
      if (history) {
        setTestHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading guest history:', error);
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // If guest user, load from localStorage
      if (user?.guest) {
        await loadGuestHistory();
        setLoading(false);
        return;
      }

      // Load test history from backend for authenticated users
      const testSessionsResponse = await apiService.getUserTestSessions({
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (testSessionsResponse.success) {
        const sessions = testSessionsResponse.sessions || [];
        const history = sessions.map((session: any) => ({
          testId: parseInt(session.testId) || session.id || 0,
          score: session.rawScore || 0,
          date: session.createdAt || new Date().toISOString(),
          company: session.testName || session.testCompany || "Unknown Test"
        }));
        setTestHistory(history);
        localStorage.setItem('test_history', JSON.stringify(history));
      }

      // Load performance analytics
      const analyticsResponse = await apiService.getPerformanceAnalytics('30d');
      if (analyticsResponse.success && analyticsResponse.data) {
        const data = analyticsResponse.data;
        setPerformance({
          speed: data.timeAnalysis?.averageTimePerQuestion || 0,
          accuracy: data.averageAccuracy || 0,
          consistency: 0,
          categoryBreakdown: data.categoryPerformance || {}
        });
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // --- PERSISTENCE & RECOVERY ---
  useEffect(() => {
    const backup = localStorage.getItem('placement_state_v1');
    const history = localStorage.getItem('test_history');
    if (backup && !activeTestId) {
      try {
        const data = JSON.parse(backup);
        setActiveTestId(data.activeTestId);
        setAnswers(data.answers || {});
        setTimeLeft(data.timeLeft || 3600);
        setTestHistory(history ? JSON.parse(history) : []);
        toast.success("Previous session restored");
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
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
  }, [answers, timeLeft, activeTestId, flagged, currentIdx, isSubmitted]);

  // --- BACKEND INTEGRATION FUNCTIONS ---
  const recordTestStart = async () => {
    if (!activeTest || !user || user?.guest) return;
    
    try {
      await apiService.recordTestStart(
        activeTest.id,
        activeTest.title,
        activeTest.tags[0] || 'General',
        activeTest.difficultyLevel
      );
    } catch (error) {
      console.error('Failed to record test start:', error);
    }
  };

  const recordQuestionAnswer = async (questionId: number, answerIndex: number) => {
    if (!activeTest || !user || user?.guest) return;
    
    const currentQ = activeTest.questions.find(q => q.id === questionId);
    if (!currentQ) return;

    try {
      await apiService.recordQuestionAnswered(
        activeTest.id,
        questionId,
        currentIdx,
        answerIndex,
        currentQ.correctAnswer,
        30,
        currentQ.category,
        currentQ.difficulty
      );
    } catch (error) {
      console.error('Failed to record question answer:', error);
    }
  };

  const recordQuestionFlag = async (questionId: number) => {
    if (!activeTest || !user || user?.guest) return;
    
    try {
      await apiService.recordQuestionFlagged(activeTest.id, questionId);
    } catch (error) {
      console.error('Failed to record question flag:', error);
    }
  };

  const recordTestCompletion = async (score: number) => {
    if (!activeTest || !user || user?.guest) return;

    const testSessionData = {
      testId: activeTest.id.toString(),
      testName: activeTest.title,
      testCategory: activeTest.tags[0] || 'General',
      testDifficulty: activeTest.difficultyLevel,
      testTags: activeTest.tags,
      status: 'completed',
      totalDuration: 3600 - timeLeft,
      questions: activeTest.questions.map((q, index) => ({
        questionId: q.id.toString(),
        questionIndex: index,
        questionText: q.question.substring(0, 200),
        category: q.category,
        difficulty: q.difficulty,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: answers[q.id],
        timeSpent: 45,
        isFlagged: flagged.includes(q.id),
        isReviewed: false,
        isCorrect: answers[q.id] === q.correctAnswer
      })),
      performance: {
        totalQuestions: QUESTIONS_PER_TEST,
        answeredQuestions: Object.keys(answers).length,
        correctAnswers: score,
        incorrectAnswers: Object.keys(answers).length - score,
        skippedQuestions: QUESTIONS_PER_TEST - Object.keys(answers).length,
        flaggedQuestions: flagged.length,
        reviewedQuestions: 0,
        averageTimePerQuestion: (3600 - timeLeft) / Object.keys(answers).length || 0,
        accuracy: (score / QUESTIONS_PER_TEST) * 100,
      },
      rawScore: score,
      normalizedScore: (score / QUESTIONS_PER_TEST) * 100,
      passingScore: activeTest.passingScore,
      isPassed: score >= activeTest.passingScore,
      environment: {
        browser: navigator.userAgent,
        os: navigator.platform,
        device: 'desktop',
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        networkType: 'unknown',
        ipAddress: 'unknown'
      }
    };

    try {
      await apiService.recordTestCompleted(testSessionData);
      toast.success("Test results saved to your profile!");
    } catch (error) {
      console.error('Failed to record test completion:', error);
      toast.error("Failed to save test results, but test completed locally");
    }
  };

  // --- PROCTORING SYSTEM ---
  useEffect(() => {
    if (!activeTestId || isSubmitted) return;

    const ticker = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(ticker);
          finalizeTest();
          return 0;
        }
        
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

    // Record test start when test begins
    if (user && !user.guest) {
      recordTestStart();
    }

    return () => {
      clearInterval(ticker);
    };
  }, [activeTestId, isSubmitted, answers, user]);

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

  const finalizeTest = async () => {
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
    
    // Record test completion to backend for authenticated users
    if (user && !user.guest) {
      await recordTestCompletion(score);
    }
    
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

  // --- AUTH UI COMPONENTS ---
  const AuthPrompt = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-gray-700 p-8 rounded-2xl max-w-md w-full"
      >
        <div className="text-center mb-6">
          <Lock className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400">Login or register to track your progress and save test results</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const response = await apiService.demoLogin();
                if (response.success) {
                  setUser(response.data.user || response.data);
                  localStorage.setItem('user', JSON.stringify(response.data));
                  localStorage.removeItem('guest_session');
                  toast.success("Demo login successful!");
                  await loadUserData();
                } else {
                  toast.error(response.message || "Demo login failed");
                }
              } catch (error) {
                toast.error("Demo login failed. Please try again.");
              } finally {
                setLoading(false);
              }
            }}
            className="w-full px-6 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Try Demo Account"}
          </button>
          
          <div className="text-center text-gray-500 text-sm">
            <p>Demo account has limited features</p>
            <p className="mt-2">
              <a href="/login" className="text-cyan-400 hover:text-cyan-300">
                Full login
              </a> • 
              <a href="/register" className="text-cyan-400 hover:text-cyan-300 ml-2">
                Register
              </a>
            </p>
          </div>
        </div>
        
        <button
          onClick={handleGuestMode}
          className="w-full mt-4 px-6 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all"
        >
          Continue as Guest
        </button>
      </motion.div>
    </div>
  );

  // --- LOADING SCREEN ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your data...</p>
        </div>
      </div>
    );
  }

  // --- AUTH CHECK ---
  if (!user && !loading) {
    return (
      <>
        <AuthPrompt />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 font-sans">
          <div className="max-w-7xl mx-auto">
            <header className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-5xl font-bold">
                    <span className="text-cyan-400">Placement</span> Prep Pro
                  </h1>
                  <p className="text-gray-400 mt-2">Master your placement interviews with 336 unique questions</p>
                </div>
              </div>
            </header>
          </div>
        </div>
      </>
    );
  }

  // --- MAIN DASHBOARD RENDER ---
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
                <p className="text-gray-400 mt-2">
                  {user?.guest ? "Guest Mode - Progress saved locally for 24 hours" : `Welcome, ${user?.name || user?.email || 'User'}!`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!user?.guest && (
                  <button 
                    onClick={async () => {
                      try {
                        const response = await apiService.getPerformanceAnalytics('30d');
                        if (response.success) {
                          setShowStats(true);
                        }
                      } catch (error) {
                        toast.error("Failed to load analytics");
                      }
                    }}
                    className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700"
                  >
                    <BarChart3 size={20} />
                  </button>
                )}
                <button onClick={() => setShowStats(true)} className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700">
                  <Settings size={20} />
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30"
                >
                  {user?.guest ? "Exit Guest Mode" : "Logout"}
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
              {!user?.guest && performance.accuracy > 0 && (
                <div className="flex items-center gap-2">
                  <Award size={16} />
                  <span>Accuracy: {Math.round(performance.accuracy)}%</span>
                </div>
              )}
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
                  onClick={() => {
                    setSelectedTags([]);
                    setSearchQuery("");
                    setDifficultyFilter("all");
                  }}
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
                className="p-6 rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900/50 to-black cursor-pointer group transition-all relative"
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
                    
                    {/* Performance Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 p-4 rounded-xl">
                        <p className="text-sm text-gray-400 mb-1">Total Tests</p>
                        <p className="text-2xl font-bold">{testHistory.length}</p>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-xl">
                        <p className="text-sm text-gray-400 mb-1">Average Score</p>
                        <p className="text-2xl font-bold">
                          {Math.round(testHistory.reduce((acc, t) => acc + t.score, 0) / testHistory.length)}/12
                        </p>
                      </div>
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

  // --- TEST COMPLETE SCREEN ---
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
            <AwardIcon className="w-24 h-24 text-cyan-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-2">Test Complete!</h2>
            <p className="text-gray-400">{activeTest.company}</p>
            {user?.guest && (
              <p className="text-yellow-500 text-sm mt-2">⚠️ Guest mode: Results saved locally for 24 hours</p>
            )}
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
              onClick={() => {
                setActiveTestId(null);
                setIsSubmitted(false);
                resetTest();
              }}
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
            {user?.guest && (
              <button 
                onClick={() => {
                  handleLogout();
                  toast.success("Redirecting to login...");
                }}
                className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all"
              >
                Login to Save Progress
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // --- ACTIVE TEST SCREEN ---
  const currentQ = activeTest!.questions[currentIdx];
  const progress = ((currentIdx + 1) / QUESTIONS_PER_TEST) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 flex flex-col">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-gray-800 px-6 flex justify-between items-center bg-gray-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to leave? Your progress will be saved.')) {
                setActiveTestId(null);
              }
            }}
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
          {user?.guest && (
            <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
              Guest Mode
            </div>
          )}
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to submit the test?')) {
                finalizeTest();
              }
            }}
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
                    onClick={() => {
                      setAnswers({...answers, [currentQ.id]: i});
                      if (user && !user.guest) {
                        recordQuestionAnswer(currentQ.id, i);
                      }
                    }}
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
                  onClick={() => {
                    const newFlagged = flagged.includes(currentQ.id) 
                      ? flagged.filter(f => f !== currentQ.id) 
                      : [...flagged, currentQ.id];
                    setFlagged(newFlagged);
                    
                    if (user && !user.guest) {
                      if (!flagged.includes(currentQ.id)) {
                        recordQuestionFlag(currentQ.id);
                      }
                    }
                  }}
                  className={`p-3 rounded-xl ${
                    flagged.includes(currentQ.id) 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Flag size={18} />
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to reset the test? All progress will be lost.')) {
                      resetTest();
                    }
                  }}
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