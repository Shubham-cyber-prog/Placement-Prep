import { motion } from "framer-motion";
import { GraduationCap, MapPin, Briefcase, Star, ExternalLink, MessageCircle, Calendar } from "lucide-react";

const mentors = [
    {
        id: 1,
        name: "Vikram Singh",
        role: "Senior SDE",
        company: "Google",
        experience: "8+ Years",
        location: "Bangalore, India",
        expertise: ["System Design", "Distributed Systems", "Java"],
        rating: 4.9,
        sessions: 120,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        color: "#4285F4"
    },
    {
        id: 2,
        name: "Sarah Chen",
        role: "Tech Lead",
        company: "Microsoft",
        experience: "6+ Years",
        location: "Seattle, USA",
        expertise: ["Frontend", "React", "Cloud Architecture"],
        rating: 4.8,
        sessions: 95,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        color: "#00BCF2"
    },
    {
        id: 3,
        name: "Rahul Mishra",
        role: "Engineering Manager",
        company: "Amazon",
        experience: "10+ Years",
        location: "Hyderabad, India",
        expertise: ["Leadership", "Backend", "Scalability"],
        rating: 4.7,
        sessions: 150,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
        color: "#FF9900"
    },
    {
        id: 4,
        name: "Emily White",
        role: "Staff Engineer",
        company: "Netflix",
        experience: "9+ Years",
        location: "Los Gatos, USA",
        expertise: ["Microservices", "Java", "Kotlin"],
        rating: 4.9,
        sessions: 80,
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        color: "#E50914"
    },
    {
        id: 5,
        name: "David Kim",
        role: "Senior AI Researcher",
        company: "DeepMind",
        experience: "5+ Years",
        location: "London, UK",
        expertise: ["AI/ML", "Python", "TensorFlow"],
        rating: 5.0,
        sessions: 60,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        color: "#76B900"
    },
    {
        id: 6,
        name: "Priya Patel",
        role: "Product Manager",
        company: "Uber",
        experience: "7+ Years",
        location: "Bangalore, India",
        expertise: ["Product Strategy", "Management", "Agile"],
        rating: 4.8,
        sessions: 110,
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
        color: "#000000"
    }
];

const Mentorship = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Find a Mentor</h1>
                <p className="text-muted-foreground">Connect with experienced professionals for guidance and growth</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Active Mentors", value: "500+" },
                    { label: "Sessions", value: "12k+" },
                    { label: "Satisfaction", value: "4.9/5" },
                    { label: "Topics", value: "30+" },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass rounded-xl p-4 text-center"
                    >
                        <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Mentors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((mentor, index) => (
                    <motion.div
                        key={mentor.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="glass rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/50"
                    >
                        <div className="p-6">
                            {/* Profile Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img
                                            src={mentor.image}
                                            alt={mentor.name}
                                            className="w-16 h-16 rounded-2xl object-cover border-2 border-background shadow-md"
                                        />
                                        <div
                                            className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-background"
                                            style={{ backgroundColor: mentor.color }}
                                        >
                                            {mentor.company[0]}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground">{mentor.name}</h3>
                                        <p className="text-sm text-muted-foreground font-medium">{mentor.role}</p>
                                        <p className="text-xs text-primary font-semibold mt-0.5">at {mentor.company}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{mentor.rating}</span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Briefcase className="w-4 h-4 shrink-0" />
                                    <span>{mentor.experience} Exp</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{mentor.location}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {mentor.expertise.map(skill => (
                                        <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-medium border border-border">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                <button className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary py-2.5 rounded-xl text-sm font-semibold transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Chat</span>
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-primary/25">
                                    <Calendar className="w-4 h-4" />
                                    <span>Book</span>
                                </button>
                            </div>

                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Mentorship;
