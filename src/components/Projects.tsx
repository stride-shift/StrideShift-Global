import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionEyebrow from '@/components/SectionEyebrow';
import { showcase } from '@/data/stride';
import { useSiteContent } from '@/hooks/useSiteContent';

/**
 * Homepage "What we build" — a clean, linked card grid of the flagship
 * solutions (capped at 6 so the page stays tight). Each card animates in on
 * scroll, lifts on hover, and links through to its detail page. The full set
 * lives on the Solutions page via the "See all solutions" link.
 */
const HOMEPAGE_LIMIT = 6;

const Projects = () => {
  const { content } = useSiteContent();
  const projects = content.solutions.slice(0, HOMEPAGE_LIMIT);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const card = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] } },
  };

  return (
    <section id="solutions" className="bg-stride-bg-elev py-16 md:py-24 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <SectionEyebrow>What we build</SectionEyebrow>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-stride-text-strong mb-4 tracking-tight">
            {showcase.title}
          </h2>
          <p className="text-stride-text-muted text-base sm:text-lg leading-relaxed">
            {showcase.sub}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <motion.div key={project.slug} variants={card}>
              <Link
                to={`/solutions/${project.slug}`}
                onClick={() => window.scrollTo(0, 0)}
                className="group glow-card block h-full bg-stride-bg-elev border border-stride-border rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Visual header */}
                <div
                  className="relative h-44 bg-cover bg-center overflow-hidden"
                  style={{ backgroundImage: `url(${project.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-stride-ink/85 via-stride-ink/65 to-stride-ink/85 group-hover:from-stride-ink/65 group-hover:via-stride-ink/45 transition-all duration-500" />
                  <div className="relative h-full flex flex-col justify-between p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono tracking-widest text-stride-gold">
                        {project.n}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-white/90 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full font-semibold">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl text-white tracking-tight">
                      {project.name}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col">
                  <p className="text-xs italic text-stride-text-muted mb-3 leading-relaxed line-clamp-2">
                    {project.problem}
                  </p>
                  <p className="text-sm text-stride-text-strong mb-4 line-clamp-3 leading-relaxed">
                    {project.solution}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1.5 mb-4">
                    {project.chips.slice(0, 3).map((chip) => (
                      <span
                        key={chip}
                        className="px-2 py-0.5 bg-stride-accent/15 text-stride-accent rounded-full text-[10px] uppercase tracking-wider font-medium"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <span className="text-stride-accent font-semibold text-sm inline-flex items-center">
                    See how it works
                    <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* See all */}
        <div className="text-center mt-12">
          <Link
            to="/solutions"
            onClick={() => window.scrollTo(0, 0)}
            className="inline-flex items-center px-7 py-3 bg-stride-ink text-stride-cream rounded-full hover:bg-stride-ink-deep hover:shadow-xl transition-all group font-semibold"
          >
            See all solutions
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Projects;
