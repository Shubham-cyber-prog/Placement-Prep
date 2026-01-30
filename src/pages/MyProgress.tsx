"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Award, Clock, CheckCircle2, Target, BarChart3, 
  Calendar, ChevronRight, Zap, Brain, ShieldCheck, Terminal,
  Trophy, Star, Activity, ArrowUpRight, Download, Info,
  History as HistoryIcon, RefreshCcw, Layout, BookOpen,
  Users, Plus, Sparkles, Flame, Gauge, Lightbulb, TrendingDown,
  Timer, Rocket, AlertTriangle, Loader2, User, LogOut, X
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

// API Service
const API_BASE_URL = "http://localhost:5000/api";

// Define types
type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

type ProgressData = {
  userId: string;
  overview: {
    consistency: { days: number; percentage: number; message: string };
    avgAccuracy: { value: string; trend: number; message: string };
    estimatedReadiness: { level: number; maxLevel: number; message: string };
  };
  skillProficiency: Array<{
    label: string;
    val: number;
    col: string;
    info: string;
  }>;
  testHistory: Array<{
    id: string;
    testName: string;
    date: string;
    score: number;
    total: number;
    category: string;
    accuracy: number;
    duration: string;
    difficulty: string;
  }>;
  insights: {
    performanceVelocity: {
      avgResponseTime: number;
      trend: string;
      analysis: string;
    };
    focusAreas: string[];
    careerProjection: {
      productCompanies: { matchPercentage: number; readinessLevel: number; estimatedMonths: number };
      earlyStartups: { matchPercentage: number; readinessLevel: number; estimatedMonths: number };
      quantTrading: { matchPercentage: number; readinessLevel: number; estimatedMonths: number };
    };
  };
  achievements: Array<{
    id: string;
    title: string;
    desc: string;
    icon: string;
    unlocked: boolean;
    color: string;
    progress: number;
    totalRequired: number;
  }>;
  analytics: {
    totalQuestions: number;
    totalTests: number;
    consistencyScore: number;
    estimatedMonths: number;
    studyCalendar: Array<{
      date: string;
      active: boolean;
      intensity: number;
    }>;
  };
};

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Fetch with authentication
const fetchWithAuth = async (url: string, options: FetchOptions = {}): Promise<any> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    };
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Valid skill names and difficulties based on your backend validation
const VALID_SKILLS = [
  'Data Structures',
  'Algorithms',
  'System Design',
  'Frontend',
  'Backend',
  'Databases',
  'OOP',
  'Networking',
  'Security',
  'Testing'
];

const VALID_CATEGORIES = [
  'Technical',
  'Behavioral',
  'Coding',
  'System Design',
  'Data Structures',
  'Algorithms'
];

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// UI Components
const glassStyle = "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl";

const LocalBadge = ({ children, color = "bg-[#00d4aa]" }: { children: React.ReactNode, color?: string }) => (
  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${color} text-black`}>
    {children}
  </span>
);

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  message, 
  color = "text-[#00d4aa]" 
}: { 
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down';
  message: string;
  color?: string;
}) => (
  <div className={`p-8 rounded-[2.5rem] ${glassStyle} relative overflow-hidden group`}>
    <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 ${color}/10 group-hover:scale-125 transition-transform`} />
    <p className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">{title}</p>
    <h4 className="text-3xl font-black italic">{value}</h4>
    <p className="text-[9px] font-bold mt-2 flex items-center gap-1">
      {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {message}
    </p>
  </div>
);

