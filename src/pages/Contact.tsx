import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import ContactForm from '@/components/ContactForm';
import { useSiteContent } from '@/hooks/useSiteContent';
import PageHeroBackground from '@/components/PageHeroBackground';
import SectionEyebrow from '@/components/SectionEyebrow';
import PageSections from '@/components/editor/PageSections';

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

const Contact = () => {
  const { content } = useSiteContent();
  const contact = content.contact;
  const style = contact.style;
  const extras = contact.extras ?? [];
  return (
    <PageLayout showContact={false}>
      <SEO
        title="Contact StrideShift — Let's talk"
        description="Tell us the challenge you're facing — we'll listen first, then show you whether and how we can help. No pitch decks. No pressure."
      />

      <PageSections
        page="contact"
        sections={{
          hero: (
      <section className="relative pt-28 md:pt-36 pb-12 md:pb-16 text-white overflow-hidden">
        <PageHeroBackground />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <SectionEyebrow>{contact.eyebrow}</SectionEyebrow>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 tracking-tight"
            style={style.titleColor ? { color: style.titleColor } : undefined}
          >
            {contact.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed [text-wrap:balance]"
          >
            {contact.tagline}
          </motion.p>

          {extras.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 space-y-3 max-w-3xl mx-auto"
            >
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
        </div>
      </section>

          ),
          form: (
      <section className="py-16 md:py-24 bg-stride-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left — looping ambient video, no overlay text. Border keeps the
                panel visible while the (large) video file buffers. */}
            <div className="relative rounded-2xl overflow-hidden bg-stride-ink-deep border border-stride-border min-h-[440px] lg:min-h-0">
              <video
                src="/contact.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Right — form */}
            <div>
              <ContactForm />
            </div>
          </div>

          {/* Legal entity — board requirement: identify the company behind
              StrideShift on the Contact page and footer. */}
          <div className="mt-10 pt-8 border-t border-stride-border text-center">
            <p className="text-sm text-stride-text-muted leading-relaxed">
              StrideShift is a trading name of{' '}
              <span className="text-stride-text-strong font-medium">
                The Field Institute (Pty) Ltd
              </span>{' '}
              (Registration Number: 2017/313210/07)
            </p>
            <address className="not-italic text-sm text-stride-text-muted leading-relaxed mt-1">
              7 Escombe Avenue, Parktown West, Johannesburg, South Africa
              <br />
              <a href="mailto:hq@strideshift.ai" className="text-stride-accent hover:underline">
                hq@strideshift.ai
              </a>
            </address>
          </div>
        </div>
      </section>
          ),
        }}
      />
    </PageLayout>
  );
};

export default Contact;
