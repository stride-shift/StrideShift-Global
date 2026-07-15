import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContactButton from '@/components/FloatingContactButton';
import ScrollProgress from '@/components/ScrollProgress';
import BackToTop from '@/components/BackToTop';
import EditorToolbar, { DesignFab } from '@/components/editor/EditorToolbar';
import { scrollToTop } from '@/components/motion/SmoothScroll';

type PageLayoutProps = {
  children: React.ReactNode;
  /** Kept for backward compatibility — also hides the floating contact bubble. */
  showContact?: boolean;
};

const PageLayout = ({ children, showContact = true }: PageLayoutProps) => {
  const location = useLocation();

  // Jump to top when the route changes — routed through Lenis when active,
  // because a plain window.scrollTo gets overridden by its animation loop.
  useEffect(() => {
    scrollToTop(true);
  }, [location]);

  return (
    <div className="min-h-screen bg-stride-bg-elev w-full max-w-[100vw] overflow-x-hidden">
      <ScrollProgress />
      <Navbar />
      {children}
      <Footer />
      <BackToTop />
      {showContact && <FloatingContactButton />}
      <DesignFab />
      <EditorToolbar />
    </div>
  );
};

export default PageLayout;
