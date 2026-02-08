import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Index from "./pages/Index";
import Homepage from "./pages/Homepage";
import Auth from "./components/Auth";
import Achievements from './pages/Achievements';
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
import ResumeBuilder from "./pages/ResumeBuilder";
import MockInterview from "./pages/MockInterview";
import StudyGroups from "./pages/StudyGroups";
import Forum from "./pages/Forum";
import GroupDetail from "./pages/GroupDetail";
import DiscussionDetail from "./pages/DiscussionDetail";

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
            {/* Public routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected dashboard routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/dsa" element={<DSA />} />
              <Route path="/dsa/problem/:id" element={<ProblemDetail />} />
              <Route path="/study-material" element={<StudyMaterial />} />
              <Route path="/system-design" element={<SystemDesign />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/my-progress" element={<MyProgress />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/mock-test" element={<MockTest />} />
              <Route path="/interview-prep" element={<InterviewPreparationPlatform />} />
              <Route path="/mock-interview" element={<MockInterview />} />
              
              {/* Study Groups - Only ONE route for listing */}
              <Route path="/study-groups" element={<StudyGroups />} />
              
              {/* Group Detail - Separate route */}
              <Route path="/groups/:id" element={<GroupDetail />} />
              
              {/* Forum - Only ONE route for listing */}
              <Route path="/forum" element={<Forum />} />
              
              {/* Discussion Detail - Use consistent naming */}
              <Route path="/discussions/:id" element={<DiscussionDetail />} />
              
              <Route path="/aptitude-test" element={<AptitudePage />} />
              <Route path="/resume" element={<ResumeBuilder />} />
              <Route path="/settings" element={<Settings />} />
              
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
};

export default App;