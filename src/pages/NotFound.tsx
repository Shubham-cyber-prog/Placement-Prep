import React, { useEffect, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  Terminal, 
  Zap, 
  ShieldAlert,
  Code2,
  Brain,
  Layers,
  Users
} from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Neural Background Engine (Kept for UI consistency)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: any[] = [];
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5
        });
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.05)";
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
          if (dist < 180) {
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

  const variants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30 flex items-center justify-center p-6 relative overflow-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <motion.div 
        initial="hidden" 
        animate="visible" 
        transition={{ staggerChildren: 0.1 }}
        className="max-w-4xl w-full z-10"
      >
        {/* Header Section */}
        <motion.div variants={variants} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">
              System Status: 404 Not Found
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4">
            Lost in the <span className="text-cyan-400 italic">Stack.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl border-l-2 border-cyan-500/30 pl-6 py-2">
            The requested resource could not be located within the PlacePrep directory. 
            Redirecting to known coordinates is recommended.
          </p>
        </motion.div>

        {/* Simplified Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Primary Action */}
          <motion.div 
            variants={variants}
            whileHover={{ y: -5 }}
            onClick={() => navigate('/')}
            className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:border-cyan-400/50 transition-all"
          >
            <Zap className="w-8 h-8 text-cyan-400 mb-12" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Initialize Recovery</h3>
              <p className="text-sm text-slate-500 uppercase tracking-widest font-black">Return to Dashboard</p>
            </div>
          </motion.div>

          {/* Secondary Action */}
          <motion.div 
            variants={variants}
            whileHover={{ y: -5 }}
            onClick={() => navigate(-1)}
            className="bg-[#0b1121] border border-white/10 rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors mb-12" />
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Back</h3>
              <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-black">Previous Node</p>
            </div>
          </motion.div>
        </div>

        {/* Footer Navigation Modules */}
        <motion.div variants={variants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'DSA', path: '/dsa', icon: Code2 },
            { name: 'Architecture', path: '/system-design', icon: Layers },
            { name: 'Aptitude', path: '/aptitude', icon: Brain },
            { name: 'Network', path: '/mentorship', icon: Users },
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => navigate(item.path)}
              className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-400/30 hover:bg-white/[0.05] transition-all group"
            >
              <item.icon className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">
                {item.name}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Terminal Trace */}
        <motion.div 
          variants={variants}
          className="mt-12 flex items-center justify-between border-t border-white/5 pt-8"
        >
          <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600 uppercase tracking-[0.3em]">
            <Terminal className="w-3 h-3" /> Trace_ID: {Math.random().toString(36).substring(7)}
          </div>
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.3em]">
            Loc: {window.location.pathname}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;