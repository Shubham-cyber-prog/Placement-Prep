import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Index from "./pages/Index";
import Homepage from "./pages/Homepage";
import Auth from "./components/Auth";
import DSA from "./pages/DSA";
import InterviewPreparationPlatform from "./pages/InterviewPrep";
import MockTest from "./pages/MockTest";
import AptitudePage from "./pages/AptitudePage";
import ProblemDetail from "./pages/ProblemDetail";
import MyProgress from "./pages/MyProgress";
import Companies from "./pages/Companies";
import StudyMaterial from "./pages/StudyMaterial"; 
import SystemDesign from "./pages/SystemDesign";
import ComingSoon from "./pages/ComingSoon";
import Mentorship from "./pages/Mentorship";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import ScrollToTop from "./components/ScrollToTop";
import ResumeBuilder from "./pages/ResumeBuilder";   // ✅ NEW IMPORT
import { i } from "node_modules/framer-motion/dist/types.d-a9pt5qxk";

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
            <Route path="/study-material" element={<StudyMaterial />} />
            <Route path="/dsa/problem/:id" element={<ProblemDetail />} />
            <Route path="/system-design" element={<SystemDesign />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/my-progress" element={<MyProgress />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/mock-test" element={<MockTest />} />
            <Route path="/interview-prep" element={<InterviewPreparationPlatform />} />
            <Route path="/aptitude-test" element={<AptitudePage />} />
            <Route path="/interview" element={<ComingSoon />} />
            <Route path="/settings" element={<Settings />} />

            {/* ✅ Resume Builder now functional */}
            <Route path="/resume" element={<ResumeBuilder />} />

            <Route path="/tests" element={<ComingSoon />} />
            
            
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

        <ScrollToTop />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
