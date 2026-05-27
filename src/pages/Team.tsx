import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { useSiteContent } from '@/hooks/useSiteContent';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const item = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
};

const Team = () => {
  const { content } = useSiteContent();
  const team = content.team;
  const members = team.members;
  return (
    <PageLayout>
      <SEO
        title="Team — StrideShift"
        description="Meet the StrideShift team: AI specialists, strategists, and technologists bringing decades of experience in AI, enterprise transformation, and human-centred design."
      />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-12 md:pb-16 bg-stride-ink text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[36rem] h-[36rem] rounded-full bg-stride-gold/16 blur-3xl animate-blob" />
          <div
            className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full bg-stride-sage/22 blur-3xl animate-blob"
            style={{ animationDelay: '-8s' }}
          />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[20rem] h-[20rem] rounded-full bg-stride-sky/14 blur-3xl animate-pulse-slow" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={container}>
            <motion.span
              variants={item}
              className="inline-block mb-4 text-xs uppercase tracking-[0.22em] text-stride-accent-soft font-semibold"
            >
              {team.eyebrow}
            </motion.span>
            <motion.h1
              variants={item}
              className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-6 tracking-tight"
            >
              {team.title}
            </motion.h1>
            <motion.p
              variants={item}
              className="text-base sm:text-lg text-white/85 max-w-3xl mx-auto leading-relaxed"
            >
              {team.tagline}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission strip */}
      <section className="py-10 bg-stride-bg-elev border-b border-stride-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-display text-xl md:text-2xl lg:text-3xl text-stride-text-strong tracking-tight">
            {team.mission}
          </p>
        </div>
      </section>

      {/* Members grid */}
      <section className="py-16 md:py-24 bg-stride-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={container}
          >
            {members.map((member, i) => (
              <motion.article
                key={i}
                variants={item}
                className="group bg-stride-bg-elev border border-stride-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div
                  className="h-72 bg-cover bg-center bg-stride-navy/10 relative"
                  style={{ backgroundImage: `url('${member.photo}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-stride-navy/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded text-xs font-mono tracking-wider text-stride-navy">
                    {member.initials}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-stride-text-strong mb-1 tracking-tight">
                    {member.name}
                  </h3>
                  <p className="text-sm text-stride-accent font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-stride-text-muted leading-relaxed">{member.bio}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-stride-navy text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 tracking-tight">
            {team.ctaTitle}
          </h2>
          <p className="text-white/85 mb-8 leading-relaxed">{team.ctaSub}</p>
          <Link
            to="/contact"
            className="inline-flex items-center px-7 py-3 bg-white text-stride-navy rounded-lg hover:bg-stride-accent-soft transition-all group font-semibold"
          >
            Get in touch
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default Team;
