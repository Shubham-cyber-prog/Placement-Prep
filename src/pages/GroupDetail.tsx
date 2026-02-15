import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Calendar, MessageSquare, UserPlus, 
  Settings, Hash, Globe, Lock, 
  ChevronLeft, ExternalLink, Bell,
  MoreVertical, Edit, Trash2, LogOut,
  AlertCircle, RefreshCw, Target
} from 'lucide-react';
import GroupChat from '../components/GroupChat';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    // Get current user from localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/auth');
      return;
    }
    fetchGroupDetails(token);
  }, [id]);

  const fetchGroupDetails = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching group details for ID: ${id}`);
      
      const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        let errorMessage = `Failed to fetch group: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `HTTP error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Group data:', data);
      
      if (data.success) {
        setGroup(data.data.group);
        setIsMember(data.data.isMember);
      } else {
        throw new Error(data.message || 'Failed to load group data');
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchGroupDetails(token);
    }
  };

  const handleJoinGroup = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${id}/join`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsMember(true);
          setGroup(prev => ({ 
            ...prev, 
            members: [...(prev.members || []), currentUser],
            memberCount: (prev.memberCount || prev.members?.length || 0) + 1 
          }));
        } else {
          throw new Error(data.message || 'Failed to join group');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert(`Failed to join group: ${error.message}`);
    }
  };

  const handleLeaveGroup = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${id}/leave`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsMember(false);
          setGroup(prev => ({ 
            ...prev, 
            members: (prev.members || []).filter(m => m._id !== currentUser?._id),
            memberCount: Math.max(0, (prev.memberCount || prev.members?.length || 1) - 1) 
          }));
        } else {
          throw new Error(data.message || 'Failed to leave group');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert(`Failed to leave group: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-3xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Error Loading Group</h3>
          <p className="text-gray-400 mb-4">{error || 'Group not found'}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/study-groups')}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              Back to Groups
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 py-3 bg-[#00d4aa] text-black rounded-xl font-bold hover:bg-[#00d4aa]/80 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/study-groups')}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Groups
        </button>
        
        <div className="flex items-center gap-3">
          {isMember ? (
            <>
              <button 
                onClick={() => navigate(`/groups/${id}/settings`)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button
                onClick={handleLeaveGroup}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Leave Group
              </button>
            </>
          ) : (
            <button
              onClick={handleJoinGroup}
              className="px-6 py-3 bg-[#00d4aa] text-black rounded-xl font-bold hover:bg-[#00d4aa]/80 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" /> Join Group
            </button>
          )}
        </div>
      </div>

      {/* Group Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {group.name?.charAt(0).toUpperCase() || 'G'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <p className="text-gray-400 flex items-center gap-2 mt-2">
                  {group.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {group.isPublic ? 'Public Group' : 'Private Group'}
                  <span className="mx-2">•</span>
                  <Users className="w-4 h-4" /> {group.memberCount || group.members?.length || 0} members
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-6 max-w-3xl">{group.description}</p>

            <div className="flex flex-wrap gap-2">
              {group.tags?.map((tag, index) => (
                <span key={index} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          </div>

          {group.creator?._id === currentUser?._id && (
            <button 
              onClick={() => navigate(`/groups/${id}/edit`)}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Group Content - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Chat (Main Feature) */}
        <div className="lg:col-span-2">
          <GroupChat 
            groupId={id} 
            isMember={isMember} 
            currentUser={currentUser} 
            groupName={group.name}
          />
        </div>

        {/* Right Column - Info & Members */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {isMember && (
            <div className="glass rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate(`/discussion/new?group=${id}`)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5 text-[#00d4aa]" />
                  <span className="text-xs">New Discussion</span>
                </button>
                <button
                  onClick={() => navigate(`/groups/${id}/schedule`)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-2"
                >
                  <Calendar className="w-5 h-5 text-[#00d4aa]" />
                  <span className="text-xs">Schedule</span>
                </button>
                <button
                  onClick={() => navigate(`/groups/${id}/resources`)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-2"
                >
                  <Target className="w-5 h-5 text-[#00d4aa]" />
                  <span className="text-xs">Resources</span>
                </button>
                <button
                  onClick={() => navigate(`/groups/${id}/invite`)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-2"
                >
                  <UserPlus className="w-5 h-5 text-[#00d4aa]" />
                  <span className="text-xs">Invite</span>
                </button>
              </div>
            </div>
          )}

          {/* Group Stats */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4">Group Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Members</span>
                <span className="font-bold">{group.memberCount || group.members?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Created</span>
                <span className="font-bold">{new Date(group.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Today</span>
                <span className="font-bold text-green-400">{Math.floor(Math.random() * 10) + 1}</span>
              </div>
            </div>
          </div>

          {/* Group Members */}
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Members</h3>
              <button 
                onClick={() => navigate(`/groups/${id}/members`)}
                className="text-xs text-[#00d4aa] hover:text-[#00d4aa]/80"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {/* Creator */}
              {group.creator && (
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {group.creator.name?.charAt(0).toUpperCase() || 'C'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">{group.creator.name || 'Creator'}</span>
                      <span className="text-xs text-gray-400 block">Creator</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                    Admin
                  </span>
                </div>
              )}

              {/* Other Members */}
              {group.members?.filter(m => m._id !== group.creator?._id).slice(0, 4).map(member => (
                <div key={member._id || member.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {member.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm">{member.name || 'Anonymous'}</span>
                  </div>
                  {member._id === currentUser?._id && (
                    <span className="text-xs text-[#00d4aa]">You</span>
                  )}
                </div>
              ))}

              {group.members?.length > 5 && (
                <button 
                  onClick={() => navigate(`/groups/${id}/members`)}
                  className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  +{group.members.length - 5} more members
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;