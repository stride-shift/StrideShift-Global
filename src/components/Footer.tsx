import { ArrowRight, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { site } from '@/data/stride';
import Logo from '@/components/Logo';
import { getSupabase } from '@/lib/supabase';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Email required', description: 'Please enter your email.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    const supa = getSupabase();
    if (supa) {
      const { error } = await supa.from('newsletter_subscribers').insert({
        email: email.trim().toLowerCase(),
        source: 'website',
        consent_at: new Date().toISOString(),
      });
      if (error && !/duplicate|unique/i.test(error.message)) {
        toast({
          title: 'Hmm — that didn\'t work',
          description: 'Please try again in a moment.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
    }
    toast({ title: 'Thanks!', description: "You're on the newsletter list." });
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <footer id="contact" className="bg-stride-navy text-white pt-16 pb-8 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center">
              <Logo tone="light" size={30} />
            </Link>
            <p className="text-white/80 mt-5 mb-5 max-w-md leading-relaxed">
              {site.description} From messy problem to clear action — in days, not months.
            </p>
            <p className="text-white/60 text-sm mb-5">
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 hover:text-white">
                <Mail size={14} />
                {site.email}
              </a>
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-white/70 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/#solutions" className="text-white/70 hover:text-white transition-colors">
                  Solutions
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-white/70 hover:text-white transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/70 hover:text-white transition-colors">
                  Ideas
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white">Get the newsletter</h3>
            <p className="text-white/60 text-xs mb-3 leading-relaxed">
              Subscribe for the latest updates on StrideShift Global.
            </p>
            <form className="space-y-3" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-stride-accent-soft text-white placeholder-white/40 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-white text-stride-navy rounded-md hover:bg-stride-accent-soft transition-colors flex items-center justify-center disabled:opacity-50 text-sm font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing…' : (
                  <>
                    Subscribe
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-white/50 text-xs">
            © {new Date().getFullYear()} StrideShift Global. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-xs text-white/50 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
