import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile } from '../lib/supabase';
import {
  LayoutDashboard,
  BookOpen,
  Code,
  Building2,
  Sparkles,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Overview from './Overview';
import Topics from './Topics';
import Problems from './Problems';
import Companies from './Companies';
import AIRecommendations from './AIRecommendations';

type TabType = 'overview' | 'topics' | 'problems' | 'companies' | 'ai';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'topics' as TabType, label: 'Topics', icon: BookOpen },
    { id: 'problems' as TabType, label: 'Problems', icon: Code },
    { id: 'companies' as TabType, label: 'Companies', icon: Building2 },
    { id: 'ai' as TabType, label: 'AI Coach', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Placement Prep</h1>
                <p className="text-xs text-gray-500">
                  {profile?.full_name || 'User'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={signOut}
              className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          <aside
            className={`lg:col-span-3 ${
              mobileMenuOpen ? 'block' : 'hidden'
            } lg:block mb-6 lg:mb-0`}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={signOut}
                  className="lg:hidden w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-9">
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'topics' && <Topics />}
            {activeTab === 'problems' && <Problems />}
            {activeTab === 'companies' && <Companies />}
            {activeTab === 'ai' && <AIRecommendations />}
          </main>
        </div>
      </div>
    </div>
  );
}
