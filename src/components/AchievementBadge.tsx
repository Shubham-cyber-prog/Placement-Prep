import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Award, 
  Crown, 
  Zap, 
  Shield, 
  Sword, 
  Gem, 
  Sparkles,
  Medal,
  Clock,
  Users,
  CheckCircle,
  TrendingUp,
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface AchievementBadgeProps {
  achievement: {
    type: 'badge' | 'streak' | 'milestone' | 'special';
    name: string;
    description: string;
    points: number;
    earnedAt?: string;
    unlocked?: boolean;
    icon?: string;
    category?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    progress?: number; // For progress-based achievements (0-100)
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'compact' | 'detailed' | 'card';
  showPoints?: boolean;
  showDetails?: boolean;
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  variant = 'default',
  showPoints = true,
  showDetails = false,
  showProgress = false,
  onClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get icon based on type or custom icon
  const getIcon = () => {
    if (achievement.icon) {
      switch (achievement.icon) {
        case 'flame': return <Flame className="w-full h-full" />;
        case 'crown': return <Crown className="w-full h-full" />;
        case 'zap': return <Zap className="w-full h-full" />;
        case 'shield': return <Shield className="w-full h-full" />;
        case 'sword': return <Sword className="w-full h-full" />;
        case 'gem': return <Gem className="w-full h-full" />;
        case 'sparkles': return <Sparkles className="w-full h-full" />;
        case 'medal': return <Medal className="w-full h-full" />;
        case 'clock': return <Clock className="w-full h-full" />;
        case 'users': return <Users className="w-full h-full" />;
        case 'check': return <CheckCircle className="w-full h-full" />;
        case 'trending': return <TrendingUp className="w-full h-full" />;
        default: return <Trophy className="w-full h-full" />;
      }
    }
    
    switch (achievement.type) {
      case 'badge': return <Trophy className="w-full h-full" />;
      case 'streak': return <Flame className="w-full h-full" />;
      case 'milestone': return <Award className="w-full h-full" />;
      case 'special': return <Crown className="w-full h-full" />;
      default: return <Star className="w-full h-full" />;
    }
  };

  // Get rarity colors and effects
  const getRarityStyles = () => {
    const baseStyles = {
      common: {
        bg: 'from-gray-400/20 to-gray-600/20',
        border: 'border-gray-500/30',
        glow: 'shadow-gray-500/20',
        text: 'text-gray-300',
        points: 'text-yellow-400'
      },
      rare: {
        bg: 'from-blue-400/20 to-cyan-600/20',
        border: 'border-blue-500/40',
        glow: 'shadow-blue-500/30',
        text: 'text-blue-300',
        points: 'text-yellow-300'
      },
      epic: {
        bg: 'from-purple-500/20 to-pink-600/20',
        border: 'border-purple-500/50',
        glow: 'shadow-purple-500/40',
        text: 'text-purple-300',
        points: 'text-yellow-200'
      },
      legendary: {
        bg: 'from-yellow-400/20 to-orange-600/20',
        border: 'border-yellow-500/60',
        glow: 'shadow-yellow-500/50',
        text: 'text-yellow-300',
        points: 'text-yellow-100'
      }
    };

    return baseStyles[achievement.rarity || 'common'];
  };

  // Get category colors
  const getCategoryColor = () => {
    switch (achievement.category) {
      case 'consistency': return 'bg-blue-500/20 text-blue-400';
      case 'performance': return 'bg-green-500/20 text-green-400';
      case 'volume': return 'bg-purple-500/20 text-purple-400';
      case 'skill': return 'bg-yellow-500/20 text-yellow-400';
      case 'speed': return 'bg-red-500/20 text-red-400';
      case 'community': return 'bg-cyan-500/20 text-cyan-400';
      case 'challenge': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-16 h-16',
      icon: 'w-6 h-6',
      text: 'text-xs',
      points: 'text-[10px]',
      glow: 'shadow-lg'
    },
    md: {
      container: 'w-24 h-24',
      icon: 'w-10 h-10',
      text: 'text-sm',
      points: 'text-xs',
      glow: 'shadow-xl'
    },
    lg: {
      container: 'w-32 h-32',
      icon: 'w-14 h-14',
      text: 'text-base',
      points: 'text-sm',
      glow: 'shadow-2xl'
    },
    xl: {
      container: 'w-40 h-40',
      icon: 'w-18 h-18',
      text: 'text-lg',
      points: 'text-base',
      glow: 'shadow-3xl'
    }
  };

  const config = sizeConfig[size];
  const rarity = getRarityStyles();

  // Render compact variant (for lists/grids)
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
        className={`
          relative group cursor-pointer ${className}
          ${achievement.unlocked ? '' : 'opacity-60'}
        `}
      >
        <div className={`
          relative ${config.container} rounded-2xl p-3
          ${achievement.unlocked 
            ? `bg-gradient-to-br ${rarity.bg} ${rarity.border} border-2 ${config.glow} ${rarity.glow}` 
            : 'bg-gray-900/50 border-2 border-gray-700/50'
          }
          transition-all duration-300
          ${isHovered ? 'scale-105' : ''}
        `}>
          {/* Main icon */}
          <div className="w-full h-full flex items-center justify-center">
            <div className={config.icon}>
              {getIcon()}
            </div>
          </div>

          {/* Lock overlay for locked achievements */}
          {!achievement.unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
              <Lock className="w-6 h-6 text-gray-500" />
            </div>
          )}

          {/* Hover glow effect */}
          {achievement.unlocked && isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent"
            />
          )}

          {/* Points badge */}
          {showPoints && (
            <div className={`
              absolute -top-2 -right-2 px-2 py-1 rounded-full
              ${achievement.unlocked 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                : 'bg-gray-700'
              }
              shadow-lg
            `}>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-white" />
                <span className="text-xs font-bold text-white">
                  {achievement.points}
                </span>
              </div>
            </div>
          )}

          {/* Progress ring for progress-based achievements */}
          {showProgress && achievement.progress !== undefined && (
            <div className="absolute inset-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke={achievement.unlocked ? "#00d4aa" : "#666"}
                  strokeWidth="3"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * achievement.progress) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Name and category below */}
        <div className="mt-2 text-center">
          <h4 className={`font-semibold ${config.text} ${rarity.text} truncate`}>
            {achievement.name}
          </h4>
          {achievement.category && variant !== 'compact' && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${getCategoryColor()}`}>
              {achievement.category}
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  // Render detailed variant (popup/modal style)
  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          relative glass p-6 rounded-3xl max-w-md mx-auto
          ${achievement.unlocked 
            ? `border-2 ${rarity.border}` 
            : 'border border-gray-700/50'
          }
          ${className}
        `}
      >
        {/* Header with icon and title */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`
            relative ${sizeConfig.lg.container} rounded-2xl p-4 flex items-center justify-center
            ${achievement.unlocked 
              ? `bg-gradient-to-br ${rarity.bg}` 
              : 'bg-gray-900/50'
            }
          `}>
            <div className={sizeConfig.lg.icon}>
              {getIcon()}
            </div>
            
            {!achievement.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                <Lock className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {achievement.name}
                </h3>
                {achievement.category && (
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor()}`}>
                    {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-bold text-yellow-500">
                  {achievement.points}
                </span>
              </div>
            </div>
            
            {achievement.rarity && (
              <div className="mt-2">
                <span className={`
                  text-xs font-bold px-2 py-1 rounded
                  ${achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400' :
                    achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400' :
                    achievement.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400' :
                    'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400'}
                `}>
                  {achievement.rarity.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-6">
          {achievement.description}
        </p>

        {/* Progress bar if applicable */}
        {achievement.progress !== undefined && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="font-bold text-[#00d4aa]">{achievement.progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${achievement.progress}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8]"
              />
            </div>
          </div>
        )}

        {/* Stats and metadata */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-xs text-gray-400">Type</p>
            <p className="font-medium capitalize">{achievement.type}</p>
          </div>
          
          <div className="p-3 rounded-xl bg-white/5">
            <p className="text-xs text-gray-400">Status</p>
            <p className={`font-medium ${achievement.unlocked ? 'text-green-400' : 'text-gray-400'}`}>
              {achievement.unlocked ? 'Unlocked' : 'Locked'}
            </p>
          </div>
        </div>

        {/* Earned date if unlocked */}
        {achievement.unlocked && achievement.earnedAt && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Earned on {new Date(achievement.earnedAt).toLocaleDateString()}</span>
          </div>
        )}
      </motion.div>
    );
  }

  // Render card variant (for dashboard)
  if (variant === 'card') {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        onClick={onClick}
        className={`
          glass rounded-2xl p-4 cursor-pointer group
          ${achievement.unlocked 
            ? 'border border-[#00d4aa]/20 hover:border-[#00d4aa]/40' 
            : 'border border-gray-700/50 hover:border-gray-600'
          }
          transition-all duration-300 ${className}
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`
            relative flex-shrink-0 w-12 h-12 rounded-xl p-2
            ${achievement.unlocked 
              ? 'bg-gradient-to-br from-[#00d4aa]/20 to-[#00b4d8]/20' 
              : 'bg-gray-800/50'
            }
          `}>
            <div className="w-full h-full">
              {getIcon()}
            </div>
            
            {!achievement.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                <Lock className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-bold text-white truncate">
                {achievement.name}
              </h4>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-bold text-yellow-500">
                  {achievement.points}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mb-2 line-clamp-2">
              {achievement.description}
            </p>
            
            <div className="flex items-center justify-between">
              {achievement.category && (
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor()}`}>
                  {achievement.category}
                </span>
              )}
              
              {achievement.unlocked ? (
                <div className="flex items-center gap-1 text-xs text-[#00d4aa]">
                  <CheckCircle className="w-3 h-3" />
                  <span>Unlocked</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant (standalone badge)
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotateY: 5 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`
        relative inline-block ${className}
        ${achievement.unlocked ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {/* Main badge container */}
      <div className={`
        relative ${config.container} rounded-3xl p-4
        ${achievement.unlocked 
          ? `bg-gradient-to-br ${rarity.bg} border-2 ${rarity.border} ${config.glow} ${rarity.glow}` 
          : 'bg-gray-900/80 border-2 border-gray-700/50'
        }
        transition-all duration-500
        ${isHovered && achievement.unlocked ? 'shadow-2xl' : ''}
      `}>
        {/* Animated background pattern */}
        {achievement.unlocked && (
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <motion.div
              animate={{ 
                x: [0, 100, 0],
                y: [0, 50, 0]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"
            />
          </div>
        )}

        {/* Icon container */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <motion.div
            animate={achievement.unlocked ? { 
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0 
            } : {}}
            transition={{ type: "spring", stiffness: 300 }}
            className={config.icon}
          >
            {getIcon()}
          </motion.div>
        </div>

        {/* Lock overlay for locked achievements */}
        {!achievement.unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl backdrop-blur-sm">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
        )}

        {/* Hover effects */}
        <AnimatePresence>
          {isHovered && achievement.unlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent"
            />
          )}
        </AnimatePresence>

        {/* Points display */}
        {showPoints && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`
              absolute -bottom-2 -right-2 px-3 py-1.5 rounded-full
              ${achievement.unlocked 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg' 
                : 'bg-gray-800 shadow'
              }
              backdrop-blur-sm
            `}
          >
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-white" />
              <span className="text-xs font-bold text-white">
                {achievement.points}
              </span>
            </div>
          </motion.div>
        )}

        {/* Progress ring for progress-based achievements */}
        {showProgress && achievement.progress !== undefined && (
          <div className="absolute inset-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke={achievement.unlocked ? "#00d4aa" : "#666"}
                strokeWidth="4"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * achievement.progress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Name and details below badge */}
      <div className="mt-4 text-center">
        <h4 className={`font-bold ${config.text} ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
          {achievement.name}
        </h4>
        
        {showDetails && (
          <>
            <p className={`text-xs text-gray-400 mt-1 ${config.points}`}>
              {achievement.description}
            </p>
            {achievement.category && (
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${getCategoryColor()}`}>
                {achievement.category}
              </span>
            )}
          </>
        )}
        
        {achievement.progress !== undefined && showProgress && (
          <div className="mt-2">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${achievement.progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-[#00d4aa] to-[#00b4d8]"
              />
            </div>
            <span className="text-xs text-gray-400 mt-1">
              {achievement.progress}% complete
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AchievementBadge;