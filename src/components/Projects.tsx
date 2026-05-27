import { useState, useRef, useEffect, TouchEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { showcase } from '@/data/stride';
import { useSiteContent } from '@/hooks/useSiteContent';
import Tilt3D from '@/components/motion/Tilt3D';

const CHIP_PALETTE = [
  'bg-stride-sky/15 text-stride-sky border-stride-sky/30',
  'bg-stride-sage/18 text-stride-sage border-stride-sage/30',
  'bg-stride-gold/18 text-stride-gold border-stride-gold/30',
] as const;

const Projects = () => {
  const [activeProject, setActiveProject] = useState(0);
  const projectsRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const { content } = useSiteContent();

  const projects = content.solutions;
  const minSwipeDistance = 50;

  useEffect(() => {
    if (isInView && !isHovering) {
      const interval = setInterval(() => {
        setActiveProject((prev) => (prev + 1) % projects.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [isInView, isHovering, projects.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setIsInView(entries[0].isIntersecting);
      },
      { threshold: 0.2 }
    );
    if (projectsRef.current) observer.observe(projectsRef.current);
    return () => observer.disconnect();
  }, []);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) setActiveProject((p) => (p + 1) % projects.length);
    else if (distance < -minSwipeDistance) setActiveProject((p) => (p - 1 + projects.length) % projects.length);
  };

  const getCardAnimationClass = (index: number) => {
    if (index === activeProject) return 'scale-100 opacity-100 z-20';
    if (index === (activeProject + 1) % projects.length) return 'translate-x-[40%] scale-95 opacity-60 z-10';
    if (index === (activeProject - 1 + projects.length) % projects.length)
      return 'translate-x-[-40%] scale-95 opacity-60 z-10';
    return 'scale-90 opacity-0';
  };

  return (
    <section id="solutions" ref={projectsRef} className="bg-stride-bg-elev py-16 md:py-24 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          className={`text-center mb-10 max-w-3xl mx-auto transition-all duration-1000 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-stride-text-strong mb-4 tracking-tight">
            {showcase.title}
          </h2>
          <p className="text-stride-text-muted text-base sm:text-lg leading-relaxed">{showcase.sub}</p>
          {isMobile && (
            <div className="flex items-center justify-center mt-4 animate-pulse-slow">
              <div className="flex items-center text-stride-accent">
                <ChevronLeft size={16} />
                <p className="text-sm mx-1">Swipe to navigate</p>
                <ChevronRight size={16} />
              </div>
            </div>
          )}
        </div>

        <div
          className="relative h-[600px] overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={carouselRef}
        >
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            {projects.map((project, index) => {
              const chipClass = CHIP_PALETTE[index % CHIP_PALETTE.length];
              return (
                <div
                  key={project.slug}
                  className={`absolute top-0 w-full max-w-md transform transition-all duration-500 ${getCardAnimationClass(index)}`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <Tilt3D max={6} depth={26} className="rounded-xl glow-card">
                    <Card className="overflow-hidden h-[560px] border border-stride-border shadow-sm hover:shadow-2xl flex flex-col rounded-xl tilt-inner">
                      <div
                        className="relative p-6 flex items-center justify-center h-48 overflow-hidden bg-stride-ink"
                        style={{
                          backgroundImage: `url(${project.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-stride-ink/90 via-stride-ink/75 to-stride-ink/90" />
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-stride-sky/30 blur-3xl animate-blob" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-stride-sage/25 blur-3xl animate-blob" style={{ animationDelay: '-6s' }} />
                        <div className="relative z-10 flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-mono tracking-widest text-stride-gold mb-2">
                            {project.n} · {project.category.toUpperCase()}
                          </span>
                          <h3 className="font-display text-2xl text-white mb-2">{project.name}</h3>
                          <div className="w-12 h-0.5 bg-gradient-to-r from-stride-sky via-stride-sage to-stride-gold" />
                        </div>
                      </div>

                      <CardContent className="p-6 flex flex-col flex-grow bg-stride-bg-elev">
                        <p className="text-sm italic text-stride-text-muted mb-4 leading-relaxed">
                          {project.problem}
                        </p>
                        <p className="text-stride-text-strong text-sm mb-5 flex-grow leading-relaxed">
                          {project.solution}
                        </p>

                        <div className="mt-auto">
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {project.chips.map((chip, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border ${chipClass}`}
                              >
                                {chip}
                              </span>
                            ))}
                          </div>
                          <Link
                            to={`/solutions/${project.slug}`}
                            className="link-shimmer text-stride-sky flex items-center font-semibold group text-sm w-fit"
                            onClick={() => window.scrollTo(0, 0)}
                          >
                            <span>See how it works</span>
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </Tilt3D>
                </div>
              );
            })}
          </div>

          {!isMobile && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-stride-navy hover:bg-white z-30 shadow-md transition-all duration-300 hover:scale-110"
                onClick={() => setActiveProject((p) => (p - 1 + projects.length) % projects.length)}
                aria-label="Previous solution"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-stride-navy hover:bg-white z-30 shadow-md transition-all duration-300 hover:scale-110"
                onClick={() => setActiveProject((p) => (p + 1) % projects.length)}
                aria-label="Next solution"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center space-x-2 z-30">
            {projects.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeProject === idx ? 'bg-stride-navy w-5' : 'bg-stride-border hover:bg-stride-accent'
                }`}
                onClick={() => setActiveProject(idx)}
                aria-label={`Go to solution ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
