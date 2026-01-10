import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Globe, Layers, Trophy, Code2,
  Settings, Users, FileText, FlaskConical,
  Radio, CheckCircle2, Target, Eye
} from 'lucide-react';

const Homepage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();

  const yHero = useTransform(scrollYProgress, [0, 0.5], [0, -150]);
  const rotateText = useTransform(scrollYProgress, [0, 0.5], [0, 5]);

  // --- NEURAL NETWORK ENGINE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: any[] = [];
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      for (let i = 0; i < 150; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1
        });
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.1)";
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
          if (dist < 150) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    };
    init(); draw();
    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative cursor-crosshair">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      
      {/* --- ELITE NAV --- */}
      <nav className="flex items-center justify-between px-10 py-6 fixed top-0 w-full z-[100] border-b border-white/5 bg-[#020617]/50 backdrop-blur-2xl">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <motion.div 
            whileHover={{ rotate: 360 }} transition={{ duration: 1 }}
            className="bg-cyan-400 p-2 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.5)]"
          >
            <Zap className="w-5 h-5 text-black fill-current" />
          </motion.div>
          <span className="text-2xl font-black tracking-tighter text-white italic">PlacePrep</span>
        </div>
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
          <a href="#about" className="hover:text-cyan-400 hover:tracking-[0.6em] transition-all">About</a>
          <a href="#ecosystem" className="hover:text-cyan-400 hover:tracking-[0.6em] transition-all">Ecosystem</a>
          <a href="#console" className="hover:text-cyan-400 hover:tracking-[0.6em] transition-all">Console</a>
          <a href="#mentorship" className="hover:text-cyan-400 hover:tracking-[0.6em] transition-all">Network</a>
        </div>
        <button onClick={() => navigate('/auth')} className="px-10 py-3 bg-white text-black text-[10px] font-black rounded-full hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all">
          SIGN IN / UP
        </button>
      </nav>

      {/* --- HERO: TITAN TEXT --- */}
      <motion.section style={{ y: yHero, rotate: rotateText }} className="relative px-6 pt-64 pb-48 text-center z-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-black tracking-[0.3em] uppercase mb-12">
          <Radio className="w-4 h-4" /> System v2.0.26 // Active Prep Engine
        </motion.div>
        
        <h1 className="text-8xl md:text-[180px] font-black mb-8 tracking-[-0.08em] leading-[0.75] text-white">
          THE <motion.span whileHover={{ skewX: -10 }} className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 inline-block">CAREER</motion.span> <br />
          ARCHIVE.
        </h1>

        <p className="text-xl md:text-3xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium italic tracking-tight">
          "Structured preparation leads to success."
        </p>

        <button 
          onClick={() => navigate('/dashboard')} 
          className="relative px-16 py-7 bg-transparent border-2 border-cyan-400 text-cyan-400 rounded-3xl font-black text-2xl overflow-hidden group transition-all"
        >
          <span className="relative z-10 group-hover:text-black transition-colors">INITIALIZE BOOT</span>
          <div className="absolute inset-0 bg-cyan-400 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </motion.section>

      {/* --- ABOUT SECTION: SYSTEM ORIGIN --- */}
      <section id="about" className="max-w-7xl mx-auto px-6 mb-60 z-20 relative">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <h2 className="text-5xl font-black text-white italic mb-8 uppercase tracking-tighter">System Origin</h2>
            <p className="text-slate-400 text-xl leading-relaxed mb-8 font-medium">
              PlacePrep was engineered to bridge the gap between academic theory and industry-grade architecture. We don't just provide questions; we build the mindset required to design, scale, and secure high-performance systems at MAANG.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 group hover:border-cyan-400 transition-all">
                <Target className="w-8 h-8 text-cyan-400 mb-4" />
                <h4 className="text-white font-bold mb-2 uppercase">Mission</h4>
                <p className="text-slate-500 text-sm italic">Automating the path to elite technical mastery.</p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 group hover:border-purple-400 transition-all">
                <Eye className="w-8 h-8 text-purple-400 mb-4" />
                <h4 className="text-white font-bold mb-2 uppercase">Vision</h4>
                <p className="text-slate-500 text-sm italic">Becoming the global standard for placement architecture.</p>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative bg-[#0b1121] border border-white/10 rounded-[4rem] p-12 overflow-hidden shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-[10px] font-black text-slate-500 ml-auto tracking-[0.3em]">VERSION 2.0.26</span>
              </div>
              <h3 className="text-3xl font-black text-white italic mb-6 uppercase">Why Us?</h3>
              <ul className="space-y-4">
                {["Curated MAANG Roadmaps", "Real-time Progress Sync", "Community-driven Mentorship", "AI-Powered Resume Logic"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-400 font-medium group cursor-default">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE BENTO ECOSYSTEM --- */}
      <section id="ecosystem" className="max-w-7xl mx-auto px-6 mb-60 z-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[300px]">
          
          {/* Dashboard Module */}
          <motion.div whileHover={{ scale: 0.98 }} className="md:col-span-8 md:row-span-2 bg-[#0b1121] border border-white/10 rounded-[4rem] p-16 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
               <Trophy className="w-16 h-16 text-cyan-400 mb-8" />
               <div className="text-right">
                  <div className="text-7xl font-black text-white italic">68%</div>
                  <div className="text-[10px] font-black text-cyan-400 tracking-[0.4em] uppercase">Architecture Progress</div>
               </div>
            </div>
            <h3 className="text-5xl font-black text-white italic mb-4 mt-12 tracking-tighter uppercase">Command Center</h3>
            <p className="text-slate-500 text-xl max-w-md font-medium">Real-time sync between DSA practice, system design, and interview readiness.</p>
            <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:opacity-20 transition-all duration-1000">
               <Settings className="w-96 h-96 animate-spin-slow" />
            </div>
          </motion.div>

          {/* Individual Track Modules */}
          <div className="md:col-span-4 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[4rem] p-12 flex flex-col justify-between group hover:rotate-2 transition-transform">
             <Code2 className="w-12 h-12 text-white/50 group-hover:text-white" />
             <h3 className="text-3xl font-black text-white italic">DSA Mastery</h3>
          </div>

          <div className="md:col-span-4 bg-[#0b1121] border border-white/5 p-12 rounded-[4rem] hover:bg-white/5 transition-all">
             <Layers className="w-12 h-12 text-blue-500 mb-6" />
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">System Design</h3>
          </div>

          {/* Resources Module */}
          <div className="md:col-span-6 bg-white/5 border border-white/5 backdrop-blur-3xl rounded-[4rem] p-12 flex items-center justify-between group">
             <div>
                <h3 className="text-3xl font-black text-white italic mb-2 uppercase tracking-tighter">Asset Hub</h3>
                <p className="text-slate-500 text-sm">Resumes, Companies, & Mocks.</p>
             </div>
             <div className="flex -space-x-4">
                {[Globe, FileText, FlaskConical].map((Icon, i) => (
                   <div key={i} className="w-14 h-14 bg-[#0b1121] border border-white/10 rounded-full flex items-center justify-center hover:-translate-y-4 transition-transform cursor-pointer">
                      <Icon className="w-6 h-6 text-cyan-400" />
                   </div>
                ))}
             </div>
          </div>

          <div id="mentorship" className="md:col-span-6 bg-cyan-400 rounded-[4rem] p-12 flex items-center justify-between group cursor-pointer overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-4xl font-black text-black italic leading-none uppercase tracking-tighter">Mentorship</h3>
                <p className="text-black/60 font-bold text-sm mt-2 uppercase tracking-widest underline decoration-2 underline-offset-4">Connect with Industry-level Preparation</p>
             </div>
             <Users className="w-24 h-24 text-black/10 group-hover:scale-150 transition-transform duration-1000" />
          </div>

        </div>
      </section>

      {/* --- DIAGNOSTIC TERMINAL --- */}
      <section id="console" className="max-w-5xl mx-auto px-6 mb-60 relative z-20">
        <div className="bg-[#0b1121] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
          <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase">
             <div className="flex gap-3"><div className="w-3 h-3 rounded-full bg-red-500/20" />Diagnostic_Console.sh</div>
             <div className="italic tracking-widest">Lead: Lead Name</div>
          </div>
          <div className="p-16 font-mono text-lg space-y-6">
            <p className="text-cyan-400 italic"># Mapping logic for high-performance placement...</p>
            <p className="text-white"><span className="text-purple-400">const</span> architect = <span className="text-orange-300">"User"</span>;</p>
            <p className="text-white">prep_efficiency += <span className="text-cyan-400 font-black">0.68</span>;</p>
            <div className="pt-8 w-full bg-white/5 h-2 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} whileInView={{ width: "68%" }} transition={{ duration: 2 }} className="h-full bg-cyan-400 shadow-[0_0_20px_#22d3ee]" />
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
<footer className="bg-black pt-48 pb-20 border-t border-white/5 relative z-20 text-center">
  <div className="flex flex-col items-center mb-24">
    <div className="flex items-center justify-center gap-4 mb-8">
      <Zap className="text-cyan-400 fill-current w-16 h-16 shadow-[0_0_20px_rgba(34,211,238,0.3)]" />
      <span className="text-6xl font-black tracking-tighter text-white uppercase italic">PlacePrep</span>
    </div>
    
    {/* DYNAMIC YEAR & WHITE TEXT */}
    <p className="text-[11px] font-black text-white tracking-[0.8em] uppercase mb-12 opacity-90">
       PLACEPREP © {new Date().getFullYear()} • LEAD ARCHITECT: Lead Name
    </p>
    
    <div className="flex justify-center gap-16 text-[11px] font-black text-white tracking-[0.4em] uppercase">
       <a 
         href="https://twitter.com" 
         target="_blank" 
         rel="noreferrer"
         className="hover:text-cyan-400 border-b-2 border-cyan-500 pb-1 transition-all duration-300"
       >
         Twitter
       </a>
       <a 
         href="https://github.com" 
         target="_blank" 
         rel="noreferrer"
         className="hover:text-cyan-400 border-b-2 border-cyan-500 pb-1 transition-all duration-300"
       >
         Github
       </a>
    </div>
  </div>

  <p className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">
     Designed for Career Growth & Technical Excellence
  </p>
</footer>
    </div>
  );
};

export default Homepage;