import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';

const ACCENT_IMAGES = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1614436163996-25cee5f54290?auto=format&fit=crop&w=800&q=70',
];

// Editorial gradients in the brand palette — sky, sage, gold — rotated so
// each testimonial gets its own mood without leaving the design system.
const SIDE_TINTS = [
  { left: 'from-stride-sky/80 via-stride-sky to-stride-ink', right: 'from-stride-gold/80 via-stride-gold/60 to-stride-ink' },
  { left: 'from-stride-sage/80 via-stride-sage to-stride-ink', right: 'from-stride-sky/80 via-stride-sky/60 to-stride-ink' },
  { left: 'from-stride-gold/70 via-stride-sage to-stride-ink', right: 'from-stride-sky/80 via-stride-sage/60 to-stride-ink' },
];

const Testimonials = () => {
  const { content } = useSiteContent();
  const testimonials = content.testimonials;
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hover) return;
    const id = setInterval(() => setActive((a) => (a + 1) % testimonials.length), 7000);
    return () => clearInterval(id);
  }, [hover]);

  if (!testimonials.length) return null;
  const safeIndex = active % testimonials.length;
  const current = testimonials[safeIndex] ?? testimonials[0];
  const tint = SIDE_TINTS[active % SIDE_TINTS.length];
  const leftImg = ACCENT_IMAGES[active % ACCENT_IMAGES.length];
  const rightImg = ACCENT_IMAGES[(active + 1) % ACCENT_IMAGES.length];

  const next = () => setActive((a) => (a + 1) % testimonials.length);
  const prev = () => setActive((a) => (a - 1 + testimonials.length) % testimonials.length);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-stride-bg-elev overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14 reveal-on-scroll">
          <div className="inline-flex items-center gap-3 mb-3 text-stride-text-muted">
            <span className="h-px w-10 bg-gradient-to-r from-transparent via-stride-sky/60 to-stride-sky/60" />
            <span className="text-xs uppercase tracking-[0.22em] font-semibold">Voices</span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent via-stride-sage/60 to-stride-sage/60" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-stride-text-strong tracking-tight">
            What clients tell us
          </h2>
        </div>

        <div className="grid grid-cols-[1fr_minmax(0,3fr)_1fr] gap-3 md:gap-6 items-center">
          {/* LEFT decorative image */}
          <div className="relative hidden lg:block aspect-[3/4] rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`left-${active}`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className={`absolute inset-0 bg-gradient-to-br ${tint.left}`}
              >
                <img
                  src={leftImg}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CENTER quote card */}
          <div className="relative card-tint-sky rounded-2xl shadow-2xl p-7 md:p-12 overflow-hidden min-h-[360px] md:min-h-[420px] flex flex-col">
            <div
              className="absolute inset-0 pointer-events-none opacity-50"
              style={{
                background:
                  'radial-gradient(circle at 100% 0%, hsl(var(--stride-gold) / 0.18) 0%, transparent 55%)',
              }}
            />
            <Quote className="w-16 h-16 md:w-20 md:h-20 text-stride-gold/30 absolute top-4 left-6" />

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                className="relative flex-grow flex flex-col"
              >
                <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl text-stride-text-strong leading-snug tracking-tight pl-6 md:pl-10 pt-4">
                  "{current.quote}"
                </blockquote>

                <div className="mt-auto pl-6 md:pl-10 pt-8">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-stride-ink text-stride-cream flex items-center justify-center font-mono text-sm font-semibold ring-2 ring-stride-gold/60">
                      {current.initials}
                    </div>
                    <div>
                      <p className="text-stride-text-strong font-semibold uppercase tracking-wider text-sm">
                        {current.name}
                      </p>
                      <p className="text-stride-text-muted text-sm">{current.role}</p>
                    </div>
                  </div>

                  <div className="border-t border-stride-border/70 pt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {testimonials.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActive(i)}
                          className={`h-2 rounded-full transition-all ${
                            i === active
                              ? 'bg-stride-navy w-8'
                              : 'bg-stride-border w-2 hover:bg-stride-accent'
                          }`}
                          aria-label={`Show testimonial ${i + 1}`}
                        />
                      ))}
                    </div>
                    <div className="text-stride-text-muted text-sm font-mono tabular-nums">
                      <span className="text-stride-text-strong font-semibold">
                        {String(active + 1).padStart(2, '0')}
                      </span>
                      <span className="opacity-50"> / {String(testimonials.length).padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prev}
                        className="w-10 h-10 rounded-full border border-stride-border flex items-center justify-center text-stride-text-strong hover:bg-stride-bg transition-colors"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={next}
                        className="w-10 h-10 rounded-full border border-stride-border flex items-center justify-center text-stride-text-strong hover:bg-stride-bg transition-colors"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT decorative image */}
          <div className="relative hidden lg:block aspect-[3/4] rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`right-${active}`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className={`absolute inset-0 bg-gradient-to-br ${tint.right}`}
              >
                <img
                  src={rightImg}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
