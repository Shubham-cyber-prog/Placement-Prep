import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Index from "./pages/Index";
import Homepage from "./pages/Homepage";
import Auth from "./pages/Auth";
import DSA from "./pages/DSA";
import ProblemDetail from "./pages/ProblemDetail";
import Companies from "./pages/Companies";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import ResumeBuilder from "./pages/ResumeBuilder";   // ✅ NEW IMPORT

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Index />} />
            <Route path="/dsa" element={<DSA />} />
            <Route path="/dsa/problem/:id" element={<ProblemDetail />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/aptitude" element={<ComingSoon />} />
            <Route path="/interview" element={<ComingSoon />} />
            <Route path="/system-design" element={<ComingSoon />} />
            <Route path="/progress" element={<ComingSoon />} />
            <Route path="/materials" element={<ComingSoon />} />

            {/* ✅ Resume Builder now functional */}
            <Route path="/resume" element={<ResumeBuilder />} />

            <Route path="/tests" element={<ComingSoon />} />
            <Route path="/mentorship" element={<ComingSoon />} />
            <Route path="/settings" element={<ComingSoon />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

        <ScrollToTop />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
