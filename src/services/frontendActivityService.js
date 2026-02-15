import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class FrontendActivityService {
  constructor() {
    this.axios = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Record test session
  async recordTestSession(sessionData) {
    try {
      const response = await this.axios.post('/activities/test-session', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error recording test session:', error);
      throw error;
    }
  }

  // Record activity
  async recordActivity(activityType, metadata = {}) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.warn('No user ID found, skipping activity recording');
        return { success: false, message: 'User not authenticated' };
      }

      const activityData = {
        activityType,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language
        }
      };

      // Queue activity for batch processing
      this.queueActivity(userId, activityData);

      // For critical activities, send immediately
      const criticalActivities = ['test_started', 'test_completed', 'test_submitted'];
      if (criticalActivities.includes(activityType)) {
        return this.sendActivity(userId, activityData);
      }

      return { success: true, queued: true };
    } catch (error) {
      console.error('Error recording activity:', error);
      // Store in localStorage for later sync
      this.storeOfflineActivity(activityData);
      return { success: false, error: error.message };
    }
  }

  // Queue activity for batch processing
  queueActivity(userId, activityData) {
    const queue = JSON.parse(localStorage.getItem('activity_queue') || '[]');
    queue.push({
      userId,
      ...activityData,
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem('activity_queue', JSON.stringify(queue.slice(-100))); // Keep last 100

    // Process queue if it has 10+ items or every 30 seconds
    if (queue.length >= 10) {
      this.processActivityQueue();
    }
  }

  // Process activity queue
  async processActivityQueue() {
    const queue = JSON.parse(localStorage.getItem('activity_queue') || '[]');
    if (queue.length === 0) return;

    try {
      const response = await this.axios.post('/activities/batch', { activities: queue });
      if (response.data.success) {
        localStorage.removeItem('activity_queue');
        console.log(`✅ Synced ${queue.length} activities`);
      }
      return response.data;
    } catch (error) {
      console.error('Error syncing activities:', error);
      // Keep activities in queue for next attempt
      return { success: false, error: error.message };
    }
  }

  // Store offline activity
  storeOfflineActivity(activityData) {
    const offlineActivities = JSON.parse(localStorage.getItem('offline_activities') || '[]');
    offlineActivities.push({
      ...activityData,
      storedAt: new Date().toISOString()
    });
    localStorage.setItem('offline_activities', JSON.stringify(offlineActivities.slice(-50))); // Keep last 50
  }

  // Sync offline activities
  async syncOfflineActivities() {
    const offlineActivities = JSON.parse(localStorage.getItem('offline_activities') || '[]');
    if (offlineActivities.length === 0) return;

    try {
      const response = await this.axios.post('/activities/batch', { activities: offlineActivities });
      if (response.data.success) {
        localStorage.removeItem('offline_activities');
        console.log(`✅ Synced ${offlineActivities.length} offline activities`);
      }
      return response.data;
    } catch (error) {
      console.error('Error syncing offline activities:', error);
      return { success: false, error: error.message };
    }
  }

  // Send single activity
  async sendActivity(userId, activityData) {
    try {
      const response = await this.axios.post('/activities/record', {
        userId,
        ...activityData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending activity:', error);
      throw error;
    }
  }

  // Get user activities
  async getUserActivities(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const response = await this.axios.get(`/activities?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  // Get performance analytics
  async getPerformanceAnalytics(period = '30d') {
    try {
      const response = await this.axios.get(`/activities/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Get activity summary
  async getActivitySummary(period = '7d') {
    try {
      const response = await this.axios.get(`/activities/summary?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity summary:', error);
      throw error;
    }
  }

  // Get activity heatmap
  async getActivityHeatmap(year = new Date().getFullYear()) {
    try {
      const response = await this.axios.get(`/activities/heatmap?year=${year}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity heatmap:', error);
      throw error;
    }
  }

  // Get test sessions
  async getTestSessions(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const response = await this.axios.get(`/activities/test-sessions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching test sessions:', error);
      throw error;
    }
  }

  // Export activities
  async exportActivities(format = 'json', startDate, endDate) {
    try {
      const params = new URLSearchParams({ format });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await this.axios.get(`/activities/export?${params}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activities_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error) {
      console.error('Error exporting activities:', error);
      throw error;
    }
  }

  // Initialize activity tracking
  initialize() {
    // Set up periodic sync
    setInterval(() => this.processActivityQueue(), 30000); // Every 30 seconds
    setInterval(() => this.syncOfflineActivities(), 60000); // Every minute

    // Sync on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncOfflineActivities();
        this.processActivityQueue();
      }
    });

    // Sync on network status change
    window.addEventListener('online', () => {
      this.syncOfflineActivities();
      this.processActivityQueue();
    });

    // Record page view
    this.recordActivity('page_view', {
      path: window.location.pathname,
      referrer: document.referrer,
      title: document.title
    });

    console.log('✅ Activity tracking initialized');
    return this;
  }

  // Test activity tracking
  async trackTestActivity(testId, action, data = {}) {
    const activityTypes = {
      start: 'test_started',
      pause: 'test_paused',
      resume: 'test_resumed',
      submit: 'test_submitted',
      complete: 'test_completed',
      reset: 'test_reset'
    };

    return this.recordActivity(activityTypes[action], {
      testId,
      ...data
    });
  }

  // Question activity tracking
  async trackQuestionActivity(questionId, action, data = {}) {
    const activityTypes = {
      view: 'question_viewed',
      answer: 'question_answered',
      flag: 'question_flagged',
      review: 'question_reviewed'
    };

    return this.recordActivity(activityTypes[action], {
      questionId,
      ...data
    });
  }

  // Learning activity tracking
  async trackLearningActivity(resourceId, resourceType, action, data = {}) {
    const activityTypes = {
      start: 'resource_started',
      progress: 'resource_progress',
      complete: 'resource_completed',
      bookmark: 'resource_bookmarked'
    };

    return this.recordActivity(activityTypes[action], {
      resourceId,
      resourceType,
      ...data
    });
  }

  // Get platform analytics (admin only)
  async getPlatformAnalytics(period = '7d') {
    try {
      const response = await this.axios.get(`/activities/platform-analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching platform analytics:', error);
      throw error;
    }
  }

  // Cleanup old activities
  async cleanupActivities(olderThanDays = 365, dryRun = false) {
    try {
      const response = await this.axios.delete('/activities/cleanup', {
        data: { olderThanDays, dryRun }
      });
      return response.data;
    } catch (error) {
      console.error('Error cleaning up activities:', error);
      throw error;
    }
  }
}

export default new FrontendActivityService();