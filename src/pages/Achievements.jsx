import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Award,
  Zap,
  TrendingUp,
  Medal,
  Crown,
  Sparkles,
  Gem,
  Shield,
  Sword,
  Clock,
  Calendar,
  Filter,
  Search,
  ChevronRight,
  Home,
  Users,
  PieChart,
  RefreshCw,LogOut
} from "lucide-react";
import  AchievementBadge  from "../components/AchievementBadge"
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [displayName, setDisplayName] = useState("Guest");
  const [stats, setStats] = useState({
    totalPoints: 0,
    totalAchievements: 0,
    unlocked: 0,
    locked: 0
  });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Fetch achievements data
  const fetchAchievements = async (token) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch achievements: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.achievements) {
        const allAchievements = generateAllAchievements();
        const userAchievements = data.achievements;
        
        // Merge user achievements with all achievements
        const mergedAchievements = allAchievements.map(ach => {
          const userAch = userAchievements.find(u => u.name === ach.name);
          return userAch ? { ...ach, ...userAch, unlocked: true } : ach;
        });

        setAchievements(mergedAchievements);
        setFilteredAchievements(mergedAchievements);
        
        // Calculate stats
        const unlockedCount = mergedAchievements.filter(a => a.unlocked).length;
        const totalPoints = mergedAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
        
        setStats({
          totalPoints,
          totalAchievements: mergedAchievements.length,
          unlocked: unlockedCount,
          locked: mergedAchievements.length - unlockedCount
        });
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate all possible achievements
  const generateAllAchievements = () => {
    return [
      {
        type: 'badge',
        name: 'First Steps',
        description: 'Complete your first practice test',
        points: 100,
        icon: 'beginner',
        category: 'participation'
      },
      {
        type: 'streak',
        name: '7-Day Streak',
        description: 'Practice for 7 consecutive days',
        points: 250,
        icon: 'streak',
        category: 'consistency'
      },
      {
        type: 'badge',
        name: 'Quick Learner',
        description: 'Score above 90% on any test',
        points: 200,
        icon: 'highscore',
        category: 'performance'
      },
      {
        type: 'streak',
        name: '30-Day Master',
        description: 'Practice for 30 consecutive days',
        points: 500,
        icon: 'master',
        category: 'consistency'
      },
      {
        type: 'badge',
        name: 'Problem Solver',
        description: 'Solve 50+ coding problems',
        points: 300,
        icon: 'solver',
        category: 'volume'
      },
      {
        type: 'badge',
        name: 'Aptitude Ace',
        description: 'Master all aptitude categories',
        points: 400,
        icon: 'ace',
        category: 'expertise'
      },
      {
        type: 'streak',
        name: 'Weekly Warrior',
        description: 'Complete 5 tests in one week',
        points: 350,
        icon: 'warrior',
        category: 'intensity'
      },
      {
        type: 'badge',
        name: 'Interview Ready',
        description: 'Complete interview preparation module',
        points: 450,
        icon: 'interview',
        category: 'completion'
      },
      {
        type: 'badge',
        name: 'System Architect',
        description: 'Complete system design challenges',
        points: 600,
        icon: 'architect',
        category: 'expertise'
      },
      {
        type: 'streak',
        name: 'Daily Dedication',
        description: 'Practice daily for 14 days',
        points: 400,
        icon: 'dedication',
        category: 'consistency'
      },
      {
        type: 'badge',
        name: 'Perfect Score',
        description: 'Get 100% on any assessment',
        points: 800,
        icon: 'perfect',
        category: 'performance'
      },
      {
        type: 'badge',
        name: 'Community Leader',
        description: 'Help 10+ other users',
        points: 350,
        icon: 'leader',
        category: 'community'
      }
    ];
  };

  // Handle authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setDisplayName(user.displayName || user.email?.split('@')[0] || 'User');
        
        let token = localStorage.getItem('auth_token');
        if (token) {
          setUserToken(token);
          await fetchAchievements(token);
        }
      } else {
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter achievements
  useEffect(() => {
    let filtered = achievements;
    
    // Apply category filter
    if (filter !== 'all') {
      filtered = filtered.filter(ach => ach.category === filter);
    }
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(ach => 
        ach.name.toLowerCase().includes(search.toLowerCase()) ||
        ach.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredAchievements(filtered);
  }, [filter, search, achievements]);

  // Get achievement icon component
  const getAchievementIcon = (iconName) => {
    switch (iconName) {
      case 'streak': return <Flame className="w-6 h-6 text-orange-500" />;
      case 'highscore': return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'master': return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'solver': return <Target className="w-6 h-6 text-blue-500" />;
      case 'ace': return <Award className="w-6 h-6 text-purple-500" />;
      case 'warrior': return <Sword className="w-6 h-6 text-red-500" />;
      case 'interview': return <Users className="w-6 h-6 text-cyan-500" />;
      case 'architect': return <Gem className="w-6 h-6 text-pink-500" />;
      case 'dedication': return <Clock className="w-6 h-6 text-indigo-500" />;
      case 'perfect': return <Sparkles className="w-6 h-6 text-yellow-400" />;
      case 'leader': return <Shield className="w-6 h-6 text-emerald-500" />;
      default: return <Trophy className="w-6 h-6 text-[#00d4aa]" />;
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'consistency': return 'bg-blue-500/20 text-blue-400';
      case 'performance': return 'bg-green-500/20 text-green-400';
      case 'volume': return 'bg-purple-500/20 text-purple-400';
      case 'expertise': return 'bg-yellow-500/20 text-yellow-400';
      case 'participation': return 'bg-cyan-500/20 text-cyan-400';
      case 'intensity': return 'bg-red-500/20 text-red-400';
      case 'completion': return 'bg-pink-500/20 text-pink-400';
      case 'community': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (userToken) {
      await fetchAchievements(userToken);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
            title="Back to Dashboard"
          >
            <Home className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="gradient-text">Achievements</span>
            </h1>
            <p className="text-gray-400 mt-1">Earn badges and track your progress</p>
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
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-[#00d4aa]/20"
            style={{ background: "linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)" }}
          >
            <Zap className="w-5 h-5" /> Dashboard
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/20 text-green-400">
              {stats.unlocked}/{stats.totalAchievements}
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.totalPoints}</h3>
          <p className="text-sm text-gray-400">Total Points</p>
        </div>

        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-6 h-6 text-[#00d4aa]" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-400">
              {Math.round((stats.unlocked / stats.totalAchievements) * 100)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.unlocked}</h3>
          <p className="text-sm text-gray-400">Unlocked</p>
        </div>

        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-6 h-6 text-orange-500" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-purple-500/20 text-purple-400">
              {stats.locked} remaining
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.locked}</h3>
          <p className="text-sm text-gray-400">Locked</p>
        </div>

        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
              Level {Math.floor(stats.totalPoints / 500) + 1}
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            #{Math.floor(Math.random() * 100) + 1}
          </h3>
          <p className="text-sm text-gray-400">Global Rank</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Collection Progress</span>
          <span className="text-[#00d4aa] font-bold">
            {stats.unlocked} / {stats.totalAchievements}
          </span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(stats.unlocked / stats.totalAchievements) * 100}%` }}
            transition={{ duration: 1 }}
            className="h-full rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8]"
          />
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search achievements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#00d4aa]/50"
              />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === 'all' 
                  ? 'bg-[#00d4aa] text-black' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              All
            </button>
            {['consistency', 'performance', 'volume', 'expertise', 'participation', 'intensity', 'completion', 'community'].map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === category 
                    ? getCategoryColor(category).replace('bg-', 'bg-').replace('text-', 'text-')
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass rounded-2xl p-6 border-2 transition-all duration-300 ${
              achievement.unlocked 
                ? 'border-[#00d4aa]/30 hover:border-[#00d4aa]/50' 
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`p-3 rounded-xl ${
                achievement.unlocked 
                  ? 'bg-gradient-to-br from-[#00d4aa] to-[#00b4d8]' 
                  : 'bg-white/10'
              }`}>
                {getAchievementIcon(achievement.icon)}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{achievement.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(achievement.category)}`}>
                      {achievement.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4" />
                      <span className="font-bold">{achievement.points}</span>
                    </div>
                    {achievement.unlocked && (
                      <span className="text-xs text-green-400">Unlocked</span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">
                  {achievement.description}
                </p>
                
                <div className="flex items-center justify-between">
                  {achievement.unlocked ? (
                    <div className="flex items-center gap-2 text-sm text-[#00d4aa]">
                      <Calendar className="w-4 h-4" />
                      <span>Earned recently</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Target className="w-4 h-4" />
                      <span>Locked - Keep going!</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {/* View details */}}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Achievements */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" /> Recent Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements
            .filter(a => a.unlocked)
            .slice(0, 4)
            .map((achievement, index) => (
              <div key={index} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#00b4d8]">
                    {getAchievementIcon(achievement.icon)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{achievement.name}</h4>
                    <p className="text-xs text-gray-400">{achievement.points} pts</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{achievement.description}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;