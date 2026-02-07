import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface UserRank {
  userId: string;
  name: string;
  email: string;
  score: number;
  problemsSolved: number;
  rank: number;
  problemsByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface LeaderboardData {
  type: string;
  rankings: UserRank[];
  currentUserRank: UserRank | null;
  totalUsers: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const fetchLeaderboard = async (type: 'weekly' | 'monthly') => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/rankings?type=${type}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error loading leaderboard</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">Compete with fellow learners and climb the ranks!</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'weekly' | 'monthly')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Weekly Rankings</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {leaderboardData && (
            <div className="space-y-6">
              {/* Top 3 Podium */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {leaderboardData.rankings.slice(0, 3).map((user, index) => (
                      <div
                        key={user.userId}
                        className={`text-center p-4 rounded-lg ${
                          index === 0 ? 'bg-yellow-50 border-yellow-200' :
                          index === 1 ? 'bg-gray-50 border-gray-200' :
                          'bg-amber-50 border-amber-200'
                        } border`}
                      >
                        <div className="flex justify-center mb-2">
                          {getRankIcon(user.rank)}
                        </div>
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{user.score} points</p>
                        <div className="flex justify-center space-x-2 text-xs">
                          <Badge variant="secondary">{user.problemsSolved} solved</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Full Rankings Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Full Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Rank</th>
                          <th className="text-left py-2">Name</th>
                          <th className="text-left py-2">Score</th>
                          <th className="text-left py-2">Problems Solved</th>
                          <th className="text-left py-2">Easy</th>
                          <th className="text-left py-2">Medium</th>
                          <th className="text-left py-2">Hard</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardData.rankings.map((user) => (
                          <tr key={user.userId} className="border-b hover:bg-gray-50">
                            <td className="py-3">
                              <div className="flex items-center">
                                {getRankIcon(user.rank)}
                              </div>
                            </td>
                            <td className="py-3 font-medium">{user.name}</td>
                            <td className="py-3">{user.score}</td>
                            <td className="py-3">{user.problemsSolved}</td>
                            <td className="py-3">{user.problemsByDifficulty.easy}</td>
                            <td className="py-3">{user.problemsByDifficulty.medium}</td>
                            <td className="py-3">{user.problemsByDifficulty.hard}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Current User Rank */}
              {leaderboardData.currentUserRank && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Your Ranking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getRankIcon(leaderboardData.currentUserRank.rank)}
                        <div>
                          <p className="font-semibold">{leaderboardData.currentUserRank.name}</p>
                          <p className="text-sm text-gray-600">
                            {leaderboardData.currentUserRank.score} points • {leaderboardData.currentUserRank.problemsSolved} problems solved
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-blue-700 border-blue-300">
                        Rank #{leaderboardData.currentUserRank.rank} of {leaderboardData.totalUsers}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;
