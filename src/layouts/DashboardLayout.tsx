import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";

const DashboardLayout = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-1 p-6 ml-64 transition-all duration-300">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
