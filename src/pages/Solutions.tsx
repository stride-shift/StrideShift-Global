import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { showcase } from '@/data/stride';
import { RevealOnScrollRoot } from '@/hooks/useScrollReveal';
import { useSiteContent } from '@/hooks/useSiteContent';
import PageHeroBackground from '@/components/PageHeroBackground';
import SectionEyebrow from '@/components/SectionEyebrow';
import CtaPanel from '@/components/CtaPanel';

const Solutions = () => {
  const [filter, setFilter] = useState<string>('All');
  const [query, setQuery] = useState('');
  const { content } = useSiteContent();
  const solutions = content.solutions;

  const CATEGORIES = useMemo(
    () => ['All', ...Array.from(new Set(solutions.map((s) => s.category)))],
    [solutions]
  );

  const items = useMemo(() => {
    return solutions.filter((s) => {
      const matchesFilter = filter === 'All' || s.category === filter;
      const matchesQuery =
        !query.trim() ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.solution.toLowerCase().includes(query.toLowerCase()) ||
        s.problem.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, solutions]);

  return (
    <PageLayout>
      <SEO
        title="Solutions · StrideShift"
        description="Nine AI products, each built to solve a specific decision problem. All in production. All replacing weeks of manual work."
      />
      <RevealOnScrollRoot />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-20 text-white overflow-hidden">
        <PageHeroBackground />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <SectionEyebrow>{showcase.eyebrow}</SectionEyebrow>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-5 tracking-tight"
          >
            {showcase.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-white/85 max-w-3xl mx-auto leading-relaxed"
          >
            {showcase.sub}
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-stride-bg-elev border-b border-stride-border sticky top-16 z-20 backdrop-blur-md bg-stride-bg-elev/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors ${
                  filter === c
                    ? 'bg-stride-navy text-white'
                    : 'bg-stride-bg text-stride-text-muted hover:bg-stride-accent/15 hover:text-stride-accent'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stride-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search solutions…"
              className="w-full pl-9 pr-3 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-sm"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-14 md:py-20 bg-stride-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-stride-text-muted">No solutions match that filter or query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((s, i) => (
                <Link
                  key={s.slug}
                  to={`/solutions/${s.slug}`}
                  onClick={() => window.scrollTo(0, 0)}
                  className="group reveal-on-scroll scale-up block bg-stride-bg-elev border border-stride-border rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  style={{ transitionDelay: `${(i % 6) * 60}ms` }}
                >
                  <div
                    className="relative h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${s.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-stride-navy/80 via-stride-navy/60 to-stride-navy/85 group-hover:from-stride-navy/60 group-hover:via-stride-navy/40 transition-all" />
                    <div className="relative h-full flex flex-col justify-between p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono tracking-widest text-stride-accent-soft">
                          {s.n}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-white/90 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full font-semibold">
                          {s.category}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl text-white tracking-tight">{s.name}</h3>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-xs italic text-stride-text-muted mb-3 leading-relaxed line-clamp-2">
                      {s.problem}
                    </p>
                    <p className="text-sm text-stride-text-strong mb-4 line-clamp-3 leading-relaxed">
                      {s.solution}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-1.5 mb-4">
                      {s.chips.slice(0, 3).map((chip) => (
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA — floating gradient panel with breathing room before the footer,
          matching the solution detail pages */}
      <CtaPanel
        title="Don't see your problem?"
        sub="We bundle these capabilities differently for every engagement. Tell us what you're facing — we'll show you the shape of a solution."
      />
    </PageLayout>
  );
};

export default Solutions;
