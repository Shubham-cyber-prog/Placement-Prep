import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { 
  Search, Filter, Plus, Users, Lock, Globe, 
  Calendar, Target, TrendingUp, MessageSquare,
  UserPlus, Clock, ChevronRight, Hash,
  Flame, Trophy, BarChart3, Eye,
  RefreshCw, LogOut, X, CheckCircle
} from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";

const GroupCard = ({ group, onJoin }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        console.log('Navigating to group:', group._id); // Debug log
        navigate(`/groups/${group._id}`);
      }}
      className="glass p-6 rounded-2xl cursor-pointer hover:border-[#00d4aa]/30 transition-all border border-white/10"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
            {group.featuredImage ? (
              <img src={group.featuredImage} alt={group.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-white text-lg">
                {group.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              {group.name}
              {!group.isPublic && <Lock className="w-4 h-4 text-yellow-500" />}
            </h3>
            <p className="text-sm text-gray-400">by {group.creator?.name || 'Anonymous'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {group.isPublic ? (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Public
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private
            </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{group.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {group.tags?.slice(0, 3).map((tag, index) => (
          <span key={index} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10">
            #{tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-gray-400">
            <Users className="w-4 h-4" /> {group.memberCount || group.members?.length || 0}/{group.maxMembers || 10}
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            <MessageSquare className="w-4 h-4" /> {group.stats?.totalDiscussions || 0}
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            <Target className="w-4 h-4" /> {group.stats?.problemsSolved || 0}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.(group);
          }}
          className="px-4 py-2 rounded-xl bg-[#00d4aa] text-black font-bold text-sm hover:bg-[#00d4aa]/80 transition-all"
        >
          {group.isMember ? 'Joined' : 'Join'}
        </button>
      </div>
    </motion.div>
  );
};

const CreateGroupModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
    isPublic: true,
    maxMembers: 10,
    rules: '',
    featuredImage: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create New Group</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Group Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full glass-input rounded-xl p-3"
              placeholder="Enter group name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full glass-input rounded-xl p-3 min-h-[100px]"
              placeholder="Describe your group's purpose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full glass-input rounded-xl p-3"
              placeholder="dsa, interview, coding, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Max Members</label>
              <input
                type="number"
                value={formData.maxMembers}
                onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value)})}
                className="w-full glass-input rounded-xl p-3"
                min="2"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Visibility</label>
              <select
  // Convert boolean true/false to string "true"/"false"
  value={String(formData.isPublic)} 
  onChange={(e) => setFormData({
    ...formData, 
    // Convert string "true"/"false" back to boolean
    isPublic: e.target.value === 'true' 
  })}
  className="w-full glass-input rounded-xl p-3"
>
  <option value="true">Public</option>
  <option value="false">Private</option>
</select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rules (optional)</label>
            <textarea
              value={formData.rules}
              onChange={(e) => setFormData({...formData, rules: e.target.value})}
              className="w-full glass-input rounded-xl p-3 min-h-[80px]"
              placeholder="Group rules (one per line)"
            />
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
              onCreate(formData);
              onClose();
            }}
            className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)" }}
          >
            <Plus className="w-5 h-5" /> Create Group
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const StudyGroups = () => {
  const [displayName, setDisplayName] = useState("Guest");
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const filters = [
    { id: 'all', label: 'All Groups', icon: Globe },
    { id: 'public', label: 'Public', icon: Globe },
    { id: 'private', label: 'Private', icon: Lock },
    { id: 'joined', label: 'Joined', icon: CheckCircle },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'new', label: 'New', icon: Clock }
  ];

  useEffect(() => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    setUserToken(token);
    fetchGroups(token);
  } else {
    navigate('/auth');
  }
}, []);

