import { Mail, Linkedin, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { site } from '@/data/stride';
import { useSiteContent } from '@/hooks/useSiteContent';

const ContactInfo = () => {
  const { content } = useSiteContent();
  const contact = content.contact;
  return (
    <section
      id="contact-info"
      className="bg-gradient-to-b from-stride-bg-elev to-stride-bg text-stride-text-strong relative py-16 md:py-20"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-stride-text-strong mb-4 tracking-tight">
            {contact.title}
          </h2>
          <p className="text-stride-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {contact.tagline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <a
            href={`mailto:${site.email}`}
            className="bg-stride-bg-elev rounded-xl shadow-md p-6 border border-stride-border hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-start group"
          >
            <div className="w-10 h-10 rounded-lg bg-stride-accent/15 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-stride-accent" />
            </div>
            <span className="stride-eyebrow mb-1">Email</span>
            <span className="text-stride-text-strong font-medium group-hover:text-stride-accent transition-colors">
              {site.email}
            </span>
          </a>

          <div className="bg-stride-bg-elev rounded-xl shadow-md p-6 border border-stride-border flex flex-col items-start">
            <div className="w-10 h-10 rounded-lg bg-stride-accent/15 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-stride-accent" />
            </div>
            <span className="stride-eyebrow mb-1">Hours</span>
            <span className="text-stride-text-strong font-medium">Mon – Fri, by appointment</span>
          </div>

          <Link
            to="/contact"
            className="bg-stride-navy text-white rounded-xl shadow-md p-6 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-start group"
          >
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-white/85" />
            </div>
            <span className="text-xs uppercase tracking-[0.22em] text-white/60 font-semibold mb-1">
              Or use the form
            </span>
            <span className="font-medium inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform">
              Tell us what's keeping you up at night
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;
