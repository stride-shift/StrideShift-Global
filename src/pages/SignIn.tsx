import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import SEO from '@/components/SEO';
import { getSupabase, isSupabaseConfigured, AUTH_REDIRECT_AFTER_SIGNIN } from '@/lib/supabase';

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
    const supa = getSupabase();
    if (!supa) {
      setError('Supabase is not configured. See the notice above.');
      return;
    }
    setLoading(true);
    const { error: err } = await supa.auth.signInWithPassword({ email, password });
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

  const signInWithGoogle = async () => {
    const supa = getSupabase();
    if (!supa) {
      setError('Supabase is not configured.');
      return;
    }
    await supa.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${next}` },
    });
  };

  return (
    <>
      <SEO title="Sign in · StrideShift" description="Sign in to StrideShift Global." />
      <AuthLayout
        eyebrow="Welcome back"
        title="Sign in"
        description="Use Google, or email + password — whichever is easier."
        foot={
          <>
            New here?{' '}
            <Link to="/sign-up" className="text-stride-accent font-medium underline">
              Create an account
            </Link>
          </>
        }
      >
        <button
          onClick={signInWithGoogle}
          disabled={!isSupabaseConfigured()}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-stride-border bg-stride-bg-elev hover:bg-stride-bg text-stride-text-strong font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.83z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-stride-text-muted text-xs uppercase tracking-wider">
          <span className="h-px flex-1 bg-stride-border" />
          <span>or</span>
          <span className="h-px flex-1 bg-stride-border" />
        </div>

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
