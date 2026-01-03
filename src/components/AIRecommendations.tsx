import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  Target,
  Lightbulb,
  Calendar,
  Award,
  ArrowRight,
} from 'lucide-react';

type Recommendation = {
  type: 'focus' | 'warning' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  action?: string;
};

export default function AIRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    topicsCompleted: 0,
    problemsSolved: 0,
    studyStreak: 0,
    weakAreas: [] as string[],
  });

  useEffect(() => {
    if (user) {
      loadDataAndGenerateRecommendations();
    }
  }, [user]);

  const loadDataAndGenerateRecommendations = async () => {
    setLoading(true);

    const [topicsData, problemsData, sessionsData] = await Promise.all([
      supabase.from('topics').select('*').eq('user_id', user?.id),
      supabase.from('practice_problems').select('*').eq('user_id', user?.id),
      supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('session_date', { ascending: false }),
    ]);

    const topics = topicsData.data || [];
    const problems = problemsData.data || [];
    const sessions = sessionsData.data || [];

    const completedTopics = topics.filter(t => t.status === 'Completed').length;
    const solvedProblems = problems.filter(p => p.status === 'Solved').length;
    const weakTopics = topics
      .filter(t => {
        const progress = t.total_hours > 0 ? (t.completed_hours / t.total_hours) * 100 : 0;
        return progress < 30 && t.status !== 'Not Started';
      })
      .map(t => t.name);

    setStats({
      topicsCompleted: completedTopics,
      problemsSolved: solvedProblems,
      studyStreak: calculateStreak(sessions),
      weakAreas: weakTopics,
    });

    const generatedRecommendations = generateRecommendations(topics, problems, sessions);
    setRecommendations(generatedRecommendations);
    setLoading(false);
  };

  const calculateStreak = (sessions: Array<{ session_date: string }>) => {
    if (sessions.length === 0) return 0;

    const uniqueDates = [...new Set(sessions.map(s => s.session_date))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const date of uniqueDates) {
      const sessionDate = new Date(date);
      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const generateRecommendations = (
    topics: Array<{ name: string; status: string; completed_hours: number; total_hours: number; priority: string }>,
    problems: Array<{ status: string; difficulty: string; topic: string; attempts: number }>,
    sessions: Array<{ duration_minutes: number; session_date: string }>
  ): Recommendation[] => {
    const recs: Recommendation[] = [];

    if (topics.length === 0) {
      recs.push({
        type: 'suggestion',
        title: 'Get Started with Your Preparation',
        description: 'Begin by adding topics you need to study. Break down your preparation into manageable subjects like DSA, System Design, DBMS, etc.',
        action: 'Add your first topic',
      });
    }

    const highPriorityIncomplete = topics.filter(
      t => t.priority === 'High' && t.status !== 'Completed'
    );
    if (highPriorityIncomplete.length > 0) {
      recs.push({
        type: 'focus',
        title: 'Focus on High Priority Topics',
        description: `You have ${highPriorityIncomplete.length} high priority topics pending: ${highPriorityIncomplete.map(t => t.name).join(', ')}. Consider dedicating more time to these.`,
        action: 'View topics',
      });
    }

    const lowProgressTopics = topics.filter(t => {
      const progress = t.total_hours > 0 ? (t.completed_hours / t.total_hours) * 100 : 0;
      return progress < 30 && t.status === 'In Progress';
    });
    if (lowProgressTopics.length > 0) {
      recs.push({
        type: 'warning',
        title: 'Weak Areas Detected',
        description: `Topics needing attention: ${lowProgressTopics.map(t => t.name).join(', ')}. These topics have less than 30% completion.`,
        action: 'Review weak areas',
      });
    }

    const easyProblems = problems.filter(p => p.difficulty === 'Easy' && p.status === 'Solved').length;
    const mediumProblems = problems.filter(p => p.difficulty === 'Medium' && p.status === 'Solved').length;
    const hardProblems = problems.filter(p => p.difficulty === 'Hard' && p.status === 'Solved').length;

    if (easyProblems > 20 && mediumProblems < 10) {
      recs.push({
        type: 'suggestion',
        title: 'Level Up Your Problem Solving',
        description: 'You have solved many easy problems. It\'s time to challenge yourself with medium difficulty problems to improve your skills.',
        action: 'Add medium problems',
      });
    }

    if (mediumProblems > 30 && hardProblems < 5) {
      recs.push({
        type: 'suggestion',
        title: 'Ready for Hard Problems',
        description: 'Great progress on medium problems! Start attempting hard problems to prepare for challenging interview questions.',
        action: 'Add hard problems',
      });
    }

    const recentWeekSessions = sessions.filter(s => {
      const sessionDate = new Date(s.session_date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return sessionDate >= weekAgo;
    });

    const weeklyHours = recentWeekSessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60;

    if (weeklyHours < 10) {
      recs.push({
        type: 'warning',
        title: 'Increase Study Time',
        description: `You studied ${Math.round(weeklyHours)} hours this week. Aim for at least 15-20 hours weekly for effective placement preparation.`,
        action: 'Set study goals',
      });
    }

    const problemsByTopic = problems.reduce((acc, p) => {
      acc[p.topic] = (acc[p.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const underPracticedTopics = topics
      .filter(t => (problemsByTopic[t.name] || 0) < 5)
      .map(t => t.name);

    if (underPracticedTopics.length > 0 && problems.length > 0) {
      recs.push({
        type: 'suggestion',
        title: 'Balance Your Practice',
        description: `Add more practice problems for: ${underPracticedTopics.slice(0, 3).join(', ')}. Consistent practice across all topics ensures well-rounded preparation.`,
        action: 'Add problems',
      });
    }

    const highAttemptProblems = problems.filter(p => p.attempts > 3 && p.status !== 'Solved');
    if (highAttemptProblems.length > 0) {
      recs.push({
        type: 'suggestion',
        title: 'Seek Help for Stuck Problems',
        description: `You have ${highAttemptProblems.length} problems with multiple attempts but unsolved. Consider reviewing solutions or seeking mentorship for these.`,
        action: 'Review problems',
      });
    }

    if (topics.filter(t => t.status === 'Completed').length >= 5) {
      recs.push({
        type: 'achievement',
        title: 'Great Progress!',
        description: 'You have completed 5 or more topics. Keep up the excellent work. Consider starting mock interviews to test your knowledge.',
        action: 'Continue learning',
      });
    }

    if (problems.filter(p => p.status === 'Solved').length >= 50) {
      recs.push({
        type: 'achievement',
        title: 'Problem Solving Milestone!',
        description: 'You have solved 50+ problems! You are building strong problem-solving skills. Keep practicing regularly.',
        action: 'Keep going',
      });
    }

    if (recs.length === 0) {
      recs.push({
        type: 'suggestion',
        title: 'Ready to Begin',
        description: 'Start your placement preparation journey by adding topics, practice problems, and target companies to track your progress effectively.',
      });
    }

    return recs;
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'focus':
        return <Target className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'achievement':
        return <Award className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'focus':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'achievement':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-cyan-50 border-cyan-200 text-cyan-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Study Coach</h2>
          <p className="text-gray-600">Personalized insights and recommendations for your preparation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Topics Done</p>
              <p className="text-2xl font-bold text-gray-900">{stats.topicsCompleted}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Problems Solved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.problemsSolved}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Study Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.studyStreak} days</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Weak Areas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.weakAreas.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-500 mt-2">Analyzing your progress...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-5 ${getRecommendationColor(rec.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getRecommendationColor(rec.type)}`}>
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                    {rec.action && (
                      <button className="flex items-center gap-2 text-sm font-medium hover:underline">
                        {rec.action}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Pro Tips for Success</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Consistency is key - Study for at least 3-4 hours daily</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Focus on fundamentals before jumping to advanced topics</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Revise solved problems regularly to retain concepts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Practice mock interviews and take timed coding tests</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Build projects to showcase your skills on resume</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
