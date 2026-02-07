import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Target, Clock, CheckCircle, Play } from "lucide-react";

const PersonalizedPath = () => {
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPersonalizedPath();
  }, []);

  const fetchPersonalizedPath = async () => {
    try {
      const response = await fetch('/api/recommendations/generate-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPath(data);
    } catch (error) {
      console.error('Error fetching personalized path:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No learning path available</h3>
          <p className="mt-1 text-sm text-muted-foreground">Complete some problems to generate your personalized path.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-foreground">My Learning Path</h1>
        <p className="mt-2 text-muted-foreground">
          AI-powered recommendations based on your progress
        </p>
      </motion.div>

      {/* Weak Areas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-lg p-6 border"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Target className="mr-2 h-5 w-5" />
          Areas for Improvement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {path.weakAreas.difficulties.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Difficulty Levels</h3>
              <div className="flex flex-wrap gap-2">
                {path.weakAreas.difficulties.map((diff) => (
                  <span key={diff} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {diff}
                  </span>
                ))}
              </div>
            </div>
          )}
          {path.weakAreas.topics.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {path.weakAreas.topics.map((topicId) => (
                  <span key={topicId} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    Topic {topicId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-lg p-6 border"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          Recommended Items
        </h2>
        <div className="space-y-4">
          {path.recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium">{rec.item.title || rec.item.name}</h3>
                <p className="text-sm text-muted-foreground">{rec.reason}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {rec.priority} priority
                </span>
              </div>
              <button className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center">
                <Play className="mr-2 h-4 w-4" />
                Start
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-lg p-6 border"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Suggested Timeline
        </h2>
        <div className="space-y-4">
          {path.timeline.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center space-x-4"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.item}</h3>
                <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                {item.estimatedTime} min
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Estimated Time</span>
            <span className="text-lg font-bold text-primary">{path.estimatedTime} minutes</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalizedPath;
