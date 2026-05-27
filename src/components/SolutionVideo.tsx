import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SolutionVideoProps {
  videoUrl?: string;
  tagline?: string;
  productName: string;
  posterImage?: string;
}

const SolutionVideo = ({ videoUrl, tagline, productName, posterImage }: SolutionVideoProps) => {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative -mt-16 md:-mt-24 z-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-stride-navy aspect-video border border-white/10"
        >
          {videoUrl && playing ? (
            <iframe
              src={`${videoUrl}${videoUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0&modestbranding=1`}
              title={`${productName} explainer`}
              className="absolute inset-0 w-full h-full"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <>
              {/* Poster */}
              {posterImage ? (
                <img
                  src={posterImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-stride-navy via-stride-navy-light to-stride-accent" />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-stride-navy/85 via-stride-navy/60 to-stride-navy/80" />

              {/* Animated blobs */}
              <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-stride-accent/20 blur-3xl animate-blob" />
              <div
                className="absolute -bottom-32 -left-20 w-[24rem] h-[24rem] rounded-full bg-stride-accent-soft/15 blur-3xl animate-blob"
                style={{ animationDelay: '-8s' }}
              />

              {/* Grid */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
                  backgroundSize: '60px 60px',
                  maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
                  WebkitMaskImage:
                    'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
                }}
              />

              <div className="relative h-full flex flex-col items-center justify-center text-center text-white p-6 sm:p-10">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xs uppercase tracking-[0.22em] text-stride-accent-soft font-semibold mb-4"
                >
                  Watch the explainer · 90 seconds
                </motion.span>
                <motion.h3
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                  className="font-display text-2xl sm:text-4xl md:text-5xl mb-3 tracking-tight max-w-2xl"
                >
                  {productName}
                </motion.h3>
                {tagline && (
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                    className="text-white/85 max-w-xl mb-8 text-sm sm:text-base leading-relaxed"
                  >
                    {tagline}
                  </motion.p>
                )}

                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => videoUrl && setPlaying(true)}
                  disabled={!videoUrl}
                  className={cn(
                    'relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center bg-white text-stride-navy shadow-2xl',
                    videoUrl ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'
                  )}
                  aria-label="Play explainer video"
                >
                  <span className="absolute inset-0 rounded-full animate-ring-pulse" aria-hidden="true" />
                  <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-stride-navy ml-1.5" />
                </motion.button>
                {!videoUrl && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="mt-4 text-xs text-white/60 italic"
                  >
                    Video coming soon — set <span className="font-mono">videoUrl</span> in data to embed.
                  </motion.p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionVideo;
