import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
// SignUp page was removed — StrideShift is invite-only. Admins issue invites
// from /admin → People → Invitations and Supabase emails a sign-up link.
import AuthLayout from '@/components/AuthLayout';
import SEO from '@/components/SEO';
import { getSupabase, AUTH_REDIRECT_AFTER_SIGNIN } from '@/lib/supabase';

const SignIn = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = params.get('next') || AUTH_REDIRECT_AFTER_SIGNIN;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsConfirmation(false);
    setResent(false);
    const normalised = email.trim().toLowerCase();
    const supa = getSupabase();
    if (!supa) {
      setError('Supabase is not configured. See the notice above.');
      return;
    }
    setLoading(true);
    const { error: err } = await supa.auth.signInWithPassword({ email: normalised, password });
    setLoading(false);
    if (err) {
      if (err.message.toLowerCase().includes('email not confirmed')) {
        setNeedsConfirmation(true);
      } else if (err.message.toLowerCase().includes('invalid')) {
        setError('Email or password is incorrect.');
      } else {
        setError(err.message);
      }
      return;
    }
    navigate(next, { replace: true });
  };

  const resend = async () => {
    const supa = getSupabase();
    if (!supa || !email) return;
    const { error: err } = await supa.auth.resend({ type: 'signup', email });
    if (!err) setResent(true);
  };

  return (
    <>
      <SEO title="Sign in · StrideShift" description="Sign in to StrideShift Global." />
      <AuthLayout
        eyebrow="Welcome back"
        title="Sign in"
        description="Sign in with your email and password."
        foot={
          <span className="text-stride-text-muted">
            StrideShift is invite-only. If you don't have an account, contact your admin.
          </span>
        }
      >
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
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent"
                placeholder="you@company.com"
              />
            </div>
          </label>
          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stride-text-strong">Password</span>
              <Link
                to="/forgot-password"
                className="text-xs text-stride-accent hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stride-text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="current-password"
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent"
                placeholder="••••••••"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-stride-navy text-white font-medium hover:bg-stride-navy-dark transition-colors flex items-center justify-center disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
          </button>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {needsConfirmation && !resent && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your email isn't confirmed yet.{' '}
              <button type="button" onClick={resend} className="underline font-medium">
                Resend confirmation email
              </button>
            </p>
          )}
          {resent && (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Confirmation email sent. Check your inbox.
            </p>
          )}
        </form>
      </AuthLayout>
    </>
  );
};

export default SignIn;
