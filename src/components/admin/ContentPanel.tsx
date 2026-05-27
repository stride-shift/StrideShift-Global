import { useEffect, useRef, useState } from 'react';
import {
  Loader2,
  Plus,
  Trash2,
  Home,
  Info,
  Users,
  Mail,
  MessageSquareQuote,
  Box,
  FileText,
  Upload,
  Eye,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  useSiteContent,
  DEFAULT_CONTENT,
  isSupabaseConfigured,
  type SiteContent,
} from '@/hooks/useSiteContent';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import ImageUpload from '@/components/admin/ImageUpload';
import ContentPreview from '@/components/admin/ContentPreview';
import { importBlogFile } from '@/lib/importBlog';

const inputCls =
  'w-full px-3 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-sm';
const labelCls = 'text-xs font-medium text-stride-text-muted uppercase tracking-wider';

/* ---- small field helpers ---- */
const Field = ({
  label,
  value,
  onChange,
  multiline,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) => (
  <label className="block">
    <span className={labelCls}>{label}</span>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`${inputCls} mt-1 resize-none`}
      />
    ) : (
      <input value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} mt-1`} />
    )}
  </label>
);

const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <label className="block">
    <span className={labelCls}>{label}</span>
    <div className="mt-1 flex items-center gap-1.5">
      <input
        type="color"
        value={value || '#1a2a4a'}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-10 rounded border border-stride-border bg-stride-bg-elev cursor-pointer flex-shrink-0"
        title="Pick colour"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="(default)"
        className="flex-1 min-w-0 px-2 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-xs font-mono"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="text-[10px] text-stride-text-muted hover:text-stride-text-strong px-1.5 py-1"
          aria-label="Clear colour"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  </label>
);

const Card = ({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove?: () => void;
  children: React.ReactNode;
}) => (
  <div className="border border-stride-border rounded-xl p-4 space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-stride-text-muted">{title}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1.5 rounded-md text-stride-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
    {children}
  </div>
);

const AddButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 text-sm text-stride-accent font-medium hover:underline"
  >
    <Plus className="w-4 h-4" />
    {label}
  </button>
);

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-stride-bg-elev border border-stride-border rounded-2xl p-6">
    <h3 className="font-display text-xl text-stride-text-strong tracking-tight mb-4">{title}</h3>
    {children}
  </div>
);

const PAGES = [
  { id: 'home', label: 'Homepage', icon: <Home className="w-4 h-4" /> },
  { id: 'about', label: 'About page', icon: <Info className="w-4 h-4" /> },
  { id: 'team', label: 'Team page', icon: <Users className="w-4 h-4" /> },
  { id: 'contact', label: 'Contact page', icon: <Mail className="w-4 h-4" /> },
  { id: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote className="w-4 h-4" /> },
  { id: 'solutions', label: 'Solutions', icon: <Box className="w-4 h-4" /> },
  { id: 'blog', label: 'Blog / Ideas', icon: <FileText className="w-4 h-4" /> },
] as const;

const BLOCK_TYPES: { value: 'h2' | 'h3' | 'p' | 'quote'; label: string }[] = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h2', label: 'Heading' },
  { value: 'h3', label: 'Subheading' },
  { value: 'quote', label: 'Quote' },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';

const formatDisplayDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

type PageId = (typeof PAGES)[number]['id'];

const ContentPanel = () => {
  const { content, updateContent, resetContent, saving } = useSiteContent();
  const { resetSettings } = useSiteSettings();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [page, setPage] = useState<PageId>('home');
  const [savedFlash, setSavedFlash] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewPostIndex, setPreviewPostIndex] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(content);

  const save = async () => {
    setSaveError(null);
    try {
      await updateContent(draft);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2600);
    } catch (e: any) {
      setSaveError(
        e?.message ||
          'Could not save to Supabase — kept in this browser. Run supabase/migration.sql so the site_content table accepts admin writes.'
      );
    }
  };

  /* ---- import a blog file (.txt / .md / .docx / .pdf) ---- */
  const handleImportFile = async (file: File) => {
    setImporting(true);
    setImportError(null);
    try {
      const parsed = await importBlogFile(file);
      const today = new Date().toISOString().slice(0, 10);
      const newPost = {
        slug: `${slugify(parsed.title)}-${Date.now().toString(36).slice(-4)}`,
        title: parsed.title,
        excerpt: parsed.excerpt,
        date: today,
        displayDate: formatDisplayDate(today),
        readingMinutes: parsed.readingMinutes,
        image: '',
        body: parsed.body,
      };
      setDraft((d) => ({ ...d, posts: [newPost, ...d.posts] }));
      setPreviewPostIndex(0);
    } catch (e: any) {
      setImportError(e?.message || 'Could not import that file.');
    } finally {
      setImporting(false);
    }
  };

  /* ---- typed section updaters ---- */
  const setHome = (patch: Partial<SiteContent['home']>) =>
    setDraft({ ...draft, home: { ...draft.home, ...patch } });
  const setAbout = (patch: Partial<SiteContent['about']>) =>
    setDraft({ ...draft, about: { ...draft.about, ...patch } });
  const setTeam = (patch: Partial<SiteContent['team']>) =>
    setDraft({ ...draft, team: { ...draft.team, ...patch } });
  const setContact = (patch: Partial<SiteContent['contact']>) =>
    setDraft({ ...draft, contact: { ...draft.contact, ...patch } });

  return (
    <div>
      {/* Save bar */}
      <div className="sticky top-16 z-20 flex items-center gap-3 bg-stride-bg/95 backdrop-blur py-3 mb-5">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-stride-navy text-white font-medium hover:bg-stride-navy-dark transition-colors disabled:opacity-60 inline-flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {dirty ? 'Save all changes' : 'Saved'}
        </button>
        <button
          onClick={async () => {
            if (
              !window.confirm(
                'Reset everything? This clears your custom content AND hero style (colour, size, alignment) back to the defaults.'
              )
            ) {
              return;
            }
            await Promise.all([resetContent(), resetSettings()]);
            setDraft(DEFAULT_CONTENT);
          }}
          className="px-4 py-2.5 rounded-lg text-stride-text-muted hover:bg-stride-bg-elev text-sm transition-colors"
        >
          Reset to default
        </button>
        {dirty && !savedFlash && (
          <span className="text-sm text-amber-600 dark:text-amber-400">Unsaved changes</span>
        )}
        {savedFlash && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Saved ✓</span>
        )}
      </div>
      {saveError && (
        <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed mb-4">{saveError}</p>
      )}
      {!isSupabaseConfigured() && (
        <p className="text-xs text-stride-text-muted mb-4">
          Saved to this browser. Configure Supabase (with the{' '}
          <code className="font-mono">site_content</code> table) to make edits global.
        </p>
      )}

      <div className="grid lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[180px_minmax(0,1fr)_400px] gap-6">
        {/* Page selector */}
        <aside className="lg:sticky lg:top-32 self-start">
          <p className="text-xs uppercase tracking-wider text-stride-text-muted font-semibold mb-2 px-1">
            Select a page
          </p>
          <nav className="flex lg:flex-col gap-1 flex-wrap">
            {PAGES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPage(p.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  page === p.id
                    ? 'bg-stride-navy text-white'
                    : 'text-stride-text-strong hover:bg-stride-bg-elev'
                }`}
              >
                {p.icon}
                {p.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Editor */}
        <div className="space-y-5 min-w-0">
          {/* ===== HOME ===== */}
          {page === 'home' && (
            <>
              <p className="text-xs text-stride-text-muted -mt-1">
                Everything edited here renders on the live homepage. Reorder pain points with the
                arrows, recolour highlights, and add custom text blocks below.
              </p>

              <SectionCard title='"Sound familiar?" section'>
                <div className="space-y-4">
                  <Field
                    label="Section headline"
                    value={draft.home.soundFamiliarTitle}
                    onChange={(v) => setHome({ soundFamiliarTitle: v })}
                    multiline
                  />
                  <Field
                    label="Highlight line"
                    value={draft.home.soundFamiliarHighlight}
                    onChange={(v) => setHome({ soundFamiliarHighlight: v })}
                    multiline
                  />

                  {/* Colour controls — render on the homepage */}
                  <div className="grid grid-cols-3 gap-3">
                    <ColorField
                      label="Headline colour"
                      value={draft.home.soundFamiliarTitleColor}
                      onChange={(v) => setHome({ soundFamiliarTitleColor: v })}
                    />
                    <ColorField
                      label="Highlight colour"
                      value={draft.home.soundFamiliarHighlightColor}
                      onChange={(v) => setHome({ soundFamiliarHighlightColor: v })}
                    />
                    <ColorField
                      label="Arrow / accent"
                      value={draft.home.soundFamiliarAccentColor}
                      onChange={(v) => setHome({ soundFamiliarAccentColor: v })}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className={labelCls}>Pain points ({draft.home.problems.length})</span>
                      <span className="text-[10px] text-stride-text-muted">
                        Use arrows to reorder
                      </span>
                    </div>
                    <div className="space-y-2 mt-1">
                      {draft.home.problems.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <button
                              onClick={() => {
                                if (i === 0) return;
                                const next = [...draft.home.problems];
                                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                                setHome({ problems: next });
                              }}
                              disabled={i === 0}
                              className="p-1 rounded-sm text-stride-text-muted hover:text-stride-accent disabled:opacity-30 disabled:hover:text-stride-text-muted"
                              aria-label="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (i === draft.home.problems.length - 1) return;
                                const next = [...draft.home.problems];
                                [next[i + 1], next[i]] = [next[i], next[i + 1]];
                                setHome({ problems: next });
                              }}
                              disabled={i === draft.home.problems.length - 1}
                              className="p-1 rounded-sm text-stride-text-muted hover:text-stride-accent disabled:opacity-30 disabled:hover:text-stride-text-muted"
                              aria-label="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            value={p}
                            onChange={(e) => {
                              const next = [...draft.home.problems];
                              next[i] = e.target.value;
                              setHome({ problems: next });
                            }}
                            className={inputCls}
                          />
                          <button
                            onClick={() =>
                              setHome({ problems: draft.home.problems.filter((_, x) => x !== i) })
                            }
                            className="p-2 rounded-md text-stride-text-muted hover:text-red-500"
                            aria-label="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <AddButton
                        label="Add pain point"
                        onClick={() =>
                          setHome({ problems: [...draft.home.problems, 'New pain point'] })
                        }
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Capabilities section header">
                <div className="space-y-4">
                  <Field
                    label="Eyebrow"
                    value={draft.home.capabilitiesEyebrow}
                    onChange={(v) => setHome({ capabilitiesEyebrow: v })}
                  />
                  <Field
                    label="Title"
                    value={draft.home.capabilitiesTitle}
                    onChange={(v) => setHome({ capabilitiesTitle: v })}
                  />
                  <Field
                    label="Intro"
                    value={draft.home.capabilitiesIntro}
                    onChange={(v) => setHome({ capabilitiesIntro: v })}
                    multiline
                    rows={3}
                  />
                </div>
              </SectionCard>

              {/* ===== EXTRAS — custom text blocks the user adds to the homepage ===== */}
              <SectionCard title={`Custom text blocks (${draft.home.extras.length})`}>
                <p className="text-xs text-stride-text-muted mb-3">
                  Add your own paragraphs to the homepage. Each block can have its own colour,
                  size and alignment, and you can reorder them.
                </p>
                <div className="space-y-3">
                  {draft.home.extras.map((b, i) => (
                    <Card
                      key={b.id}
                      title={`Block ${i + 1}`}
                      onRemove={() =>
                        setHome({ extras: draft.home.extras.filter((_, x) => x !== i) })
                      }
                    >
                      <div className="flex gap-2 items-start">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => {
                              if (i === 0) return;
                              const next = [...draft.home.extras];
                              [next[i - 1], next[i]] = [next[i], next[i - 1]];
                              setHome({ extras: next });
                            }}
                            disabled={i === 0}
                            className="p-1 rounded-sm text-stride-text-muted hover:text-stride-accent disabled:opacity-30"
                            aria-label="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (i === draft.home.extras.length - 1) return;
                              const next = [...draft.home.extras];
                              [next[i + 1], next[i]] = [next[i], next[i + 1]];
                              setHome({ extras: next });
                            }}
                            disabled={i === draft.home.extras.length - 1}
                            className="p-1 rounded-sm text-stride-text-muted hover:text-stride-accent disabled:opacity-30"
                            aria-label="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          value={b.text}
                          onChange={(e) => {
                            const next = [...draft.home.extras];
                            next[i] = { ...b, text: e.target.value };
                            setHome({ extras: next });
                          }}
                          rows={2}
                          placeholder="Your text…"
                          className={`${inputCls} resize-none`}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={b.size}
                          onChange={(e) => {
                            const next = [...draft.home.extras];
                            next[i] = { ...b, size: e.target.value as any };
                            setHome({ extras: next });
                          }}
                          className={inputCls}
                        >
                          <option value="sm">Small</option>
                          <option value="md">Medium</option>
                          <option value="lg">Large</option>
                        </select>
                        <select
                          value={b.align}
                          onChange={(e) => {
                            const next = [...draft.home.extras];
                            next[i] = { ...b, align: e.target.value as any };
                            setHome({ extras: next });
                          }}
                          className={inputCls}
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                        <div className="flex gap-1 items-center">
                          <input
                            type="color"
                            value={b.color || '#1a2a4a'}
                            onChange={(e) => {
                              const next = [...draft.home.extras];
                              next[i] = { ...b, color: e.target.value };
                              setHome({ extras: next });
                            }}
                            className="h-9 w-12 rounded border border-stride-border bg-stride-bg-elev cursor-pointer"
                          />
                          <input
                            value={b.color}
                            onChange={(e) => {
                              const next = [...draft.home.extras];
                              next[i] = { ...b, color: e.target.value };
                              setHome({ extras: next });
                            }}
                            className="flex-1 px-2 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong text-xs font-mono focus:outline-none focus:ring-2 focus:ring-stride-accent"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  <AddButton
                    label="Add text block"
                    onClick={() =>
                      setHome({
                        extras: [
                          ...draft.home.extras,
                          {
                            id: `extra-${Date.now().toString(36)}`,
                            text: 'New text block on the homepage.',
                            color: '#1a2a4a',
                            size: 'md',
                            align: 'left',
                          },
                        ],
                      })
                    }
                  />
                </div>
              </SectionCard>
            </>
          )}

          {/* ===== ABOUT ===== */}
          {page === 'about' && (
            <>
              <SectionCard title="About — header">
                <div className="space-y-4">
                  <Field label="Eyebrow" value={draft.about.eyebrow} onChange={(v) => setAbout({ eyebrow: v })} />
                  <Field label="Title" value={draft.about.title} onChange={(v) => setAbout({ title: v })} />
                  <Field label="Tagline" value={draft.about.tagline} onChange={(v) => setAbout({ tagline: v })} multiline />
                  <Field label="Story title" value={draft.about.storyTitle} onChange={(v) => setAbout({ storyTitle: v })} />
                  <Field label="Story intro" value={draft.about.storySub} onChange={(v) => setAbout({ storySub: v })} multiline rows={3} />
                </div>
              </SectionCard>

              <SectionCard title={`Story cards (${draft.about.storyCards.length})`}>
                <div className="space-y-3">
                  {draft.about.storyCards.map((c, i) => (
                    <Card
                      key={i}
                      title={`Card ${i + 1}`}
                      onRemove={() =>
                        setAbout({ storyCards: draft.about.storyCards.filter((_, x) => x !== i) })
                      }
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={c.n}
                          onChange={(e) => {
                            const next = [...draft.about.storyCards];
                            next[i] = { ...c, n: e.target.value };
                            setAbout({ storyCards: next });
                          }}
                          placeholder="No."
                          className={inputCls}
                        />
                        <input
                          value={c.label}
                          onChange={(e) => {
                            const next = [...draft.about.storyCards];
                            next[i] = { ...c, label: e.target.value };
                            setAbout({ storyCards: next });
                          }}
                          placeholder="Label"
                          className={inputCls}
                        />
                      </div>
                      <input
                        value={c.title}
                        onChange={(e) => {
                          const next = [...draft.about.storyCards];
                          next[i] = { ...c, title: e.target.value };
                          setAbout({ storyCards: next });
                        }}
                        placeholder="Title"
                        className={inputCls}
                      />
                      <textarea
                        value={c.body}
                        onChange={(e) => {
                          const next = [...draft.about.storyCards];
                          next[i] = { ...c, body: e.target.value };
                          setAbout({ storyCards: next });
                        }}
                        rows={3}
                        placeholder="Body"
                        className={`${inputCls} resize-none`}
                      />
                    </Card>
                  ))}
                  <AddButton
                    label="Add story card"
                    onClick={() =>
                      setAbout({
                        storyCards: [
                          ...draft.about.storyCards,
                          { n: '0', label: 'Label', title: 'Title', body: 'Body' },
                        ],
                      })
                    }
                  />
                </div>
              </SectionCard>

              <SectionCard title="Comparison">
                <Field
                  label="Comparison title"
                  value={draft.about.comparisonTitle}
                  onChange={(v) => setAbout({ comparisonTitle: v })}
                />
                <div className="space-y-3 mt-3">
                  {draft.about.comparison.map((row, i) => (
                    <Card
                      key={i}
                      title={`Row ${i + 1}`}
                      onRemove={() =>
                        setAbout({ comparison: draft.about.comparison.filter((_, x) => x !== i) })
                      }
                    >
                      <input
                        value={row.traditional}
                        onChange={(e) => {
                          const next = [...draft.about.comparison];
                          next[i] = { ...row, traditional: e.target.value };
                          setAbout({ comparison: next });
                        }}
                        placeholder="Traditional consulting"
                        className={inputCls}
                      />
                      <input
                        value={row.strideshift}
                        onChange={(e) => {
                          const next = [...draft.about.comparison];
                          next[i] = { ...row, strideshift: e.target.value };
                          setAbout({ comparison: next });
                        }}
                        placeholder="StrideShift"
                        className={inputCls}
                      />
                    </Card>
                  ))}
                  <AddButton
                    label="Add comparison row"
                    onClick={() =>
                      setAbout({
                        comparison: [
                          ...draft.about.comparison,
                          { traditional: 'Old way', strideshift: 'StrideShift way' },
                        ],
                      })
                    }
                  />
                </div>
              </SectionCard>

              <SectionCard title="Credentials">
                <Field
                  label="Credentials title"
                  value={draft.about.credentialsTitle}
                  onChange={(v) => setAbout({ credentialsTitle: v })}
                />
                <div className="space-y-3 mt-3">
                  {draft.about.credentials.map((c, i) => (
                    <Card
                      key={i}
                      title={`Credential ${i + 1}`}
                      onRemove={() =>
                        setAbout({ credentials: draft.about.credentials.filter((_, x) => x !== i) })
                      }
                    >
                      <input
                        value={c.title}
                        onChange={(e) => {
                          const next = [...draft.about.credentials];
                          next[i] = { ...c, title: e.target.value };
                          setAbout({ credentials: next });
                        }}
                        placeholder="Title"
                        className={inputCls}
                      />
                      <textarea
                        value={c.body}
                        onChange={(e) => {
                          const next = [...draft.about.credentials];
                          next[i] = { ...c, body: e.target.value };
                          setAbout({ credentials: next });
                        }}
                        rows={2}
                        placeholder="Body"
                        className={`${inputCls} resize-none`}
                      />
                    </Card>
                  ))}
                  <AddButton
                    label="Add credential"
                    onClick={() =>
                      setAbout({
                        credentials: [
                          ...draft.about.credentials,
                          { n: '0', title: 'Title', body: 'Body' },
                        ],
                      })
                    }
                  />
                </div>
              </SectionCard>

              <SectionCard title="About — closing CTA">
                <div className="space-y-4">
                  <Field label="CTA title" value={draft.about.ctaTitle} onChange={(v) => setAbout({ ctaTitle: v })} />
                  <Field label="CTA subtext" value={draft.about.ctaSub} onChange={(v) => setAbout({ ctaSub: v })} multiline />
                </div>
              </SectionCard>
            </>
          )}

          {/* ===== TEAM ===== */}
          {page === 'team' && (
            <>
              <SectionCard title="Team — header">
                <div className="space-y-4">
                  <Field label="Eyebrow" value={draft.team.eyebrow} onChange={(v) => setTeam({ eyebrow: v })} />
                  <Field label="Title" value={draft.team.title} onChange={(v) => setTeam({ title: v })} />
                  <Field label="Tagline" value={draft.team.tagline} onChange={(v) => setTeam({ tagline: v })} multiline />
                  <Field label="Mission line" value={draft.team.mission} onChange={(v) => setTeam({ mission: v })} multiline />
                  <Field label="CTA title" value={draft.team.ctaTitle} onChange={(v) => setTeam({ ctaTitle: v })} />
                  <Field label="CTA subtext" value={draft.team.ctaSub} onChange={(v) => setTeam({ ctaSub: v })} multiline />
                </div>
              </SectionCard>

              <SectionCard title={`Team members (${draft.team.members.length})`}>
                <div className="space-y-4">
                  {draft.team.members.map((m, i) => (
                    <Card
                      key={i}
                      title={`Member ${i + 1}`}
                      onRemove={() =>
                        setTeam({ members: draft.team.members.filter((_, x) => x !== i) })
                      }
                    >
                      <ImageUpload
                        value={m.photo}
                        onChange={(url) => {
                          const next = [...draft.team.members];
                          next[i] = { ...m, photo: url };
                          setTeam({ members: next });
                        }}
                        folder="team"
                        compact
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          value={m.name}
                          onChange={(e) => {
                            const next = [...draft.team.members];
                            next[i] = { ...m, name: e.target.value };
                            setTeam({ members: next });
                          }}
                          placeholder="Full name"
                          className={inputCls}
                        />
                        <input
                          value={m.role}
                          onChange={(e) => {
                            const next = [...draft.team.members];
                            next[i] = { ...m, role: e.target.value };
                            setTeam({ members: next });
                          }}
                          placeholder="Role"
                          className={inputCls}
                        />
                        <input
                          value={m.initials}
                          onChange={(e) => {
                            const next = [...draft.team.members];
                            next[i] = { ...m, initials: e.target.value };
                            setTeam({ members: next });
                          }}
                          placeholder="Initials"
                          className={inputCls}
                        />
                      </div>
                      <textarea
                        value={m.bio}
                        onChange={(e) => {
                          const next = [...draft.team.members];
                          next[i] = { ...m, bio: e.target.value };
                          setTeam({ members: next });
                        }}
                        rows={2}
                        placeholder="Short bio"
                        className={`${inputCls} resize-none`}
                      />
                    </Card>
                  ))}
                  <AddButton
                    label="Add team member"
                    onClick={() =>
                      setTeam({
                        members: [
                          ...draft.team.members,
                          { initials: '', name: '', role: '', bio: '', photo: '' },
                        ],
                      })
                    }
                  />
                </div>
              </SectionCard>
            </>
          )}

          {/* ===== CONTACT ===== */}
          {page === 'contact' && (
            <SectionCard title="Contact page">
              <div className="space-y-4">
                <Field label="Eyebrow" value={draft.contact.eyebrow} onChange={(v) => setContact({ eyebrow: v })} />
                <Field label="Title" value={draft.contact.title} onChange={(v) => setContact({ title: v })} />
                <Field label="Tagline" value={draft.contact.tagline} onChange={(v) => setContact({ tagline: v })} multiline rows={4} />
              </div>
            </SectionCard>
          )}

          {/* ===== TESTIMONIALS ===== */}
          {page === 'testimonials' && (
            <SectionCard title={`Testimonials (${draft.testimonials.length})`}>
              <div className="space-y-4">
                {draft.testimonials.map((t, i) => (
                  <Card
                    key={i}
                    title={`Testimonial ${i + 1}`}
                    onRemove={() =>
                      setDraft({
                        ...draft,
                        testimonials: draft.testimonials.filter((_, x) => x !== i),
                      })
                    }
                  >
                    <textarea
                      value={t.quote}
                      onChange={(e) => {
                        const next = [...draft.testimonials];
                        next[i] = { ...t, quote: e.target.value };
                        setDraft({ ...draft, testimonials: next });
                      }}
                      rows={3}
                      placeholder="Quote"
                      className={`${inputCls} resize-none`}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        value={t.name}
                        onChange={(e) => {
                          const next = [...draft.testimonials];
                          next[i] = { ...t, name: e.target.value };
                          setDraft({ ...draft, testimonials: next });
                        }}
                        placeholder="Role title"
                        className={inputCls}
                      />
                      <input
                        value={t.role}
                        onChange={(e) => {
                          const next = [...draft.testimonials];
                          next[i] = { ...t, role: e.target.value };
                          setDraft({ ...draft, testimonials: next });
                        }}
                        placeholder="Company / sector"
                        className={inputCls}
                      />
                      <input
                        value={t.initials}
                        onChange={(e) => {
                          const next = [...draft.testimonials];
                          next[i] = { ...t, initials: e.target.value };
                          setDraft({ ...draft, testimonials: next });
                        }}
                        placeholder="Badge"
                        className={inputCls}
                      />
                    </div>
                  </Card>
                ))}
                <AddButton
                  label="Add testimonial"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      testimonials: [
                        ...draft.testimonials,
                        {
                          quote: '',
                          name: '',
                          role: '',
                          initials: String(draft.testimonials.length + 1).padStart(2, '0'),
                        },
                      ],
                    })
                  }
                />
              </div>
            </SectionCard>
          )}

          {/* ===== SOLUTIONS ===== */}
          {page === 'solutions' && (
            <SectionCard title={`Solution cards (${draft.solutions.length})`}>
              <p className="text-xs text-stride-text-muted mb-4">
                Edits here update the homepage carousel and the Solutions grid. The full detail
                page for each solution lives in code.
              </p>
              <div className="space-y-4">
                {draft.solutions.map((s, i) => (
                  <Card key={s.slug} title={`${s.n} · ${s.name}`}>
                    <ImageUpload
                      value={s.image}
                      onChange={(url) => {
                        const next = [...draft.solutions];
                        next[i] = { ...s, image: url };
                        setDraft({ ...draft, solutions: next });
                      }}
                      folder="solutions"
                      compact
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={s.name}
                        onChange={(e) => {
                          const next = [...draft.solutions];
                          next[i] = { ...s, name: e.target.value };
                          setDraft({ ...draft, solutions: next });
                        }}
                        placeholder="Name"
                        className={inputCls}
                      />
                      <input
                        value={s.category}
                        onChange={(e) => {
                          const next = [...draft.solutions];
                          next[i] = { ...s, category: e.target.value };
                          setDraft({ ...draft, solutions: next });
                        }}
                        placeholder="Category"
                        className={inputCls}
                      />
                    </div>
                    <textarea
                      value={s.problem}
                      onChange={(e) => {
                        const next = [...draft.solutions];
                        next[i] = { ...s, problem: e.target.value };
                        setDraft({ ...draft, solutions: next });
                      }}
                      rows={2}
                      placeholder="Problem (the quote)"
                      className={`${inputCls} resize-none`}
                    />
                    <textarea
                      value={s.solution}
                      onChange={(e) => {
                        const next = [...draft.solutions];
                        next[i] = { ...s, solution: e.target.value };
                        setDraft({ ...draft, solutions: next });
                      }}
                      rows={2}
                      placeholder="Solution"
                      className={`${inputCls} resize-none`}
                    />
                    <input
                      value={s.chips.join(', ')}
                      onChange={(e) => {
                        const next = [...draft.solutions];
                        next[i] = {
                          ...s,
                          chips: e.target.value.split(',').map((c) => c.trim()).filter(Boolean),
                        };
                        setDraft({ ...draft, solutions: next });
                      }}
                      placeholder="Chips (comma-separated)"
                      className={inputCls}
                    />
                  </Card>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ===== BLOG / IDEAS ===== */}
          {page === 'blog' && (
            <SectionCard title={`Blog posts (${draft.posts.length})`}>
              <p className="text-xs text-stride-text-muted mb-3">
                Posts shown on the Ideas page and the homepage preview. Each post has a title,
                cover image, and a body built from blocks (paragraphs, headings, quotes).
              </p>

              {/* Import a whole document */}
              <div className="rounded-xl border border-dashed border-stride-accent/40 bg-stride-accent/5 p-4 mb-5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.markdown,.docx,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImportFile(f);
                    e.target.value = '';
                  }}
                />
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-stride-accent/15 text-stride-accent flex items-center justify-center flex-shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-semibold text-stride-text-strong">
                      Import a whole blog from a file
                    </p>
                    <p className="text-xs text-stride-text-muted mt-0.5">
                      Upload a <strong>.txt, .md, .docx or .pdf</strong> — it's split into
                      blocks automatically, reading time is estimated, and a new post is created.
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={importing}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-stride-navy text-white text-sm font-medium hover:bg-stride-navy-dark transition-colors disabled:opacity-60"
                    >
                      {importing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {importing ? 'Importing…' : 'Choose a file'}
                    </button>
                    {importError && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        {importError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {draft.posts.map((post, i) => {
                  const setPost = (patch: Partial<typeof post>) => {
                    const next = [...draft.posts];
                    next[i] = { ...post, ...patch };
                    setDraft({ ...draft, posts: next });
                  };
                  return (
                    <Card
                      key={i}
                      title={`Post ${i + 1}`}
                      onRemove={() =>
                        setDraft({ ...draft, posts: draft.posts.filter((_, x) => x !== i) })
                      }
                    >
                      <button
                        onClick={() => setPreviewPostIndex(i)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                          previewPostIndex === i
                            ? 'bg-stride-accent/15 text-stride-accent'
                            : 'text-stride-text-muted hover:bg-stride-bg'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {previewPostIndex === i ? 'Showing in preview' : 'Show in preview'}
                      </button>
                      <ImageUpload
                        value={post.image}
                        onChange={(url) => setPost({ image: url })}
                        folder="blog"
                        compact
                      />
                      <input
                        value={post.title}
                        onChange={(e) => setPost({ title: e.target.value })}
                        placeholder="Post title"
                        className={inputCls}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className="block">
                          <span className="text-[10px] text-stride-text-muted">URL slug</span>
                          <input
                            value={post.slug}
                            onChange={(e) => setPost({ slug: slugify(e.target.value) })}
                            placeholder="url-slug"
                            className={inputCls}
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] text-stride-text-muted">Reading minutes</span>
                          <input
                            type="number"
                            min={1}
                            value={post.readingMinutes}
                            onChange={(e) =>
                              setPost({ readingMinutes: Number(e.target.value) || 1 })
                            }
                            className={inputCls}
                          />
                        </label>
                      </div>
                      <label className="block">
                        <span className="text-[10px] text-stride-text-muted">Date</span>
                        <input
                          type="date"
                          value={post.date}
                          onChange={(e) =>
                            setPost({
                              date: e.target.value,
                              displayDate: formatDisplayDate(e.target.value),
                            })
                          }
                          className={inputCls}
                        />
                      </label>
                      <textarea
                        value={post.excerpt}
                        onChange={(e) => setPost({ excerpt: e.target.value })}
                        rows={2}
                        placeholder="Excerpt (the summary shown on cards)"
                        className={`${inputCls} resize-none`}
                      />

                      {/* Body blocks */}
                      <div className="border-t border-stride-border pt-3 mt-1">
                        <span className={labelCls}>Body ({post.body.length} blocks)</span>
                        <div className="space-y-2 mt-2">
                          {post.body.map((block, bi) => (
                            <div
                              key={bi}
                              className="flex gap-2 items-start bg-stride-bg rounded-lg p-2"
                            >
                              <select
                                value={block.type}
                                onChange={(e) => {
                                  const body = [...post.body];
                                  body[bi] = { ...block, type: e.target.value as any };
                                  setPost({ body });
                                }}
                                className="px-2 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong text-xs focus:outline-none focus:ring-2 focus:ring-stride-accent flex-shrink-0 w-28"
                              >
                                {BLOCK_TYPES.map((t) => (
                                  <option key={t.value} value={t.value}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                              <textarea
                                value={block.text}
                                onChange={(e) => {
                                  const body = [...post.body];
                                  body[bi] = { ...block, text: e.target.value };
                                  setPost({ body });
                                }}
                                rows={block.type === 'p' || block.type === 'quote' ? 3 : 1}
                                placeholder="Block text"
                                className={`${inputCls} resize-none`}
                              />
                              <button
                                onClick={() =>
                                  setPost({ body: post.body.filter((_, x) => x !== bi) })
                                }
                                className="p-2 rounded-md text-stride-text-muted hover:text-red-500 flex-shrink-0"
                                aria-label="Remove block"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <AddButton
                            label="Add body block"
                            onClick={() =>
                              setPost({ body: [...post.body, { type: 'p', text: '' }] })
                            }
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
                <AddButton
                  label="Add blog post"
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    setDraft({
                      ...draft,
                      posts: [
                        {
                          slug: `new-post-${Date.now().toString(36)}`,
                          title: 'New post',
                          excerpt: '',
                          date: today,
                          displayDate: formatDisplayDate(today),
                          readingMinutes: 3,
                          image: '',
                          body: [{ type: 'p', text: '' }],
                        },
                        ...draft.posts,
                      ],
                    });
                  }}
                />
              </div>
            </SectionCard>
          )}
        </div>

        {/* Live preview pane */}
        <div className="hidden xl:block">
          <ContentPreview page={page} draft={draft} postIndex={previewPostIndex} />
        </div>
      </div>
    </div>
  );
};

export default ContentPanel;
