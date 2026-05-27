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
} from 'lucide-react';
import SEO from '@/components/SEO';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import { Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings, DEFAULT_SETTINGS, HERO_TEMPLATES } from '@/hooks/useSiteSettings';
import { useSiteContent } from '@/hooks/useSiteContent';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { showcase, posts } from '@/data/stride';
import AnalyticsPanel from '@/components/admin/AnalyticsPanel';
import ContentPanel from '@/components/admin/ContentPanel';
import ImageUpload from '@/components/admin/ImageUpload';

const stat = (label: string, value: string | number, icon: React.ReactNode, hint?: string) => ({
  label,
  value,
  icon,
  hint,
});

/* ---- Landing-page settings panel ---- */
const LandingSettingsPanel = () => {
  const { settings, updateSettings, resetSettings, saving } = useSiteSettings();
  const [draft, setDraft] = useState(settings);
  const [savedFlash, setSavedFlash] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const save = async () => {
    setSaveError(null);
    try {
      await updateSettings(draft);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2600);
    } catch (e: any) {
      setSaveError(
        e?.message ||
          'Could not save to Supabase. The change is kept in this browser. Run supabase/migration.sql so the site_settings table accepts admin writes.'
      );
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {/* Editor */}
      <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-stride-accent" />
          <h3 className="font-display text-xl text-stride-text-strong tracking-tight">
            Landing hero
          </h3>
        </div>

        {/* Template picker */}
        <div>
          <span className="text-sm font-medium text-stride-text-strong">Template</span>
          <p className="text-xs text-stride-text-muted mb-2.5">
            Pick the look for the top of the landing page.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {HERO_TEMPLATES.map((tpl) => {
              const active = draft.heroTemplate === tpl.id;
              const swatch: Record<string, string> = {
                fluid: 'from-stride-ink via-stride-sky/60 to-stride-sage/60',
                classic: 'from-stride-ink via-stride-ink-deep to-stride-sage/40',
                aurora: 'from-stride-ink via-stride-sage to-stride-sky',
                lines: 'from-stride-ink-deep via-stride-sky to-stride-sky/40',
                spectrum: 'from-stride-sky/60 via-stride-ink to-stride-gold/40',
                mesh: 'from-stride-ink via-stride-sky/60 to-stride-sage/50',
                grid: 'from-stride-ink-deep via-stride-ink to-stride-sky/30',
                spotlight: 'from-stride-ink-deep via-stride-sky/40 to-stride-ink-deep',
                waves: 'from-stride-ink via-stride-sage/50 to-stride-sky/40',
                orbit: 'from-stride-ink via-stride-ink-deep to-stride-gold/30',
                minimal: 'from-stride-ink via-stride-ink-deep to-stride-ink',
              };
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, heroTemplate: tpl.id })}
                  className={`text-left rounded-xl border p-3 transition-all ${
                    active
                      ? 'border-stride-accent ring-2 ring-stride-accent/40 bg-stride-accent/5'
                      : 'border-stride-border hover:border-stride-accent/50'
                  }`}
                >
                  <div
                    className={`h-14 rounded-md bg-gradient-to-br ${swatch[tpl.id]} mb-2 relative overflow-hidden`}
                  >
                    {tpl.id === 'lines' && (
                      <div className="absolute inset-0 opacity-60" style={{ background: 'repeating-linear-gradient(90deg, transparent 0 6px, rgba(120,170,255,0.5) 6px 7px)' }} />
                    )}
                    {tpl.id === 'classic' && (
                      <div className="absolute right-2 top-2 bottom-2 w-8 rounded bg-white/25" />
                    )}
                    {(tpl.id === 'grid' || tpl.id === 'spotlight') && (
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)',
                          backgroundSize: '12px 12px',
                        }}
                      />
                    )}
                    {tpl.id === 'orbit' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full border border-white/40" />
                        <div className="absolute w-5 h-5 rounded-full border border-white/30" />
                      </div>
                    )}
                    {tpl.id === 'waves' && (
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/15 rounded-t-[100%]" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-stride-text-strong flex items-center gap-1.5">
                    {tpl.name}
                    {active && <span className="text-stride-accent text-xs">● live</span>}
                  </p>
                  <p className="text-[11px] text-stride-text-muted leading-snug mt-0.5">
                    {tpl.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-stride-text-strong block mb-2">
            Hero image
            {draft.heroTemplate !== 'classic' && (
              <span className="text-stride-text-muted font-normal">
                {' '}— used by the Classic template
              </span>
            )}
          </span>
          <ImageUpload
            value={draft.heroImageUrl}
            onChange={(url) => setDraft({ ...draft, heroImageUrl: url })}
            folder="hero"
          />
        </div>

        <label className="block">
          <span className="text-sm font-medium text-stride-text-strong">Headline</span>
          <textarea
            value={draft.heroHeadline}
            onChange={(e) => setDraft({ ...draft, heroHeadline: e.target.value })}
            rows={2}
            className="mt-1 w-full px-3 py-2.5 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-sm resize-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stride-text-strong">Sub-headline</span>
          <textarea
            value={draft.heroSubhead}
            onChange={(e) => setDraft({ ...draft, heroSubhead: e.target.value })}
            rows={3}
            className="mt-1 w-full px-3 py-2.5 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-sm resize-none"
          />
        </label>

        {/* Style controls — colour, alignment, headline size, overlay */}
        <div className="border-t border-stride-border pt-4 space-y-4">
          <p className="text-xs uppercase tracking-wider text-stride-text-muted font-semibold">
            Style — applies to the selected template
          </p>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-stride-text-strong">Alignment</span>
              <div className="mt-1 inline-flex rounded-md border border-stride-border bg-stride-bg-elev p-0.5 w-full">
                {(['left', 'center'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setDraft({ ...draft, heroAlign: a })}
                    className={`flex-1 px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                      draft.heroAlign === a
                        ? 'bg-stride-navy text-white'
                        : 'text-stride-text-strong hover:bg-stride-bg'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-stride-text-strong">Headline size</span>
              <select
                value={draft.heroHeadlineSize}
                onChange={(e) =>
                  setDraft({ ...draft, heroHeadlineSize: e.target.value as any })
                }
                className="mt-1 w-full px-3 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-sm"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra large</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-stride-text-strong">Headline colour</span>
              <div className="mt-1 flex gap-2 items-center">
                <input
                  type="color"
                  value={draft.heroHeadlineColor}
                  onChange={(e) => setDraft({ ...draft, heroHeadlineColor: e.target.value })}
                  className="h-9 w-12 rounded border border-stride-border bg-stride-bg-elev cursor-pointer"
                />
                <input
                  value={draft.heroHeadlineColor}
                  onChange={(e) => setDraft({ ...draft, heroHeadlineColor: e.target.value })}
                  className="flex-1 px-2 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-xs font-mono"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-stride-text-strong">Sub-headline colour</span>
              <div className="mt-1 flex gap-2 items-center">
                <input
                  type="color"
                  value={draft.heroSubheadColor}
                  onChange={(e) => setDraft({ ...draft, heroSubheadColor: e.target.value })}
                  className="h-9 w-12 rounded border border-stride-border bg-stride-bg-elev cursor-pointer"
                />
                <input
                  value={draft.heroSubheadColor}
                  onChange={(e) => setDraft({ ...draft, heroSubheadColor: e.target.value })}
                  className="flex-1 px-2 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-xs font-mono"
                />
              </div>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-stride-text-strong">
              Background overlay darkness · {Math.round(draft.heroOverlayOpacity * 100)}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(draft.heroOverlayOpacity * 100)}
              onChange={(e) =>
                setDraft({ ...draft, heroOverlayOpacity: Number(e.target.value) / 100 })
              }
              className="mt-2 w-full accent-stride-accent"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-stride-navy text-white font-medium hover:bg-stride-navy-dark transition-colors disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {dirty ? 'Save changes' : 'Saved'}
          </button>
          <button
            onClick={() => {
              resetSettings();
              setDraft(DEFAULT_SETTINGS);
            }}
            className="px-4 py-2.5 rounded-lg text-stride-text-muted hover:bg-stride-bg text-sm transition-colors"
          >
            Reset to default
          </button>
          {savedFlash && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              Saved ✓
            </span>
          )}
        </div>
        {saveError && (
          <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">{saveError}</p>
        )}
        {!isSupabaseConfigured() && (
          <p className="text-xs text-stride-text-muted">
            Saved to this browser. Configure Supabase (with the <code className="font-mono">site_settings</code>{' '}
            table) to make changes global across all visitors.
          </p>
        )}
      </div>

      {/* Live preview */}
      <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6">
        <h3 className="font-display text-xl text-stride-text-strong tracking-tight mb-4">
          Live preview
        </h3>
        {(() => {
          const isClassic = draft.heroTemplate === 'classic';
          const shaderBg: Record<string, string> = {
            fluid: 'from-stride-ink via-stride-sky/60 to-stride-sage/60',
            aurora: 'from-stride-ink via-stride-sage to-stride-sky',
            lines: 'from-stride-ink-deep via-stride-sky to-stride-sky/40',
            spectrum: 'from-stride-sky/60 via-stride-ink to-stride-gold/40',
            mesh: 'from-stride-ink via-stride-sky/60 to-stride-sage/50',
            grid: 'from-stride-ink-deep via-stride-ink to-stride-sky/30',
            spotlight: 'from-stride-ink-deep via-stride-sky/40 to-stride-ink-deep',
            waves: 'from-stride-ink via-stride-sage/50 to-stride-sky/40',
            orbit: 'from-stride-ink via-stride-ink-deep to-stride-gold/30',
            minimal: 'from-stride-ink via-stride-ink-deep to-stride-ink',
          };
          return (
            <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-stride-navy">
              {isClassic && draft.heroImageUrl && (
                <img
                  src={draft.heroImageUrl}
                  alt="Hero preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {isClassic ? (
                <div className="absolute inset-0 bg-gradient-to-br from-stride-navy/97 via-stride-navy/88 to-stride-navy/72" />
              ) : (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${shaderBg[draft.heroTemplate]}`}
                >
                  {draft.heroTemplate === 'lines' && (
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{
                        background:
                          'repeating-linear-gradient(95deg, transparent 0 10px, rgba(120,170,255,0.5) 10px 12px)',
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-stride-navy/40 to-stride-navy/70" />
                </div>
              )}
              <div
                className={`relative h-full flex flex-col justify-center p-6 ${
                  draft.heroAlign === 'center' ? 'items-center text-center' : 'items-start text-left'
                }`}
              >
                <h4
                  className={`font-display leading-tight mb-2 line-clamp-3 ${
                    draft.heroHeadlineSize === 'sm'
                      ? 'text-base'
                      : draft.heroHeadlineSize === 'md'
                      ? 'text-lg'
                      : draft.heroHeadlineSize === 'xl'
                      ? 'text-2xl'
                      : 'text-xl'
                  } ${draft.heroAlign === 'left' ? '' : 'max-w-md'}`}
                  style={{ color: draft.heroHeadlineColor }}
                >
                  {draft.heroHeadline || 'Headline preview'}
                </h4>
                <p
                  className={`text-xs line-clamp-3 max-w-sm ${
                    draft.heroAlign === 'left' ? 'border-l-2 border-stride-accent-soft pl-2' : ''
                  }`}
                  style={{ color: draft.heroSubheadColor, opacity: 0.85 }}
                >
                  {draft.heroSubhead || 'Sub-headline preview'}
                </p>
                <span className="mt-3 inline-block text-[10px] uppercase tracking-wider text-stride-accent-soft/80">
                  {draft.heroTemplate} template
                </span>
              </div>
            </div>
          );
        })()}
        <p className="text-xs text-stride-text-muted mt-3">
          Static preview — the live shaders animate on the actual page. Changes apply site-wide on save.
        </p>
      </div>
    </div>
  );
};

