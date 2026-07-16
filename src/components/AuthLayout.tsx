import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  foot?: ReactNode;
}

const AuthLayout = ({ children, eyebrow = 'StrideShift', title, description, foot }: AuthLayoutProps) => {
  const configured = isSupabaseConfigured();
  return (
    <div className="min-h-screen flex flex-col bg-stride-bg-elev">
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-stride-border/60">
        <Link to="/" className="flex items-center gap-2 text-stride-text-strong">
          <ArrowLeft className="w-4 h-4" />
          <Logo />
        </Link>
        <ThemeToggle variant="standalone" />
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-[1fr_1fr]">
        <div className="flex items-center justify-center px-6 sm:px-12 py-10 lg:py-16 bg-stride-bg-elev">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="w-full max-w-md"
          >
            <span className="text-xs uppercase tracking-[0.22em] text-stride-text-muted font-semibold">
              {eyebrow}
            </span>
            <h1 className="font-display text-3xl md:text-4xl text-stride-text-strong mt-3 mb-3 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-stride-text-muted mb-8 leading-relaxed">{description}</p>
            )}

            {!configured && (
              <div className="mb-6 rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700/40 p-4">
                <p className="text-amber-900 dark:text-amber-200 text-sm">
                  <strong>Supabase isn't configured yet.</strong> Copy <code className="font-mono">.env.example</code>{' '}
                  to <code className="font-mono">.env</code>, fill in <code className="font-mono">VITE_SUPABASE_URL</code>{' '}
                  and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>, then restart{' '}
                  <code className="font-mono">npm run dev</code> to enable auth.
                </p>
              </div>
            )}

            {children}

            {foot && (
              <div className="mt-8 text-sm text-stride-text-muted text-center">{foot}</div>
            )}
          </motion.div>
        </div>

        {/* Decorative right panel — aurora wash + brand quote */}
        <div className="hidden lg:block relative overflow-hidden aurora-wash">
          <div className="absolute inset-0 animate-aurora-drift">
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full bg-stride-sky/22 blur-3xl animate-blob" />
            <div
              className="absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full bg-stride-sage/22 blur-3xl animate-blob"
              style={{ animationDelay: '-8s' }}
            />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[22rem] h-[22rem] rounded-full bg-stride-gold/15 blur-3xl animate-pulse-slow" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
                backgroundSize: '80px 80px',
                maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
              }}
            />
          </div>
          <div className="relative h-full flex flex-col justify-end p-12 text-white">
            <blockquote className="font-display text-2xl xl:text-3xl text-white leading-snug tracking-tight border-l-2 border-stride-gold/70 pl-5 max-w-lg">
              "From messy problem to clear action — in days, not months."
            </blockquote>
            <p className="mt-4 text-gold-gradient text-sm uppercase tracking-[0.22em] font-semibold pl-5">
              StrideShift Global
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
