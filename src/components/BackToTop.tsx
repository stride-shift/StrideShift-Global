import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { scrollToTop } from '@/components/motion/SmoothScroll';

/** Floating back-to-top button — appears once the user is past the fold. */
const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 640);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          onClick={() => scrollToTop()}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.85 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="fixed bottom-6 left-6 z-40 w-11 h-11 rounded-full bg-stride-bg-elev/90 backdrop-blur-md border border-stride-border shadow-lg text-stride-text-strong flex items-center justify-center hover:bg-stride-accent hover:text-white hover:border-stride-accent transition-colors focus:outline-none focus:ring-2 focus:ring-stride-accent"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
