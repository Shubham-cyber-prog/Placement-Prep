import React, { useEffect } from 'react';
import ActivityService from '../services/frontendActivityService';

const ActivityTracker = ({ children, userId }) => {
  useEffect(() => {
    // Initialize activity tracking
    ActivityService.initialize();

    // Track session start
    ActivityService.recordActivity('session_started', {
      sessionStart: new Date().toISOString()
    });

    // Track page views
    const handleRouteChange = () => {
      ActivityService.recordActivity('page_view', {
        path: window.location.pathname,
        title: document.title
      });
    };

    // Listen to route changes (if using React Router)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      // Track session end
      ActivityService.recordActivity('session_ended', {
        sessionEnd: new Date().toISOString()
      });

      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [userId]);

  // Track user interactions
  const trackInteraction = (element, eventType, metadata = {}) => {
    const handler = (e) => {
      ActivityService.recordActivity('user_interaction', {
        element,
        eventType,
        ...metadata,
        coordinates: {
          x: e.clientX,
          y: e.clientY
        }
      });
    };

    return handler;
  };

  return children;
};

export default ActivityTracker;