import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import {
  Code2,
  Brain,
  Users,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Flame,
  Award,
  ExternalLink,
  Layout,
  Cpu,
  Palette,
  Monitor,
  Rocket,
  Trophy
} from "lucide-react";

// --- YOUR CUSTOM COMPONENT IMPORTS ---
import StatCard from "@/components/StatCard";
import CategoryCard from "@/components/CategoryCard";
import ProgressRing from "@/components/ProgressRing";
import RecentActivity from "@/components/RecentActivity";
import UpcomingEvents from "@/components/UpcomingEvents";
import TopicProgress from "@/components/TopicProgress";

// --- DATA STRUCTURES ---
const categories = [
  {
    title: "DSA Practice",
    description: "Master Data Structures and Algorithms with 500+ coding problems",
    icon: Code2,
    count: 500,
    path: "/dsa",
    gradient: "linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)",
  },
  {
    title: "Aptitude",
    description: "Quantitative, Logical Reasoning & Verbal Ability questions",
    icon: Brain,
    count: 300,
    path: "/aptitude",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
  },
  {
    title: "Interview Prep",
    description: "HR, Technical & Behavioral interview questions bank",
    icon: Users,
    count: 200,
    path: "/interview",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
  },
  {
    title: "System Design",
    description: "Learn to design scalable systems for senior roles",
    icon: Lightbulb,
    count: 50,
    path: "/system-design",
    gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
  },
];

const topicProgress = [
  { name: "Arrays & Strings", solved: 45, total: 80, color: "#00d4aa" },
  { name: "Linked Lists", solved: 20, total: 40, color: "#8b5cf6" },
  { name: "Trees & Graphs", solved: 15, total: 60, color: "#f59e0b" },
  { name: "Dynamic Programming", solved: 10, total: 50, color: "#ec4899" },
  { name: "Sorting & Searching", solved: 30, total: 35, color: "#00b4d8" },
];

const techStack = [
  { name: "React/Next.js", level: 85, color: "bg-blue-500" },
  { name: "TypeScript", level: 70, color: "bg-blue-600" },
  { name: "Tailwind CSS", level: 95, color: "bg-cyan-500" },
  { name: "State Mgmt", level: 60, color: "bg-purple-500" },
];

const Index = () => {
  const [displayName, setDisplayName] = useState("Candidate");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setDisplayName(user.displayName || user.email?.split('@')[0] || "Candidate");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Welcome back, <span className="gradient-text">{displayName}!</span>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-primary" /> System Online. Ready to push some pixels today?
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/dsa")}
          className="px-6 py-3 rounded-xl font-bold text-primary-foreground flex items-center gap-2 shadow-lg shadow-primary/20"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Flame className="w-5 h-5 fill-current" /> Daily Code Sprint
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Components Built" value={42} change="+5 this week" changeType="positive" icon={Layout} delay={0.1} />
        <StatCard title="Streak" value="15 days" change="On fire!" changeType="positive" icon={TrendingUp} delay={0.15} />
        <StatCard title="Performance Score" value="98%" change="Optimization peak" changeType="positive" icon={Cpu} delay={0.2} />
        <StatCard title="UI Contributions" value={120} change="Global impact" changeType="neutral" icon={Palette} delay={0.25} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Preparation Tracks */}
          <div>
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-foreground">Preparation Tracks</h2>
               <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded border border-white/10">v2.0.4-stable</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <CategoryCard key={i} {...cat} />
              ))}
            </div>
          </div>

          {/* WOW FEATURE: Frontend Playground Card */}
          <div className="relative overflow-hidden group glass rounded-3xl p-8 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Monitor className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <span className="bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-primary/30">New Playground</span>
              <h2 className="text-2xl font-black mt-4 mb-2 italic">Live UI Sandbox</h2>
              <p className="text-muted-foreground max-w-md text-sm leading-relaxed mb-6">
                Practice building complex UI components with real-time feedback. Test your Tailwind skills and DOM manipulation.
              </p>
              <div className="flex gap-4">
                <button onClick={() => navigate("/aptitude")} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 hover:brightness-110 transition-all shadow-md shadow-primary/30">
                  Launch Editor <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">U{i}</div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">+12</div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Typo: changed opicProgress to topicProgress */}
          <TopicProgress topics={topicProgress} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Tech Stack Health Monitor */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" /> Skill Proficiency
            </h3>
            <div className="space-y-5">
              {techStack.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tight mb-2">
                    <span>{skill.name}</span>
                    <span className="text-primary">{skill.level}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${skill.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest border border-white/10 transition-all">
              Update Skill Map
            </button>
          </div>

          {/* Overall Progress Circle */}
          <div className="glass rounded-2xl p-6 flex flex-col items-center bg-gradient-to-b from-white/5 to-transparent">
            <h3 className="text-lg font-bold text-foreground mb-4">Mastery Progress</h3>
            <ProgressRing progress={68} label="Complete" />
            <div className="grid grid-cols-2 w-full gap-4 mt-6">
               <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase font-black text-muted-foreground">Solved</p>
                  <p className="text-lg font-bold">120</p>
               </div>
               <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase font-black text-muted-foreground">To Go</p>
                  <p className="text-lg font-bold">380</p>
               </div>
            </div>
          </div>

          <UpcomingEvents />
        </div>
      </div>

      {/* WOW FEATURE: Interactive Bottom Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {/* Card 1: Study Material (Mapped to /study-material) */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => navigate("/study-material")}
            className="p-8 rounded-3xl bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#00d4aa]/20 flex items-center justify-center mb-6 text-[#00d4aa]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-black text-xl mb-2 italic">Cheat Sheets</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">Hand-picked revision notes for React, System Design, and CSS Architecture.</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#00d4aa] tracking-widest group-hover:gap-3 transition-all">
                  Access Library <ExternalLink className="w-3 h-3" />
                </div>
            </div>
          </motion.div>

          {/* Card 2: Mentorship (Mapped to /mentorship) */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => navigate("/mentorship")}
            className="p-8 rounded-3xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#8b5cf6]/20 flex items-center justify-center mb-6 text-[#8b5cf6]">
              <Users className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-black text-xl mb-2 italic">Mock Sessions</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">Simulate real technical interviews with Senior Frontend Engineers.</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#8b5cf6] tracking-widest group-hover:gap-3 transition-all">
                  Book A Slot <ExternalLink className="w-3 h-3" />
                </div>
            </div>
          </motion.div>

          {/* Card 3: Resume Builder (Mapped to /resume) */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => navigate("/resume")}
            className="p-8 rounded-3xl bg-[#ec4899]/10 border border-[#ec4899]/20 flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#ec4899]/20 flex items-center justify-center mb-6 text-[#ec4899]">
              <Award className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-black text-xl mb-2 italic">Portfoli-Gen</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">Convert your progress into a high-converting developer resume.</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#ec4899] tracking-widest group-hover:gap-3 transition-all">
                  Generate PDF <ExternalLink className="w-3 h-3" />
                </div>
            </div>
          </motion.div>

          {/* Card 4: Progress Tracker */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => navigate("/progress")}
            className="p-8 rounded-3xl bg-[#00b4d8]/10 border border-[#00b4d8]/20 flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#00b4d8]/20 flex items-center justify-center mb-6 text-[#00b4d8]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-black text-xl mb-2 italic">My Progress</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">Track achievements, earn badges, and level up your coding skills.</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#00b4d8] tracking-widest group-hover:gap-3 transition-all">
                  View Dashboard <ExternalLink className="w-3 h-3" />
                </div>
            </div>
          </motion.div>
      </div>
    </div>
  );
};

export default Index;