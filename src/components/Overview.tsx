import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, Code, Building2, Clock, TrendingUp, Target, Sparkles } from 'lucide-react';

type Stats = {
  totalTopics: number;
  completedTopics: number;
  totalProblems: number;
  solvedProblems: number;
  totalCompanies: number;
  appliedCompanies: number;
  studyHoursThisWeek: number;
};

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalTopics: 0,
    completedTopics: 0,
    totalProblems: 0,
    solvedProblems: 0,
    totalCompanies: 0,
    appliedCompanies: 0,
    studyHoursThisWeek: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    type: string;
    title: string;
    time: string;
  }>>([]);

  useEffect(() => {
    if (user) {
      loadStats();
      loadRecentActivity();
    }
  }, [user]);

  const loadStats = async () => {
    const [topicsData, problemsData, companiesData, sessionsData] = await Promise.all([
      supabase.from('topics').select('status').eq('user_id', user?.id),
      supabase.from('practice_problems').select('status').eq('user_id', user?.id),
      supabase.from('companies').select('application_status').eq('user_id', user?.id),
      supabase
        .from('study_sessions')
        .select('duration_minutes')
        .eq('user_id', user?.id)
        .gte('session_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const totalStudyMinutes = sessionsData.data?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0;

    setStats({
      totalTopics: topicsData.data?.length || 0,
      completedTopics: topicsData.data?.filter(t => t.status === 'Completed').length || 0,
      totalProblems: problemsData.data?.length || 0,
      solvedProblems: problemsData.data?.filter(p => p.status === 'Solved').length || 0,
      totalCompanies: companiesData.data?.length || 0,
      appliedCompanies: companiesData.data?.filter(c => c.application_status !== 'Researching').length || 0,
      studyHoursThisWeek: Math.round(totalStudyMinutes / 60),
    });
  };

  const loadRecentActivity = async () => {
    const { data: recentProblems } = await supabase
      .from('practice_problems')
      .select('title, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentProblems) {
      setRecentActivity(
        recentProblems.map(p => ({
          type: 'problem',
          title: p.title,
          time: new Date(p.created_at).toLocaleDateString(),
        }))
      );
    }
  };

  const statCards = [
    {
      title: 'Topics Progress',
      value: `${stats.completedTopics}/${stats.totalTopics}`,
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20 dark:bg-blue-500/30',
    },
    {
      title: 'Problems Solved',
      value: `${stats.solvedProblems}/${stats.totalProblems}`,
      icon: Code,
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500/20 dark:bg-green-500/30',
    },
    {
      title: 'Companies Tracking',
      value: `${stats.appliedCompanies}/${stats.totalCompanies}`,
      icon: Building2,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-500/20 dark:bg-orange-500/30',
    },
    {
      title: 'Study Hours (Week)',
      value: `${stats.studyHoursThisWeek}h`,
      icon: Clock,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/20 dark:bg-purple-500/30',
    },
  ];

  const topicsCompletion = stats.totalTopics > 0
    ? Math.round((stats.completedTopics / stats.totalTopics) * 100)
    : 0;
  const problemsCompletion = stats.totalProblems > 0
    ? Math.round((stats.solvedProblems / stats.totalProblems) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-3xl font-bold gradient-text">Welcome Back!</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Here's your placement preparation progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="glass-card p-6 group hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.gradient} animate-pulse`}></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
              <p className="text-3xl font-bold gradient-text">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Progress & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Overview */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Progress Overview</h3>
          </div>

          <div className="space-y-6">
            {/* Topics Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Topics Completion</span>
                <span className="text-sm font-bold gradient-text">{topicsCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${topicsCompletion}%` }}
                />
              </div>
            </div>

            {/* Problems Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Problems Solved</span>
                <span className="text-sm font-bold gradient-text">{problemsCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${problemsCompletion}%` }}
                />
              </div>
            </div>

            {/* Weekly Goal */}
            <div className="pt-4 border-t border-white/20 dark:border-white/10">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 dark:bg-purple-500/30 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Weekly Goal</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {stats.studyHoursThisWeek} hours studied this week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Activity</h3>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-white/20 dark:border-white/10 last:border-0">
                  <div className="p-2 bg-green-500/20 dark:bg-green-500/30 rounded-lg">
                    <Code className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Code className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity yet</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Start adding topics and problems to track your progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
