import { useEffect, useRef, useState } from 'react';
import { Eye, BrainCircuit, Compass, ArrowRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScrollHijack } from '@/hooks/useScrollHijack';
import { capabilities } from '@/data/stride';
import { useSiteContent } from '@/hooks/useSiteContent';
import SectionEyebrow from '@/components/SectionEyebrow';
import NeuralBackground from '@/components/ui/neural-background';

const ICONS = [
  <Eye className="w-10 h-10 text-white transition-transform duration-300 transform" key="eye" />,
  <BrainCircuit className="w-10 h-10 text-white transition-transform duration-300 transform" key="brain" />,
  <Compass className="w-10 h-10 text-white transition-transform duration-300 transform" key="compass" />,
];

const Features = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const hijackSectionRef = useRef<HTMLDivElement>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const { content } = useSiteContent();
  const caps = content.home;

  const features = capabilities.items.map((item, i) => ({
    icon: ICONS[i],
    title: item.title,
    description: item.body,
    n: item.n,
    tags: item.tags,
  }));

  const { isHijacked, currentIndex } = useScrollHijack(hijackSectionRef, features.length);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-in');
            (entry.target as HTMLElement).style.opacity = '1';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (featuresRef.current) {
      const elements = featuresRef.current.querySelectorAll('.feature-item');
      elements.forEach((el) => {
        if (!el.classList.contains('animate-slide-in')) {
          (el as HTMLElement).style.opacity = '0';
          observer.observe(el);
        }
      });
    }
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section
        id="capabilities"
        className="relative bg-stride-bg-elev overflow-hidden py-14 md:py-20 w-full"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" ref={featuresRef}>
          <div className="text-center mb-12 max-w-3xl mx-auto feature-item">
            <SectionEyebrow>How we work</SectionEyebrow>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-stride-text-strong mb-4 tracking-tight">
              {caps.capabilitiesTitle}
            </h2>
            <p className="text-stride-text-muted text-base sm:text-lg leading-relaxed">
              {caps.capabilitiesIntro}
            </p>
          </div>

          {/* Scroll-hijacked capabilities section */}
          <div
            ref={hijackSectionRef}
            className={cn(
              'relative transition-all duration-500',
              isHijacked ? 'fixed inset-0 z-50 bg-black' : 'grid grid-cols-1 md:grid-cols-3 gap-5'
            )}
            style={{ height: isHijacked ? '100vh' : 'auto' }}
          >
            {isHijacked && (
              <div className="absolute top-4 right-4 z-10 text-white text-sm opacity-70">
                {currentIndex + 1} / {features.length}
              </div>
            )}

            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  'feature-item rounded-xl overflow-hidden transform transition-all duration-500 relative shadow-lg',
                  isHijacked
                    ? cn(
                        'absolute inset-0 w-full h-full',
                        index === currentIndex
                          ? 'opacity-100 translate-x-0'
                          : index < currentIndex
                            ? 'opacity-0 -translate-x-full'
                            : 'opacity-0 translate-x-full'
                      )
                    : 'hover:-translate-y-1 h-[340px]'
                )}
                style={{ transitionDelay: isHijacked ? '0ms' : `${index * 100}ms` }}
                onMouseEnter={() => !isHijacked && setHoveredFeature(index)}
                onMouseLeave={() => !isHijacked && setHoveredFeature(null)}
              >
                <div className="absolute inset-0 w-full h-full">
                  {/* Neural particle field — masked so it only paints the
                      left/right edges and fades out in the middle, where text
                      sits. Cursor-reactive, theme-aware (blue/gold). */}
                  <div
                    className="absolute inset-0"
                    style={{
                      WebkitMaskImage:
                        'linear-gradient(90deg, #000 0%, #000 18%, rgba(0,0,0,0.06) 50%, #000 82%, #000 100%)',
                      maskImage:
                        'linear-gradient(90deg, #000 0%, #000 18%, rgba(0,0,0,0.06) 50%, #000 82%, #000 100%)',
                    }}
                  >
                    <NeuralBackground particleCount={260} speed={0.7} />
                  </div>
                  {/* Tint over everything for text legibility */}
                  <div
                    className={cn(
                      'absolute inset-0 transition-opacity duration-300 pointer-events-none',
                      isHijacked
                        ? 'bg-stride-navy/70'
                        : hoveredFeature === index
                          ? 'bg-stride-navy/65'
                          : 'bg-stride-navy/75'
                    )}
                  />
                </div>

                <div
                  className={cn(
                    'relative z-10 flex flex-col justify-end',
                    isHijacked
                      ? 'p-16 h-full text-center items-center justify-center'
                      : 'p-6 h-full'
                  )}
                >
                  <div className={isHijacked ? 'space-y-6 max-w-2xl' : ''}>
                    <div
                      className={cn(
                        'inline-block p-3 bg-white/10 backdrop-blur-sm rounded-lg transition-all duration-300 transform',
                        isHijacked
                          ? 'mb-6 scale-150'
                          : hoveredFeature === index
                            ? 'mb-4 hover:scale-110'
                            : 'mb-4'
                      )}
                    >
                      <div
                        className={`transform transition-transform duration-300 ${!isHijacked && hoveredFeature === index ? 'rotate-12' : ''}`}
                      >
                        {feature.icon}
                      </div>
                    </div>
                    <span className="block text-stride-gold text-xs font-mono tracking-widest mb-2">
                      {feature.n}
                    </span>
                    <h3
                      className={cn(
                        'font-display font-medium text-white',
                        isHijacked ? 'text-4xl mb-4' : 'text-xl mb-2'
                      )}
                    >
                      {feature.title}
                    </h3>
                    <p className={cn('text-white/90', isHijacked ? 'text-lg' : 'text-sm')}>
                      {feature.description}
                    </p>
                    {!isHijacked && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {feature.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase tracking-wider text-white/70 bg-white/10 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {!isHijacked && (
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-stride-sky via-stride-sage to-stride-gold transition-all duration-500 ${hoveredFeature === index ? 'w-full' : 'w-0'}`}
                    />
                  )}
                </div>
              </div>
            ))}

            {isHijacked && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
                <div className="flex space-x-2 mb-4 justify-center">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-300',
                        index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm opacity-70">
                  {isMobile ? 'Swipe' : 'Scroll'} to continue • Press ESC to exit
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-14 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3 px-4">
          <Link
            to="/contact"
            onClick={() => window.scrollTo(0, 0)}
            className="inline-flex items-center justify-center px-6 py-3 bg-stride-ink hover:bg-stride-ink-deep text-stride-cream rounded-full shadow-md hover:shadow-xl transition-all group w-full sm:w-auto font-semibold"
          >
            Start a conversation
            <MessageSquare className="ml-2 w-4 h-4 group-hover:animate-pulse" />
          </Link>

          <Link
            to="/about"
            onClick={() => window.scrollTo(0, 0)}
            className="inline-flex items-center px-6 py-3 bg-stride-bg-elev text-stride-text-strong rounded-full border border-stride-border hover:bg-stride-sage-tint hover:border-stride-sage/40 transition-all group w-full sm:w-auto justify-center font-medium"
          >
            Learn how we work
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default Features;