const Admin = () => {
  const { user, isAdmin, loading, configured, signOut } = useAuth();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const { content } = useSiteContent();
  const [tab, setTab] = useState<'overview' | 'analytics' | 'landing' | 'content'>('overview');

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

  const stats = [
    stat('Solutions', showcase.items.length, <Box className="w-5 h-5" />, 'Live products'),
    stat('Ideas', posts.length, <FileText className="w-5 h-5" />, 'Published'),
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
              <Logo tone="dark" />
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

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-stride-border">
          {(['overview', 'analytics', 'landing', 'content'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 -mb-px text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'border-stride-navy text-stride-text-strong'
                  : 'border-transparent text-stride-text-muted hover:text-stride-text-strong'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6">
              <h3 className="font-display text-xl text-stride-text-strong mb-4 tracking-tight">
                Recent ideas
              </h3>
              <ul className="space-y-3">
                {posts.slice(0, 3).map((p) => (
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
                {showcase.items.slice(0, 5).map((s) => (
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
                    <strong>Analytics</strong> — live pageviews, sessions and clicks.{' '}
                    <strong>Landing</strong> — pick a hero template and edit the headline + image.{' '}
                    <strong>Content</strong> — edit testimonials, team and homepage copy. Every
                    change saves to Supabase and goes live instantly.
                  </p>
                  <div className="flex flex-wrap gap-2">
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

        {tab === 'analytics' && <AnalyticsPanel />}

        {tab === 'landing' && <LandingSettingsPanel />}

        {tab === 'content' && <ContentPanel />}
      </main>
    </div>
  );
};

export default Admin;
