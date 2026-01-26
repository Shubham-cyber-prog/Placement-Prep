import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Medal, TrendingUp, Users, Target, Zap,
  ChevronUp, ChevronDown, Gift, Flame, Star
} from "lucide-react";

const glassStyle = "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl";

interface UserRank {
  rank: number;
  userId: string;
  name: string;
  email: string;
  score: number;
  problemsSolved: number;
  problemsByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface CurrentUserData {
  score: number;
  problemsSolved: number;
  rank: number;
  totalUsers: number;
  percentile: string;
}

interface RankingData {
  type: 'weekly' | 'monthly';
  currentUser: CurrentUserData;
  nearbyUsers: UserRank[];
  problemsByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

const getRankMedal = (rank: number) => {
  if (rank === 1) return { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
  if (rank === 2) return { icon: Medal, color: 'text-gray-300', bg: 'bg-gray-500/10' };
  if (rank === 3) return { icon: Medal, color: 'text-orange-600', bg: 'bg-orange-500/10' };
  return { icon: null, color: 'text-blue-400', bg: 'bg-blue-500/10' };
};

const LocalBadge = ({ children, color = "bg-[#00d4aa]" }: { children: React.ReactNode, color?: string }) => (
  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${color} text-black`}>
    {children}
  </span>
);

export const RankingTab: React.FC = () => {
  const [rankingType, setRankingType] = useState<'weekly' | 'monthly'>('weekly');
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankingData();
  }, [rankingType]);

  const fetchRankingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Get or create JWT token from Firebase
      let token = localStorage.getItem('jwtToken');

      if (!token) {
        // Try to get Firebase auth token and exchange for JWT
        try {
          const { auth } = await import('../pages/firebase');
          const currentUser = auth.currentUser;
          
          if (!currentUser) {
            throw new Error('No Firebase user logged in');
          }

          // Call backend to exchange Firebase token for JWT
          const firebaseAuthResponse = await fetch(
            `${API_BASE_URL}/api/auth/firebase`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                firebaseUID: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              }),
            }
          );

          if (!firebaseAuthResponse.ok) {
            const errorData = await firebaseAuthResponse.text();
            console.error('Firebase Auth Response Error:', errorData);
            throw new Error('Failed to authenticate with backend');
          }

          const authData = await firebaseAuthResponse.json();
          token = authData.token;

          // Cache the JWT token
          if (token) {
            localStorage.setItem('jwtToken', token);
          }
        } catch (firebaseErr) {
          console.warn('Firebase token exchange failed:', firebaseErr);
          // Try to use token from localStorage as fallback
          token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Could not obtain authentication token. Please login first.');
          }
        }
      }

      // Fetch user's ranking details
      const detailResponse = await fetch(
        `${API_BASE_URL}/api/rankings/me?type=${rankingType}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Detail Response Status:', detailResponse.status);

      if (!detailResponse.ok) {
        const errorData = await detailResponse.text();
        console.error('Detail Response Error:', errorData);
        throw new Error(`Failed to fetch ranking data: ${detailResponse.statusText}`);
      }

      const detailData: RankingData = await detailResponse.json();
      setRankingData(detailData);

      // Fetch full leaderboard
      const leaderboardResponse = await fetch(
        `${API_BASE_URL}/api/rankings?type=${rankingType}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Leaderboard Response Status:', leaderboardResponse.status);

      if (!leaderboardResponse.ok) {
        const errorData = await leaderboardResponse.text();
        console.error('Leaderboard Response Error:', errorData);
        throw new Error(`Failed to fetch leaderboard: ${leaderboardResponse.statusText}`);
      }

      const leaderboardData = await leaderboardResponse.json();
      setLeaderboard(leaderboardData.rankings || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching ranking data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-[#00d4aa] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading rankings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 rounded-[2.5rem] ${glassStyle} border-l-4 border-l-red-500`}>
        <h3 className="text-sm font-bold text-red-400 mb-4">Error Loading Rankings</h3>
        <p className="text-red-300 text-sm mb-4">{error}</p>
        <details className="text-xs text-gray-400 cursor-pointer">
          <summary className="font-bold mb-2">Troubleshooting Steps</summary>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>✅ Make sure you are logged in</li>
            <li>✅ Check that backend server is running (port 5000)</li>
            <li>✅ Verify VITE_BACKEND_URL is set in .env.local</li>
            <li>✅ Open browser DevTools (F12) → Console tab to see detailed errors</li>
            <li>✅ Check Network tab to see API requests and responses</li>
            <li>✅ Ensure database connection is working</li>
          </ul>
        </details>
        <button
          onClick={() => fetchRankingData()}
          className="mt-6 px-4 py-2 bg-[#00d4aa] text-black rounded-lg font-bold text-xs hover:bg-[#00d4aa]/80 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!rankingData) {
    return (
      <div className={`p-8 rounded-[2.5rem] ${glassStyle}`}>
        <p className="text-gray-400">No ranking data available</p>
      </div>
    );
  }

  const { currentUser, nearbyUsers, problemsByDifficulty } = rankingData;
  const isTopRanker = currentUser.rank <= 3;

  return (
    <motion.div
      key={rankingType}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Time Period Selector */}
      <div className="flex gap-4">
        {(['weekly', 'monthly'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setRankingType(type)}
            className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
              rankingType === type
                ? 'bg-[#00d4aa] text-black shadow-lg shadow-[#00d4aa]/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {type === 'weekly' ? '📅 This Week' : '📆 This Month'}
          </button>
        ))}
      </div>