// Test Recording Modal Component
const TestRecordingModal = ({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (testData: any) => void;
}) => {
  const [formData, setFormData] = useState({
    testName: '',
    category: 'Technical',
    score: 7,
    totalScore: 10,
    accuracy: 70,
    duration: 15,
    difficulty: 'Medium',
    topics: ['Data Structures'],
    timePerQuestion: 120,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'topics') {
      setFormData(prev => ({
        ...prev,
        topics: value.split(',').map(topic => topic.trim()).filter(topic => topic)
      }));
    } else if (name === 'score' || name === 'totalScore' || name === 'accuracy' || name === 'duration' || name === 'timePerQuestion') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-[#0a0a0a] rounded-3xl ${glassStyle} w-full max-w-md`}
      >
        <div className="p-8 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-[#00d4aa]">Record New Test</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">Enter test details to update your progress</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Test Name</label>
              <input
                type="text"
                name="testName"
                value={formData.testName}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                placeholder="e.g., Data Structures Practice"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                >
                  {VALID_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                >
                  {VALID_DIFFICULTIES.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Score</label>
                <input
                  type="number"
                  name="score"
                  min="0"
                  value={formData.score}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Total Score</label>
                <input
                  type="number"
                  name="totalScore"
                  min="1"
                  value={formData.totalScore}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Accuracy (%)</label>
                <input
                  type="number"
                  name="accuracy"
                  min="0"
                  max="100"
                  value={formData.accuracy}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Duration (min)</label>
                <input
                  type="number"
                  name="duration"
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Topics (comma separated)</label>
              <input
                type="text"
                name="topics"
                value={formData.topics.join(', ')}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                placeholder="e.g., Data Structures, Algorithms"
              />
              <p className="text-xs text-gray-500 mt-2">Use valid skill names: {VALID_SKILLS.slice(0, 5).join(', ')}...</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Time per Question (sec)</label>
              <input
                type="number"
                name="timePerQuestion"
                min="1"
                value={formData.timePerQuestion}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#00d4aa] text-black rounded-xl text-sm font-bold hover:bg-[#00d4aa]/80 transition-colors"
            >
              Record Test
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal,
  Calendar,
  ShieldCheck,
  Trophy,
  Award,
  Star,
  Zap,
  Brain,
  Target,
  CheckCircle2,
  Flame,
  Rocket,
};

export default function MyProgress() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'insights'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [recordingTest, setRecordingTest] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      console.log('No auth token found, redirecting to login');
      navigate('/auth');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      setUserInfo(user);
      fetchProgressData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/auth');
    }
  }, [navigate]);

  const fetchProgressData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchWithAuth('/progress');
      
      if (result.success && result.data) {
        setProgressData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch progress data');
      }
    } catch (err: any) {
      console.error('Error fetching progress:', err);
      setError(err.message || 'Failed to load progress data');
      
      if (err.message.includes('Unauthorized')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/auth'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecordTest = async (testData: any): Promise<void> => {
    try {
      setRecordingTest(true);
      
      // Clean up topics - ensure they are valid skill names
      const cleanedTopics = testData.topics
        .map((topic: string) => {
          // Try to match with valid skills
          const matchedSkill = VALID_SKILLS.find(skill => 
            skill.toLowerCase().includes(topic.toLowerCase()) || 
            topic.toLowerCase().includes(skill.toLowerCase())
          );
          return matchedSkill || 'Data Structures'; // Default fallback
        })
        .filter((topic: string, index: number, arr: string[]) => arr.indexOf(topic) === index); // Remove duplicates

      const formattedTestData = {
        ...testData,
        topics: cleanedTopics,
        // Ensure difficulty is exactly one of the valid enum values
        difficulty: VALID_DIFFICULTIES.includes(testData.difficulty) 
          ? testData.difficulty 
          : 'Medium'
      };

      console.log('Submitting test data:', formattedTestData);

      const result = await fetchWithAuth('/progress/test', {
        method: 'POST',
        body: JSON.stringify(formattedTestData)
      });

      if (result.success) {
        alert('✅ Test recorded successfully!');
        setShowRecordModal(false);
        await fetchProgressData();
      } else {
        throw new Error(result.message || 'Failed to record test');
      }
    } catch (err: any) {
      console.error('Error recording test:', err);
      alert(`❌ Failed to record test: ${err.message}`);
    } finally {
      setRecordingTest(false);
    }
  };

  const handleUpdateSkill = async (skillName: string, proficiency: number): Promise<void> => {
    try {
      // Ensure skill name is valid
      const validSkillName = VALID_SKILLS.includes(skillName) ? skillName : 'Data Structures';
      
      const result = await fetchWithAuth('/progress/skill', {
        method: 'PUT',
        body: JSON.stringify({ skillName: validSkillName, proficiency })
      });

      if (result.success) {
        alert('✅ Skill updated successfully!');
        await fetchProgressData();
      }
    } catch (err) {
      console.error('Error updating skill:', err);
      alert('Failed to update skill');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleRefresh = () => {
    fetchProgressData();
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-10 h-10 text-[#00d4aa] animate-spin mb-4" />
        <p className="text-[#00d4aa] font-black uppercase tracking-[0.3em] text-xs">
          Loading Progress Dashboard...
        </p>
      </div>
    );
  }

  if (error && !progressData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a]">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-500 text-lg mb-2">Error Loading Progress</p>
        <p className="text-gray-400 text-sm mb-6 max-w-md text-center">{error}</p>
        <button
          onClick={fetchProgressData}
          className="px-6 py-3 bg-[#00d4aa] text-black font-bold rounded-lg hover:bg-[#00d4aa]/80 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a]">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
        <p className="text-yellow-500 text-lg mb-2">No Progress Data</p>
        <button
          onClick={() => navigate('/auth')}
          className="px-6 py-3 bg-[#00d4aa] text-black font-bold rounded-lg hover:bg-[#00d4aa]/80 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const { overview, skillProficiency, testHistory, insights, achievements, analytics } = progressData;

  return (
    <>
      <TestRecordingModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        onSubmit={handleRecordTest}
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10 font-sans selection:bg-[#00d4aa] selection:text-black">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* HEADER SECTION */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00d4aa]/10 rounded-lg border border-[#00d4aa]/20">
                  <Gauge className="w-6 h-6 text-[#00d4aa]" />
                </div>
                <div>
                  <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                    My <span className="text-[#00d4aa]">Progress</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-[#00d4aa] flex items-center justify-center">
                      <User className="w-3 h-3 text-black" />
                    </div>
                    <span className="text-sm text-gray-400">{userInfo?.name || 'User'}</span>
                    <span className="text-xs text-gray-600 bg-white/5 px-2 py-1 rounded">
                      {analytics.totalTests} tests taken
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-[#00d4aa]" /> 
                Real-time tracking of your placement preparation
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                title="Refresh Data"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <div className={`flex p-1 rounded-2xl ${glassStyle}`}>
                {(['overview', 'history', 'insights'] as const).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    disabled={loading}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                      activeTab === tab 
                        ? 'bg-[#00d4aa] text-black shadow-lg shadow-[#00d4aa]/20' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowRecordModal(true)}
                disabled={recordingTest || loading}
                className="px-6 py-3 bg-[#00d4aa] text-black text-sm font-bold rounded-lg hover:bg-[#00d4aa]/80 transition-colors flex items-center gap-2"
              >
                {recordingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Record Test
                  </>
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* MAIN CONTENT */}
            <div className="lg:col-span-8 space-y-10">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div key="ov" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <StatCard title="Consistency" value={`${overview.consistency.days} Days`} icon={Flame} trend="up" message={overview.consistency.message} />
                      <StatCard title="Avg. Accuracy" value={`${overview.avgAccuracy.value}%`} icon={Star} trend="up" message={overview.avgAccuracy.message} />
                      <StatCard title="Est. Readiness" value={`Lvl ${overview.estimatedReadiness.level}`} icon={Clock} trend="up" message={overview.estimatedReadiness.message} />
                    </div>

                    <section className={`p-10 rounded-[3rem] ${glassStyle}`}>
                      <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                          <Brain className="w-4 h-4 text-[#00d4aa]" /> Skill Proficiency
                        </h3>
                        <span className="text-[10px] text-gray-500">{skillProficiency.length} skills</span>
                      </div>
                      <div className="space-y-10">
                        {skillProficiency.map((skill) => (
                          <div key={skill.label} className="space-y-3">
                            <div className="flex justify-between text-[10px] font-bold uppercase">
                              <span className="text-gray-300">{skill.label}</span>
                              <span className="text-[#00d4aa] font-black">{skill.val}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${skill.col}`} style={{ width: `${skill.val}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div key="hi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-[2.5rem] ${glassStyle} overflow-hidden`}>
                    <div className="p-8 border-b border-white/5 flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                        <HistoryIcon className="w-4 h-4 text-[#00d4aa]" /> Test History
                      </h3>
                      <span className="text-[10px] text-gray-500">{testHistory.length} tests</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-black/20 text-[9px] font-black uppercase text-gray-500">
                          <tr>
                            <th className="p-8">Test</th>
                            <th className="p-8">Score</th>
                            <th className="p-8">Accuracy</th>
                            <th className="p-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {testHistory.map((test) => (
                            <tr key={test.id} className="border-t border-white/5 hover:bg-white/5">
                              <td className="p-8">
                                <p className="font-bold">{test.testName}</p>
                                <p className="text-[9px] text-gray-500">{test.date} • {test.category}</p>
                              </td>
                              <td className="p-8 font-black text-[#00d4aa]">{test.score}/{test.total}</td>
                              <td className="p-8"><LocalBadge>{test.accuracy}%</LocalBadge></td>
                              <td className="p-8">
                                <button className="p-2 hover:bg-white/5 rounded-lg">
                                  <ArrowUpRight className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'insights' && (
                  <motion.div key="ins" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-8 rounded-[2.5rem] ${glassStyle}`}>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-6">Performance</h3>
                        <p className="text-gray-400">{insights.performanceVelocity.analysis}</p>
                      </div>
                      <div className={`p-8 rounded-[2.5rem] ${glassStyle}`}>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-6">Focus Areas</h3>
                        <ul className="space-y-2">
                          {insights.focusAreas.map((area, i) => (
                            <li key={i} className="text-gray-300">{area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SIDEBAR */}
            <aside className="lg:col-span-4 space-y-10">
              <section className={`p-10 rounded-[3rem] ${glassStyle}`}>
                <h3 className="text-xs font-black uppercase tracking-widest mb-8">Achievements</h3>
                <div className="space-y-6">
                  {achievements.map((ach) => {
                    const Icon = iconMap[ach.icon] || Trophy;
                    return (
                      <div key={ach.id} className={`flex items-center gap-4 ${ach.unlocked ? '' : 'opacity-50'}`}>
                        <Icon className={`w-6 h-6 ${ach.unlocked ? ach.color : 'text-gray-600'}`} />
                        <div>
                          <p className="text-[11px] font-black">{ach.title}</p>
                          <p className="text-[9px] text-gray-500">{ach.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className={`p-10 rounded-[3rem] ${glassStyle}`}>
                <h3 className="text-xs font-black uppercase tracking-widest mb-8">Study Calendar</h3>
                <div className="grid grid-cols-7 gap-2">
                  {analytics.studyCalendar.slice(0, 35).map((day, i) => (
                    <div key={i} className={`aspect-square rounded ${day.active ? 'bg-[#00d4aa]' : 'bg-white/5'}`} />
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}