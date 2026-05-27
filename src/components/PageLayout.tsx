import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContactButton from '@/components/FloatingContactButton';
import ScrollProgress from '@/components/ScrollProgress';

type PageLayoutProps = {
  children: React.ReactNode;
  /** Kept for backward compatibility — also hides the floating contact bubble. */
  showContact?: boolean;
};

const PageLayout = ({ children, showContact = true }: PageLayoutProps) => {
  const location = useLocation();

  // Effect to scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen bg-stride-bg-elev w-full max-w-[100vw] overflow-x-hidden">
      <ScrollProgress />
      <Navbar />
      {children}
      <Footer />
      {showContact && <FloatingContactButton />}
    </div>
  );
};

export default PageLayout;