      {/* User's Current Rank Card */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`p-10 rounded-[2.5rem] ${glassStyle} relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00d4aa]/10 to-blue-500/10 rounded-full -mr-32 -mt-32" />

        <div className="relative z-10">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">
            <Trophy className="w-4 h-4 text-[#00d4aa] inline mr-2" />
            Your Ranking
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Rank */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rank</p>
              <div className={`text-5xl font-black italic ${isTopRanker ? 'text-yellow-400' : 'text-[#00d4aa]'}`}>
                #{currentUser.rank}
              </div>
              {isTopRanker && (
                <div className="inline-block">
                  <LocalBadge color="bg-yellow-500">🏆 Top Ranker</LocalBadge>
                </div>
              )}
            </div>

            {/* Score */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Score</p>
              <div className="text-5xl font-black italic text-blue-400">{currentUser.score}</div>
              <p className="text-[9px] text-gray-500">
                {currentUser.problemsSolved} problems solved
              </p>
            </div>

            {/* Percentile */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Percentile</p>
              <div className="text-5xl font-black italic text-purple-400">{currentUser.percentile}%</div>
              <p className="text-[9px] text-gray-500">
                Above {Math.floor(parseFloat(currentUser.percentile) / 10)} × 10% users
              </p>
            </div>

            {/* Problems by Difficulty */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Breakdown</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Easy (3pt)</span>
                  <span className="font-bold text-[#00d4aa]">{problemsByDifficulty.easy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Medium (7pt)</span>
                  <span className="font-bold text-blue-400">{problemsByDifficulty.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Hard (10pt)</span>
                  <span className="font-bold text-rose-400">{problemsByDifficulty.hard}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Nearby Competitors */}
      {nearbyUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-8 rounded-[2.5rem] ${glassStyle}`}
        >
          <h3 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-3">
            <Users className="w-4 h-4 text-[#00d4aa]" />
            Nearby Competitors
          </h3>

          <div className="space-y-4">
            {nearbyUsers.map((user, index) => {
              const medal = getRankMedal(user.rank);
              const MedalIcon = medal.icon;
              const isCurrentUser = index === Math.floor(nearbyUsers.length / 2);

              return (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl flex items-center justify-between transition-all border ${
                    isCurrentUser
                      ? 'bg-[#00d4aa]/10 border-[#00d4aa]/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {MedalIcon ? (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${medal.bg}`}>
                        <MedalIcon className={`w-6 h-6 ${medal.color}`} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <span className="font-black text-blue-400 text-lg">#{user.rank}</span>
                      </div>
                    )}

                    <div>
                      <p className="font-bold text-white flex items-center gap-2">
                        {user.name}
                        {isCurrentUser && <span className="text-[10px] font-black bg-[#00d4aa] text-black px-2 py-1 rounded">YOU</span>}
                      </p>
                      <p className="text-[10px] text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-2xl font-black italic text-[#00d4aa]">{user.score}</p>
                    <p className="text-[9px] text-gray-500">{user.problemsSolved} solved</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      {leaderboard.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-8 rounded-[2.5rem] ${glassStyle} overflow-hidden`}
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
              <Flame className="w-4 h-4 text-orange-500" />
              Full Leaderboard
            </h3>
            <p className="text-[10px] text-gray-500">Top {Math.min(leaderboard.length, 20)} Users</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/20 text-[9px] font-black uppercase text-gray-500 border-b border-white/5">
                <tr>
                  <th className="p-4">Rank</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Problems</th>
                  <th className="p-4">Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.slice(0, 20).map((user, index) => {
                  const medal = getRankMedal(user.rank);
                  const MedalIcon = medal.icon;

                  return (
                    <motion.tr
                      key={user.userId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {MedalIcon ? (
                            <MedalIcon className={`w-4 h-4 ${medal.color}`} />
                          ) : (
                            <span className="font-bold text-gray-400">#{user.rank}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm text-white">{user.name}</p>
                        <p className="text-[9px] text-gray-500">{user.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-lg text-[#00d4aa]">{user.score}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300">{user.problemsSolved}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <LocalBadge color="bg-[#00d4aa]/20">
                            🟢 {user.problemsByDifficulty.easy}
                          </LocalBadge>
                          <LocalBadge color="bg-blue-500/20">
                            🔵 {user.problemsByDifficulty.medium}
                          </LocalBadge>
                          <LocalBadge color="bg-rose-500/20">
                            🔴 {user.problemsByDifficulty.hard}
                          </LocalBadge>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {leaderboard.length > 20 && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
              <p className="text-[10px] text-gray-500">
                Showing 20 of {leaderboard.length} users
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Points Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-6 rounded-[2rem] ${glassStyle}`}
      >
        <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-[#00d4aa]" /> Points System
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-[#00d4aa]">3</p>
            <p className="text-[9px] text-gray-500 mt-1">Easy Problem</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-blue-400">7</p>
            <p className="text-[9px] text-gray-500 mt-1">Medium Problem</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-rose-400">10</p>
            <p className="text-[9px] text-gray-500 mt-1">Hard/Tough Problem</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
