import { motion, useScroll, useSpring } from 'framer-motion';

/** Thin progress bar pinned to the top of the viewport, tracks page scroll. */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-stride-accent via-stride-accent-soft to-stride-accent origin-left z-[60]"
      aria-hidden="true"
    />
  );
};

export default ScrollProgress;
