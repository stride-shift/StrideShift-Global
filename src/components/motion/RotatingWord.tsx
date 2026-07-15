import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * Wix-style scrolling word — cycles through a list of words with a vertical
 * roll. Sized to the widest word so the surrounding text never reflows.
 * Reduced-motion users get a plain crossfade-free static first word.
 */
const RotatingWord = ({
  words,
  intervalMs = 2400,
  className,
}: {
  words: string[];
  intervalMs?: number;
  className?: string;
}) => {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const list = useMemo(() => words.map((w) => w.trim()).filter(Boolean), [words]);

  useEffect(() => {
    if (reduced || list.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % list.length), intervalMs);
    return () => window.clearInterval(id);
  }, [list.length, intervalMs, reduced]);

  if (!list.length) return null;
  if (reduced || list.length === 1) return <span className={className}>{list[0]}</span>;

  return (
    <span className={`relative inline-grid align-baseline ${className ?? ''}`}>
      {/* Invisible sizer — reserves width/height of the widest word */}
      {list.map((w) => (
        <span key={w} className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden="true">
          {w}
        </span>
      ))}
      <span className="col-start-1 row-start-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={list[index]}
            initial={{ y: '105%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-105%', opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
            className="block whitespace-nowrap"
          >
            {list[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
};

export default RotatingWord;
