import React from 'react';
import { motion, Variants } from 'framer-motion'; // Added Variants type
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ArrowLeft, 
  Search,
  Compass,
  Map,
  Frown,
  Rocket,
  AlertCircle,
  Code2,
  Brain,
  Users,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  // Explicitly typing variants prevents the "string not assignable" error
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4 font-sans">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl w-full"
      >
        {/* Main Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="h-2 bg-gradient-to-r from-[#00d4aa] via-[#00b4d8] to-[#8b5cf6]" />
          
          <div className="p-8 md:p-12">
            <motion.div 
              variants={itemVariants}
              className="relative mb-8 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#00d4aa]/20 rounded-full blur-3xl" />
                <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00d4aa] via-[#00b4d8] to-[#8b5cf6] relative">
                  404
                </h1>
                
                <motion.div
                  animate={{ 
                    rotate: 360,
                    y: [0, -10, 0]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute -top-8 -right-8 w-16 h-16 md:w-20 md:h-20"
                >
                  <Compass className="w-full h-full text-[#00d4aa]/30" />
                </motion.div>
                
                <motion.div
                  animate={{ 
                    rotate: -360,
                    y: [0, 10, 0]
                  }}
                  transition={{ 
                    rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute -bottom-8 -left-8 w-12 h-12 md:w-16 md:h-16"
                >
                  <Map className="w-full h-full text-[#00b4d8]/30" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center space-y-4 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Lost in the Digital Wilderness
              </h2>
              <p className="text-lg text-gray-400 max-w-lg mx-auto">
                The page you're searching for seems to have wandered off the beaten path.
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
            >
              {[
                { label: 'Return Home', desc: 'Go back to dashboard', icon: Home, color: '#00d4aa', path: '/' },
                { label: 'Go Back', desc: 'Return to previous page', icon: ArrowLeft, color: '#00b4d8', path: -1 },
                { label: 'Search', desc: 'Find what you need', icon: Search, color: '#8b5cf6', path: '/search' },
                { label: 'Start Practice', desc: 'Continue learning', icon: Rocket, color: '#f59e0b', path: '/practice' }
              ].map((btn, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => typeof btn.path === 'number' ? navigate(btn.path) : navigate(btn.path)}
                  className="group relative p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
                  style={{ borderColor: `rgba(255,255,255,0.1)` }}
                >
                  <btn.icon className="w-8 h-8 mb-3" style={{ color: btn.color }} />
                  <h3 className="text-lg font-semibold text-white mb-1">{btn.label}</h3>
                  <p className="text-sm text-gray-400">{btn.desc}</p>
                </motion.button>
              ))}
            </motion.div>

            {/* Popular Destinations */}
            <motion.div variants={itemVariants} className="space-y-4">
              <p className="text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Popular destinations:
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  { name: 'Dashboard', path: '/', icon: Home },
                  { name: 'DSA Practice', path: '/dsa', icon: Code2 },
                  { name: 'Aptitude', path: '/aptitude', icon: Brain },
                  { name: 'Interview Prep', path: '/interview', icon: Users },
                  { name: 'System Design', path: '/system-design', icon: Lightbulb },
                  { name: 'Progress', path: '/progress', icon: TrendingUp }
                ].map((link, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(link.path)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-all border border-white/5 hover:border-[#00d4aa]/30"
                  >
                    <link.icon className="w-4 h-4 text-[#00d4aa]" />
                    {link.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-white/10 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Frown className="w-3 h-3" />
                <span>Error 404</span>
                <span>•</span>
                <span className="font-mono">{window.location.pathname}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;