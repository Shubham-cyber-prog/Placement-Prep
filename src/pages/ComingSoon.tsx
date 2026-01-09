import { motion } from "framer-motion";
import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ComingSoon = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <Construction className="w-20 h-20 text-primary" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-foreground mb-3">Coming Soon!</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          We're working hard to bring you this feature. Stay tuned for updates!
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
