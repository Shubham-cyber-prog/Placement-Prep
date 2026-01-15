import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Index from "./pages/Index";
import DSA from "./pages/DSA";

import MockTest from "./pages/MockTest";
import ProblemDetail from "./pages/ProblemDetail";

import Companies from "./pages/Companies";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

import Mentorship from "./pages/Mentorship";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/dsa" element={<DSA />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/mock-test" element={<MockTest />} />

            <Route path="/aptitude" element={<ComingSoon />} />
            <Route path="/interview" element={<ComingSoon />} />
            <Route path="/system-design" element={<ComingSoon />} />
            <Route path="/progress" element={<ComingSoon />} />
            <Route path="/materials" element={<ComingSoon />} />
            <Route path="/resume" element={<ComingSoon />} />
            <Route path="/tests" element={<ComingSoon />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/settings" element={<ComingSoon />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
