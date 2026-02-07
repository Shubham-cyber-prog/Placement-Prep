import React from 'react';
import { Badge, Card, CardContent } from './ui/card';
import { Trophy, Star, Target } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: {
    type: 'badge' | 'streak';
    name: string;
    description: string;
    points: number;
    earnedAt: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md'
}) => {
  const getIcon = () => {
    switch (achievement.type) {
      case 'badge':
        return <Trophy className="text-yellow-500" />;
      case 'streak':
        return <Target className="text-blue-500" />;
      default:
        return <Star className="text-purple-500" />;
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <Card className="inline-block">
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <div className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-100`}>
            {getIcon()}
          </div>
          <div>
            <h4 className="font-semibold text-sm">{achievement.name}</h4>
            <p className="text-xs text-gray-600">{achievement.description}</p>
            <div className="flex items-center mt-1">
              <Star className="w-3 h-3 text-yellow-500 mr-1" />
              <span className="text-xs font-medium">{achievement.points} pts</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
