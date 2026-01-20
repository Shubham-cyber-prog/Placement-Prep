"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Award, Clock, CheckCircle2, Target, BarChart3, 
  Calendar, ChevronRight, Zap, Brain, ShieldCheck, Terminal,
  Trophy, Star, Activity, ArrowUpRight, Download, Info,
  History as HistoryIcon, RefreshCcw, Layout, BookOpen,
  Users, Plus, Sparkles, Flame, Gauge, Lightbulb, TrendingDown,
  Timer, Rocket, AlertTriangle
} from "lucide-react";

// --- STYLES ---
const glassStyle = "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl";

// --- INTERNAL UI COMPONENTS ---
const LocalBadge = ({ children, color = "bg-[#00d4aa]" }: { children: React.ReactNode, color?: string }) => (
  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${color} text-black`}>
    {children}
  </span>
);

// --- MOCKED DATA ---
const mockHistory = [
  { id: '1', testName: 'DSA Fundamentals', date: '2026-01-15', score: 8, total: 10, category: 'Technical', accuracy: 80, duration: '12m' },
  { id: '2', testName: 'System Design Expert', date: '2026-01-12', score: 7, total: 10, category: 'Architecture', accuracy: 70, duration: '25m' },
  { id: '3', testName: 'React Mastery', date: '2026-01-10', score: 10, total: 10, category: 'Frontend', accuracy: 100, duration: '8m' },
];

const achievements = [
  { id: 'a1', title: 'Algorithm Ace', desc: 'Score 100% on DSA.', icon: Terminal, unlocked: true, color: 'text-emerald-400' },
  { id: 'a2', title: 'Consistent', desc: '7 day practice streak.', icon: Calendar, unlocked: true, color: 'text-blue-400' },
  { id: 'a3', title: 'Architect', desc: 'Finish all 16 modules.', icon: ShieldCheck, unlocked: false, color: 'text-purple-400' },
];

const skillData = [
  { label: 'Data Structures', val: 85, col: 'bg-[#00d4aa]', info: 'Expert in Graphs & Trees' },
  { label: 'System Design', val: 62, col: 'bg-blue-500', info: 'Needs work on Sharding' },
  { label: 'Frontend', val: 94, col: 'bg-purple-500', info: 'Master of React Hooks' },
  { label: 'Backend', val: 45, col: 'bg-rose-500', info: 'Focus on SQL indexing' }
];

export default function MyProgress() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'insights'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a]">
        <RefreshCcw className="w-10 h-10 text-[#00d4aa] animate-spin mb-4" />
        <p className="text-[#00d4aa] font-black uppercase tracking-[0.3em] text-xs">Calibrating Metrics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10 font-sans selection:bg-[#00d4aa] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00d4aa]/10 rounded-lg border border-[#00d4aa]/20">
                <Gauge className="w-6 h-6 text-[#00d4aa]" />
              </div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                My <span className="text-[#00d4aa]">Progress</span>
              </h1>
            </div>
            <p className="text-gray-400 flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-[#00d4aa]" /> Tracking career growth since December 2025.
            </p>
          </div>

          <div className={`flex p-1 rounded-2xl ${glassStyle}`}>
            {['overview', 'history', 'insights'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)} 
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-[#00d4aa] text-black shadow-lg shadow-[#00d4aa]/20' : 'text-gray-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* MAIN CONTENT COLUMN */}
          <div className="lg:col-span-8 space-y-10">
            
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="ov" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className={`p-8 rounded-[2.5rem] ${glassStyle} relative overflow-hidden group`}>
                      <Flame className="absolute -right-4 -bottom-4 w-24 h-24 text-orange-500/10 group-hover:scale-125 transition-transform" />
                      <p className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Consistency</p>
                      <h4 className="text-3xl font-black italic">14 Days</h4>
                      <p className="text-[9px] text-orange-400 font-bold mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> BEATING 92% OF USERS
                      </p>
                    </div>
                    <div className={`p-8 rounded-[2.5rem] ${glassStyle} relative overflow-hidden group`}>
                      <Star className="absolute -right-4 -bottom-4 w-24 h-24 text-yellow-500/10 group-hover:scale-125 transition-transform" />
                      <p className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Avg. Accuracy</p>
                      <h4 className="text-3xl font-black italic">84.2%</h4>
                      <p className="text-[9px] text-[#00d4aa] font-bold mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +4.1% FROM LAST WEEK
                      </p>
                    </div>
                    <div className={`p-8 rounded-[2.5rem] ${glassStyle} relative overflow-hidden group`}>
                      <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/10 group-hover:scale-125 transition-transform" />
                      <p className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Est. Readiness</p>
                      <h4 className="text-3xl font-black italic">Lvl 4</h4>
                      <p className="text-[9px] text-blue-400 font-bold mt-2 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> ELIGIBLE FOR FAANG MOCKS
                      </p>
                    </div>
                  </div>

                  <section className={`p-10 rounded-[3rem] ${glassStyle} relative overflow-hidden group`}>
                    <Brain className="absolute -top-10 -right-10 w-64 h-64 opacity-5 group-hover:scale-105 transition-transform duration-700" />
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                        <Brain className="w-4 h-4 text-[#00d4aa]" /> Skill Proficiency
                      </h3>
                      <button className="p-2 hover:bg-white/5 rounded-full transition-all"><Download className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-10">
                      {skillData.map((skill) => (
                        <div key={skill.label} className="space-y-3">
                          <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span className="text-gray-300">{skill.label}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-500 lowercase italic font-normal">{skill.info}</span>
                              <span className="text-[#00d4aa] font-black">{skill.val}%</span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${skill.val}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={`h-full ${skill.col} shadow-[0_0_20px_rgba(0,212,170,0.3)] relative`}>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div key="hi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-[2.5rem] ${glassStyle} overflow-hidden`}>
                  <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                      <HistoryIcon className="w-4 h-4 text-[#00d4aa]" /> Assessment Registry
                    </h3>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-black/20 text-[9px] font-black uppercase text-gray-500">
                      <tr>
                        <th className="p-8">Test Domain</th>
                        <th className="p-8">Score</th>
                        <th className="p-8">Duration</th>
                        <th className="p-8">Accuracy</th>
                        <th className="p-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {mockHistory.map((t) => (
                        <tr key={t.id} className="hover:bg-white/[0.03] transition-colors group">
                          <td className="p-8">
                            <p className="font-bold text-sm text-white">{t.testName}</p>
                            <p className="text-[9px] text-gray-500 uppercase mt-1">{t.category} • {t.date}</p>
                          </td>
                          <td className="p-8 font-black text-lg italic text-[#00d4aa]">{t.score}/{t.total}</td>
                          <td className="p-8 text-gray-400 font-mono text-xs">{t.duration}</td>
                          <td className="p-8"><LocalBadge color={t.accuracy >= 80 ? "bg-[#00d4aa]" : "bg-yellow-500"}>{t.accuracy}%</LocalBadge></td>
                          <td className="p-8 text-right">
                             <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-lg"><ArrowUpRight className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {/* NEW INSIGHTS TAB IMPLEMENTATION */}
              {activeTab === 'insights' && (
                <motion.div key="ins" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Velocity vs Accuracy */}
                    <div className={`p-8 rounded-[2.5rem] ${glassStyle} space-y-6`}>
                      <div className="flex items-center gap-3">
                        <Timer className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest">Performance Velocity</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Avg. Response Time</span>
                          <span className="font-mono text-[#00d4aa]">42s / question</span>
                        </div>
                        <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                          <p className="text-[11px] text-purple-200 leading-relaxed italic">
                            "You are answering 15% faster than last month while maintaining accuracy. This indicates strong pattern recognition in DSA."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Weak Points / Danger Zones */}
                    <div className={`p-8 rounded-[2.5rem] ${glassStyle} space-y-6 border-l-4 border-l-rose-500`}>
                      <div className="flex items-center gap-3 text-rose-400">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="text-xs font-black uppercase tracking-widest">Focus Areas</h3>
                      </div>
                      <div className="space-y-4">
                        {['B+ Trees Scaling', 'Network Latency Math', 'OAuth2 Flows'].map(area => (
                          <div key={area} className="flex items-center justify-between group cursor-help">
                            <span className="text-sm text-gray-300">{area}</span>
                            <TrendingDown className="w-3 h-3 text-rose-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Career Readiness Projection */}
                  <section className={`p-10 rounded-[3rem] ${glassStyle} relative overflow-hidden bg-gradient-to-br from-[#00d4aa]/5 to-blue-500/5`}>
                    <Rocket className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 -rotate-12" />
                    <h3 className="text-xs font-black uppercase tracking-widest mb-8">Career Path Projection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="text-center space-y-2">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Product Companies</p>
                          <p className="text-2xl font-black text-[#00d4aa]">94% Match</p>
                       </div>
                       <div className="text-center space-y-2 border-x border-white/10">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Early Startups</p>
                          <p className="text-2xl font-black text-blue-400">78% Match</p>
                       </div>
                       <div className="text-center space-y-2">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Quant Trading</p>
                          <p className="text-2xl font-black text-purple-400">42% Match</p>
                       </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SIDEBAR WIDGETS */}
          <aside className="lg:col-span-4 space-y-10">
            <section className={`p-10 rounded-[3rem] ${glassStyle} space-y-8 relative overflow-hidden`}>
              <Trophy className="absolute -bottom-10 -right-10 w-40 h-40 opacity-5 rotate-12" />
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                  <Award className="w-4 h-4 text-yellow-500" /> Milestones
                </h3>
              </div>
              <div className="space-y-6 relative z-10">
                {achievements.map((ach) => (
                  <div key={ach.id} className={`flex items-center gap-5 p-4 rounded-2xl transition-all ${ach.unlocked ? 'bg-white/5 border border-white/5 scale-100' : 'opacity-20 grayscale scale-95'}`}>
                    <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                      <ach.icon className={`w-6 h-6 ${ach.unlocked ? ach.color : 'text-white'}`} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-tight leading-none mb-1">{ach.title}</p>
                      <p className="text-[9px] text-gray-500 italic leading-tight">{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={`p-10 rounded-[3rem] ${glassStyle} space-y-6`}>
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#00d4aa]" /> Study Pulse
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.2, zIndex: 10 }} className={`aspect-square rounded-[3px] transition-all cursor-crosshair ${i % 7 === 0 ? 'bg-[#00d4aa]' : i % 4 === 0 ? 'bg-[#00d4aa]/40' : 'bg-white/5 hover:bg-white/10'}`} />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}