import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import SEO from '@/components/SEO';
import { getSupabase } from '@/lib/supabase';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Invite-only system — admins add emails via /admin → People → Invitations
    // and the database trigger blocks sign-up for any email that isn't on the
    // pending_invitations list. We only normalise here; the actual gate lives
    // in the DB so users can't bypass it.
    const normalised = email.trim().toLowerCase();
    const supa = getSupabase();
    if (!supa) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    const { error: err } = await supa.auth.signUp({
      email: normalised,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/sign-in`,
      },
    });
    setLoading(false);
    if (err) {
      // The DB trigger raises a check_violation when there's no matching
      // pending invitation — translate the Postgres error into something
      // a non-technical user can act on.
      if (/no invitation found|check_violation|database error saving new user/i.test(err.message)) {
        setError(
          "That email hasn't been invited yet. Ask an admin to invite you, then come back here."
        );
      } else {
        setError(err.message);
      }
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <>
        <SEO title="Check your email · StrideShift" description="Confirm your StrideShift account." />
        <AuthLayout
          eyebrow="Check your inbox"
          title="One last step"
          description="We just sent you a confirmation email. Click the link to activate your account."
          foot={
            <Link to="/sign-in" className="text-stride-accent font-medium underline">
              Back to sign in
            </Link>
          }
        >
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300/60 dark:border-emerald-700/40 p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
            <p className="text-stride-text-strong font-medium mb-1">Confirmation sent</p>
            <p className="text-sm text-stride-text-muted">
              We sent a link to <strong className="text-stride-text-strong">{email}</strong>. Open
              it on this device.
            </p>
          </div>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <SEO title="Sign up · StrideShift" description="Create a StrideShift account." />
      <AuthLayout
        eyebrow="Invitation required"
        title="Create an account"
        description="StrideShift is invite-only. Use the email an admin invited — we'll send a confirmation link to your inbox."
        foot={
          <>
            Already have an account?{' '}
            <Link to="/sign-in" className="text-stride-accent font-medium underline">
              Sign in
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-stride-text-strong">Full name</span>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stride-text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent"
                placeholder="Jane Doe"
              />
            </div>
          </label>
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
            <span className="text-sm font-medium text-stride-text-strong">Password</span>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stride-text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent"
                placeholder="At least 8 characters"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-stride-navy text-white font-medium hover:bg-stride-navy-dark transition-colors flex items-center justify-center disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
          </button>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </form>
      </AuthLayout>
    </>
  );
};

export default SignUp;
