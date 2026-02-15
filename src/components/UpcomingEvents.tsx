import { motion } from "framer-motion";
import { Calendar, Clock, Target, Zap } from "lucide-react";

const UpcomingEvents = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-6">Upcoming Events</h3>
        <p className="text-gray-400 text-center py-8">No upcoming events</p>
      </div>
    );
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'recommended_test':
        return Target;
      case 'weekly_challenge':
        return Zap;
      case 'mock_interview':
        return Calendar;
      default:
        return Target;
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-6">Upcoming Events</h3>
      <div className="space-y-4">
        {events.slice(0, 3).map((event, index) => {
          const Icon = getEventIcon(event.type);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/10 hover:border-[#00d4aa]/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#00d4aa]/20">
                    <Icon className="w-4 h-4 text-[#00d4aa]" />
                  </div>
                  <span className="font-semibold">{event.title}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                  {event.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{event.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{event.duration} min</span>
                </div>
                <span>
                  {new Date(event.scheduledTime).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingEvents;