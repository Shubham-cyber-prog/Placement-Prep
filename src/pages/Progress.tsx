import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  Trophy, 
  TrendingUp, 
  Award, 
  Target,
  Zap,
  Flame,
  Lock,
  CheckCircle,
  Code2,
  BookOpen,
  Users,
  Calendar,
  ArrowRight
} from "lucide-react";

// Badge definitions matching PlacePrep theme
const badges = [
  {
    id: 'beginner',
    name: 'Beginner',
    icon: '🌱',
    description: 'Start your coding journey',
    requirement: 'Earn 100 points',
    pointsRequired: 100,
    color: '#00d4aa',
    glowColor: 'rgba(0, 212, 170, 0.3)'
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    icon: '🌿',
    description: 'Building solid foundations',
    requirement: 'Earn 500 points',
    pointsRequired: 500,
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.3)'
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: '🌳',
    description: 'Master developer status',
    requirement: 'Earn 1000 points',
    pointsRequired: 1000,
    color: '#00b4d8',
    glowColor: 'rgba(0, 180, 216, 0.3)'
  },
  {
    id: 'expert',
    name: 'Expert',
    icon: '⭐',
    description: 'Elite problem solver',
    requirement: 'Earn 2500 points',
    pointsRequired: 2500,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.3)'
  },
  {
    id: 'legend',
    name: 'Legend',
    icon: '👑',
    description: 'Top 1% developer',
    requirement: 'Earn 5000 points',
    pointsRequired: 5000,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.3)'
  },
  {
    id: 'master',
    name: 'Grand Master',
    icon: '💎',
    description: 'Ultimate achievement',
    requirement: 'Earn 10000 points',
    pointsRequired: 10000,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.3)'
  }
];

