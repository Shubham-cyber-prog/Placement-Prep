import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Shield, Bell, Palette, Globe, 
  Camera, Mail, Lock, Moon, Sun, 
  Trash2, Save, CheckCircle2, AlertCircle, LogOut, ShieldCheck,
  MapPin, Briefcase, Award
} from "lucide-react";
import { auth } from "../pages/firebase"; // Ensure path is correct
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // --- STATE MANAGEMENT ---
  const [userData, setUserData] = useState({
    name: "", // Fetched from Firebase
    email: "", // Fetched from Firebase
    bio: "Passionate learner focusing on DSA and System Design.", // Static for now
    company: "PlacePrep Student", // Static for now
    location: "Bengaluru, India", // Static for now
    skills: "React, Node.js, Python" // Static for now
  });

  // 1. DYNAMIC FETCH: Get Auth data directly from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData((prev) => ({
          ...prev,
          name: user.displayName || "Candidate",
          email: user.email || ""
        }));
      } else {
        // If not logged in, send back to auth page
        navigate("/auth");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. SIMULATED SAVE: Visual feedback for frontend progress
  const handleSave = async () => {
    setIsSaving(true);
    // Simulating a backend call
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tighter uppercase italic">Node Configuration</h1>
          <p className="text-muted-foreground font-medium italic text-xs tracking-widest opacity-70">
            Auth Layer: Firebase Active
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="glass px-4 py-2 rounded-xl text-xs font-black text-red-500 hover:bg-red-500/10 smooth-transition hover:scale-105 flex items-center gap-2 uppercase tracking-widest border border-red-500/20"
        >
          <LogOut className="w-4 h-4" /> Terminate Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {["profile", "security", "appearance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] smooth-transition ${
                activeTab === tab 
                  ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-105" 
                  : "glass text-slate-400 hover:bg-white/5 hover:scale-102"
              }`}
            >
              {tab === "profile" ? <User size={14}/> : tab === "security" ? <Shield size={14}/> : <Palette size={14}/>}
              {tab}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="lg:col-span-3">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="glass rounded-[2.5rem] p-8 border-white/10 backdrop-blur-3xl min-h-[500px] flex flex-col justify-between smooth-transition"
          >
            <div className="space-y-8">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Avatar Section - Seeded by Email */}
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                            <img 
                                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${userData.email}`} 
                                alt="Avatar" 
                                className="w-20 h-20 opacity-80"
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-2 bg-slate-950 border border-white/20 rounded-lg shadow-xl cursor-pointer hover:bg-cyan-500 group-hover:scale-110 smooth-transition">
                           <Camera className="text-white w-4 h-4" />
                        </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase text-white tracking-tighter italic">{userData.name}</h3>
                      <p className="text-[10px] text-cyan-400 font-black tracking-[0.3em] uppercase opacity-70">Authenticated Profile</p>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Archive Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                        <input 
                          type="email" 
                          disabled
                          value={userData.email}
                          className="w-full glass bg-slate-950/20 border-none ring-1 ring-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-slate-500 outline-none cursor-not-allowed italic smooth-transition" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Target Company</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                        <input 
                          type="text" 
                          value={userData.company}
                          onChange={(e) => setUserData({...userData, company: e.target.value})}
                          className="w-full glass bg-slate-950/50 border-none ring-1 ring-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500 smooth-transition" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Current Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                        <input 
                          type="text" 
                          value={userData.location}
                          onChange={(e) => setUserData({...userData, location: e.target.value})}
                          className="w-full glass bg-slate-950/50 border-none ring-1 ring-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500 smooth-transition" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Skill Matrix</label>
                      <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                        <input 
                          type="text" 
                          value={userData.skills}
                          onChange={(e) => setUserData({...userData, skills: e.target.value})}
                          className="w-full glass bg-slate-950/50 border-none ring-1 ring-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500 transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Career Objective / Bio</label>
                    <textarea 
                      rows={3}
                      value={userData.bio}
                      onChange={(e) => setUserData({...userData, bio: e.target.value})}
                      className="w-full glass bg-slate-950/50 border-none ring-1 ring-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500 transition-all" 
                    />
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="p-6 glass rounded-2xl border-cyan-500/20 flex items-center gap-4">
                    <ShieldCheck className="text-cyan-400 w-10 h-10" />
                    <div>
                      <h4 className="font-black uppercase text-xs tracking-widest">Access Layer Protection</h4>
                      <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                        Security credentials managed via Firebase Authorization Protocol. <br />
                        Archive Node: Secure
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Update Passcode</label>
                    <input type="password" placeholder="Current Secret" className="w-full glass bg-slate-950/50 border-none ring-1 ring-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none" />
                    <input type="password" placeholder="New Secret" className="w-full glass bg-slate-950/50 border-none ring-1 ring-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Save Action */}
            <div className="pt-8 border-t border-white/10 flex items-center justify-between">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic flex items-center gap-2">
                <Globe size={10} /> Edge Node Local Sync Active
              </span>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-10 py-3 bg-cyan-400 text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(34,211,238,0.2)] flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 hover:bg-cyan-300"
              >
                {isSaving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save size={14} />}
                Commit Changes
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{opacity:0, y:20}} 
            animate={{opacity:1, y:0}} 
            exit={{opacity:0}} 
            className="fixed bottom-8 right-8 glass bg-cyan-500 text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest z-50 shadow-[0_0_50px_rgba(34,211,238,0.4)]"
          >
            <CheckCircle2 size={16} className="inline mr-2" />
            Configuration Layer Updated
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;