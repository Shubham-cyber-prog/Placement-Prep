import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
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
  Moon,
  Sun,
} from 'lucide-react';
import Overview from './Overview';
import Topics from './Topics';
import Problems from './Problems';
import Companies from './Companies';
import AIRecommendations from './AIRecommendations';

type TabType = 'overview' | 'topics' | 'problems' | 'companies' | 'ai';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <div className="min-h-screen bg-gradient-mesh-light dark:bg-gradient-mesh-dark bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Navbar */}
      <nav className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & User Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-blue-600 dark:to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">Placement Prep</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {profile?.full_name || 'User'}
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="glass-card p-2.5 hover:scale-110 transition-transform"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-purple-600" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
              </button>
              <button
                onClick={signOut}
                className="glass-card px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:scale-105 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden glass-card p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Sidebar */}
          <aside
            className={`lg:col-span-3 ${mobileMenuOpen ? 'block' : 'hidden'
              } lg:block mb-6 lg:mb-0`}
          >
            <div className="glass-card p-4 sticky top-24">
              <nav className="space-y-2">
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 dark:from-blue-600 dark:to-purple-600 text-white shadow-lg scale-105'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Theme Toggle & Logout */}
              <div className="lg:hidden mt-6 pt-6 border-t border-white/20 dark:border-white/10 space-y-2">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all"
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-5 h-5" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="w-5 h-5" />
                      Light Mode
                    </>
                  )}
                </button>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
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
