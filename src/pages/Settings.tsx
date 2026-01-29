import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, Palette,
  Camera, Mail, Moon, Sun,
  Save, CheckCircle2, LogOut, ShieldCheck,
  MapPin, Briefcase, Award
} from "lucide-react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { applyTheme } from "../lib/theme";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    bio: "Passionate learner focusing on DSA and System Design.",
    company: "PlacePrep Student",
    location: "Bengaluru, India",
    skills: "React, Node.js, Python"
  });

  // AUTH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData((prev) => ({
          ...prev,
          name: user.displayName || "Candidate",
          email: user.email || ""
        }));
      } else {
        navigate("/auth");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // THEME INIT
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const handleSave = () => {
    setIsSaving(true);
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
          <h1 className="text-3xl font-bold uppercase italic">Node Configuration</h1>
          <p className="text-xs tracking-widest opacity-70 italic">
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
        {/* Sidebar */}
        <div className="space-y-2">
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
              {tab === "profile" && <User size={14} />}
              {tab === "security" && <Shield size={14} />}
              {tab === "appearance" && <Palette size={14} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
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
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-4">
                  <ShieldCheck size={32} className="text-cyan-400" />
                  <p>Firebase authentication active</p>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 border border-cyan-500/30 rounded-lg hover:border-cyan-500/60 transition-all">
                    <div className="flex items-center gap-3">
                      {theme === "dark" ? <Moon size={20} className="text-cyan-400" /> : <Sun size={20} className="text-yellow-500" />}
                      <div>
                        <p className="font-semibold text-sm uppercase">Theme</p>
                        <p className="text-xs opacity-60">Current: {theme === "dark" ? "Dark Mode" : "Light Mode"}</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        theme === "dark" ? "bg-cyan-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          theme === "dark" ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <button onClick={handleSave} disabled={isSaving} className="w-full glass px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2">
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-cyan-500 text-black px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
