import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, Code, Building2, Clock, TrendingUp, Target } from 'lucide-react';

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
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Problems Solved',
      value: `${stats.solvedProblems}/${stats.totalProblems}`,
      icon: Code,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Companies Tracking',
      value: `${stats.appliedCompanies}/${stats.totalCompanies}`,
      icon: Building2,
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Study Hours (Week)',
      value: `${stats.studyHoursThisWeek}h`,
      icon: Clock,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
        <p className="text-gray-600">Here's your placement preparation progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Topics Completion</span>
                <span className="text-sm font-bold text-gray-900">{topicsCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${topicsCompletion}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Problems Solved</span>
                <span className="text-sm font-bold text-gray-900">{problemsCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${problemsCompletion}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-50 rounded-lg">
                  <Target className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Weekly Goal</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.studyHoursThisWeek} hours studied this week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Code className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No recent activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Start adding topics and problems to track your progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
