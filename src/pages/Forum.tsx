import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { 
  Search, Filter, Plus, MessageSquare, ThumbsUp, Eye, 
  Clock, TrendingUp, Hash, Users, BookOpen,
  ChevronRight, Flame, Award, RefreshCw,
  LogOut, X, Send, Code2, Brain,
  Lightbulb, Calendar, User, CheckCircle
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

const DiscussionCard = ({ discussion, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(discussion)}
      className="glass p-6 rounded-2xl cursor-pointer hover:border-[#00d4aa]/30 transition-all border border-white/10"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
            <span className="font-bold text-white text-sm">
              {discussion.author?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg mb-1">{discussion.title}</h3>
              <p className="text-sm text-gray-400">
                by {discussion.author?.name || 'Anonymous'} • {new Date(discussion.createdAt).toLocaleDateString()}
              </p>
            </div>
            {discussion.isPinned && (
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                <Award className="w-3 h-3" /> Pinned
              </span>
            )}
          </div>
          
          <p className="text-gray-300 mb-4 line-clamp-2">{discussion.content}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {discussion.tags?.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10">
                #{tag}
              </span>
            ))}
            {discussion.group && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> {discussion.group?.name || 'Group'}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-400">
                <ThumbsUp className="w-4 h-4" /> {discussion.likeCount || discussion.likes?.length || 0}
              </span>
              <span className="flex items-center gap-1 text-gray-400">
                <MessageSquare className="w-4 h-4" /> {discussion.commentCount || discussion.comments?.length || 0}
              </span>
              <span className="flex items-center gap-1 text-gray-400">
                <Eye className="w-4 h-4" /> {discussion.views || 0}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#00d4aa]">
              <ChevronRight className="w-4 h-4" /> View Discussion
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CreateDiscussionModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    groupId: '',
    problemId: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Start New Discussion</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Discussion Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full glass-input rounded-xl p-3"
              placeholder="What's your question or topic?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full glass-input rounded-xl p-3 min-h-[200px]"
              placeholder="Describe your discussion in detail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full glass-input rounded-xl p-3"
              placeholder="dsa, algorithm, help, interview, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Group (optional)</label>
              <select
                value={formData.groupId}
                onChange={(e) => setFormData({...formData, groupId: e.target.value})}
                className="w-full glass-input rounded-xl p-3"
              >
                <option value="">Select a group</option>
                <option value="group1">DSA Mastery</option>
                <option value="group2">Interview Prep</option>
                <option value="group3">System Design</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Problem (optional)</label>
              <select
                value={formData.problemId}
                onChange={(e) => setFormData({...formData, problemId: e.target.value})}
                className="w-full glass-input rounded-xl p-3"
              >
                <option value="">Select a problem</option>
                <option value="problem1">Two Sum</option>
                <option value="problem2">Reverse Linked List</option>
                <option value="problem3">Binary Tree Inorder</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(formData);
              onClose();
            }}
            className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)" }}
          >
            <Send className="w-5 h-5" /> Post Discussion
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Forum = () => {
  const [discussions, setDiscussions] = useState([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const categories = [
    { id: 'all', label: 'All Topics', icon: MessageSquare, color: 'text-[#00d4aa]' },
    { id: 'dsa', label: 'DSA', icon: Code2, color: 'text-blue-500' },
    { id: 'interview', label: 'Interview', icon: Brain, color: 'text-purple-500' },
    { id: 'system', label: 'System Design', icon: Lightbulb, color: 'text-yellow-500' },
    { id: 'general', label: 'General', icon: Users, color: 'text-green-500' },
    { id: 'help', label: 'Help', icon: BookOpen, color: 'text-red-500' },
    { id: 'popular', label: 'Popular', icon: Flame, color: 'text-orange-500' },
    { id: 'unsolved', label: 'Unsolved', icon: QuestionCircle, color: 'text-pink-500' }
  ];

  const sortOptions = [
    { id: 'recent', label: 'Most Recent' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'trending', label: 'Trending' },
    { id: 'comments', label: 'Most Comments' },
    { id: 'views', label: 'Most Views' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setUserToken(token);
      fetchDiscussions(token);
    } else {
      navigate('/auth');
    }
  }, []);

  const fetchDiscussions = async (token) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/discussions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDiscussions(data.data.discussions || []);
          setFilteredDiscussions(data.data.discussions || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterDiscussions(value, selectedCategory, sortBy);
  };

  const filterDiscussions = (search, category, sort) => {
    let filtered = discussions;
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(discussion => 
        discussion.title.toLowerCase().includes(search.toLowerCase()) ||
        discussion.content?.toLowerCase().includes(search.toLowerCase()) ||
        discussion.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(discussion => 
        discussion.tags?.includes(category) ||
        discussion.category === category
      );
    }
    
    // Apply sorting
    switch (sort) {
      case 'recent':
        filtered = filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'popular':
        filtered = filtered.sort((a, b) => 
          (b.likeCount || b.likes?.length || 0) - (a.likeCount || a.likes?.length || 0)
        );
        break;
      case 'trending':
        filtered = filtered.sort((a, b) => 
          (b.views || 0) - (a.views || 0)
        );
        break;
      case 'comments':
        filtered = filtered.sort((a, b) => 
          (b.commentCount || b.comments?.length || 0) - (a.commentCount || a.comments?.length || 0)
        );
        break;
      case 'views':
        filtered = filtered.sort((a, b) => 
          (b.views || 0) - (a.views || 0)
        );
        break;
    }
    
    setFilteredDiscussions(filtered);
  };

  const handleCreateDiscussion = async (discussionData) => {
  if (!userToken) return;
  
  try {
    // Prepare the data in the correct format expected by backend
    const formattedData = {
      title: discussionData.title,
      content: discussionData.content,
      tags: discussionData.tags ? discussionData.tags.split(',').map(tag => tag.trim()) : [],
      groupId: discussionData.groupId || null,
      problemId: discussionData.problemId || null
    };

    console.log('Sending discussion data:', formattedData); // For debugging

    const response = await fetch(`${API_BASE_URL}/api/discussions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(errorData.message || 'Failed to create discussion');
    }

    const data = await response.json();
    if (data.success) {
      setDiscussions([data.data, ...discussions]);
      setCreateModalOpen(false);
      // Show success message
      alert('Discussion created successfully!');
    }
  } catch (error) {
    console.error('Failed to create discussion:', error);
    // Show error to user
    alert(`Error: ${error.message}`);
  }
};

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#00d4aa] to-[#00b4d8]">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Community <span className="gradient-text">Forum</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Ask questions, share knowledge, and connect with peers
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            ← Back to Dashboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCreateModalOpen(true)}
            className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-[#00d4aa]/20"
            style={{ background: "linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)" }}
          >
            <Plus className="w-5 h-5" /> New Discussion
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/20 text-green-400">
              +{Math.floor(discussions.length / 10)} today
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{discussions.length}</h3>
          <p className="text-sm text-gray-400">Total Discussions</p>
        </div>
        
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-6 h-6 text-green-500" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-400">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            {new Set(discussions.map(d => d.author?._id)).size}
          </h3>
          <p className="text-sm text-gray-400">Active Members</p>
        </div>
        
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <ThumbsUp className="w-6 h-6 text-purple-500" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
              Engaging
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            {discussions.reduce((acc, d) => acc + (d.likeCount || d.likes?.length || 0), 0)}
          </h3>
          <p className="text-sm text-gray-400">Total Likes</p>
        </div>
        
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-6 h-6 text-orange-500" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-purple-500/20 text-purple-400">
              {Math.floor((discussions.filter(d => d.solutionComment).length / discussions.length) * 100)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{discussions.filter(d => d.solutionComment).length}</h3>
          <p className="text-sm text-gray-400">Solved Discussions</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search discussions..."
              className="w-full glass-input rounded-xl pl-12 pr-4 py-3"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  filterDiscussions(searchTerm, e.target.value, sortBy);
                }}
                className="glass-input rounded-xl px-4 py-3"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  filterDiscussions(searchTerm, selectedCategory, e.target.value);
                }}
                className="glass-input rounded-xl px-4 py-3"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                filterDiscussions(searchTerm, category.id, sortBy);
              }}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                selectedCategory === category.id
                  ? 'bg-[#00d4aa] text-black font-bold'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <category.icon className={`w-4 h-4 ${category.color}`} />
              {category.label}
            </button>
          ))}
        </div>

        {/* Discussions List */}
        {filteredDiscussions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No discussions found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? `No discussions match "${searchTerm}"`
                : "Be the first to start a discussion!"}
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-6 py-3 bg-[#00d4aa] text-black rounded-xl font-bold hover:bg-[#00d4aa]/80 transition-all"
            >
              Start First Discussion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDiscussions.map((discussion, index) => (
              <motion.div
                key={discussion._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DiscussionCard 
                  discussion={discussion} 
                  onClick={(d) => navigate(`/discussions/${d._id}`)} 
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Topics */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" /> Trending Topics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Dynamic Programming', 'System Design', 'React Interview', 'Binary Trees']
            .map((topic, index) => (
              <div key={index} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00d4aa]/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${
                    index === 0 ? 'bg-blue-500/20' :
                    index === 1 ? 'bg-purple-500/20' :
                    index === 2 ? 'bg-green-500/20' : 'bg-orange-500/20'
                  }`}>
                    <Hash className={`w-5 h-5 ${
                      index === 0 ? 'text-blue-400' :
                      index === 1 ? 'text-purple-400' :
                      index === 2 ? 'text-green-400' : 'text-orange-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-bold">{topic}</h4>
                    <p className="text-xs text-gray-400">{Math.floor(Math.random() * 50) + 10} discussions</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{Math.floor(Math.random() * 500) + 100} views</span>
                  <span className="text-[#00d4aa]">Explore →</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Create Discussion Modal */}
      <CreateDiscussionModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateDiscussion}
      />
    </div>
  );
};

// Add missing icon
const QuestionCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Forum;