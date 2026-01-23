import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Shield, Palette, Globe,
  Camera, Mail, Moon, Sun,
  Save, CheckCircle2, LogOut, ShieldCheck,
  MapPin, Briefcase, Award
} from "lucide-react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { applyTheme }  from "../lib/theme";

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
        <button onClick={handleLogout} className="text-red-500 font-bold">
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {["profile", "security", "appearance"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full px-4 py-3 uppercase text-xs font-black ${
                activeTab === tab ? "bg-cyan-500 text-black" : "glass"
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
          <motion.div className="glass p-8 min-h-[500px] flex flex-col justify-between">

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <p>Name: {userData.name}</p>
                <p>Email: {userData.email}</p>
                <p>Company: {userData.company}</p>
                <p>Location: {userData.location}</p>
                <p>Skills: {userData.skills}</p>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <ShieldCheck size={32} className="text-cyan-400" />
                <p>Firebase authentication active</p>
              </div>
            )}

            {/* APPEARANCE TAB */}
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

            {/* Footer */}
            <button onClick={handleSave} disabled={isSaving}>
              <Save /> Save
            </button>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div className="fixed bottom-4 right-4 bg-cyan-500 p-3">
            <CheckCircle2 /> Saved
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
