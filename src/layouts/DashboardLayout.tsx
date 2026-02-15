import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { Search, Bell, User, X, Check, Award, Flame, AlertTriangle, Info, ArrowRight } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import PageLoader from "@/components/PageLoader";

// Notification System Component
const NotificationSystem = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll, 
  onDismiss,
  isOpen,
  onClose 
}) => {
  const navigate = useNavigate();

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return <Check className="w-5 h-5 text-green-500" />;
      case 'achievement': return <Award className="w-5 h-5 text-yellow-500" />;
      case 'streak': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'test': return <Check className="w-5 h-5 text-[#00d4aa]" />;
      case 'reminder': return <Bell className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'achievement': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'streak': return 'bg-orange-500/10 border-orange-500/20';
      case 'test': return 'bg-[#00d4aa]/10 border-[#00d4aa]/20';
      case 'reminder': return 'bg-blue-500/10 border-blue-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      case 'info': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-white/5 border-white/10';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = Number(now) - Number(notifDate);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Notification Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-6 h-6 text-primary" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                {notifications.filter(n => !n.read).length > 0 && (
                  <button
                    onClick={onMarkAsRead}
                    className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-all"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-4 rounded-xl border ${getNotificationColor(notification.type)} ${
                        !notification.read ? 'ring-1 ring-primary/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          {notification.actionUrl && (
                            <button
                              onClick={() => {
                                navigate(notification.actionUrl);
                                onDismiss(notification.id);
                              }}
                              className="mt-2 text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                            >
                              {notification.actionText || 'View details'}
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              {notification.priority === 'high' && (
                                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                                  High priority
                                </span>
                              )}
                              {notification.category && (
                                <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                                  {notification.category}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => onDismiss(notification.id)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {notifications.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <button
                    onClick={onClearAll}
                    className="w-full py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Notification Toast Component
const NotificationToast = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const getToastStyles = (type) => {
    switch(type) {
      case 'success': return 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30';
      case 'achievement': return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'streak': return 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30';
      case 'warning': return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'error': return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30';
      default: return 'bg-gradient-to-r from-primary/20 to-primary/20 border-primary/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.5 }}
      className={`fixed top-20 right-6 w-96 p-4 rounded-xl border backdrop-blur-xl shadow-2xl z-50 ${getToastStyles(notification.type)}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {notification.type === 'success' && <Check className="w-5 h-5 text-green-500" />}
          {notification.type === 'achievement' && <Award className="w-5 h-5 text-yellow-500" />}
          {notification.type === 'streak' && <Flame className="w-5 h-5 text-orange-500" />}
          {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
        </div>
        <button
          onClick={() => onDismiss(notification.id)}
          className="p-1 hover:bg-muted rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const DashboardLayout = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return { name: 'User', role: 'User', email: '' };
  };

  const user = getUserData();
  const displayName = user.name || 'User';

  const handleProfileClick = () => {
    navigate("/settings");
  };

  // Add toast notification
  const addToast = (notification) => {
    const toast = {
      ...notification,
      id: `toast-${Date.now()}-${Math.random()}`
    };
    setToasts(prev => [...prev, toast]);
  };

  // Dismiss toast
  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || `notif-${Date.now()}-${Math.random()}`,
      timestamp: notification.timestamp || new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    
    // Show toast for important notifications
    if (notification.priority === 'high' || notification.type === 'achievement' || notification.type === 'streak') {
      addToast(newNotification);
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  // Dismiss notification
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Generate notifications based on user data
  const generateNotifications = () => {
    const newNotifications = [];
    
    // Welcome notification for new users
    if (notifications.length === 0) {
      newNotifications.push({
        id: `welcome-${Date.now()}`,
        type: 'info',
        title: '👋 Welcome to PrepMaster!',
        message: `Good to see you, ${displayName}! Start your preparation journey.`,
        timestamp: new Date(),
        read: false,
        priority: 'high',
        category: 'Welcome',
        actionUrl: '/dsa',
        actionText: 'Get started'
      });
    }

    // Daily practice reminder
    const lastLogin = localStorage.getItem('lastLogin');
    const today = new Date().toDateString();
    
    if (lastLogin !== today) {
      newNotifications.push({
        id: `daily-reminder-${Date.now()}`,
        type: 'reminder',
        title: '⏰ Daily Practice Reminder',
        message: 'Don\'t forget to practice today! Keep your streak alive.',
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        category: 'Reminder',
        actionUrl: '/dsa',
        actionText: 'Practice now'
      });
      localStorage.setItem('lastLogin', today);
    }

    // Streak milestone (example - you can make this dynamic based on actual streak)
    const streak = localStorage.getItem('streak') ? parseInt(localStorage.getItem('streak')) : 0;
    if (streak === 7) {
      newNotifications.push({
        id: `streak-7-${Date.now()}`,
        type: 'streak',
        title: '🔥 7-Day Streak!',
        message: 'You\'ve practiced for 7 days in a row! Amazing consistency!',
        timestamp: new Date(),
        read: false,
        priority: 'high',
        category: 'Achievement',
        actionUrl: '/progress',
        actionText: 'View streak'
      });
    }

    return newNotifications;
  };

  // Load initial notifications
  useEffect(() => {
    const initialNotifications = generateNotifications();
    initialNotifications.forEach(notification => {
      addNotification(notification);
    });
  }, []);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance to show a random notification every 2 minutes
      if (Math.random() < 0.1) {
        const randomNotifications = [
          {
            type: 'info',
            title: '📚 New Problem Available',
            message: 'Check out the newly added DSA problems in Arrays category!',
            priority: 'medium',
            actionUrl: '/dsa',
            actionText: 'View problems'
          },
          {
            type: 'achievement',
            title: '🎯 Daily Goal Progress',
            message: 'You\'re making great progress today! Keep going!',
            priority: 'low',
            actionUrl: '/progress',
            actionText: 'View progress'
          },
          {
            type: 'test',
            title: '📝 New Practice Test',
            message: 'A new DSA practice test is now available with 25 questions.',
            priority: 'medium',
            actionUrl: '/tests',
            actionText: 'Take test'
          }
        ];
        
        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        addNotification(randomNotification);
      }
    }, 120000); // Every 2 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <AnimatePresence>{loading && <PageLoader />}</AnimatePresence>

      {/* Notification Toasts */}
      <AnimatePresence>
        {toasts.map(toast => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onDismiss={dismissToast}
          />
        ))}
      </AnimatePresence>

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onMarkAsRead={markAllAsRead}
        onClearAll={clearAllNotifications}
        onDismiss={dismissNotification}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <div className="min-h-screen bg-background smooth-transition flex flex-col">
        <AppSidebar />

        <div className="ml-64 flex-1 flex flex-col smooth-transition ease-out">
          <header className="sticky top-0 z-30 h-16 glass border-b border-border/50">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search problems, topics, companies..."
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Dynamic Notification Bell */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleNotifications}
                  className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className={`w-5 h-5 transition-colors ${
                    notifications.filter(n => !n.read).length > 0 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"
                    />
                  )}
                  {notifications.filter(n => !n.read).length > 5 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                      {notifications.filter(n => !n.read).length > 99 ? '99+' : notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </motion.button>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.role || 'User'}
                    </p>
                  </div>

                  <button
                    onClick={handleProfileClick}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      location.pathname === "/settings"
                        ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                        : "bg-primary/20 text-primary hover:bg-primary/30"
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6 flex-1">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;