import { useEffect, useRef, useState } from 'react';
import { Eye, BrainCircuit, Compass, ArrowRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useScrollHijack } from '@/hooks/useScrollHijack';
import { capabilities, problem } from '@/data/stride';
import { useSiteContent } from '@/hooks/useSiteContent';

const ICONS = [
  <Eye className="w-10 h-10 text-white transition-transform duration-300 transform" key="eye" />,
  <BrainCircuit className="w-10 h-10 text-white transition-transform duration-300 transform" key="brain" />,
  <Compass className="w-10 h-10 text-white transition-transform duration-300 transform" key="compass" />,
];

const HERO_IMAGES = [
  '/lovable-uploads/48e540e5-6a25-44e4-b3f7-80f3bfc2777a.png',
  '/lovable-uploads/48ecf6e2-5a98-4a9d-af6f-ae2265cd4098.png',
  '/lovable-uploads/cf8966e3-de0d-445f-9fbd-ee6c48daa7ff.png',
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
    image: HERO_IMAGES[i],
    n: item.n,
    tags: item.tags,
  }));

  const { isHijacked, currentIndex } = useScrollHijack(hijackSectionRef, features.length);

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-stride-text-strong mb-4 tracking-tight">
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
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className={cn(
                      'w-full h-full object-cover transition-all duration-300',
                      isHijacked ? 'grayscale-0' : 'grayscale'
                    )}
                  />
                  <div
                    className={cn(
                      'absolute inset-0 transition-opacity duration-300',
                      isHijacked
                        ? 'bg-stride-navy/60'
                        : hoveredFeature === index
                          ? 'bg-stride-navy/70'
                          : 'bg-stride-navy/85'
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
          <Button
            onClick={scrollToContact}
            className="inline-flex items-center px-6 py-3 bg-stride-navy hover:bg-stride-navy-dark text-white rounded-lg shadow-md hover:shadow-lg transition-all group w-full sm:w-auto"
          >
            Start a conversation
            <MessageSquare className="ml-2 w-4 h-4 group-hover:animate-pulse" />
          </Button>

          <Link
            to="/about"
            onClick={() => window.scrollTo(0, 0)}
            className="inline-flex items-center px-6 py-3 bg-white text-stride-navy rounded-lg border border-stride-border hover:bg-stride-accent-soft transition-all group w-full sm:w-auto justify-center font-medium"
          >
            Learn how we work
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Open-ended problem section */}
      <section className="bg-stride-bg py-14 md:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal-on-scroll">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-stride-text-strong mb-6 tracking-tight max-w-3xl mx-auto">
              {problem.headline}
            </h2>
          </div>

          <div className="reveal-on-scroll scale-up delay-1 glow-card bg-stride-bg-elev rounded-2xl shadow-lg border border-stride-border p-8 md:p-12 transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
              <div className="space-y-4">
                {problem.body.map((para, i) => (
                  <p
                    key={i}
                    className="text-stride-text-muted text-base sm:text-lg leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>
              <div className="card-tint-sky rounded-xl p-6 md:p-8">
                <h3 className="font-display text-xl sm:text-2xl text-stride-text-strong mb-4">
                  {problem.definitionTitle}
                </h3>
                <ul className="space-y-3">
                  {problem.definitionList.map((d) => (
                    <li key={d.strong} className="flex gap-3 text-sm sm:text-base">
                      <span className="text-stride-sky font-bold mt-0.5 flex-shrink-0">→</span>
                      <span className="text-stride-text-muted">
                        <strong className="text-stride-text-strong">{d.strong}</strong>
                        {d.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