const Progress = () => {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('placeprepProgress');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      points: 0,
      unlockedBadges: [],
      stats: {
        problemsSolved: 0,
        coursesCompleted: 0,
        daysActive: 1,
        currentStreak: 0
      }
    };
  });

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [newBadge, setNewBadge] = useState(null);

  useEffect(() => {
    localStorage.setItem('placeprepProgress', JSON.stringify(progress));
  }, [progress]);

  const getCurrentLevel = () => {
    let currentBadge = badges[0];
    let nextBadge = badges[1];
    
    for (let i = badges.length - 1; i >= 0; i--) {
      if (progress.points >= badges[i].pointsRequired) {
        currentBadge = badges[i];
        nextBadge = badges[i + 1] || null;
        break;
      }
    }
    
    return { currentBadge, nextBadge };
  };

  const getProgressPercentage = () => {
    const { currentBadge, nextBadge } = getCurrentLevel();
    
    if (!nextBadge) return 100;
    
    const progressPercent = ((progress.points - currentBadge.pointsRequired) / 
      (nextBadge.pointsRequired - currentBadge.pointsRequired)) * 100;
    
    return Math.max(0, Math.min(100, progressPercent));
  };

  const earnPoints = (amount, statType) => {
    const oldPoints = progress.points;
    const newPoints = oldPoints + amount;

    // Check for newly unlocked badges
    badges.forEach(badge => {
      if (oldPoints < badge.pointsRequired && newPoints >= badge.pointsRequired) {
        const alreadyUnlocked = progress.unlockedBadges.find(u => u.id === badge.id);
        if (!alreadyUnlocked) {
          const updatedBadges = [...progress.unlockedBadges, {
            id: badge.id,
            date: new Date().toLocaleDateString()
          }];
          
          setProgress(prev => ({
            ...prev,
            points: newPoints,
            unlockedBadges: updatedBadges,
            stats: {
              ...prev.stats,
              [statType]: prev.stats[statType] + 1
            }
          }));
          
          setNewBadge(badge);
          setShowUnlockModal(true);
          return;
        }
      }
    });

    setProgress(prev => ({
      ...prev,
      points: newPoints,
      stats: {
        ...prev.stats,
        [statType]: prev.stats[statType] + 1
      }
    }));
  };

  const resetProgress = () => {
    if (confirm('⚠️ Reset all progress? This action cannot be undone.')) {
      setProgress({
        points: 0,
        unlockedBadges: [],
        stats: {
          problemsSolved: 0,
          coursesCompleted: 0,
          daysActive: 1,
          currentStreak: 0
        }
      });
    }
  };

  const { currentBadge, nextBadge } = getCurrentLevel();
  const progressPercentage = getProgressPercentage();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <span className="gradient-text">My Progress</span>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Track achievements, earn badges, level up
          </p>
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-white/5 px-3 py-2 rounded-xl border border-white/10">
          Achievement System v1.0
        </span>
      </motion.div>

      {/* Points Display & Level Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Points Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 border border-primary/20 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(0, 180, 216, 0.1) 100%)' }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="w-32 h-32" />
          </div>
          <div className="relative z-10 text-center">
            <p className="text-xs uppercase font-black tracking-widest text-muted-foreground mb-2">Total Points</p>
            <motion.div 
              className="text-6xl font-black mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ 
                background: 'linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {progress.points}
            </motion.div>
            <div className="flex items-center justify-center gap-2 text-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">Keep grinding!</span>
            </div>
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-3xl p-8 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{currentBadge.icon}</div>
              <div>
                <h3 className="text-2xl font-black italic">{currentBadge.name}</h3>
                <p className="text-xs text-muted-foreground">Current Level</p>
              </div>
            </div>
            {nextBadge && (
              <div className="text-right">
                <p className="text-sm font-bold text-primary">
                  {nextBadge.pointsRequired - progress.points} pts to next
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <ArrowRight className="w-3 h-3" /> {nextBadge.name}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Level Progress</span>
              <span className="text-primary">{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8] shadow-[0_0_15px_rgba(0,212,170,0.5)]"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass rounded-2xl p-6 border border-white/10 text-center">
          <Code2 className="w-8 h-8 mx-auto mb-3 text-[#00d4aa]" />
          <p className="text-3xl font-black mb-1">{progress.stats.problemsSolved}</p>
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Problems Solved</p>
        </div>
        <div className="glass rounded-2xl p-6 border border-white/10 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-3 text-[#8b5cf6]" />
          <p className="text-3xl font-black mb-1">{progress.stats.coursesCompleted}</p>
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Courses Done</p>
        </div>
        <div className="glass rounded-2xl p-6 border border-white/10 text-center">
          <Calendar className="w-8 h-8 mx-auto mb-3 text-[#f59e0b]" />
          <p className="text-3xl font-black mb-1">{progress.stats.daysActive}</p>
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Days Active</p>
        </div>
        <div className="glass rounded-2xl p-6 border border-white/10 text-center">
          <Flame className="w-8 h-8 mx-auto mb-3 text-[#ec4899] fill-current" />
          <p className="text-3xl font-black mb-1">{progress.stats.currentStreak}</p>
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Day Streak</p>
        </div>
      </motion.div>

      {/* Achievement Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" /> Achievement Badges
          </h2>
          <span className="text-xs text-muted-foreground">
            {progress.unlockedBadges.length} of {badges.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge, index) => {
            const isUnlocked = progress.points >= badge.pointsRequired;
            const unlockInfo = progress.unlockedBadges.find(u => u.id === badge.id);
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`relative glass rounded-2xl p-6 border transition-all duration-300 ${
                  isUnlocked 
                    ? 'border-primary/30 hover:border-primary/50 hover:shadow-lg' 
                    : 'border-white/10 opacity-50'
                }`}
                style={isUnlocked ? { boxShadow: `0 0 20px ${badge.glowColor}` } : {}}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl z-10">
                    <Lock className="w-12 h-12 text-white/30" />
                  </div>
                )}
                
                <div className="text-center relative z-0">
                  <motion.div 
                    className="text-6xl mb-3"
                    animate={isUnlocked ? { 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {badge.icon}
                  </motion.div>
                  <h3 className="text-xl font-black italic mb-1">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                    style={{ 
                      backgroundColor: isUnlocked ? `${badge.color}20` : 'rgba(255, 255, 255, 0.05)',
                      color: isUnlocked ? badge.color : 'var(--muted-foreground)',
                      border: `1px solid ${isUnlocked ? `${badge.color}40` : 'rgba(255, 255, 255, 0.1)'}`
                    }}
                  >
                    {isUnlocked ? <CheckCircle className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                    {badge.requirement}
                  </div>
                  {isUnlocked && unlockInfo && (
                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                      Unlocked {unlockInfo.date}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => earnPoints(50, 'problemsSolved')}
          className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)' }}
        >
          <Code2 className="w-5 h-5" /> Solve Problem (+50 pts)
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => earnPoints(100, 'coursesCompleted')}
          className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' }}
        >
          <BookOpen className="w-5 h-5" /> Complete Course (+100 pts)
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetProgress}
          className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20"
        >
          Reset Progress
        </motion.button>
      </motion.div>

      {/* Unlock Modal */}
      {showUnlockModal && newBadge && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowUnlockModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="glass rounded-3xl p-8 max-w-md text-center border border-primary/30"
            style={{ boxShadow: `0 0 50px ${newBadge.glowColor}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              className="text-8xl mb-4"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ duration: 0.6 }}
            >
              {newBadge.icon}
            </motion.div>
            <h2 className="text-3xl font-black italic mb-2 gradient-text">
              Badge Unlocked!
            </h2>
            <h3 className="text-2xl font-bold mb-2" style={{ color: newBadge.color }}>
              {newBadge.name}
            </h3>
            <p className="text-muted-foreground mb-6">{newBadge.description}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUnlockModal(false)}
              className="px-8 py-3 rounded-xl font-bold text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${newBadge.color} 0%, ${newBadge.color}CC 100%)` }}
            >
              Awesome! 🚀
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Progress;