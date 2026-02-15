// components/DiscussionDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ThumbsUp, MessageSquare, Eye, Share2, Bookmark,
  Send, MoreVertical, Calendar, User, Clock, CheckCircle,
  Hash, Edit, Trash2, Flag, Copy
} from 'lucide-react';

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [userToken, setUserToken] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setUserToken(token);
      fetchDiscussionDetails(token);
    } else {
      navigate('/auth');
    }
  }, [id]);

  const fetchDiscussionDetails = async (token) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/discussions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setDiscussion(data.data.discussion);
        setComments(data.data.discussion.comments || []);
        setIsAuthor(data.data.isAuthor || false);
        setHasLiked(data.data.hasLiked || false);
      } else {
        console.error('Failed to fetch discussion:', data.message);
      }
    } catch (error) {
      console.error('Error fetching discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!userToken) return;
    
    try {
      const endpoint = hasLiked ? 'unlike' : 'like';
      const method = hasLiked ? 'DELETE' : 'POST';
      
      const response = await fetch(`${API_BASE_URL}/api/discussions/${id}/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setHasLiked(!hasLiked);
        // Refresh discussion data
        fetchDiscussionDetails(userToken);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !userToken) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/discussions/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();
      if (data.success) {
        setNewComment('');
        // Refresh comments
        fetchDiscussionDetails(userToken);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!userToken || !window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/discussions/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Refresh comments
        fetchDiscussionDetails(userToken);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!userToken || !window.confirm('Are you sure you want to delete this discussion?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/discussions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        navigate('/forum');
      }
    } catch (error) {
      console.error('Error deleting discussion:', error);
    }
  };

  const handleEditDiscussion = () => {
    // You can implement edit functionality here
    // For now, just show a message
    alert('Edit functionality coming soon!');
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleReport = () => {
    // You can implement report functionality here
    alert('Report functionality coming soon!');
  };

  const formatDate = (dateString) => {
  if (!dateString) return 'Recently';
  
  // Convert string to Date object
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  if (diffYears < 1) return `${diffYears}y ago`;
  
  // For dates older than a year, show full date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#151515]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#151515]">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Discussion Not Found</h2>
          <p className="text-gray-400 mb-6">The discussion you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/forum')}
            className="px-6 py-3 bg-[#00d4aa] text-black rounded-xl font-bold hover:bg-[#00d4aa]/80 transition-all"
          >
            Back to Forum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#151515] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/forum')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-2xl font-bold">Discussion Details</h1>
          </div>
          {isAuthor && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditDiscussion}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={handleDeleteDiscussion}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Discussion Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Discussion Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-6"
            >
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
                  <span className="font-bold text-white text-lg">
                    {discussion.author?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{discussion.author?.name || 'Anonymous'}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {formatDate(discussion.createdAt)}
                    </span>
                    {discussion.updatedAt !== discussion.createdAt && (
                      <span className="flex items-center gap-1">
                        <Edit className="w-4 h-4" /> Edited {formatDate(discussion.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setActiveAction(activeAction === 'actions' ? null : 'actions')}
                    className="p-2 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  {activeAction === 'actions' && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] rounded-xl shadow-lg border border-white/10 z-10">
                      <button
                        onClick={handleCopyLink}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors rounded-t-xl"
                      >
                        <Copy className="w-4 h-4" /> Copy Link
                      </button>
                      <button
                        onClick={handleReport}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors rounded-b-xl"
                      >
                        <Flag className="w-4 h-4" /> Report
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{discussion.title}</h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {discussion.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm flex items-center gap-1"
                  >
                    <Hash className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none mb-6">
                <p className="whitespace-pre-line text-gray-300 leading-relaxed">
                  {discussion.content}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 transition-colors ${hasLiked ? 'text-[#00d4aa]' : 'hover:text-[#00d4aa]'}`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${hasLiked ? 'fill-[#00d4aa]' : ''}`} />
                    <span>{discussion.likes?.length || 0} Likes</span>
                  </button>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageSquare className="w-5 h-5" />
                    <span>{discussion.comments?.length || 0} Comments</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Eye className="w-5 h-5" />
                    <span>{discussion.views || 0} Views</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-xl hover:bg-white/10 transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6"
            >
              <h2 className="text-xl font-bold mb-6">
                Comments ({comments.length})
              </h2>

              {/* Add Comment */}
              <div className="mb-8">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full glass-input rounded-xl p-4 min-h-[100px] resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 ${
                      newComment.trim()
                        ? 'bg-[#00d4aa] text-black hover:bg-[#00d4aa]/80'
                        : 'bg-white/10 text-gray-400 cursor-not-allowed'
                    } transition-all`}
                  >
                    <Send className="w-4 h-4" /> Post Comment
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment, index) => (
                    <div key={comment._id || index} className="pb-6 border-b border-white/10 last:border-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm">{comment.author?.name || 'Anonymous'}</h4>
                              <span className="text-xs text-gray-400">
                                {formatDate(comment.createdAt)}
                              </span>
                              {comment.isSolution && (
                                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Solution
                                </span>
                              )}
                            </div>
                            {(isAuthor || comment.author?._id === discussion.author?._id) && (
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <button className="text-xs text-gray-400 hover:text-[#00d4aa] transition-colors flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" /> {comment.likes?.length || 0}
                            </button>
                            <button className="text-xs text-gray-400 hover:text-[#00d4aa] transition-colors">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Author Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold mb-4">About Author</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
                  <span className="font-bold text-white text-xl">
                    {discussion.author?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold">{discussion.author?.name || 'Anonymous'}</h4>
                  <p className="text-sm text-gray-400">
                    Joined {formatDate(discussion.author?.createdAt || discussion.createdAt)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <div className="text-2xl font-bold">{discussion.author?.discussionCount || 1}</div>
                  <div className="text-xs text-gray-400">Discussions</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <div className="text-2xl font-bold">{discussion.author?.commentCount || comments.length}</div>
                  <div className="text-xs text-gray-400">Comments</div>
                </div>
              </div>
              <button 
                onClick={() => {/* Navigate to user profile */}}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              >
                View Profile
              </button>
            </motion.div>

            {/* Related Topics (based on actual tags) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold mb-4">Related Topics</h3>
              <div className="space-y-3">
                {discussion.tags?.slice(0, 4).map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/forum?tag=${tag}`)}
                    className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center gap-3"
                  >
                    <div className={`p-2 rounded-xl ${
                      index === 0 ? 'bg-blue-500/20' :
                      index === 1 ? 'bg-purple-500/20' :
                      index === 2 ? 'bg-green-500/20' : 'bg-orange-500/20'
                    }`}>
                      <Hash className={`w-4 h-4 ${
                        index === 0 ? 'text-blue-400' :
                        index === 1 ? 'text-purple-400' :
                        index === 2 ? 'text-green-400' : 'text-orange-400'
                      }`} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">{tag}</div>
                      <div className="text-xs text-gray-400">
                        {tag === 'dsa' ? 'Data Structures & Algorithms' : 
                         tag === 'arrays' ? 'Array problems and solutions' :
                         tag === 'loops' ? 'Looping constructs and patterns' :
                         'Related discussions'}
                      </div>
                    </div>
                  </button>
                ))}
                {(!discussion.tags || discussion.tags.length === 0) && (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No tags available
                  </div>
                )}
              </div>
            </motion.div>

            {/* Discussion Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold mb-4">Discussion Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="font-medium">{formatDate(discussion.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="font-medium">{formatDate(discussion.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Views</span>
                  <span className="font-medium">{discussion.views || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Likes</span>
                  <span className="font-medium">{discussion.likes?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Comments</span>
                  <span className="font-medium">{discussion.comments?.length || 0}</span>
                </div>
                {discussion.solutionComment && (
                  <div className="flex items-center justify-between text-green-400">
                    <span>Solution Marked</span>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;