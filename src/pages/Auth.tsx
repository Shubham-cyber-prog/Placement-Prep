import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Lock, Mail, User, ArrowRight, Eye, EyeOff, 
  ShieldCheck, ShieldAlert, Fingerprint, Chrome, Github,
  Briefcase, CheckCircle2, Globe, Sparkles, Cpu, Scan
} from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  
  const getStrength = (pass: string) => {
    let s = 0;
    if (pass.length > 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };

  const strength = getStrength(password);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* --- HYPER-DYNAMIC BACKGROUND --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dvhndv7be/image/upload/v1676239162/noise_f7s6e2.png')] opacity-[0.05]" />
        
        {/* Animated Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1100px] min-h-[700px] grid grid-cols-1 lg:grid-cols-2 bg-[#0b1121]/60 border border-white/10 rounded-[4rem] backdrop-blur-3xl overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.7)] relative z-20"
      >
        {/* LEFT PANEL: DATA VISUALIZATION */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent border-r border-white/5 relative overflow-hidden">
          
          {/* Logo & Status */}
          <div className="relative z-10 flex flex-col gap-10">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-cyan-400 p-2.5 rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-transform group-hover:scale-110">
                <Zap className="w-7 h-7 text-black fill-current" />
              </div>
              <span className="text-3xl font-black tracking-tighter text-white uppercase italic">PlacePrep</span>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <Scan className="w-4 h-4 animate-pulse" /> Authentication Node 01
              </div>
              <h2 className="text-7xl font-black text-white italic leading-[0.8] uppercase tracking-tighter">
                Global <br /> <span className="text-cyan-400">Career</span> <br /> Archive.
              </h2>
            </div>
          </div>

          {/* Stats / Visual eye-candy */}
          <div className="relative z-10 grid grid-cols-2 gap-6">
             <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-md">
                <Globe className="w-6 h-6 text-cyan-400 mb-3" />
                <div className="text-2xl font-black text-white tracking-tighter">1K+</div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Candidates</div>
             </div>
             <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-md">
                <Cpu className="w-6 h-6 text-purple-400 mb-3" />
                <div className="text-2xl font-black text-white tracking-tighter">88.4%</div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Placement Rate</div>
             </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px]" />
        </div>

        {/* RIGHT PANEL: INTERACTIVE FORM */}
        <div className="p-10 md:p-20 flex flex-col justify-center relative bg-black/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'signin' : 'signup'}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: "anticipate" }}
            >
              <div className="mb-12">
                <h3 className="text-5xl font-black text-white italic mb-3 tracking-tighter uppercase leading-none">
                  {isLogin ? 'Init Session' : 'Create Profile'}
                </h3>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-[2px] bg-cyan-400" />
                   <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">
                    {isLogin ? 'System Authorization Required' : 'Initialize Career Protocol'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* HIGH-END SOCIAL LOGINS */}
                <div className="flex gap-4">
                   <button className="flex-1 flex items-center justify-center gap-3 bg-[#020617] border border-white/10 py-4 rounded-3xl hover:border-cyan-400/50 transition-all hover:bg-cyan-400/5 group">
                      <Chrome className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                   </button>
                   <button className="flex-1 flex items-center justify-center gap-3 bg-[#020617] border border-white/10 py-4 rounded-3xl hover:border-cyan-400/50 transition-all hover:bg-cyan-400/5 group">
                      <Github className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                   </button>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400" />
                      <input type="text" placeholder="Candidate Identifier" className="w-full bg-[#020617] border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 outline-none focus:border-cyan-500/50 focus:bg-[#0b1121] transition-all text-xs font-bold" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Candidate Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400" />
                    <input type="email" placeholder="user@careerarchive.com" className="w-full bg-[#020617] border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 outline-none focus:border-cyan-500/50 focus:bg-[#0b1121] transition-all text-xs font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between px-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Key</label>
                    {isLogin && <button className="text-[10px] font-black text-cyan-500 uppercase hover:text-white">Recover</button>}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-[#020617] border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-14 outline-none focus:border-cyan-500/50 focus:bg-[#0b1121] transition-all text-xs font-bold" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {!isLogin && password.length > 0 && (
                    <div className="px-3 pt-3">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((step) => (
                          <div key={step} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step <= strength ? 'bg-cyan-400 shadow-[0_0_15px_#22d3ee]' : 'bg-white/5'}`} />
                        ))}
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mt-3 flex items-center gap-2">
                        <ShieldCheck size={12} className={strength >= 3 ? "text-cyan-400" : "text-slate-700"} />
                        Entropy Level: {strength < 2 ? 'Insufficient' : strength < 4 ? 'Standard' : 'Elite Security'}
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-cyan-400 text-black py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-all flex items-center justify-center gap-4 mt-6 overflow-hidden relative group"
                >
                  <span className="relative z-10">{isLogin ? 'Access Archive' : 'Initiate Profile'}</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                  <motion.div 
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </button>

                <div className="text-center pt-10">
                  <button 
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="group relative inline-flex flex-col items-center"
                  >
                    <span className="text-[11px] font-black text-slate-500 group-hover:text-white transition-all uppercase tracking-[0.4em]">
                      {isLogin ? "Generate New Candidate Profile" : "Back to Access Layer"}
                    </span>
                    <div className="w-0 h-[2px] bg-cyan-400 group-hover:w-full transition-all duration-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;