const fetchGroups = async (token) => {
  try {
    setLoading(true);
    console.log('Fetching groups with token:', token); // Debug
    const response = await fetch(`${API_BASE_URL}/api/groups`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Groups response:', response.status); // Debug
    
    if (response.ok) {
      const data = await response.json();
      console.log('Groups data:', data); // Debug
      if (data.success) {
        setGroups(data.data.groups || []);
        setFilteredGroups(data.data.groups || []);
      }
    } else {
      console.error('Failed to fetch groups:', await response.text());
    }
  } catch (error) {
    console.error('Failed to fetch groups:', error);
  } finally {
    setLoading(false);
  }
};

  const handleJoinGroup = async (group) => {
  if (!userToken) {
    alert('Please login first');
    return;
  }
  
  try {
    console.log('Attempting to join group:', group._id);
    
    const response = await fetch(`${API_BASE_URL}/api/groups/${group._id}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Join response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Failed to join group';
      try {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.log('Could not parse error as JSON');
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Join success:', data);
    
    if (data.success) {
      // Update local state
      setGroups(groups.map(g => 
        g._id === group._id 
          ? { 
              ...g, 
              isMember: true, 
              memberCount: (g.memberCount || g.members?.length || 0) + 1,
              members: [...(g.members || []), { _id: 'current-user' }] // Add current user to members
            }
          : g
      ));
      alert('Successfully joined the group!');
    } else {
      throw new Error(data.message || 'Failed to join group');
    }
  } catch (error) {
    console.error('Failed to join group:', error);
    alert(`Error: ${error.message}`);
  }
};

  const handleCreateGroup = async (groupData) => {
    if (!userToken) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGroups([data.data, ...groups]);
          setCreateModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Failed to create group:', error);
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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    let filtered = groups;
    
    // Apply search filter
    if (value) {
      filtered = filtered.filter(group => 
        group.name.toLowerCase().includes(value.toLowerCase()) ||
        group.description?.toLowerCase().includes(value.toLowerCase()) ||
        group.tags?.some(tag => tag.toLowerCase().includes(value.toLowerCase()))
      );
    }
    
    // Apply type filter
    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'public':
          filtered = filtered.filter(group => group.isPublic);
          break;
        case 'private':
          filtered = filtered.filter(group => !group.isPublic);
          break;
        case 'joined':
          filtered = filtered.filter(group => group.isMember);
          break;
        case 'trending':
          filtered = filtered.filter(group => (group.stats?.totalDiscussions || 0) > 10);
          break;
        case 'new':
          filtered = filtered.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
      }
    }
    
    setFilteredGroups(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading groups...</p>
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
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Study <span className="gradient-text">Groups</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Join groups to collaborate, learn, and solve problems together
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
            <Plus className="w-5 h-5" /> Create Group
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
            <Users className="w-6 h-6 text-blue-500" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/20 text-green-400">
              +{Math.floor(groups.length / 3)} today
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{groups.length}</h3>
          <p className="text-sm text-gray-400">Total Groups</p>
        </div>
        
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <Globe className="w-6 h-6 text-green-500" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-400">
              {Math.floor((groups.filter(g => g.isPublic).length / groups.length) * 100)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{groups.filter(g => g.isPublic).length}</h3>
          <p className="text-sm text-gray-400">Public Groups</p>
        </div>
        
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-6 h-6 text-purple-500" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            {(groups || []).reduce((acc, group) => acc + (group?.memberCount || 0), 0)}
          </h3>
          <p className="text-sm text-gray-400">Total Members</p>
        </div>
        
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-6 h-6 text-orange-500" />
            <span className="text-xs font-bold px-2 py-1 rounded bg-purple-500/20 text-purple-400">
              Hot
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            {groups.reduce((acc, group) => acc + (group.stats?.totalDiscussions || 0), 0)}
          </h3>
          <p className="text-sm text-gray-400">Total Discussions</p>
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
              placeholder="Search groups by name, description, or tags..."
              className="w-full glass-input rounded-xl pl-12 pr-4 py-3"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="glass-input rounded-xl px-4 py-3"
            >
              {filters.map(filter => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                selectedFilter === filter.id
                  ? 'bg-[#00d4aa] text-black font-bold'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
            </button>
          ))}
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No groups found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? `No groups match "${searchTerm}"`
                : "Be the first to create a group!"}
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-6 py-3 bg-[#00d4aa] text-black rounded-xl font-bold hover:bg-[#00d4aa]/80 transition-all"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GroupCard group={group} onJoin={handleJoinGroup} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Groups */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" /> Featured Groups
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups
            .filter(g => g.stats?.totalDiscussions > 20)
            .slice(0, 4)
            .map((group, index) => (
              <div key={index} className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
                    {group.featuredImage ? (
                      <img src={group.featuredImage} alt={group.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-white text-2xl">
                        {group.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{group.name}</h4>
                    <p className="text-sm text-gray-400">{group.description?.slice(0, 60)}...</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {group.memberCount || group.members?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> {group.stats?.totalDiscussions || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" /> {group.stats?.problemsSolved || 0}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/study-groups/${group._id}`)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    View <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
};

export default StudyGroups;