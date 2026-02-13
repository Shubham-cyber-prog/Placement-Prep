import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Target, Clock, CheckCircle, Play, 
  RefreshCw, TrendingUp, AlertCircle, ChevronRight,
  Award, BarChart, Calendar, Filter, X, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

const PersonalizedPath = () => {
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [progress, setProgress] = useState({});
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const navigate = useNavigate();

  // ===== UPDATED: Get token from localStorage (checks multiple possible keys) =====
  const getToken = () => {
    // Check different possible token keys
    const possibleKeys = ['token', 'auth_token', 'accessToken', 'jwt'];
    
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        console.log(`✅ Found token under key: ${key}`);
        return token;
      }
    }
    
    console.log('❌ No token found in any known keys');
    return null;
  };

  // ===== UPDATED: Debug function to show all possible token keys =====
  const debugLocalStorage = () => {
    console.log('========== LOCALSTORAGE DEBUG ==========');
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    // Check all possible token keys
    const possibleKeys = ['token', 'auth_token', 'accessToken', 'jwt'];
    possibleKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value ? `✅ Present (${value.substring(0, 20)}...)` : '❌ Missing');
    });
    
    // Check for user
    const user = localStorage.getItem('user');
    console.log('user exists:', !!user);
    
    // List first few chars of all items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      if (value && value.length > 0) {
        console.log(`${key}:`, value.substring(0, 30) + '...');
      }
    }
    console.log('=========================================');
    
    // Return true if any token exists
    return possibleKeys.some(key => localStorage.getItem(key));
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = getToken();
    return !!token;
  };

  // ===== UPDATED: Set test token that matches your backend =====
  const setTestToken = () => {
    // Use the same key your backend uses (from logs, it's 'auth_token')
    localStorage.setItem('auth_token', 'test-token-123');
    localStorage.setItem('user', JSON.stringify({ id: 'test', name: 'Test User' }));
    console.log('✅ Test token set under key: auth_token');
    toast.success('Test token set! Refreshing...');
    window.location.reload();
  };

  // ===== UPDATED: Clear all possible token keys =====
  const clearToken = () => {
    const possibleKeys = ['token', 'auth_token', 'accessToken', 'jwt'];
    possibleKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('user');
    console.log('❌ All tokens cleared');
    toast.success('Tokens cleared!');
    window.location.reload();
  };

  const startItem = (item, type) => {
    if (!isAuthenticated()) {
      toast.error('Please login to continue');
      navigate('/auth');
      return;
    }
    
    if (type === 'problem') {
      navigate(`/practice/${item._id}`);
    } else if (type === 'topic') {
      navigate(`/topics/${item._id}`);
    } else {
      console.log('Unknown item type:', type);
      toast.error('Cannot start this item');
    }
  };

  const markAsCompleted = async (itemId) => {
    if (!isAuthenticated()) {
      toast.error('Please login to update progress');
      navigate('/auth');
      return;
    }

    try {
      const token = getToken();
      console.log('Marking item as completed:', itemId);
      
      const response = await fetch('http://localhost:5000/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        clearToken();
        toast.error('Session expired. Please login again.');
        navigate('/auth');
        return;
      }

      if (response.ok) {
        setProgress(prev => ({ ...prev, [itemId]: 'completed' }));
        toast.success('Progress updated!');
        setTimeout(() => refreshPath(), 1000);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const fetchPersonalizedPath = useCallback(async (showLoading = true) => {
    // Run debug check
    const hasToken = debugLocalStorage();
    
    if (!hasToken) {
      console.log('❌ No token found in localStorage');
      setError('No authentication token found. Please login again.');
      if (showLoading) setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      
      console.log('📡 Making API request with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:5000/api/recommendations/generate-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);

      if (response.status === 401) {
        console.log('❌ Token rejected by server (401)');
        setError('Session expired. Please login again.');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      
      const processedData = {
        weakAreas: data.weakAreas || { difficulties: [], topics: [] },
        recommendations: data.recommendations || [],
        timeline: data.timeline || [],
        estimatedTime: data.estimatedTime || 0,
        stats: data.stats || { totalCompleted: 0, totalAttempts: 0, strongTopics: [] }
      };
      
      setPath(processedData);
      toast.success('Learning path loaded!');
      
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError(error.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const refreshPath = async () => {
    if (!isAuthenticated()) {
      toast.error('Please login to refresh your learning path');
      navigate('/auth');
      return;
    }

    setRefreshing(true);
    setError(null);
    
    try {
      const token = getToken();
      console.log('Refreshing recommendations...');
      
      const response = await fetch('http://localhost:5000/api/recommendations/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        clearToken();
        toast.error('Session expired. Please login again.');
        navigate('/auth');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to refresh recommendations');
      }

      const data = await response.json();
      console.log('Refresh response:', data);
      
      toast.success(data.message || 'Learning path refreshed!');
      await fetchPersonalizedPath(false);
    } catch (error) {
      console.error('Error refreshing path:', error);
      toast.error('Failed to refresh learning path');
    } finally {
      setRefreshing(false);
    }
  };

  // Initial check on mount
  useEffect(() => {
    debugLocalStorage();
    const hasToken = ['token', 'auth_token', 'accessToken', 'jwt'].some(key => localStorage.getItem(key));
    
    if (!hasToken) {
      console.log('❌ No token - showing debug panel');
      setError('No authentication token found. Please login first.');
      setLoading(false);
    } else {
      fetchPersonalizedPath();
    }
  }, [fetchPersonalizedPath]);

  // Mock data for testing UI when API fails
  const loadMockData = () => {
    const mockPath = {
      weakAreas: {
        difficulties: ["Medium", "Hard"],
        topics: ["Arrays", "Dynamic Programming"]
      },
      recommendations: [
        {
          type: "problem",
          item: { _id: "1", title: "Two Sum", difficulty: "Medium" },
          reason: "Practice array manipulation",
          priority: "high"
        },
        {
          type: "topic",
          item: { _id: "2", name: "Dynamic Programming" },
          reason: "Master DP concepts",
          priority: "medium"
        }
      ],
      timeline: [
        { item: "Two Sum", type: "practice", estimatedTime: 30 },
        { item: "DP Study", type: "study", estimatedTime: 60 }
      ],
      estimatedTime: 90
    };
    setPath(mockPath);
    toast.success('Loaded mock data for testing');
  };

  const filteredRecommendations = path?.recommendations?.filter(rec => {
    if (filter === 'high') return rec.priority === 'high';
    if (filter === 'medium') return rec.priority === 'medium';
    return true;
  });

  // Rest of your JSX remains exactly the same...
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Debug Panel */}
      {(error || debugMode) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Debug Mode
            </h3>
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm"
            >
              {debugMode ? 'Hide' : 'Show'} Debug
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/5 p-3 rounded">
                <p className="font-mono text-sm">Token in localStorage:</p>
                <p className={`font-bold ${getToken() ? 'text-green-600' : 'text-red-600'}`}>
                  {getToken() ? '✅ Present' : '❌ Missing'}
                </p>
                {getToken() && (
                  <p className="text-xs mt-1 break-all">
                    Token: {getToken().substring(0, 30)}...
                  </p>
                )}
              </div>
              <div className="bg-black/5 p-3 rounded">
                <p className="font-mono text-sm">User in localStorage:</p>
                <p className={`font-bold ${localStorage.getItem('user') ? 'text-green-600' : 'text-red-600'}`}>
                  {localStorage.getItem('user') ? '✅ Present' : '❌ Missing'}
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded">
                <p className="font-mono text-sm text-red-600">Error: {error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={setTestToken}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                Set Test Token
              </button>
              <button
                onClick={clearToken}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                Clear Token
              </button>
              <button
                onClick={loadMockData}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
              >
                Load Mock Data
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
              >
                Clear All & Reload
              </button>
            </div>

            <div className="bg-black/5 p-3 rounded">
              <p className="font-mono text-sm mb-2">Debug Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Token found under key: <strong>auth_token</strong> (this is correct)</li>
                <li>Click "Set Test Token" to ensure it's working</li>
                <li>Then click "Load Mock Data" to test UI</li>
                <li>The app will now automatically detect your token</li>
              </ol>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Learning Path
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered recommendations tailored to your progress
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            {debugMode ? 'Hide Debug' : 'Debug'}
          </button>
          
          {path && (
            <button
              onClick={() => fetchPersonalizedPath()}
              disabled={refreshing}
              className="px-4 py-2 bg-card border rounded-lg hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-lg text-muted-foreground">Loading your learning path...</p>
          </div>
        </div>
      )}

      {/* Error State with Actions */}
      {error && !path && !loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/auth'}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={loadMockData}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Load Mock Data (Test UI)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Path State */}
      {!error && !loading && !path && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Learning Path Available</h3>
            <p className="text-muted-foreground mb-6">
              Complete some practice problems to generate your personalized path.
            </p>
            <button
              onClick={() => navigate('/practice')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Practicing
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Only show when we have path */}
      {path && !loading && !error && (
        <>
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recommended Items</p>
                  <p className="text-2xl font-bold">{path.recommendations?.length || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Est. Time</p>
                  <p className="text-2xl font-bold">{path.estimatedTime || 0} min</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Weak Areas</p>
                  <p className="text-2xl font-bold">
                    {(path.weakAreas?.difficulties?.length || 0) + (path.weakAreas?.topics?.length || 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weak Areas */}
          {path.weakAreas && (path.weakAreas.difficulties?.length > 0 || path.weakAreas.topics?.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card rounded-lg p-6 border"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Target className="mr-2 h-5 w-5 text-primary" />
                  Areas for Improvement
                </h2>
                <span className="text-sm text-muted-foreground">Focus on these first</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {path.weakAreas.difficulties?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Difficulty Levels</h3>
                    <div className="flex flex-wrap gap-2">
                      {path.weakAreas.difficulties.map((diff) => (
                        <span 
                          key={diff} 
                          className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium"
                        >
                          {diff}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {path.weakAreas.topics?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Topics to Review</h3>
                    <div className="flex flex-wrap gap-2">
                      {path.weakAreas.topics.map((topic, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium"
                        >
                          {typeof topic === 'string' ? topic : topic.name || `Topic ${topic}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-lg p-6 border"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Recommended for You
              </h2>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1.5 bg-muted border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredRecommendations?.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-muted/30 rounded-lg border hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {rec.priority}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {rec.type}
                        </span>
                      </div>
                      <h3 className="font-semibold">{rec.item?.title || rec.item?.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                    </div>
                    <button
                      onClick={() => startItem(rec.item, rec.type)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timeline */}
          {path.timeline?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-lg p-6 border"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Suggested Timeline
              </h2>
              
              <div className="space-y-4">
                {path.timeline.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.item}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {item.estimatedTime} min
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default PersonalizedPath;