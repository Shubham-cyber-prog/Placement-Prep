import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Lock, Mail, User, ArrowRight, Eye, EyeOff, 
  ShieldCheck, Globe, Cpu, Scan, Chrome, Github,
  AlertCircle
} from 'lucide-react';

// Firebase imports
import { 
  auth, 
  googleProvider, 
  githubProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from '../firebase';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Password strength checker
  const getStrength = (pass) => {
    let s = 0;
    if (pass.length > 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };

  const strength = getStrength(password);

  // Handle email/password authentication
  // Replace Firebase imports with your backend calls
const handleAuth = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  // Basic validation
  if (!email || !password) {
    setError('Please fill in all required fields');
    setLoading(false);
    return;
  }

  if (!isLogin && !name) {
    setError('Please enter your name');
    setLoading(false);
    return;
  }

  try {
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password }
      : { name, email, password };

    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success) {
      // Store the token from your backend
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Navigate to progress page
      navigate('/dashboard');
    } else {
      setError(data.message || 'Authentication failed');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    setError(error.message || 'Authentication failed');
  } finally {
    setLoading(false);
  }
};

// Remove or disable social login for now


  // Handle social login
  const handleSocialLogin = async (provider) => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Social login successful:', result.user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Social login error:', error);
      
      switch (error.code) {
        case 'auth/popup-blocked':
          setError('Popup was blocked by your browser. Please allow popups for this site.');
          break;
        case 'auth/popup-closed-by-user':
          setError('Sign-in popup was closed before completing');
          break;
        case 'auth/unauthorized-domain':
          setError('This domain is not authorized for authentication');
          break;
        case 'auth/account-exists-with-different-credential':
          setError('An account already exists with the same email');
          break;
        default:
          setError(`Social login failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  // Toggle between login/signup
  const toggleAuthMode = () => {
    resetForm();
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
        {/* Fixed SVG URL with properly escaped quotes */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern id=%22grid%22 width=%2240%22 height=%2240%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M 40 0 L 0 0 0 40%22 fill=%22none%22 stroke=%22rgba(255,255,255,0.05)%22 stroke-width=%221%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22url(%23grid)%22/%3E%3C/svg%3E')]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1100px] min-h-[700px] grid grid-cols-1 lg:grid-cols-2 bg-[#0b1121]/60 border border-white/10 rounded-[4rem] backdrop-blur-3xl overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.7)] relative z-20"
      >
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent border-r border-white/5 relative overflow-hidden">
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
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px]" />
        </div>

        {/* Right Panel */}
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

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-6">
                {/* Social Login Buttons */}
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => handleSocialLogin(googleProvider)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-3 bg-[#020617] border border-white/10 py-4 rounded-3xl hover:border-cyan-400/50 transition-all hover:bg-cyan-400/5 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Chrome className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSocialLogin(githubProvider)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-3 bg-[#020617] border border-white/10 py-4 rounded-3xl hover:border-cyan-400/50 transition-all hover:bg-cyan-400/5 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Github className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-sm font-medium">GitHub</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="px-4 bg-[#0b1121] text-slate-500 font-bold tracking-widest">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400" />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Candidate Identifier" 
                        required={!isLogin}
                        disabled={loading}
                        className="w-full bg-[#020617] border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 outline-none focus:border-cyan-500/50 focus:bg-[#0b1121] transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed" 
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">
                    Candidate Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@careerarchive.com" 
                      required
                      disabled={loading}
                      className="w-full bg-[#020617] border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 outline-none focus:border-cyan-500/50 focus:bg-[#0b1121] transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between px-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Access Key <span className="text-red-400">*</span>
                    </label>
                    {isLogin && (
                      <button 
                        type="button"
                        className="text-[10px] font-black text-cyan-500 uppercase hover:text-white transition-colors"
                      >
                        Recover
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      required
                      disabled={loading}
                      minLength={isLogin ? 6 : 8}
                      className="w-full bg-[#020617] border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-14 outline-none focus:border-cyan-500/50 focus:bg-[#0b1121] transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {!isLogin && password.length > 0 && (
                    <div className="px-3 pt-3">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((step) => (
                          <div 
                            key={step} 
                            className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                              step <= strength 
                                ? step <= 2 
                                  ? 'bg-red-400' 
                                  : step <= 3 
                                    ? 'bg-yellow-400' 
                                    : 'bg-green-400'
                                : 'bg-white/5'
                            }`} 
                          />
                        ))}
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mt-3 flex items-center gap-2">
                        <ShieldCheck size={12} className={
                          strength >= 4 ? "text-green-400" : 
                          strength >= 3 ? "text-yellow-400" : 
                          "text-red-400"
                        } />
                        Password Strength: {strength < 2 ? 'Weak' : strength < 4 ? 'Good' : 'Strong'}
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={loading || (!isLogin && strength < 2)}
                  className="w-full bg-cyan-400 text-black py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-all flex items-center justify-center gap-4 mt-6 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative group"
                >
                  <span className="relative z-10">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⟳</span> Processing...
                      </span>
                    ) : isLogin ? 'Access Archive' : 'Initiate Profile'}
                  </span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                </button>

                <div className="text-center pt-10">
                  <button 
                    type="button"
                    onClick={toggleAuthMode}
                    disabled={loading}
                    className="group relative inline-flex flex-col items-center disabled:opacity-50"
                  >
                    <span className="text-[11px] font-black text-slate-500 group-hover:text-white transition-all uppercase tracking-[0.4em]">
                      {isLogin ? "Generate New Candidate Profile" : "Back to Access Layer"}
                    </span>
                    <div className="w-0 h-[2px] bg-cyan-400 group-hover:w-full transition-all duration-500" />
                  </button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;