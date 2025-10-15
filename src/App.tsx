
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import FooterTranslated from "@/components/FooterTranslated";
import ScrollToTop from "@/components/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";
import AIChat from "./pages/AIChat";
import BookingSession from "./pages/BookingSession";
import PeerSupport from "./pages/PeerSupport";
import Journal from "./pages/Journal";
import Activities from "./pages/Activities";
import Assessment from "./pages/Assessment";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import AboutUs from "./pages/AboutUs";
import MyProfile from "./pages/MyProfile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import AccessibilityStatement from "./pages/Accessibility";
import NotFound from "./pages/NotFound";
import AdminEntries from "./pages/AdminEntries";
import AdminProfiles from "./pages/AdminProfiles";
import AdminAssessments from "./pages/AdminAssessments";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { LanguageProvider } from "@/contexts/LanguageContext";
import VolunteerMentor from "./pages/VolunteerMentor";
import BrainLoading from "./components/BrainLoading";
import { useNavigationLoading } from "./hooks/useNavigationLoading";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/signin";
  const isLoading = useNavigationLoading();

  const RequireAuth = ({ children }: { children: React.ReactElement }) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return <Navigate to="/signin" replace />;
    }
    return children;
  };

  const RequireAdmin = ({ children }: { children: React.ReactElement }) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userRaw ? JSON.parse(userRaw) : null;
    if (!token || user?.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!hideNavbar && <Navigation />}
      <FloatingActionButton />
      {location.pathname !== "/" && <BrainLoading isVisible={isLoading} />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mood" element={<RequireAuth><MoodTracker /></RequireAuth>} />
        <Route path="/ai-chat" element={<RequireAuth><AIChat /></RequireAuth>} />
        <Route path="/booking" element={<RequireAuth><BookingSession /></RequireAuth>} />
        {/* Resources page removed; content merged into Activities */}
        <Route path="/community" element={<RequireAuth><PeerSupport /></RequireAuth>} />
        <Route path="/volunteer" element={<RequireAuth><VolunteerMentor /></RequireAuth>} />
        <Route path="/journal" element={<RequireAuth><Journal /></RequireAuth>} />
        <Route path="/activities" element={<RequireAuth><Activities /></RequireAuth>} />
        {/* Local Support page removed */}
        <Route path="/assessment" element={<RequireAuth><Assessment /></RequireAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<RequireAuth><AboutUs /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><MyProfile /></RequireAuth>} />
        <Route path="/privacy" element={<RequireAuth><PrivacyPolicy /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin-entries" element={<RequireAdmin><AdminEntries /></RequireAdmin>} />
        <Route path="/admin-profiles" element={<RequireAdmin><AdminProfiles /></RequireAdmin>} />
        <Route path="/admin-assessments" element={<RequireAdmin><AdminAssessments /></RequireAdmin>} />
        <Route path="/analytics-page" element={<RequireAdmin><Analytics /></RequireAdmin>} />
        <Route path="/terms" element={<RequireAuth><TermsOfService /></RequireAuth>} />
        <Route path="/cookies" element={<RequireAuth><CookiePolicy /></RequireAuth>} />
        <Route path="/accessibility" element={<RequireAuth><AccessibilityStatement /></RequireAuth>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FooterTranslated />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;