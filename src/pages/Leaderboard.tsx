import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  Trophy,
  Medal,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Star,
  Flame,
  Code2,
  Brain,
  MessageSquare,
  Crown,
  BarChart3,
  PieChart,
  LogOut,
  Home,
  Target,
  TrendingUp,
  Clock,
  Zap,
  BookOpen,
  CheckCircle
} from "lucide-react";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [displayName, setDisplayName] = useState("Guest");
  const [selectedType, setSelectedType] = useState('overall');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [showUserStats, setShowUserStats] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Leaderboard types
  const leaderboardTypes = [
    { id: 'overall', label: 'Overall', icon: Trophy, color: 'text-yellow-500', description: 'Top problem solvers' },
    { id: 'weekly', label: 'Weekly Streak', icon: Flame, color: 'text-orange-500', description: 'Longest active streaks' },
    { id: 'monthly', label: 'Monthly Points', icon: Star, color: 'text-purple-500', description: 'Most problems this month' },
    { id: 'dsa', label: 'DSA Masters', icon: Code2, color: 'text-[#00d4aa]', description: 'Top DSA performers' },
    { id: 'aptitude', label: 'Aptitude Pros', icon: Brain, color: 'text-blue-500', description: 'Aptitude experts' },
    { id: 'interview', label: 'Interview Experts', icon: MessageSquare, color: 'text-pink-500', description: 'Interview preparation' },
  ];

  // Time frames
  const timeFrames = [
    { id: 'all', label: 'All Time' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
  ];

  // Fetch leaderboard data
  const fetchLeaderboardData = async (token) => {
    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/api/leaderboard?type=${selectedType}&timeFrame=${selectedTimeFrame}&page=${currentPage}`;
      console.log('Fetching:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      console.log('Leaderboard data:', data);
      
      if (data.success) {
        setLeaderboardData(data.data);
      } else {
        setError(data.message || 'Failed to load leaderboard');
      }
    } catch (err) {
      setError(err.message);
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async (userId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/leaderboard/user/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserStats(data.data);
          setSelectedUser(userId);
          setShowUserStats(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Handle authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = localStorage.getItem('auth_token');
        if (token) {
          setUserToken(token);
          setDisplayName(user.displayName || user.email?.split('@')[0] || 'User');
          await fetchLeaderboardData(token);
        } else {
          navigate('/auth');
        }
      } else {
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (userToken) {
      fetchLeaderboardData(userToken);
    }
  }, [selectedType, selectedTimeFrame, currentPage]);

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

  // Filter rankings based on search
  const filteredRankings = leaderboardData?.rankings?.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get rank medal
  const getRankMedal = (index) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-sm font-mono text-gray-500">#{index + 1}</span>;
    }
  };

  // Get rank color
  const getRankColor = (index) => {
    switch (index) {
      case 0: return 'bg-yellow-500/20 border-yellow-500/50';
      case 1: return 'bg-gray-400/20 border-gray-400/50';
      case 2: return 'bg-amber-600/20 border-amber-600/50';
      default: return 'bg-white/5 border-white/10';
    }
  };

  // Get display value based on leaderboard type
  const getDisplayValue = (user, type) => {
    switch (type) {
      case 'weekly':
        return user.currentStreak || 0;
      case 'monthly':
        return user.monthlySolved || user.monthlyPoints || 0;
      case 'dsa':
      case 'aptitude':
      case 'interview':
        return user.categoryScore || user.categoryLevel * 100 || 0;
      default:
        return user.problemsSolved || 0;
    }
  };

  // Get display label based on leaderboard type
  const getDisplayLabel = (type) => {
    switch (type) {
      case 'weekly':
        return 'day streak';
      case 'monthly':
        return 'problems this month';
      case 'dsa':
      case 'aptitude':
      case 'interview':
        return 'skill score';
      default:
        return 'problems solved';
    }
  };

  // Get secondary value
  const getSecondaryValue = (user, type) => {
    switch (type) {
      case 'weekly':
        return `${user.longestStreak || 0} max`;
      case 'monthly':
        return `${user.problemsSolved || 0} total`;
      case 'dsa':
      case 'aptitude':
      case 'interview':
        return `Level ${user.categoryLevel || 1}`;
      default:
        return `${user.averageAccuracy?.toFixed(1) || 0}% acc`;
    }
  };

  if (loading && !leaderboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Leaderboard
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00d4aa]" />
                {leaderboardData?.totalParticipants || 0} active participants
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchLeaderboardData(userToken)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Type Selector */}
          <div className="flex flex-wrap gap-2">
            {leaderboardTypes.map((type) => {
              const Icon = type.icon;
              return (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedType(type.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 relative group ${
                    selectedType === type.id
                      ? 'bg-[#00d4aa] text-black'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400'
                  }`}
                  title={type.description}
                >
                  <Icon className={`w-4 h-4 ${selectedType === type.id ? 'text-black' : type.color}`} />
                  {type.label}
                  {selectedType === type.id && (
                    <motion.div
                      layoutId="activeType"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Time Frame Selector */}
          <div className="flex gap-2">
            {timeFrames.map((frame) => (
              <motion.button
                key={frame.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedTimeFrame(frame.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  selectedTimeFrame === frame.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400'
                }`}
              >
                {frame.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search participants by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#00d4aa] focus:outline-none transition-all"
          />
        </div>
      </motion.div>

      {/* Main Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/10 bg-white/5 font-medium text-sm text-gray-400">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Participant</div>
          <div className="col-span-2 text-center">Score</div>
          <div className="col-span-2 text-center">Progress</div>
          <div className="col-span-2 text-center">Streak</div>
        </div>

        {/* Rankings */}
        <div className="divide-y divide-white/10">
          <AnimatePresence mode="wait">
            {filteredRankings && filteredRankings.length > 0 ? (
              filteredRankings.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => fetchUserStats(user._id)}
                  className={`grid grid-cols-12 gap-4 p-6 hover:bg-white/5 transition-all cursor-pointer border-l-4 ${getRankColor(index)}`}
                >
                  <div className="col-span-1 flex items-center">
                    {getRankMedal(index)}
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="font-bold text-white">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-gray-400">
                        Level {user.level || 1} • {user.badges?.length || 0} badges
                      </p>
                    </div>
                    {user._id === auth.currentUser?.uid && (
                      <span className="px-2 py-1 text-xs bg-[#00d4aa]/20 text-[#00d4aa] rounded-full flex-shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    <p className="text-lg font-bold text-[#00d4aa]">
                      {getDisplayValue(user, selectedType)}
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      {getDisplayLabel(selectedType)}
                    </p>
                  </div>
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    <p className="font-medium">{user.problemsSolved || 0}</p>
                    <p className="text-xs text-gray-400">total solved</p>
                    <p className="text-xs text-gray-500 mt-1">{getSecondaryValue(user, selectedType)}</p>
                  </div>
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1">
                      <Flame className={`w-4 h-4 ${user.currentStreak > 0 ? 'text-orange-500' : 'text-gray-600'}`} />
                      <p className="font-medium">{user.currentStreak || 0}</p>
                    </div>
                    <p className="text-xs text-gray-400">days</p>
                    {user.longestStreak > 0 && (
                      <p className="text-xs text-gray-500">Best: {user.longestStreak}</p>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No rankings available for this category</p>
                <p className="text-sm text-gray-500 mt-2">Be the first to start solving problems!</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* User's Rank (if not in top list) */}
        {leaderboardData?.userRank && leaderboardData.userRank.rank > 20 && (
          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
                  <span className="font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-xs text-gray-400">Your Rank</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#00d4aa]">#{leaderboardData.userRank.rank}</p>
                  <p className="text-xs text-gray-400">of {leaderboardData.userRank.total}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{leaderboardData.userRank.percentile}%</p>
                  <p className="text-xs text-gray-400">percentile</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {leaderboardData?.totalPages > 1 && (
          <div className="p-6 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page {currentPage} of {leaderboardData?.totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(leaderboardData?.totalPages || 1, prev + 1))}
              disabled={currentPage === (leaderboardData?.totalPages || 1)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>

      {/* User Stats Modal */}
      <AnimatePresence>
        {showUserStats && userStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowUserStats(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center text-2xl font-bold">
                      {userStats.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{userStats.user.name}</h2>
                      <p className="text-gray-400">Level {userStats.user.level || 1}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUserStats(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-400">Problems Solved</p>
                    <p className="text-2xl font-bold text-[#00d4aa]">{userStats.stats.problemsSolved}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-400">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-500">{userStats.stats.currentStreak} days</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-400">Total Score</p>
                    <p className="text-2xl font-bold">{userStats.stats.totalScore}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-400">Accuracy</p>
                    <p className="text-2xl font-bold">{userStats.stats.averageAccuracy?.toFixed(1) || 0}%</p>
                  </div>
                </div>

                {/* Rank Information */}
                {userStats.stats.rank && userStats.stats.rank.rank !== 'N/A' && (
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Global Rank</p>
                        <p className="text-3xl font-bold text-yellow-500">#{userStats.stats.rank.rank}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Percentile</p>
                        <p className="text-2xl font-bold text-[#00d4aa]">{userStats.stats.rank.percentile}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Performance */}
                {userStats.stats.categoryPerformance?.length > 0 && (
                  <>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-[#00d4aa]" />
                      Category Performance
                    </h3>
                    <div className="space-y-4 mb-6">
                      {userStats.stats.categoryPerformance.map((cat, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5">
                          <div className="flex justify-between mb-2">
                            <span>{cat.category}</span>
                            <span className="text-[#00d4aa]">{cat.problemsSolved} solved</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Avg Difficulty: {cat.averageDifficulty?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Skill Levels */}
                {userStats.stats.skillLevels?.length > 0 && (
                  <>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#00d4aa]" />
                      Skill Levels
                    </h3>
                    <div className="space-y-3">
                      {userStats.stats.skillLevels.map((skill, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{skill.category || 'General'}</span>
                            <span className="text-[#00d4aa]">Level {skill.level || 1}</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.progress || 0}%` }}
                              className="h-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Badges */}
                {userStats.stats.badges?.length > 0 && (
                  <>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 mt-6">
                      <Award className="w-4 h-4 text-yellow-500" />
                      Badges & Achievements
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userStats.stats.badges.map((badge, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-sm"
                        >
                          {badge}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;