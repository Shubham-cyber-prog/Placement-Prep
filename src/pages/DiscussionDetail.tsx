import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase";
import { 
  MessageSquare, ThumbsUp, Eye, Clock, 
  ChevronLeft, Share2, Bookmark, MoreVertical,
  Send, User, CheckCircle, Award, Flag,
  Edit, Trash2, Users, Hash, ExternalLink,
  ArrowUp, ArrowDown, RefreshCw, LogOut,
  Code2, Brain, Lightbulb, Calendar
} from "lucide-react";
// Remove problematic import
// import ReactMarkdown from 'react-markdown';

// Add this helper component for markdown rendering
const MarkdownRenderer = ({ children, className = "" }) => {
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    // Simple markdown parser for basic formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded">$1</code>')
      .replace(/# (.*?)(\n|$)/g, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/## (.*?)(\n|$)/g, '<h2 class="text-lg font-bold mt-3 mb-2">$1</h2>')
      .replace(/### (.*?)(\n|$)/g, '<h3 class="font-bold mt-2 mb-1">$1</h3>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#00d4aa] hover:underline">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(children)}</p>` }}
    />
  );
};

const Comment = ({ comment, level = 0, onReply, onLike }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // Get unique key for the comment
  const commentKey = comment._id || comment.id || `comment-${level}-${Math.random()}`;
  
  return (
    <div className={`${level > 0 ? 'ml-8' : ''}`}>
      <div className="glass p-4 rounded-xl border border-white/10 mb-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
              <span className="font-bold text-white text-xs">
                {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold text-sm">{comment.author?.name || 'Anonymous'}</h4>
                <p className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()} • {comment.isSolution && (
                    <span className="text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Solution
                    </span>
                  )}
                </p>
              </div>
              <button className="p-1 hover:bg-white/10 rounded-lg">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <MarkdownRenderer>{comment.content}</MarkdownRenderer>
            </div>
            
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => onLike?.(comment)}
                className="flex items-center gap-1 text-gray-400 hover:text-[#00d4aa]"
              >
                <ThumbsUp className="w-4 h-4" /> {comment.likes?.length || 0}
              </button>
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Reply
              </button>
              <button className="text-sm text-gray-400 hover:text-white">
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Input */}
      {showReply && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-xs">↳</span>
            </div>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 glass-input rounded-xl px-4 py-2 text-sm"
            />
            <button
              onClick={() => {
                onReply?.(comment, replyText);
                setReplyText('');
                setShowReply(false);
              }}
              className="px-3 py-2 rounded-xl bg-[#00d4aa] text-black font-bold text-sm"
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Nested Comments */}
      {comment.replies?.map((reply, index) => (
        <Comment
          key={reply._id || reply.id || `reply-${index}`}
          comment={reply}
          level={level + 1}
          onReply={onReply}
          onLike={onLike}
        />
      ))}
    </div>
  );
};

