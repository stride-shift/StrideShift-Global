import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import SEO from '@/components/SEO';
import { getSupabase } from '@/lib/supabase';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supa = getSupabase();
    if (!supa) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    const { error: err } = await supa.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <>
      <SEO title="Forgot password · StrideShift" description="Reset your StrideShift password." />
      <AuthLayout
        eyebrow="Reset"
        title="Forgot your password?"
        description="Enter your email and we'll send you a link to choose a new one."
        foot={
          <Link to="/sign-in" className="text-stride-accent font-medium underline">
            Back to sign in
          </Link>
        }
      >
        {sent ? (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300/60 dark:border-emerald-700/40 p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
            <p className="text-stride-text-strong font-medium mb-1">Email sent</p>
            <p className="text-sm text-stride-text-muted">
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-stride-text-strong">Email</span>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stride-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent"
                  placeholder="you@company.com"
                />
              </div>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-stride-navy text-white font-medium hover:bg-stride-navy-dark transition-colors flex items-center justify-center disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
            </button>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </form>
        )}
      </AuthLayout>
    </>
  );
};

export default ForgotPassword;
