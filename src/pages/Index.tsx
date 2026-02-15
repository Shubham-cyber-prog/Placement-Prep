import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { RefreshCw } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import {
  Code2,
  Brain,
  Users,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Flame,
  Award,
  ExternalLink,
  Layout,
  Cpu,
  Palette,
  Monitor,
  Rocket,
  Trophy,
  Zap,
  TrendingDown,
  PieChart,
  BarChart3,
  LineChart,
  Calendar,
  Bell,
  Settings,
  LogOut
} from "lucide-react";

// Custom components (add these if you don't have them yet)
const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon, 
  iconColor = "text-[#00d4aa]",
  delay = 0 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass p-6 rounded-2xl"
  >
    <div className="flex items-center justify-between mb-4">
      <Icon className={`w-6 h-6 ${iconColor}`} />
      <span className={`text-xs font-bold px-2 py-1 rounded ${
        changeType === 'positive' ? 'bg-green-500/20 text-green-400' :
        changeType === 'negative' ? 'bg-red-500/20 text-red-400' :
        'bg-yellow-500/20 text-yellow-400'
      }`}>
        {change}
      </span>
    </div>
    <h3 className="text-2xl font-bold mb-1">{value}</h3>
    <p className="text-sm text-gray-400">{title}</p>
  </motion.div>
);