const DiscussionDetail = () => {
  const { id } = useParams();
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Helper function to get current user
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  };

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
      setError(null);
      
      const [discussionRes, commentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/discussions/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/discussions/${id}/comments`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      if (!discussionRes.ok) {
        if (discussionRes.status === 404) {
          throw new Error('Discussion not found');
        } else {
          throw new Error(`Failed to load discussion: ${discussionRes.statusText}`);
        }
      }

      const discussionData = await discussionRes.json();
      if (discussionData.success) {
        setDiscussion(discussionData.data.discussion);
        setLiked(discussionData.data.hasLiked || false);
      } else {
        throw new Error(discussionData.message || 'Failed to load discussion data');
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        if (commentsData.success) {
          setComments(commentsData.data.comments || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch discussion details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!userToken || !discussion) return;
    
    try {
      const endpoint = liked ? 'unlike' : 'like';
      const response = await fetch(`${API_BASE_URL}/api/discussions/${id}/${endpoint}`, {
        method: liked ? 'DELETE' : 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` },
      });

      if (response.ok) {
        setLiked(!liked);
        const currentUser = getCurrentUser();
        setDiscussion({
          ...discussion,
          likeCount: liked 
            ? (discussion.likeCount || discussion.likes?.length || 1) - 1
            : (discussion.likeCount || discussion.likes?.length || 0) + 1
        });
      }
    } catch (error) {
      console.error('Failed to like discussion:', error);
      setError(error.message);
    }
  };

  const handleAddComment = async () => {
    if (!userToken || !newComment.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/discussions/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComments([data.data, ...comments]);
          setNewComment('');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      setError(error.message);
    }
  };

  const handleReply = async (parentComment, replyText) => {
    if (!userToken || !replyText.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/discussions/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: replyText,
          parentCommentId: parentComment._id || parentComment.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Add reply to the parent comment
          const updatedComments = comments.map(comment => {
            if ((comment._id || comment.id) === (parentComment._id || parentComment.id)) {
              return {
                ...comment,
                replies: [...(comment.replies || []), data.data]
              };
            }
            return comment;
          });
          setComments(updatedComments);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Failed to add reply:', error);
      setError(error.message);
    }
  };

  const handleMarkSolution = async (commentId) => {
    if (!userToken || !discussion) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/discussions/${id}/solution/${commentId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${userToken}` },
      });

      if (response.ok) {
        setDiscussion({ ...discussion, solutionComment: commentId });
        // Update comment as solution
        const updatedComments = comments.map(comment => ({
          ...comment,
          isSolution: (comment._id || comment.id) === commentId
        }));
        setComments(updatedComments);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark solution');
      }
    } catch (error) {
      console.error('Failed to mark solution:', error);
      setError(error.message);
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

  const handleRefresh = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchDiscussionDetails(token);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-3xl max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Error Loading Discussion</h3>
          <p className="text-gray-400 mb-6">{error || 'Discussion not found'}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/forum')}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              Browse Discussions
            </button>
            <button
              onClick={handleRefresh}
              className="flex-1 py-3 bg-[#00d4aa] text-black rounded-xl font-bold hover:bg-[#00d4aa]/80 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = getCurrentUser();
  const isAuthor = discussion.author?._id === currentUser?._id;

  return (
    <div className="space-y-8 pb-12 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-2 rounded-lg transition-all ${
              bookmarked ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/10 text-gray-400'
            }`}
            title={bookmarked ? 'Bookmarked' : 'Bookmark'}
          >
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400" title="Share">
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </motion.div>

      {/* Discussion Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8"
      >
        {/* Discussion Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
                    <span className="font-bold text-white">
                      {discussion.author?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold">{discussion.author?.name || 'Anonymous'}</h4>
                    <p className="text-sm text-gray-400">
                      Posted {new Date(discussion.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {discussion.isPinned && (
                  <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-4">{discussion.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {discussion.tags?.map((tag, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    #{tag}
                  </span>
                ))}
                {discussion.group && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {discussion.group.name}
                  </span>
                )}
                {discussion.problem && (
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                    <Code2 className="w-3 h-3" /> {discussion.problem.title}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Discussion Body */}
          <div className="prose prose-invert max-w-none mb-8">
            <MarkdownRenderer>{discussion.content}</MarkdownRenderer>
          </div>

          {/* Discussion Stats and Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  liked 
                    ? 'bg-[#00d4aa] text-black font-bold' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <ThumbsUp className="w-5 h-5" /> {discussion.likeCount || discussion.likes?.length || 0}
              </button>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-5 h-5" /> {discussion.commentCount || comments.length}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-5 h-5" /> {discussion.views || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAuthor && (
                <>
                  <button className="p-2 rounded-lg hover:bg-white/10">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-500/20 text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
              <button className="p-2 rounded-lg hover:bg-white/10">
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-8">
          {/* Add Comment */}
          <div className="glass p-6 rounded-2xl border border-white/10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
                  <span className="font-bold text-white">
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment..."
                  className="w-full glass-input rounded-xl p-4 min-h-[100px] mb-4"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10">
                      <Code2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10">
                      <Brain className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10">
                      <Lightbulb className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)" }}
                  >
                    <Send className="w-4 h-4" /> Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#00d4aa]" /> 
              Comments ({comments.length})
            </h3>
            
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No comments yet</h3>
                <p className="text-gray-400 mb-6">Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment._id || comment.id || `comment-${Math.random()}`}>
                    <Comment
                      comment={comment}
                      onReply={handleReply}
                      onLike={() => {}}
                    />
                    {isAuthor && !discussion.solutionComment && (
                      <button
                        onClick={() => handleMarkSolution(comment._id || comment.id)}
                        className="mt-2 ml-8 text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Mark as Solution
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Sidebar for Related Content */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-bold mb-6">Related Discussions</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00d4aa]/30 transition-all">
              <h4 className="font-bold mb-2">Similar problem: Two Sum variation</h4>
              <p className="text-sm text-gray-400 mb-3">Discussion about optimizing Two Sum solution...</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">12 comments</span>
                <span className="text-[#00d4aa]">View →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;