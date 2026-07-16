import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, XCircle, Check, X } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import SEO from '@/components/SEO';
import { getSupabase } from '@/lib/supabase';

/**
 * Set-a-new-password page. Reached two ways:
 *  1. The recovery email deep-links here with ?token_hash=…&type=recovery —
 *     we verify the token ourselves (verifyOtp), which starts a recovery
 *     session without ever bouncing through the homepage.
 *  2. Legacy links that land elsewhere fire Supabase's PASSWORD_RECOVERY
 *     event, which App.tsx redirects here; the session already exists.
 */

type Phase = 'verifying' | 'ready' | 'invalid' | 'done';

const Rule = ({ ok, label }: { ok: boolean; label: string }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
      ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-stride-text-muted'
    }`}
  >
    {ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 opacity-50" />}
    {label}
  </span>
);

const PasswordField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="text-sm font-medium text-stride-text-strong">{label}</span>
      <div className="relative mt-1">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stride-text-muted" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full pl-9 pr-11 py-2.5 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stride-text-muted hover:text-stride-text-strong transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </label>
  );
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('verifying');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) {
      setPhase('invalid');
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');

    (async () => {
      if (tokenHash) {
        // Email deep-link: exchange the one-time token for a recovery session.
        const { error: err } = await supa.auth.verifyOtp({
          type: 'recovery',
          token_hash: tokenHash,
        });
        // Strip the token from the address bar either way.
        window.history.replaceState({}, '', '/reset-password');
        setPhase(err ? 'invalid' : 'ready');
        return;
      }
      // No token in the URL: only valid if a session already exists
      // (PASSWORD_RECOVERY redirect, or a signed-in user changing password).
      const { data } = await supa.auth.getSession();
      setPhase(data.session ? 'ready' : 'invalid');
    })();
  }, []);

  const longEnough = password.length >= 8;
  const matches = confirm.length > 0 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!longEnough) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    const supa = getSupabase();
    if (!supa) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    const { error: err } = await supa.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Force a clean re-login with the new password.
    await supa.auth.signOut();
    setPhase('done');
  };

  return (
    <>
      <SEO title="Set a new password · StrideShift" description="Choose a new password." />
      <AuthLayout
        eyebrow="Password reset"
        title="Set a new password"
        description={
          phase === 'ready' ? 'Choose something secure — at least 8 characters.' : undefined
        }
        foot={
          <Link to="/sign-in" className="text-stride-accent font-medium underline">
            Back to sign in
          </Link>
        }
      >
        {phase === 'verifying' && (
          <div className="flex flex-col items-center gap-3 py-10 text-stride-text-muted">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Checking your reset link…</p>
          </div>
        )}

        {phase === 'invalid' && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-300/60 dark:border-red-700/40 p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-3" />
            <p className="text-stride-text-strong font-medium mb-1">
              This reset link is invalid or has expired
            </p>
            <p className="text-sm text-stride-text-muted mb-5">
              Reset links work once and expire after 60 minutes. Request a fresh one and try
              again.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stride-navy text-white text-sm font-medium hover:bg-stride-navy-dark transition-colors"
            >
              Request a new link
            </Link>
          </div>
        )}

        {phase === 'ready' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField label="New password" value={password} onChange={setPassword} />
            <PasswordField label="Confirm password" value={confirm} onChange={setConfirm} />

            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              <Rule ok={longEnough} label="At least 8 characters" />
              <Rule ok={matches} label="Passwords match" />
            </div>

            <button
              type="submit"
              disabled={loading || !longEnough || !matches}
              className="w-full px-4 py-3 rounded-lg bg-stride-navy text-white font-medium hover:bg-stride-navy-dark transition-colors flex items-center justify-center disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update password'}
            </button>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </form>
        )}

        {phase === 'done' && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300/60 dark:border-emerald-700/40 p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
            <p className="text-stride-text-strong font-medium mb-1">Password updated</p>
            <p className="text-sm text-stride-text-muted mb-5">
              Your new password is set. Sign in with it to continue.
            </p>
            <button
              onClick={() => navigate('/sign-in', { replace: true })}
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stride-navy text-white text-sm font-medium hover:bg-stride-navy-dark transition-colors"
            >
              Go to sign in
            </button>
          </div>
        )}
      </AuthLayout>
    </>
  );
};

export default ResetPassword;
