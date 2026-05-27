import { motion } from 'framer-motion';
import { Mail, Clock, MessageSquare } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import ContactForm from '@/components/ContactForm';
import { site } from '@/data/stride';
import { useSiteContent } from '@/hooks/useSiteContent';

const Contact = () => {
  const { content } = useSiteContent();
  const contact = content.contact;
  return (
    <PageLayout showContact={false}>
      <SEO
        title="Contact StrideShift — Let's talk"
        description="Tell us the challenge you're facing — we'll listen first, then show you whether and how we can help. No pitch decks. No pressure."
      />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-12 md:pb-16 bg-stride-ink text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[36rem] h-[36rem] rounded-full bg-stride-sky/22 blur-3xl animate-blob" />
          <div
            className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full bg-stride-gold/16 blur-3xl animate-blob"
            style={{ animationDelay: '-8s' }}
          />
          <div className="absolute top-1/3 right-1/3 w-[20rem] h-[20rem] rounded-full bg-stride-sage/18 blur-3xl animate-pulse-slow" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4 text-xs uppercase tracking-[0.22em] text-stride-accent-soft font-semibold"
          >
            {contact.eyebrow}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 tracking-tight"
          >
            {contact.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-white/85 max-w-3xl mx-auto leading-relaxed"
          >
            {contact.tagline}
          </motion.p>
        </div>
      </section>

      {/* Form + info */}
      <section className="py-16 md:py-24 bg-stride-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
            <div className="space-y-5">
              <div className="bg-stride-bg-elev rounded-xl p-6 border border-stride-border shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-stride-accent/15 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-stride-accent" />
                </div>
                <h3 className="font-display text-lg text-stride-text-strong mb-1 tracking-tight">
                  Email us directly
                </h3>
                <a
                  href={`mailto:${site.email}`}
                  className="text-stride-accent font-medium hover:underline"
                >
                  {site.email}
                </a>
              </div>

              <div className="bg-stride-bg-elev rounded-xl p-6 border border-stride-border shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-stride-accent/15 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-stride-accent" />
                </div>
                <h3 className="font-display text-lg text-stride-text-strong mb-1 tracking-tight">
                  Hours
                </h3>
                <p className="text-stride-text-muted">Mon – Fri, by appointment</p>
              </div>

              <div className="bg-stride-navy text-white rounded-xl p-6 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5 text-stride-accent-soft" />
                </div>
                <h3 className="font-display text-lg text-white mb-2 tracking-tight">
                  What happens next
                </h3>
                <ol className="space-y-2 text-sm text-white/85 list-decimal list-inside">
                  <li>You send us a note — what's keeping you up at night.</li>
                  <li>We reply within one business day to set up a call.</li>
                  <li>30-minute conversation. We listen. No pitch decks.</li>
                </ol>
              </div>
            </div>

            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Contact;
