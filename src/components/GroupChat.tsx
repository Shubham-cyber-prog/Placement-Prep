// components/GroupChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Smile, Paperclip, Sticker, 
  X, Edit2, Trash2, CheckCheck,
  Reply, Lock, MessageSquare, Loader
} from 'lucide-react';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

const GroupChat = ({ groupId, isMember, currentUser, groupName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!isMember) return;
    
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const newSocket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('joinGroup', groupId);
    });

    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on('messageUpdated', (updatedMessage) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

    newSocket.on('messageDeleted', ({ messageId }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, isDeleted: true, content: 'This message was deleted', attachments: [] }
            : msg
        )
      );
    });

    newSocket.on('userTyping', ({ userName, isTyping }) => {
      if (userName !== currentUser?.name) {
        setTypingUsers(prev => {
          if (isTyping) {
            return [...new Set([...prev, userName])];
          } else {
            return prev.filter(u => u !== userName);
          }
        });
      }
    });

    return () => {
      if (newSocket.connected) {
        newSocket.emit('leaveGroup', groupId);
        newSocket.disconnect();
      }
    };
  }, [groupId, isMember, currentUser]);

  useEffect(() => {
    if (isMember) {
      fetchMessages();
    }
  }, [groupId, page, isMember]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/messages/groups/${groupId}?page=${page}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (page === 1) {
            setMessages(data.data.messages);
          } else {
            setMessages(prev => [...data.data.messages, ...prev]);
          }
          setHasMore(data.data.pagination.page < data.data.pagination.pages);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/messages/groups/${groupId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: attachments.length > 0 ? 'image' : 'text',
          attachments: attachments,
          replyTo: replyTo?._id
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNewMessage('');
          setAttachments([]);
          setReplyTo(null);
          setShowEmojiPicker(false);
          setShowStickerPicker(false);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket && currentUser) {
      setIsTyping(true);
      socket.emit('typingStart', { 
        groupId, 
        userName: currentUser?.name || 'User' 
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        setIsTyping(false);
        socket.emit('typingStop', { 
          groupId, 
          userName: currentUser?.name || 'User' 
        });
      }
    }, 1000);
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  const handleStickerSelect = (sticker) => {
    setNewMessage(prev => prev + sticker.emoji);
    setShowStickerPicker(false);
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/emoji`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(prev => 
            prev.map(msg => 
              msg._id === messageId ? data.data : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newContent })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEditingMessage(null);
        }
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Delete this message?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Message will be updated via socket
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // FIXED: Properly typed file upload function
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newAttachments = Array.from(files).map(file => {
      // Type assertion to File
      const fileObj = file as File;
      return {
        url: URL.createObjectURL(fileObj),
        filename: fileObj.name,
        filetype: fileObj.type,
        size: fileObj.size
      };
    });
    
    setAttachments([...attachments, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const loadMoreMessages = () => {
    if (hasMore && !loading) {
      setPage(p => p + 1);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore && !loading) {
      loadMoreMessages();
    }
  };

  if (!isMember) {
    return (
      <div className="glass rounded-3xl p-8 text-center h-[600px] flex flex-col items-center justify-center">
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Join to Chat</h3>
        <p className="text-gray-400 max-w-md">
          You need to join this group to see messages and participate in discussions with other members.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[700px] glass rounded-3xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#00d4aa]/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">Group Chat</h3>
            <p className="text-xs text-gray-400">{groupName || 'Study Group'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#00d4aa] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#00d4aa] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#00d4aa] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-gray-400">
                {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.length} people are typing...`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading && page === 1 ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 text-[#00d4aa] animate-spin" />
          </div>
        ) : (
          <>
            {hasMore && (
              <button
                onClick={loadMoreMessages}
                disabled={loading}
                className="w-full py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load more messages'}
              </button>
            )}

            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No messages yet</h4>
                <p className="text-gray-400 text-sm">
                  Be the first to send a message in this group!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  currentUser={currentUser}
                  onReaction={handleReaction}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onReply={setReplyTo}
                  formatTime={formatTime}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply Indicator */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2 bg-white/5 border-t border-white/10 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Reply className="w-3 h-3 text-[#00d4aa]" />
                <span className="text-xs text-[#00d4aa]">Replying to {replyTo.sender?.name || 'User'}</span>
              </div>
              <p className="text-sm text-gray-400 truncate max-w-md">{replyTo.content}</p>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-white/10"
          >
            {attachments.map((file, index) => (
              <div key={index} className="relative flex-shrink-0">
                {file.filetype?.startsWith('image/') ? (
                  <div className="relative group">
                    <img 
                      src={file.url} 
                      alt="attachment" 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-lg flex items-center justify-center">
                      <span className="text-xs text-white">{file.filename?.slice(0, 10)}...</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center relative group">
                    <div className="text-xs text-gray-400 text-center p-1 break-words">
                      {file.filename?.slice(0, 10)}...
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-all"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-b from-transparent to-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5 text-gray-400" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
          />

          <button
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
            title="Emojis & Stickers"
          >
            <Sticker className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
            title="Emojis"
          >
            <Smile className="w-5 h-5 text-gray-400" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 glass-input rounded-xl px-4 py-2.5 text-sm"
          />

          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && attachments.length === 0) || sending}
            className="p-2.5 bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] text-black rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 right-6 z-50"
            >
              <div className="relative">
                <EmojiPicker 
                  onEmojiClick={handleEmojiClick} 
                  width={350}
                  height={400}
                />
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="absolute top-2 right-2 p-1 bg-white/10 hover:bg-white/20 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticker Picker */}
        <AnimatePresence>
          {showStickerPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 right-6 z-50 w-80 glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Emojis & Stickers</h4>
                <button
                  onClick={() => setShowStickerPicker(false)}
                  className="p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
                {[
                  '😊', '😂', '🥰', '😎', '🤔', '😴', '🥳', '😇',
                  '👍', '❤️', '🔥', '💯', '🎉', '🚀', '⭐', '✅',
                  '🎯', '💪', '🤝', '👏', '🙏', '💡', '🎨', '📚'
                ].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleStickerSelect({ emoji });
                    }}
                    className="p-3 hover:bg-white/10 rounded-lg transition-all text-2xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, currentUser, onReaction, onEdit, onDelete, onReply, formatTime }) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);

  const isOwnMessage = message.sender?._id === currentUser?._id;
  const isDeleted = message.isDeleted;

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  if (isDeleted) {
    return (
      <div className="flex justify-center">
        <div className="bg-white/5 rounded-lg px-4 py-2 text-sm text-gray-400 italic">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className="relative group max-w-[70%]"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Reply Indicator */}
        {message.replyTo && (
          <div className="mb-1 text-xs text-gray-400 border-l-2 border-[#00d4aa] pl-2 truncate max-w-xs">
            <span className="text-[#00d4aa]">↪ </span>
            Replying to {message.replyTo.sender?.name || 'User'}: {message.replyTo.content}
          </div>
        )}

        {/* Message Content */}
        <div
          className={`p-3 rounded-2xl ${
            isOwnMessage
              ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] text-black rounded-br-none'
              : 'bg-white/10 text-white rounded-bl-none'
          }`}
        >
          {!isOwnMessage && (
            <p className="text-xs font-medium text-[#00d4aa] mb-1">
              {message.sender?.name || 'Anonymous'}
            </p>
          )}
          
          {/* Message Text */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="bg-black/20 rounded px-2 py-1 text-sm text-white w-full"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onEdit(message._id, editedContent);
                    setIsEditing(false);
                  }
                }}
              />
              <button
                onClick={() => {
                  onEdit(message._id, editedContent);
                  setIsEditing(false);
                }}
                className="text-xs text-green-500 hover:text-green-400"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-red-500 hover:text-red-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Attachments */}
          {message.attachments?.map((attachment, index) => (
            <div key={index} className="mt-2">
              {attachment.filetype?.startsWith('image/') ? (
                <img
                  src={attachment.url}
                  alt="attachment"
                  className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-all"
                  onClick={() => window.open(attachment.url, '_blank')}
                />
              ) : (
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-all"
                >
                  <span className="text-sm truncate max-w-[200px]">{attachment.filename}</span>
                </a>
              )}
            </div>
          ))}

          {/* Message Footer */}
          <div className={`flex items-center justify-end gap-2 mt-1 text-[10px] ${
            isOwnMessage ? 'text-black/60' : 'text-gray-400'
          }`}>
            <span>{formatTime(message.createdAt)}</span>
            {message.isEdited && (
              <span className="italic">(edited)</span>
            )}
            {isOwnMessage && (
              <CheckCheck className="w-3 h-3" />
            )}
          </div>
        </div>

        {/* Emoji Reactions */}
        {message.emojis?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.emojis.map((emoji, index) => {
              const hasReacted = emoji.users?.some(id => id === currentUser?._id);
              return (
                <button
                  key={index}
                  onClick={() => onReaction(message._id, emoji.emoji)}
                  className={`px-2 py-0.5 text-xs rounded-full transition-all ${
                    hasReacted
                      ? 'bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/50'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {emoji.emoji} {emoji.users?.length || 0}
                </button>
              );
            })}
          </div>
        )}

        {/* Message Actions */}
        <AnimatePresence>
          {showActions && !isEditing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute ${
                isOwnMessage ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'
              } top-0 flex items-center gap-1`}
            >
              {/* Quick Reactions */}
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-1 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  title="Add reaction"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute ${
                        isOwnMessage ? 'right-0' : 'left-0'
                      } bottom-full mb-2 flex gap-1 p-1 bg-black/80 rounded-lg backdrop-blur-sm`}
                    >
                      {quickReactions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onReaction(message._id, emoji);
                            setShowReactions(false);
                          }}
                          className="p-1 hover:bg-white/10 rounded-lg transition-all text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => {
                  onReply(message);
                  setShowActions(false);
                }}
                className="p-1 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                title="Reply"
              >
                <Reply className="w-4 h-4" />
              </button>

              {isOwnMessage && (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowActions(false);
                    }}
                    className="p-1 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(message._id)}
                    className="p-1 bg-white/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GroupChat;