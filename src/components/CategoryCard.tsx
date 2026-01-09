import { motion } from "framer-motion";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  count: number;
  path: string;
  gradient: string;
  delay?: number;
}

const CategoryCard = ({
  title,
  description,
  icon: Icon,
  count,
  path,
  gradient,
  delay = 0,
}: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03 }}
      className="group"
    >
      <Link to={path}>
        <div className="relative glass rounded-2xl p-6 h-full overflow-hidden hover:border-primary/50 transition-all duration-300">
          {/* Background gradient */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
            style={{ background: gradient }}
          />

          {/* Icon */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
            style={{ background: gradient }}
          >
            <Icon className="w-7 h-7 text-background" />
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono">
              {count}+ problems
            </span>
            <motion.div
              className="flex items-center gap-1 text-primary text-sm font-medium"
              whileHover={{ x: 5 }}
            >
              <span>Start</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
