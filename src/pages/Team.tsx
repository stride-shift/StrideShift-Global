import { Suspense } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import CtaPanel from '@/components/CtaPanel';
import SEO from '@/components/SEO';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useTheme } from '@/hooks/useTheme';
import { GLSLHills } from '@/components/ui/glsl-hills';
import SectionEyebrow from '@/components/SectionEyebrow';
import PageSections from '@/components/editor/PageSections';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const item = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
};

const EXTRA_SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-sm',
  md: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
};
const EXTRA_ALIGN: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const Team = () => {
  const { content } = useSiteContent();
  const { theme } = useTheme();
  const team = content.team;
  const members = team.members;
  const style = team.style;
  const extras = team.extras ?? [];

  // Hill colour + base bg differ between modes so the toggle is obvious.
  //   Light mode: bright sky-blue ridges over a deep-navy stage.
  //   Dark mode: lifted steel-blue ridges over a softer dark background.
  const isDark = theme === 'dark';
  const hillColor: [number, number, number] = isDark
    ? [0.32, 0.48, 0.66] // brighter steel — was too dark
    : [0.49, 0.83, 0.99]; // sky-blue
  const heroBg = isDark ? '#172333' : '#0a1a30';

  // Split the grid: top row = first 4 (directors), bottom row = remaining 3.
  const topRow = members.slice(0, 4);
  const bottomRow = members.slice(4);

  return (
    <PageLayout>
      <SEO
        title="Team — StrideShift"
        description="Meet the StrideShift team: AI specialists, strategists, and technologists bringing decades of experience in AI, enterprise transformation, and human-centred design."
      />

      <PageSections
        page="team"
        sections={{
          hero: (
      <section
        className="relative pt-28 md:pt-36 pb-16 md:pb-20 overflow-hidden text-stride-cream"
        style={{ backgroundColor: heroBg }}
      >
        <Suspense fallback={<div className="absolute inset-0" style={{ backgroundColor: heroBg }} />}>
          <GLSLHills color={hillColor} speed={0.45} />
        </Suspense>

        {/* Soft top fade — keeps navbar legible without hiding the mountains.
            Bottom fade is intentionally lighter so the peaks read through the
            pillar strip. No central radial darkening. */}
        <div
          className="absolute inset-x-0 top-0 h-48 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, ${heroBg} 0%, ${heroBg}cc 40%, transparent 100%)`,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${heroBg}b3 0%, transparent 100%)`,
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={container}>
            <motion.div variants={item} className="mb-4">
              <SectionEyebrow>{team.eyebrow}</SectionEyebrow>
            </motion.div>
            <motion.h1
              variants={item}
              className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-6 tracking-tight leading-[1.02]"
              style={style.titleColor ? { color: style.titleColor } : undefined}
            >
              {team.title}
            </motion.h1>
            <motion.p
              variants={item}
              className="text-base sm:text-lg text-stride-cream/85 max-w-3xl mx-auto leading-relaxed"
            >
              {team.tagline}
            </motion.p>

            {extras.length > 0 && (
              <motion.div variants={item} className="mt-6 space-y-3 max-w-3xl mx-auto">
                {extras.map((b) => (
                  <p
                    key={b.id}
                    className={`leading-relaxed ${EXTRA_SIZE[b.size]} ${EXTRA_ALIGN[b.align]}`}
                    style={{ color: b.color || 'rgba(255,255,255,0.85)' }}
                  >
                    {b.text}
                  </p>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

          ),
          members: (
      <section className="py-16 md:py-24 bg-stride-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {topRow.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={container}
            >
              {topRow.map((member, i) => (
                <MemberCard key={i} member={member} variants={item} />
              ))}
            </motion.div>
          )}

          {bottomRow.length > 0 && (
            <motion.div
              className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={container}
            >
              {bottomRow.map((member, i) => (
                <MemberCard key={i} member={member} variants={item} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

          ),
          cta: <CtaPanel title={team.ctaTitle} sub={team.ctaSub} buttonLabel="Get in touch" />,
        }}
      />
    </PageLayout>
  );
};

const MemberCard = ({
  member,
  variants,
}: {
  member: { initials: string; name: string; role: string; bio: string; photo: string };
  variants: typeof item;
}) => (
  <motion.article
    variants={variants}
    className="group bg-stride-bg-elev border border-stride-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all"
  >
    <div className="relative aspect-square bg-stride-navy/10 overflow-hidden">
      {member.photo && (
        <img
          src={member.photo}
          alt={member.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-[center_top]"
        />
      )}
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
);

export default Team;
