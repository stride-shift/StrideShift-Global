import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Globe, Map, Box, Coins, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { systemSection, marqueeStats } from '@/data/stride';
import CursorSpotlight from '@/components/motion/CursorSpotlight';
import Tilt3D from '@/components/motion/Tilt3D';
import TextReveal from '@/components/motion/TextReveal';
import MagneticButton from '@/components/motion/MagneticButton';

const AnimatedCounter = ({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(countRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(progress * end);
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, duration, inView]);

  return (
    <span ref={countRef} className="font-bold tabular-nums">
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// Rotate through the three accent hues: sky → sage → gold. Six stats × three
// colors keeps the grid balanced and feels intentional.
const STAT_VISUALS = [
  { icon: <Users className="w-7 h-7 text-stride-sky" />, num: 60, prefix: '', suffix: '+', tint: 'sky' },
  { icon: <Globe className="w-7 h-7 text-stride-sage" />, num: 16, prefix: '', suffix: '', tint: 'sage' },
  { icon: <Map className="w-7 h-7 text-stride-gold" />, num: 3, prefix: '', suffix: '', tint: 'gold' },
  { icon: <Box className="w-7 h-7 text-stride-sky" />, num: 9, prefix: '', suffix: '', tint: 'sky' },
  { icon: <Coins className="w-7 h-7 text-stride-sage" />, num: 200, prefix: 'R', suffix: 'M+', tint: 'sage' },
  { icon: <GraduationCap className="w-7 h-7 text-stride-gold" />, num: 18, prefix: '', suffix: '', tint: 'gold' },
] as const;

const TINT_BG: Record<'sky' | 'sage' | 'gold', string> = {
  sky: 'bg-stride-sky/15',
  sage: 'bg-stride-sage/18',
  gold: 'bg-stride-gold/18',
};

const WhyWrlds = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2, duration: 0.8 },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  return (
    <CursorSpotlight
      className="bg-stride-ink text-white overflow-hidden"
    >
    <section
      id="thinking-systems"
      className="relative py-16 md:py-24 overflow-hidden"
    >
      {/* Background flourishes — sky / sage / gold blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full bg-stride-sky/12 blur-3xl animate-blob" />
        <div
          className="absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full bg-stride-sage/14 blur-3xl animate-blob"
          style={{ animationDelay: '-8s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18rem] h-[18rem] rounded-full bg-stride-gold/8 blur-3xl animate-pulse-slow"
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-4 tracking-tight"
          >
            {systemSection.titlePre}
            <span className="text-gold-gradient italic">{systemSection.titleHighlight}</span>
            {systemSection.titlePost}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-white/80 text-lg max-w-3xl mx-auto leading-relaxed"
          >
            {systemSection.sub}
          </motion.p>
        </motion.div>

        {/* Two-column philosophy */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          {systemSection.cols.map((col) => (
            <motion.div
              key={col.label}
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
            >
              <span className="block text-xs uppercase tracking-[0.22em] text-stride-accent-soft font-semibold mb-4">
                {col.label}
              </span>
              <h3 className="font-display text-2xl lg:text-3xl text-white mb-4 tracking-tight">
                {col.title}
              </h3>
              <p className="text-white/80 leading-relaxed">{col.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quote */}
        <motion.div
          className="mb-16 max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.blockquote
            variants={itemVariants}
            className="font-display text-xl md:text-2xl lg:text-3xl text-white italic leading-snug border-l-2 border-stride-accent-soft pl-6 text-left mx-auto max-w-3xl"
          >
            "{systemSection.quote}"
          </motion.blockquote>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          {marqueeStats.map((stat, i) => {
            const visual = STAT_VISUALS[i];
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
              >
                <Tilt3D max={7} depth={20} className="rounded-xl glow-card bg-stride-bg-elev border border-stride-border">
                  <div className="tilt-inner rounded-xl p-5 text-center">
                    <div className={`w-12 h-12 rounded-full ${TINT_BG[visual.tint]} flex items-center justify-center mx-auto mb-3 ring-1 ring-stride-border/60`}>
                      {visual.icon}
                    </div>
                    <div className="font-display text-2xl md:text-3xl text-stride-text-strong mb-1">
                      <AnimatedCounter
                        end={visual.num}
                        prefix={visual.prefix}
                        suffix={visual.suffix}
                      />
                    </div>
                    <p className="text-xs text-stride-text-muted leading-snug">{stat.label}</p>
                  </div>
                </Tilt3D>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="text-center mt-12">
          <MagneticButton
            href="/about"
            strength={0.35}
            onClick={() => window.scrollTo(0, 0)}
            className="btn-sheen inline-flex items-center px-7 py-3.5 bg-stride-cream text-stride-ink rounded-full hover:shadow-2xl shadow-xl transition-all font-medium"
          >
            <span className="relative z-[2] inline-flex items-center gap-2">
              How we work alongside you
              <ArrowRight className="w-4 h-4" />
            </span>
          </MagneticButton>
        </div>
      </div>
    </section>
    </CursorSpotlight>
  );
};

export default WhyWrlds;
