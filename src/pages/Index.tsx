import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
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
  Lightbulb,
} from "lucide-react";

// --- YOUR CUSTOM COMPONENT IMPORTS ---
import StatCard from "@/components/StatCard";
import CategoryCard from "@/components/CategoryCard";
import ProgressRing from "@/components/ProgressRing";
import RecentActivity from "@/components/RecentActivity";
import UpcomingEvents from "@/components/UpcomingEvents";
import TopicProgress from "@/components/TopicProgress";

// --- DATA STRUCTURES (UNTOUCHED) ---
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

const Index = () => {
  // --- DYNAMIC AUTH STATE ---
  const [displayName, setDisplayName] = useState("Candidate");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Use displayName if set, otherwise extract from email, fallback to 'Candidate'
        setDisplayName(user.displayName || user.email?.split('@')[0] || "Candidate");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, <span className="gradient-text">{displayName}!</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Continue your preparation journey. You're doing great!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-xl font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          Start Daily Challenge
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Problems Solved"
          value={120}
          change="+12 this week"
          changeType="positive"
          icon={CheckCircle}
          delay={0.1}
        />
        <StatCard
          title="Current Streak"
          value="15 days"
          change="Personal best!"
          changeType="positive"
          icon={TrendingUp}
          delay={0.15}
        />
        <StatCard
          title="Hours Practiced"
          value={48}
          change="This month"
          changeType="neutral"
          icon={Clock}
          delay={0.2}
        />
        <StatCard
          title="Target Companies"
          value={8}
          change="3 applied"
          changeType="neutral"
          icon={Target}
          delay={0.25}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Categories & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Preparation Tracks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
            </div>
          </div>

          {/* Topic Progress */}
          <TopicProgress topics={topicProgress} />
        </div>

        {/* Right Column - Activity & Events */}
        <div className="space-y-6">
          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="glass rounded-2xl p-6 flex flex-col items-center"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Overall Progress</h3>
            <ProgressRing progress={68} label="Complete" />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              You've completed 68% of your preparation goal
            </p>
          </motion.div>

          {/* Recent Activity */}
          <RecentActivity />

          {/* Upcoming Events */}
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
};

export default Index;