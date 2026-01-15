import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Code2,
  Brain,
  Building2,
  FileText,
  Users,
  BookOpen,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/" },
      { name: "My Progress", icon: Target, path: "/progress" },
    ],
  },
  {
    title: "Preparation",
    items: [
      { name: "DSA Practice", icon: Code2, path: "/dsa" },
      { name: "Aptitude", icon: Brain, path: "/aptitude" },
      { name: "Interview Prep", icon: Users, path: "/interview" },
      { name: "System Design", icon: Lightbulb, path: "/system-design" },
    ],
  },
  {
    title: "Resources",
    items: [
      { name: "Companies", icon: Building2, path: "/companies" },
      { name: "Study Materials", icon: BookOpen, path: "/study-material" },
      { name: "Resume Builder", icon: FileText, path: "/resume" },
      { name: "Mock Tests", icon: Trophy, path: "/mock-test" },
    ],
  },
  {
    title: "More",
    items: [
      { name: "Mentorship", icon: GraduationCap, path: "/mentorship" },
      { name: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg gradient-text">PlacePrep</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {menuItems.map((section) => (
          <div key={section.title}>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>

            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "hover:bg-sidebar-accent text-sidebar-foreground",
                      collapsed && "justify-center"
                    )}
                    activeClassName="bg-sidebar-accent text-primary"
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 border-t border-sidebar-border flex items-center justify-center hover:bg-sidebar-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Collapse</span>
          </div>
        )}
      </button>
    </motion.aside>
  );
};

export default AppSidebar;
