import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  FileText,
  MessageSquareQuote,
  Users,
  Mail,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
  Paintbrush,
  ExternalLink,
} from 'lucide-react';
import SEO from '@/components/SEO';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useSiteContent } from '@/hooks/useSiteContent';
import { getSupabase } from '@/lib/supabase';
import { PAGE_LABELS, PAGE_PATHS, PAGE_SECTIONS, PageId } from '@/lib/sections';
import AnalyticsPanel from '@/components/admin/AnalyticsPanel';
import ContentPanel from '@/components/admin/ContentPanel';
import LandingSettingsPanel from '@/components/admin/LandingSettingsPanel';
import MessagesPanel from '@/components/admin/MessagesPanel';
import PeoplePanel from '@/components/admin/PeoplePanel';

const stat = (label: string, value: string | number, icon: React.ReactNode, hint?: string) => ({
  label,
  value,
  icon,
  hint,
});

const Admin = () => {
  const { user, isAdmin, loading, configured, signOut } = useAuth();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const { content } = useSiteContent();
  const [tab, setTab] = useState<
    'overview' | 'design' | 'analytics' | 'landing' | 'content' | 'messages' | 'people'
  >('overview');

  useEffect(() => {
    if (!loading && configured && !user) {
      navigate('/sign-in?next=/admin', { replace: true });
    }
  }, [user, loading, configured, navigate]);

  // Self-bootstrap: if no admin exists yet, the first signed-in user can claim it.
  const claimFirstAdmin = async () => {
    const supa = getSupabase();
    if (!supa || !user) return;
    setEnrolling(true);
    setEnrollError(null);
    try {
      const { count } = await supa
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_admin', true);
      if ((count ?? 0) > 0) {
        setEnrollError(
          "There's already an admin. Ask them to grant you access in the profiles table."
        );
        setEnrolling(false);
        return;
      }
      const { error } = await supa
        .from('profiles')
        .upsert({ id: user.id, email: user.email, is_admin: true });
      if (error) throw error;
      window.location.reload();
    } catch (e: any) {
      setEnrollError(
        e?.message ||
          'Could not enrol. Make sure the `profiles` table exists (see .env.example for the SQL).'
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stride-bg">
        <Loader2 className="w-8 h-8 animate-spin text-stride-accent" />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stride-bg p-8">
        <div className="max-w-md text-center">
          <ShieldCheck className="w-12 h-12 text-stride-accent mx-auto mb-3" />
          <h1 className="font-display text-3xl text-stride-text-strong mb-3 tracking-tight">
            Admin needs Supabase
          </h1>
          <p className="text-stride-text-muted mb-6">
            Copy <code className="font-mono text-sm">.env.example</code> to{' '}
            <code className="font-mono text-sm">.env</code>, fill in your Supabase credentials,
            then restart the dev server.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-lg bg-stride-navy text-white font-medium hover:bg-stride-navy-dark"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stride-bg p-8">
        <div className="max-w-lg text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h1 className="font-display text-3xl text-stride-text-strong mb-3 tracking-tight">
            Not an admin yet
          </h1>
          <p className="text-stride-text-muted mb-6">
            You're signed in as <strong>{user.email}</strong>, but you don't have admin access.
            If no admins exist yet, you can claim the first slot.
          </p>
          <button
            onClick={claimFirstAdmin}
            disabled={enrolling}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stride-navy text-white font-medium hover:bg-stride-navy-dark disabled:opacity-60"
          >
            {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Claim first admin
          </button>
          {enrollError && <p className="text-sm text-red-600 mt-4">{enrollError}</p>}
          <div className="mt-6">
            <button onClick={signOut} className="text-stride-text-muted underline text-sm">
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Counts come from the live editable content, not the static defaults —
  // so posts/solutions added in the Content tab are reflected here.
  const sortedPosts = [...content.posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const stats = [
    stat('Solutions', content.solutions.length, <Box className="w-5 h-5" />, 'Live products'),
    stat('Ideas', content.posts.length, <FileText className="w-5 h-5" />, 'Published'),
    stat('Voices', content.testimonials.length, <MessageSquareQuote className="w-5 h-5" />, 'Testimonials'),
    stat('Team', content.team.members.length, <Users className="w-5 h-5" />, 'Members'),
  ];

  return (
    <div className="min-h-screen bg-stride-bg">
      <SEO title="Admin · StrideShift" />

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-stride-bg-elev/90 backdrop-blur border-b border-stride-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Logo />
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stride-accent/15 text-stride-accent font-semibold uppercase tracking-wider">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-stride-text-muted">{user.email}</span>
            <ThemeToggle variant="standalone" />
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-stride-text-strong hover:bg-stride-bg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl md:text-4xl text-stride-text-strong mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-stride-text-muted mb-8">
            Snapshot of what's live on the site. Edits go via Supabase when content tables are
            wired.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-stride-bg-elev border border-stride-border rounded-2xl p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-stride-accent/15 text-stride-accent flex items-center justify-center">
                  {s.icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-stride-text-muted" />
              </div>
              <p className="font-display text-3xl text-stride-text-strong mb-1">{s.value}</p>
              <p className="text-sm font-semibold text-stride-text-strong">{s.label}</p>
              {s.hint && <p className="text-xs text-stride-text-muted">{s.hint}</p>}
            </motion.div>
          ))}
        </div>

        {/* Tabs — pill style, pinned below the header so switching sections
            never requires scrolling back up */}
        <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-5 bg-stride-bg/90 backdrop-blur">
          <div className="inline-flex bg-stride-bg-elev border border-stride-border rounded-full p-1 shadow-sm overflow-x-auto max-w-full">
            {(['overview', 'design', 'analytics', 'landing', 'content', 'messages', 'people'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all capitalize whitespace-nowrap ${
                  tab === t
                    ? 'bg-stride-navy text-white shadow-md'
                    : 'text-stride-text-muted hover:text-stride-text-strong'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6">
              <h3 className="font-display text-xl text-stride-text-strong mb-4 tracking-tight">
                Recent ideas
              </h3>
              <ul className="space-y-3">
                {sortedPosts.slice(0, 3).map((p) => (
                  <li
                    key={p.slug}
                    className="flex items-start justify-between gap-3 pb-3 border-b border-stride-border/60 last:border-0 last:pb-0"
                  >
                    <div>
                      <Link
                        to={`/blog/${p.slug}`}
                        className="font-medium text-stride-text-strong hover:text-stride-accent text-sm leading-snug"
                      >
                        {p.title}
                      </Link>
                      <p className="text-xs text-stride-text-muted mt-0.5">{p.displayDate}</p>
                    </div>
                    <span className="text-xs text-stride-text-muted whitespace-nowrap">
                      {p.readingMinutes} min
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6">
              <h3 className="font-display text-xl text-stride-text-strong mb-4 tracking-tight">
                Top solutions
              </h3>
              <ul className="space-y-3">
                {content.solutions.slice(0, 5).map((s) => (
                  <li
                    key={s.slug}
                    className="flex items-center justify-between gap-3 pb-3 border-b border-stride-border/60 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-stride-accent">{s.n}</span>
                      <Link
                        to={`/solutions/${s.slug}`}
                        className="font-medium text-stride-text-strong hover:text-stride-accent text-sm"
                      >
                        {s.name}
                      </Link>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-stride-bg text-stride-text-muted">
                      {s.category}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2 bg-stride-navy text-white rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <Mail className="w-8 h-8 text-stride-accent-soft flex-shrink-0" />
                <div>
                  <h3 className="font-display text-2xl text-white mb-2 tracking-tight">
                    Run the StrideShift site
                  </h3>
                  <p className="text-white/85 mb-4">
                    <strong>Design</strong> — arrange every page visually: drag sections, hide
                    them, restyle colours and spacing.{' '}
                    <strong>Analytics</strong> — live pageviews, sessions and clicks.{' '}
                    <strong>Landing</strong> — pick a hero template and edit the headline + image.{' '}
                    <strong>Content</strong> — edit testimonials, team and homepage copy. Every
                    change saves to Supabase and goes live instantly.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setTab('design')}
                      className="px-3.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                    >
                      Design pages
                    </button>
                    <button
                      onClick={() => setTab('analytics')}
                      className="px-3.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                    >
                      View analytics
                    </button>
                    <button
                      onClick={() => setTab('landing')}
                      className="px-3.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                    >
                      Edit landing
                    </button>
                    <button
                      onClick={() => setTab('content')}
                      className="px-3.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                    >
                      Edit content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'design' && (
          <div>
            <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6 mb-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-stride-accent/15 text-stride-accent flex items-center justify-center flex-shrink-0">
                  <Paintbrush className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-stride-text-strong tracking-tight mb-1">
                    Visual page editor
                  </h3>
                  <p className="text-sm text-stride-text-muted leading-relaxed">
                    Open any page in design mode and edit it in place, Wix-style: drag the
                    handle to move sections around, use the eye to hide a section, and the
                    palette to change its background, text colour and spacing. Changes save
                    automatically and go live for every visitor. Copy and images are edited in
                    the <button onClick={() => setTab('content')} className="underline text-stride-accent">Content</button> and{' '}
                    <button onClick={() => setTab('landing')} className="underline text-stride-accent">Landing</button> tabs.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(PAGE_PATHS) as PageId[]).map((p) => (
                <div
                  key={p}
                  className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col"
                >
                  <h4 className="font-display text-lg text-stride-text-strong tracking-tight mb-1">
                    {PAGE_LABELS[p]}
                  </h4>
                  <p className="text-xs text-stride-text-muted leading-relaxed mb-4 flex-grow">
                    {PAGE_SECTIONS[p].length} sections ·{' '}
                    {PAGE_SECTIONS[p].map((s) => s.label).join(' · ')}
                  </p>
                  <Link
                    to={`${PAGE_PATHS[p]}?edit=1`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stride-navy text-white text-sm font-medium hover:bg-stride-navy/90 transition-colors w-fit"
                  >
                    <Paintbrush className="w-3.5 h-3.5" />
                    Open visual editor
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'analytics' && <AnalyticsPanel />}

        {tab === 'landing' && <LandingSettingsPanel />}

        {tab === 'content' && <ContentPanel />}

        {tab === 'messages' && <MessagesPanel />}

        {tab === 'people' && <PeoplePanel />}
      </main>
    </div>
  );
};

export default Admin;
