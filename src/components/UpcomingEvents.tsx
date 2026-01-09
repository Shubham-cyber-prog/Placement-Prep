import { motion } from "framer-motion";
import { Calendar, Clock, Building2, MapPin } from "lucide-react";

const events = [
  {
    id: 1,
    company: "Google",
    type: "Online Assessment",
    date: "Jan 15, 2026",
    time: "10:00 AM",
    status: "upcoming",
  },
  {
    id: 2,
    company: "Microsoft",
    type: "Technical Interview",
    date: "Jan 18, 2026",
    time: "2:00 PM",
    status: "upcoming",
  },
  {
    id: 3,
    company: "Amazon",
    type: "Coding Round",
    date: "Jan 22, 2026",
    time: "11:00 AM",
    status: "upcoming",
  },
];

const UpcomingEvents = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Events</h3>
        <button className="text-sm text-primary hover:underline">View Calendar</button>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{event.company}</span>
              </div>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary">
                {event.type}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{event.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UpcomingEvents;
