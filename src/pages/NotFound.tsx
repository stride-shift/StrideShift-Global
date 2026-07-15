import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import MagneticButton from '@/components/motion/MagneticButton';
import { ArrowLeft } from 'lucide-react';

const digitVariants = {
  hidden: { opacity: 0, y: 60, rotate: -8, scale: 0.7 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { delay: 0.1 + i * 0.12, type: 'spring' as const, stiffness: 210, damping: 16 },
  }),
};

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error('404: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <PageLayout showContact={false}>
      <SEO title="Page not found — StrideShift" description="The page you were looking for has moved, or never existed in the first place." />
      <div className="min-h-[80vh] flex items-center justify-center bg-stride-bg pt-24 relative overflow-hidden">
        {/* Faint drifting grid backdrop */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />

        <div className="text-center max-w-lg px-4 relative">
          {/* Giant springy digits */}
          <div className="flex items-center justify-center gap-1 select-none" aria-hidden>
            {['4', '0', '4'].map((d, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={digitVariants}
                initial="hidden"
                animate="show"
                className="font-display text-[7rem] md:text-[10rem] leading-none text-stride-text-strong"
              >
                <motion.span
                  className="inline-block"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.2 + i * 0.45, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                >
                  {d}
                </motion.span>
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1 className="font-display text-3xl md:text-4xl text-stride-text-strong mb-3 tracking-tight">
              That page doesn't exist
            </h1>
            <p className="text-stride-text-muted mb-2">
              The page you were looking for has moved, or never existed in the first place.
            </p>
            <p className="font-mono text-xs text-stride-text-muted/70 mb-8 break-all">
              {location.pathname}
            </p>
            <MagneticButton
              onClick={() => navigate('/')}
              strength={0.3}
              className="px-7 py-3.5 bg-stride-navy text-white rounded-full hover:bg-stride-navy-dark transition-colors shadow-lg"
              ariaLabel="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
