import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { Search, Bell, User } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import PageLoader from "@/components/PageLoader";
import Footer from "@/footer/Footer";

const DashboardLayout = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = "User"; // Placeholder, should be from auth context
  const handleProfileClick = () => {
    navigate("/settings");
  };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <AnimatePresence>{loading && <PageLoader />}</AnimatePresence>

      <div className="min-h-screen bg-background smooth-transition flex flex-col">
        <AppSidebar />

        <div className="ml-64 flex-1 flex flex-col smooth-transition ease-out">
          <header className="sticky top-0 z-30 h-16 glass border-b border-border/50">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search problems, topics, companies..."
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Notifications">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
  <p className="text-sm font-medium text-foreground">
    {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : "User"}
  </p>
  <p className="text-xs text-muted-foreground">
    {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : "User"}
  </p>
</div>

                  {/* UPDATED BUTTON: Added handleProfileClick and active state styling */}
                  <button
                    onClick={handleProfileClick}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        location.pathname === "/settings"
                        ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                        : "bg-primary/20 text-primary hover:bg-primary/30"
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6 flex-1">
            <motion.div
              key={location.pathname} // Adding key ensures the animation triggers on route change
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default DashboardLayout;