const CategoryCard = ({ title, description, icon: Icon, count, path, gradient }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className="glass p-6 rounded-2xl cursor-pointer hover:border-[#00d4aa]/30 transition-all"
      style={{ background: gradient + '20' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl" style={{ background: gradient }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-bold text-[#00d4aa]">{count}+</span>
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </motion.div>
  );
};

const ProgressRing = ({ progress, label }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4aa" />
            <stop offset="100%" stopColor="#00b4d8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{progress}%</span>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }) => (
  <div className="glass rounded-2xl p-6">
    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
      <Activity className="w-5 h-5 text-[#00d4aa]" /> Recent Activity
    </h3>
    <div className="space-y-4">
      {activities?.slice(0, 3).map((activity, index) => (
        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
          <div className="p-2 rounded-lg bg-[#00d4aa]/10">
            {activity.type === 'test_taken' ? <CheckCircle className="w-4 h-4 text-[#00d4aa]" /> :
             activity.type === 'streak_milestone' ? <Flame className="w-4 h-4 text-orange-500" /> :
             <Award className="w-4 h-4 text-yellow-500" />}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{activity.title}</p>
            <p className="text-xs text-gray-400">{activity.description}</p>
            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UpcomingEvents = ({ events }) => (
  <div className="glass rounded-2xl p-6">
    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
      <Calendar className="w-5 h-5 text-[#00d4aa]" /> Upcoming Events
    </h3>
    <div className="space-y-4">
      {events?.slice(0, 3).map((event, index) => (
        <div key={index} className="p-3 rounded-lg border border-white/10 hover:border-[#00d4aa]/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{event.title}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              event.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
              event.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {event.difficulty}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-2">{event.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{event.time}</span>
            <span>{event.duration} min</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TopicProgress = ({ topics }) => (
  <div className="glass rounded-3xl p-6">
    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-[#00d4aa]" /> Topic Progress
    </h3>
    <div className="space-y-4">
      {topics?.map((topic, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{topic.name}</span>
            <span className="font-bold">{topic.solved}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${topic.solved}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="h-full rounded-full"
              style={{ background: topic.color }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Add the Activity icon
const Activity = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const formatName = (name) => {
  if (!name) return 'Guest';
  
  // Split by spaces and capitalize each word
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
const Index = () => {
  const [displayName, setDisplayName] = useState("Guest");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Fetch dashboard data
  // Fetch dashboard data
const fetchDashboardData = async (token) => {
  try {
    setLoading(true);
    setError(null);

    if (!token) {
      throw new Error('Please login to view dashboard');
    }

    // Fetch dashboard data
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear tokens and redirect
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('jwtToken');
        setUserToken(null);
        navigate('/auth');
        return;
      }
      throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.success) {
      setDashboardData(data.data);
      
      // FIX: Set display name from dashboard data if available
      if (data.data.user?.name) {
        const formattedName = formatName(data.data.user.name);
        setDisplayName(formattedName);
        // Also update localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
    } else {
      throw new Error(data.message || 'Failed to load dashboard data');
    }
  } catch (err) {
    setError(err.message);
    console.error('Dashboard fetch error:', err);
  } finally {
    setLoading(false);
  }
};

  // Handle Firebase authentication and get JWT token
  const handleFirebaseAuth = async (firebaseUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUID: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        }),
      });

      if (response.ok) {
        const authData = await response.json();
        const token = authData.data.token;
        const user = authData.data.user;
        
        // Store token and user info
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUserToken(token);
        setDisplayName(user.name);
        return token;
      } else {
        throw new Error('Failed to authenticate with backend');
      }
    } catch (error) {
      console.error('Firebase auth error:', error);
      throw error;
    }
  };

  // Handle user authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Try to get existing token
          let token = localStorage.getItem('auth_token');
          
          if (!token) {
            // Get new token from Firebase
            token = await handleFirebaseAuth(user);
          }
          
          if (token) {
            setUserToken(token);
            await fetchDashboardData(token);
          }
        } catch (error) {
          console.error('Auth error:', error);
          setError(error.message);
          setLoading(false);
        }
      } else {
        // User not logged in
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('jwtToken');
        setUserToken(null);
        setDashboardData(null);
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, []);

  // Record activity
  const recordActivity = async (type, title, description, metadata = {}) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      await fetch(`${API_BASE_URL}/api/dashboard/activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          title,
          description,
          metadata
        }),
      });
    } catch (error) {
      console.error('Failed to record activity:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('jwtToken');
      setUserToken(null);
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Refresh dashboard
  const handleRefresh = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchDashboardData(token);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-3xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-[#00d4aa] text-black rounded-xl font-bold hover:bg-[#00d4aa]/80 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">No dashboard data available</p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-4 px-6 py-3 bg-[#00d4aa] text-black rounded-xl font-bold hover:bg-[#00d4aa]/80 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const { user, stats, categoryPerformance, skillLevels, recentActivities, upcomingEvents, recommendations, platformStats, leaderboard } = dashboardData;

  // Preparation categories
  const categories = [
    {
      title: "DSA Practice",
      description: "Master Data Structures and Algorithms with 500+ coding problems",
      icon: Code2,
      count: 500,
      path: "/dsa",
      gradient: "linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)",
    },
    {
      title: "Aptitude",
      description: "Quantitative, Logical Reasoning & Verbal Ability questions",
      icon: Brain,
      count: 300,
      path: "/aptitude",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
    },
    {
      title: "Interview Prep",
      description: "HR, Technical & Behavioral interview questions bank",
      icon: Users,
      count: 200,
      path: "/interview",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
    },
    {
      title: "System Design",
      description: "Learn to design scalable systems for senior roles",
      icon: Lightbulb,
      count: 50,
      path: "/system-design",
      gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    },
  ];

  // Format topic progress from skill levels
  const topicProgress = skillLevels?.map(skill => ({
    name: skill.skill,
    solved: Math.floor(skill.progress / 10) * 10,
    total: 100,
    color: skill.progress > 70 ? "#00d4aa" : skill.progress > 40 ? "#f59e0b" : "#ec4899"
  })) || [];

  return (
    <div className="space-y-8 pb-12 p-6">
      {/* Header with User Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
              <span className="font-bold text-lg text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Welcome back, <span className="gradient-text">{displayName}!</span>
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00d4aa]" /> 
                {stats?.consistencyScore > 70 ? "Excellent consistency! 🔥" : 
                 stats?.consistencyScore > 40 ? "Good progress! 💪" : 
                 "Let's get started! 🚀"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/progress")}
            className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-[#00d4aa]/20"
            style={{ background: "linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)" }}
          >
            <Flame className="w-5 h-5" /> Start Practice
          </motion.button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Tests Taken" 
          value={stats?.testsTaken || 0} 
          change={stats?.testsTaken > 0 ? `+${Math.floor(stats.testsTaken/2)} this week` : "Start your first test!"}
          changeType="positive"
          icon={BarChart3}
          iconColor="text-blue-500"
          delay={0.1}
        />
        <StatCard 
          title="Average Score" 
          value={`${stats?.averageScore || 0}%`} 
          change={stats?.averageScore > 70 ? "Excellent!" : stats?.averageScore > 50 ? "Good!" : "Room to improve"}
          changeType={stats?.averageScore > 70 ? "positive" : "neutral"}
          icon={TrendingUp}
          iconColor={stats?.averageScore > 70 ? "text-green-500" : "text-yellow-500"}
          delay={0.15}
        />
        <StatCard 
          title="Current Streak" 
          value={`${stats?.currentStreak || 0} days`} 
          change={stats?.currentStreak > 7 ? "On fire! 🔥" : "Keep going!"}
          changeType="positive"
          icon={Flame}
          iconColor="text-orange-500"
          delay={0.2}
        />
        <StatCard 
          title="Global Rank" 
          value={`#${stats?.globalRank || "N/A"}`} 
          change={stats?.percentile ? `Top ${stats.percentile}%` : "Not ranked yet"}
          changeType="neutral"
          icon={Trophy}
          iconColor="text-yellow-500"
          delay={0.25}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Preparation Tracks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Preparation Tracks</h2>
              <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded border border-white/10">
                {platformStats?.activeToday || 0} active today
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <CategoryCard key={i} {...cat} />
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#00d4aa]" /> Category Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(categoryPerformance || []).map((category, index) => (
                <motion.div
                  key={category.name || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">{category.name}</span>
                    <span className="text-sm font-bold text-[#00d4aa]">{category.accuracy}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{category.questionsAttempted} questions</span>
                    <span>{category.correctAnswers} correct</span>
                  </div>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.accuracy}%` }}
                      transition={{ duration: 1, delay: 0.2 * index }}
                      className="h-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Topic Progress */}
          <TopicProgress topics={topicProgress} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Skill Levels */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#00d4aa]" /> Skill Levels
            </h3>
            <div className="space-y-5">
              {(skillLevels || []).map((skill, index) => (
                <div key={skill.skill || index}>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span>{skill.skill}</span>
                    <span className="text-[#00d4aa]">Level {skill.level}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.progress}%` }}
                      transition={{ duration: 1, delay: 0.1 * index }}
                      className="h-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8]"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{skill.nextMilestone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Progress */}
          <div className="glass rounded-2xl p-6 flex flex-col items-center">
            <h3 className="text-lg font-bold text-foreground mb-4">Mastery Progress</h3>
            <ProgressRing progress={stats?.consistencyScore || 0} label="Consistency" />
            <div className="grid grid-cols-2 w-full gap-4 mt-6">
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase font-black text-gray-400">Solved</p>
                <p className="text-lg font-bold text-[#00d4aa]">{stats?.questionsSolved || 0}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase font-black text-gray-400">Accuracy</p>
                <p className="text-lg font-bold text-green-400">{stats?.averageScore || 0}%</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity activities={recentActivities} />

          {/* Upcoming Events */}
          <UpcomingEvents events={upcomingEvents} />
        </div>
      </div>

      {/* Platform Stats & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Platform Stats */}
        <div className="glass rounded-3xl p-6">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00d4aa]" /> Platform Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold">{platformStats?.totalUsers?.toLocaleString() || "0"}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-sm text-gray-400">Tests Taken</p>
              <p className="text-2xl font-bold">{platformStats?.totalTests?.toLocaleString() || "0"}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-sm text-gray-400">Active Today</p>
              <p className="text-2xl font-bold">{platformStats?.activeToday?.toLocaleString() || "0"}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-sm text-gray-400">Questions Solved</p>
              <p className="text-2xl font-bold">{platformStats?.questionsSolved?.toLocaleString() || "0"}</p>
            </div>
          </div>
        </div>

        {/* Quick Leaderboard */}
        <div className="glass rounded-3xl p-6">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Top Performers
          </h3>
          {(leaderboard?.rankings || []).slice(0, 5).map((user, index) => (
            <div key={user.userId || index} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                  index === 1 ? 'bg-gray-400/20 text-gray-400' :
                  index === 2 ? 'bg-orange-500/20 text-orange-500' :
                  'bg-blue-500/20 text-blue-500'
                }`}>
                  {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.stats?.testsTaken || 0} tests</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#00d4aa]">{user.score}</p>
                <p className="text-xs text-gray-400">{user.stats?.averageScore || 0}% avg</p>
              </div>
            </div>
          ))}
          <button
            onClick={() => navigate('/leaderboard')}
            className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-all"
          >
            View Full Leaderboard →
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="glass rounded-3xl p-6 mt-8">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" /> Recommendations For You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-[#00d4aa]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rec.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                    rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {rec.priority}
                  </span>
                  <span className="text-xs text-gray-400">{rec.estimatedTime} min</span>
                </div>
                <h4 className="font-semibold mb-2">{rec.title}</h4>
                <p className="text-sm text-gray-400 mb-4">{rec.description}</p>
                <button
                  onClick={() => rec.actionUrl && navigate(rec.actionUrl)}
                  className="text-sm text-[#00d4aa] hover:text-[#00d4aa]/80 flex items-center gap-1"
                >
                  Take action <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;