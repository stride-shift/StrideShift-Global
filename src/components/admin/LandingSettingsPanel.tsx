import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import {
  Loader2,
  Check,
  Palette,
  AlignLeft,
  Type,
  Layers,
  Sliders,
  Compass,
  ArrowRight,
} from 'lucide-react';
import {
  useSiteSettings,
  DEFAULT_SETTINGS,
  HERO_TEMPLATES,
  isSupabaseConfigured,
  type SiteSettings,
} from '@/hooks/useSiteSettings';
import ImageUpload from '@/components/admin/ImageUpload';
import { CssHeroBackground } from '@/components/hero/HeroBackgrounds';
import { logAdminActivity } from '@/lib/adminActivity';

// Lazy-load the WebGL shaders so they only mount when the user picks them.
const FluidShader = lazy(() => import('@/components/ui/fluid-shader'));
const AuroraShader = lazy(() =>
  import('@/components/ui/aurora-shader').then((m) => ({ default: m.AuroraShader }))
);
const LinesShader = lazy(() =>
  import('@/components/ui/lines-shader').then((m) => ({ default: m.LinesShader }))
);
const SpectrumShader = lazy(() =>
  import('@/components/ui/spectrum-shader').then((m) => ({ default: m.SpectrumShader }))
);

/* ────────────────────────────────────────────────────────────── helpers */

const SECTION_LABEL =
  'text-[11px] uppercase tracking-[0.18em] text-stride-text-muted font-semibold';

const NumberBadge = ({ n }: { n: number }) => (
  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stride-navy text-white font-display text-sm flex items-center justify-center">
    {n}
  </span>
);

const PanelHeader = ({
  n,
  title,
  subtitle,
}: {
  n: number;
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-start gap-3 pb-4 border-b border-stride-border mb-4">
    <NumberBadge n={n} />
    <div>
      <h3 className="font-display text-xl text-stride-text-strong tracking-tight leading-tight">
        {title}
      </h3>
      <p className="text-xs text-stride-text-muted mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-sm';

const labelText = 'text-[12px] font-medium text-stride-text-strong';

const TextField = ({
  label,
  value,
  onChange,
  multiline,
  rows = 2,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) => (
  <label className="block">
    <span className={labelText}>{label}</span>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${inputCls} mt-1 resize-none`}
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} mt-1`}
      />
    )}
  </label>
);

const ColorField = ({
  label,
  value,
  onChange,
  placeholderHex,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholderHex: string;
}) => (
  <label className="block">
    <span className={labelText}>{label}</span>
    <div className="mt-1 flex items-center gap-2">
      <input
        type="color"
        value={value || placeholderHex}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-10 rounded border border-stride-border bg-stride-bg-elev cursor-pointer flex-shrink-0"
      />
      <input
        value={value}
        placeholder={placeholderHex}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 px-2 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-xs font-mono"
      />
    </div>
  </label>
);

/* ────────────────────────────── template swatch (left column gallery) */

