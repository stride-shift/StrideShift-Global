import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Team from './pages/Team';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Blog from './pages/Blog';
import BlogPostDetail from './pages/BlogPostDetail';
import Solutions from './pages/Solutions';
import SolutionDetail from './pages/SolutionDetail';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Admin from './pages/Admin';
import { AnalyticsTracker } from '@/lib/analytics';
import CookieBanner from '@/components/CookieBanner';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { EditModeProvider } from '@/hooks/useEditMode';

/**
 * Routes wrapped in a crossfade page transition. The outgoing page lifts away,
 * the incoming one rises in — keyed by pathname so the animation runs on every
 * navigation. Reduced-motion users get an instant swap.
 */
const AnimatedRoutes = () => {
  const location = useLocation();
  const reduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 1 } : { opacity: 0, y: -16 }}
        transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostDetail />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/solutions/:slug" element={<SolutionDetail />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Safety net for password-reset links that land anywhere other than
 * /reset-password (e.g. older emails whose redirect fell back to the site
 * root): when Supabase fires PASSWORD_RECOVERY, take the user straight to
 * the set-new-password interface instead of leaving them silently signed in.
 */
const RecoveryRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const supa = getSupabase();
    if (!supa) return;
    const { data: sub } = supa.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && window.location.pathname !== '/reset-password') {
        navigate('/reset-password', { replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);
  return null;
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SmoothScroll />
          <AnalyticsTracker />
          <CookieBanner />
          <RecoveryRedirect />
          <EditModeProvider>
            <AnimatedRoutes />
          </EditModeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
