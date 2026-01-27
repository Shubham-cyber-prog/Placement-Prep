import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

import DashboardLayout from "./layouts/DashboardLayout";
import ScrollToTop from "./components/ScrollToTop";

import Index from "./pages/Index";
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
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import ScrollToTop from "./components/ScrollToTop";
import ResumeBuilder from "./pages/ResumeBuilder";
import Mentorship from "./pages/Mentorship";
import Progress from "./pages/Progress";  // ✅ Badge system component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/dsa" element={<DSA />} />
            <Route path="/study-material" element={<StudyMaterial />} />
            <Route path="/dsa/problem/:id" element={<ProblemDetail />} />
            <Route path="/system-design" element={<SystemDesign />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/my-progress" element={<MyProgress />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/mock-test" element={<MockTest />} />
            <Route path="/aptitude-test" element={<AptitudePage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/resume" element={<ResumeBuilder />} />
            
            {/* ✅ FIXED: Badge System Progress Page */}
            <Route path="/progress" element={<Progress />} />
            
            {/* Coming Soon Pages */}
            <Route path="/aptitude" element={<ComingSoon />} />
            <Route path="/interview" element={<ComingSoon />} />
            <Route path="/materials" element={<ComingSoon />} />
            <Route path="/tests" element={<ComingSoon />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
import StudyMaterial from "./pages/StudyMaterial";
import SystemDesign from "./pages/SystemDesign";
import Mentorship from "./pages/Mentorship";
import ResumeBuilder from "./pages/ResumeBuilder";
import Settings from "./pages/Settings";

import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <ScrollToTop />

          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dsa" element={<DSA />} />
              <Route path="/dsa/problem/:id" element={<ProblemDetail />} />
              <Route path="/study-material" element={<StudyMaterial />} />
              <Route path="/system-design" element={<SystemDesign />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/my-progress" element={<MyProgress />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/mock-test" element={<MockTest />} />
              {/* ✅ Add your interview prep route */}
              <Route path="/interview-prep" element={<InterviewPreparationPlatform />} />
              <Route path="/aptitude-test" element={<AptitudePage />} />
              <Route path="/resume" element={<ResumeBuilder />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;