const TEMPLATE_SWATCH: Record<string, string> = {
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

const TemplateTile = ({
  active,
  swatchClass,
  name,
  templateId,
  onClick,
}: {
  active: boolean;
  swatchClass: string;
  name: string;
  templateId: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative text-left rounded-xl border p-2 transition-all ${
      active
        ? 'border-stride-accent ring-2 ring-stride-accent/40 bg-stride-accent/5'
        : 'border-stride-border hover:border-stride-accent/50'
    }`}
  >
    <div
      className={`h-14 rounded-md bg-gradient-to-br ${swatchClass} mb-1.5 relative overflow-hidden`}
    >
      {/* Per-template subtle decoration */}
      {templateId === 'lines' && (
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'repeating-linear-gradient(90deg, transparent 0 6px, rgba(120,170,255,0.5) 6px 7px)',
          }}
        />
      )}
      {templateId === 'classic' && (
        <div className="absolute right-2 top-2 bottom-2 w-8 rounded bg-white/25" />
      )}
      {(templateId === 'grid' || templateId === 'spotlight') && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
      )}
      {templateId === 'orbit' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full border border-white/40" />
          <div className="absolute w-5 h-5 rounded-full border border-white/30" />
        </div>
      )}
      {templateId === 'waves' && (
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/15 rounded-t-[100%]" />
      )}
      {active && (
        <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-stride-accent text-white flex items-center justify-center shadow-md">
          <Check className="w-3 h-3" strokeWidth={3} />
        </span>
      )}
    </div>
    <p className="text-[12px] font-semibold text-stride-text-strong leading-tight">{name}</p>
  </button>
);

/* ───────────────────────── right column: summary "Template applied" */

const SummaryRow = ({
  icon: Icon,
  label,
  value,
  swatchColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  swatchColor?: string;
}) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-stride-border last:border-b-0">
    <div className="flex items-center gap-3 min-w-0">
      <Icon className="w-4 h-4 text-stride-accent flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-stride-text-muted font-semibold">
          {label.split('|')[0]}
        </p>
        {label.includes('|') && (
          <p className="text-[10px] text-stride-text-muted/80 mt-0.5">{label.split('|')[1]}</p>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      {swatchColor && (
        <span
          className="inline-block w-4 h-4 rounded border border-stride-border"
          style={{ backgroundColor: swatchColor }}
          aria-hidden="true"
        />
      )}
      <span className="text-xs font-mono text-stride-text-strong">{value}</span>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────── preview canvas */

const SHADER_TEMPLATES = ['fluid', 'aurora', 'lines', 'spectrum'] as const;
const CSS_TEMPLATES = ['mesh', 'grid', 'spotlight', 'waves', 'orbit', 'minimal'] as const;

const PreviewCanvas = ({ draft }: { draft: SiteSettings }) => {
  const tpl = draft.heroTemplate;
  const isClassic = tpl === 'classic';
  const isShader = (SHADER_TEMPLATES as readonly string[]).includes(tpl);
  const isCss = (CSS_TEMPLATES as readonly string[]).includes(tpl);

  const headlineSize =
    draft.heroHeadlineSize === 'sm'
      ? 'text-2xl'
      : draft.heroHeadlineSize === 'md'
      ? 'text-3xl'
      : draft.heroHeadlineSize === 'xl'
      ? 'text-5xl'
      : 'text-4xl';

  return (
    <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-stride-ink">
      {/* === Background: the actual hero template rendered live === */}
      {isClassic && draft.heroImageUrl && (
        <img
          src={draft.heroImageUrl}
          alt="Hero preview"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {isClassic && (
        <div className="absolute inset-0 bg-gradient-to-br from-stride-ink/95 via-stride-ink/80 to-stride-ink/60" />
      )}

      {isCss && (
        // key={tpl} forces React to remount when template changes — needed
        // because each CSS background has its own animations / DOM and we want
        // them to start fresh on each pick.
        <div key={tpl} className="absolute inset-0">
          <CssHeroBackground template={tpl} />
        </div>
      )}

      {isShader && (
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-stride-ink flex items-center justify-center text-stride-cream/40 text-xs">
              Loading shader…
            </div>
          }
        >
          <div key={tpl} className="absolute inset-0">
            {tpl === 'fluid' && <FluidShader speed={0.45} />}
            {tpl === 'aurora' && <AuroraShader />}
            {tpl === 'lines' && <LinesShader />}
            {tpl === 'spectrum' && <SpectrumShader />}
          </div>
        </Suspense>
      )}

      {/* Adjustable overlay — same as the live page */}
      <div
        className="absolute inset-0 bg-stride-ink pointer-events-none"
        style={{ opacity: draft.heroOverlayOpacity * 0.55 }}
        aria-hidden="true"
      />

      {/* === Foreground content === */}
      <div
        className={`relative h-full flex flex-col justify-center p-8 ${
          draft.heroAlign === 'center' ? 'items-center text-center' : 'items-start text-left'
        }`}
      >
        {/* The Fluid hero renders headline + rotating word, subhead beneath —
            mirror that here so the preview matches the homepage. */}
        <h4
          className={`font-display leading-snug mb-2 line-clamp-3 ${headlineSize} ${
            draft.heroAlign === 'left' ? '' : 'max-w-md'
          }`}
          style={{ color: draft.heroHeadlineColor || undefined }}
        >
          {draft.heroHeadline || 'Headline preview'}
          {draft.heroRotatingWords.trim() && (
            <span className="block">
              {draft.heroRotatingPrefix && <>{draft.heroRotatingPrefix} </>}
              <span className="text-stride-gold">
                {draft.heroRotatingWords.split(',')[0]?.trim()}
              </span>
            </span>
          )}
        </h4>
        {draft.heroSubhead && (
          <p
            className="text-xs text-white/75 mb-3 line-clamp-2 max-w-sm"
            style={{ color: draft.heroSubheadColor || undefined }}
          >
            {draft.heroSubhead}
          </p>
        )}

        <div className={`flex gap-2 ${draft.heroAlign === 'center' ? 'justify-center' : ''}`}>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
            style={{
              backgroundColor: draft.heroPrimaryButtonBg || '#3b82f6',
              color: draft.heroPrimaryButtonText || '#ffffff',
            }}
          >
            {draft.heroCtaLabel || 'Start a conversation'}
            <ArrowRight className="w-3 h-3" />
          </span>
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium border text-white/90"
            style={{
              borderColor: draft.heroSecondaryButtonBorder || 'rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.05)',
            }}
          >
            {draft.heroSecondaryLabel || 'Learn more'}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────────────────────────── main panel export */

const LandingSettingsPanel = () => {
  const { settings, updateSettings, resetSettings, saving } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
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
      await logAdminActivity({
        action: 'settings.save',
        resource: `template:${draft.heroTemplate}`,
        metadata: {
          heroTemplate: draft.heroTemplate,
          heroAlign: draft.heroAlign,
          heroHeadlineSize: draft.heroHeadlineSize,
        },
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2600);
    } catch (e: any) {
      setSaveError(
        e?.message ||
          'Could not save to Supabase. The change is kept in this browser. Run supabase/migration.sql so the site_settings table accepts admin writes.'
      );
    }
  };

  const directions: { id: SiteSettings['heroBackgroundDirection']; label: string }[] = [
    { id: 'tl', label: '↖' },
    { id: 'tr', label: '↗' },
    { id: 'r', label: '→' },
    { id: 'br', label: '↘' },
    { id: 'bl', label: '↙' },
  ];

  return (
    <div className="grid lg:grid-cols-[1.05fr_1fr] gap-5 items-start">
      {/* ╭───── LEFT — editor ─────╮ */}
      <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6">
        <PanelHeader
          n={1}
          title="Landing hero"
          subtitle="Choose a template and customise your content."
        />

        {/* TEMPLATES */}
        <section className="mb-6">
          <p className={`${SECTION_LABEL} mb-3`}>Templates</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {HERO_TEMPLATES.map((tpl) => (
              <TemplateTile
                key={tpl.id}
                templateId={tpl.id}
                name={tpl.name}
                swatchClass={TEMPLATE_SWATCH[tpl.id]}
                active={draft.heroTemplate === tpl.id}
                onClick={() => setDraft({ ...draft, heroTemplate: tpl.id })}
              />
            ))}
          </div>
        </section>

        {/* CONTENT */}
        <section className="mb-6">
          <p className={`${SECTION_LABEL} mb-3`}>Content</p>
          <div className="space-y-4">
            <label className="block">
              <span className={labelText}>
                Hero image
                {draft.heroTemplate !== 'classic' && (
                  <span className="text-stride-text-muted font-normal text-[11px] ml-1">
                    (Classic template only)
                  </span>
                )}
              </span>
              <div className="mt-1">
                <ImageUpload
                  value={draft.heroImageUrl}
                  onChange={(url) => setDraft({ ...draft, heroImageUrl: url })}
                  folder="hero"
                  compact
                />
              </div>
            </label>

            <TextField
              label="Headline"
              value={draft.heroHeadline}
              onChange={(v) => setDraft({ ...draft, heroHeadline: v })}
              multiline
            />

            <TextField
              label="Rotating words (comma-separated — the scrolling word after the headline; leave empty for a static headline)"
              value={draft.heroRotatingWords}
              onChange={(v) => setDraft({ ...draft, heroRotatingWords: v })}
              placeholder="results, decisions, strategy, performance"
            />

            <TextField
              label="Sub-headline"
              value={draft.heroSubhead}
              onChange={(v) => setDraft({ ...draft, heroSubhead: v })}
              multiline
              rows={3}
            />

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Primary CTA"
                value={draft.heroCtaLabel}
                onChange={(v) => setDraft({ ...draft, heroCtaLabel: v })}
                placeholder="Start a conversation"
              />
              <TextField
                label="Secondary CTA"
                value={draft.heroSecondaryLabel}
                onChange={(v) => setDraft({ ...draft, heroSecondaryLabel: v })}
                placeholder="Learn more"
              />
            </div>
          </div>
        </section>

        {/* STYLE */}
        <section className="mb-6">
          <p className={`${SECTION_LABEL} mb-3`}>Style</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={labelText}>Alignment</span>
                <div className="mt-1 inline-flex rounded-lg border border-stride-border bg-stride-bg p-0.5 w-full">
                  {(['left', 'center'] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setDraft({ ...draft, heroAlign: a })}
                      className={`flex-1 px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                        draft.heroAlign === a
                          ? 'bg-stride-navy text-white shadow-sm'
                          : 'text-stride-text-strong hover:bg-stride-bg-elev'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className={labelText}>Headline size</span>
                <select
                  value={draft.heroHeadlineSize}
                  onChange={(e) =>
                    setDraft({ ...draft, heroHeadlineSize: e.target.value as any })
                  }
                  className={`${inputCls} mt-1`}
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra large</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Headline colour"
                value={draft.heroHeadlineColor}
                onChange={(v) => setDraft({ ...draft, heroHeadlineColor: v })}
                placeholderHex="#ffffff"
              />
              <ColorField
                label="Sub-headline colour"
                value={draft.heroSubheadColor}
                onChange={(v) => setDraft({ ...draft, heroSubheadColor: v })}
                placeholderHex="#d1d5db"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Primary CTA bg"
                value={draft.heroPrimaryButtonBg}
                onChange={(v) => setDraft({ ...draft, heroPrimaryButtonBg: v })}
                placeholderHex="#f6f1e7"
              />
              <ColorField
                label="Primary CTA text"
                value={draft.heroPrimaryButtonText}
                onChange={(v) => setDraft({ ...draft, heroPrimaryButtonText: v })}
                placeholderHex="#0f1c2e"
              />
            </div>

            <label className="block">
              <div className="flex items-center justify-between mb-1.5">
                <span className={labelText}>Background overlay darkness</span>
                <span className="text-xs font-mono text-stride-text-muted">
                  {Math.round(draft.heroOverlayOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(draft.heroOverlayOpacity * 100)}
                onChange={(e) =>
                  setDraft({ ...draft, heroOverlayOpacity: Number(e.target.value) / 100 })
                }
                className="w-full accent-stride-accent"
              />
            </label>

            <div>
              <span className={labelText}>Background direction</span>
              <div className="mt-1.5 grid grid-cols-5 gap-1.5">
                {directions.map((d) => {
                  const active = draft.heroBackgroundDirection === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() =>
                        setDraft({ ...draft, heroBackgroundDirection: d.id })
                      }
                      className={`py-2.5 rounded-lg text-base font-bold transition-all ${
                        active
                          ? 'bg-stride-navy text-white shadow-sm'
                          : 'bg-stride-bg border border-stride-border text-stride-text-strong hover:border-stride-accent/50'
                      }`}
                      aria-label={`Direction ${d.id}`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Save bar */}
        <div className="flex items-center gap-3 pt-4 border-t border-stride-border">
          <button
            onClick={save}
            disabled={saving || !dirty}
            className={`px-5 py-2.5 rounded-full font-medium transition-all inline-flex items-center gap-2 ${
              dirty
                ? 'bg-stride-navy text-white hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default'
            } disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : !dirty ? <Check className="w-4 h-4" /> : null}
            {dirty ? 'Save changes' : 'Saved'}
          </button>
          <button
            onClick={() => {
              resetSettings();
              setDraft(DEFAULT_SETTINGS);
            }}
            className="px-4 py-2 rounded-full text-stride-text-muted hover:text-stride-text-strong hover:bg-stride-bg text-sm transition-colors"
          >
            Reset to default
          </button>
          {savedFlash && (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3 h-3" />
              Saved
            </span>
          )}
        </div>
        {saveError && (
          <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed mt-3">
            {saveError}
          </p>
        )}
        {!isSupabaseConfigured() && (
          <p className="text-xs text-stride-text-muted mt-3">
            Saved to this browser. Configure Supabase to sync changes across visitors.
          </p>
        )}
      </div>

      {/* ╭───── RIGHT — preview + summary + quick edit ─────╮ */}
      <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        {/* Live preview */}
        <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6">
          <PanelHeader
            n={2}
            title="Live preview"
            subtitle="See how your hero will look on the page."
          />
          <PreviewCanvas draft={draft} />
        </div>

        {/* Template applied summary */}
        <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6">
          <h4 className="font-display text-lg text-stride-text-strong tracking-tight">
            Template applied
          </h4>
          <p className="text-xs text-stride-text-muted mt-0.5 mb-3">
            These settings are currently applied to this template.
          </p>
          <div>
            <SummaryRow
              icon={Layers}
              label="Template"
              value={
                HERO_TEMPLATES.find((t) => t.id === draft.heroTemplate)?.name ?? draft.heroTemplate
              }
            />
            <SummaryRow
              icon={Palette}
              label="Headline|Title colour"
              value={(draft.heroHeadlineColor || '#FFFFFF').toUpperCase()}
              swatchColor={draft.heroHeadlineColor || '#FFFFFF'}
            />
            <SummaryRow
              icon={AlignLeft}
              label={draft.heroAlign === 'center' ? 'Centred|Alignment' : 'Left aligned|Alignment'}
              value={draft.heroAlign}
            />
            <SummaryRow
              icon={Palette}
              label="Sub-headline|Subtitle colour"
              value={(draft.heroSubheadColor || '#D1D5DB').toUpperCase()}
              swatchColor={draft.heroSubheadColor || '#D1D5DB'}
            />
            <SummaryRow
              icon={Type}
              label={`${
                {
                  sm: 'Small',
                  md: 'Medium',
                  lg: 'Large',
                  xl: 'Extra large',
                }[draft.heroHeadlineSize]
              }|Headline size`}
              value={draft.heroHeadlineSize}
            />
            <SummaryRow
              icon={Sliders}
              label="Overlay|Overlay darkness"
              value={`${Math.round(draft.heroOverlayOpacity * 100)}%`}
            />
            <SummaryRow
              icon={Compass}
              label={`${
                ({ tl: 'Top-left', tr: 'Top-right', r: 'Right', br: 'Bottom-right', bl: 'Bottom-left' } as Record<string, string>)[
                  draft.heroBackgroundDirection
                ]
              }|Background direction`}
              value={draft.heroBackgroundDirection}
            />
          </div>
        </div>

        {/* Quick edit — duplicate the key text fields for fast iteration */}
        <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6">
          <h4 className="font-display text-lg text-stride-text-strong tracking-tight">
            Quick edit
          </h4>
          <p className="text-xs text-stride-text-muted mt-0.5 mb-3">
            Make quick updates to key elements.
          </p>
          <div className="space-y-3">
            <TextField
              label="Headline"
              value={draft.heroHeadline}
              onChange={(v) => setDraft({ ...draft, heroHeadline: v })}
            />
            <TextField
              label="Sub-headline"
              value={draft.heroSubhead}
              onChange={(v) => setDraft({ ...draft, heroSubhead: v })}
              multiline
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Primary CTA"
                value={draft.heroCtaLabel}
                onChange={(v) => setDraft({ ...draft, heroCtaLabel: v })}
              />
              <TextField
                label="Secondary CTA"
                value={draft.heroSecondaryLabel}
                onChange={(v) => setDraft({ ...draft, heroSecondaryLabel: v })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingSettingsPanel;
