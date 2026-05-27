import { Eye } from 'lucide-react';
import type { SiteContent } from '@/hooks/useSiteContent';

/**
 * Live, styled preview of the page currently being edited in the Content tab.
 * Renders the *draft* (unsaved) content with the real site classes so the
 * admin sees how it will look before saving.
 */

interface ContentPreviewProps {
  page: string;
  draft: SiteContent;
  postIndex: number;
}

const EXTRA_SIZE_PV: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
};
const EXTRA_ALIGN_PV: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const HomePreview = ({ draft }: { draft: SiteContent }) => (
  <div className="space-y-8">
    <div className="bg-stride-bg-elev rounded-xl border border-stride-border p-5">
      <span className="stride-eyebrow mb-2 block">What we hear most</span>
      <h2
        className="font-display text-2xl tracking-tight leading-tight text-stride-text-strong"
        style={
          draft.home.soundFamiliarTitleColor
            ? { color: draft.home.soundFamiliarTitleColor }
            : undefined
        }
      >
        {draft.home.soundFamiliarTitle || 'Section headline'}
      </h2>
      <p
        className="mt-3 text-sm text-stride-text-strong font-medium border-l-2 pl-3"
        style={{
          color: draft.home.soundFamiliarHighlightColor || undefined,
          borderLeftColor:
            draft.home.soundFamiliarAccentColor || 'hsl(var(--stride-accent))',
        }}
      >
        {draft.home.soundFamiliarHighlight || 'Highlight line'}
      </p>

      {(draft.home.extras ?? []).length > 0 && (
        <div className="mt-3 space-y-2">
          {draft.home.extras.map((b) => (
            <p
              key={b.id}
              className={`leading-snug ${EXTRA_SIZE_PV[b.size]} ${EXTRA_ALIGN_PV[b.align]}`}
              style={{ color: b.color || undefined }}
            >
              {b.text}
            </p>
          ))}
        </div>
      )}

      <ul className="mt-4 divide-y divide-stride-border">
        {draft.home.problems.map((p, i) => (
          <li key={i} className="flex gap-2 py-2.5 text-sm text-stride-text-strong">
            <span
              className="font-bold"
              style={{
                color:
                  draft.home.soundFamiliarAccentColor || 'hsl(var(--stride-accent))',
              }}
            >
              →
            </span>
            {p}
          </li>
        ))}
      </ul>
    </div>
    <div className="text-center">
      <h3 className="font-display text-xl text-stride-text-strong mt-2 tracking-tight">
        {draft.home.capabilitiesTitle}
      </h3>
      <p className="text-xs text-stride-text-muted mt-2 leading-relaxed">
        {draft.home.capabilitiesIntro}
      </p>
    </div>
  </div>
);

const AboutPreview = ({ draft }: { draft: SiteContent }) => (
  <div className="space-y-6">
    <div className="bg-stride-navy rounded-xl p-5 text-center">
      <span className="text-[10px] uppercase tracking-[0.22em] text-stride-accent-soft font-semibold">
        {draft.about.eyebrow}
      </span>
      <h2 className="font-display text-2xl text-white mt-2 tracking-tight">{draft.about.title}</h2>
      <p className="text-xs text-white/80 mt-2 leading-relaxed">{draft.about.tagline}</p>
    </div>
    <div>
      <h3 className="font-display text-lg text-stride-text-strong tracking-tight">
        {draft.about.storyTitle}
      </h3>
      <p className="text-xs text-stride-text-muted mt-1">{draft.about.storySub}</p>
      <div className="grid grid-cols-1 gap-2 mt-3">
        {draft.about.storyCards.map((c, i) => (
          <div key={i} className="bg-stride-bg rounded-lg border border-stride-border p-3">
            <span className="text-stride-accent font-mono text-xs">{c.n}</span>
            <p className="font-display text-sm text-stride-text-strong">{c.title}</p>
            <p className="text-[11px] text-stride-text-muted leading-snug mt-1">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {draft.about.credentials.map((c, i) => (
        <div key={i} className="bg-stride-bg rounded-lg border border-stride-border p-3">
          <p className="font-display text-sm text-stride-text-strong leading-snug">{c.title}</p>
          <p className="text-[11px] text-stride-text-muted mt-1 leading-snug">{c.body}</p>
        </div>
      ))}
    </div>
  </div>
);

const TeamPreview = ({ draft }: { draft: SiteContent }) => (
  <div className="space-y-5">
    <div className="bg-stride-navy rounded-xl p-5 text-center">
      <span className="text-[10px] uppercase tracking-[0.22em] text-stride-accent-soft font-semibold">
        {draft.team.eyebrow}
      </span>
      <h2 className="font-display text-2xl text-white mt-2 tracking-tight">{draft.team.title}</h2>
      <p className="text-xs text-white/80 mt-2 leading-relaxed">{draft.team.tagline}</p>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {draft.team.members.map((m, i) => (
        <div key={i} className="bg-stride-bg-elev rounded-lg border border-stride-border overflow-hidden">
          <div
            className="h-24 bg-cover bg-center bg-stride-navy/20"
            style={{ backgroundImage: m.photo ? `url(${m.photo})` : undefined }}
          />
          <div className="p-2.5">
            <p className="font-display text-sm text-stride-text-strong leading-tight">{m.name}</p>
            <p className="text-[10px] text-stride-accent font-medium">{m.role}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ContactPreview = ({ draft }: { draft: SiteContent }) => (
  <div className="bg-stride-navy rounded-xl p-6 text-center">
    <span className="text-[10px] uppercase tracking-[0.22em] text-stride-accent-soft font-semibold">
      {draft.contact.eyebrow}
    </span>
    <h2 className="font-display text-3xl text-white mt-2 tracking-tight">{draft.contact.title}</h2>
    <p className="text-xs text-white/80 mt-3 leading-relaxed">{draft.contact.tagline}</p>
  </div>
);

const TestimonialsPreview = ({ draft }: { draft: SiteContent }) => (
  <div className="space-y-3">
    {draft.testimonials.map((t, i) => (
      <div key={i} className="bg-stride-bg-elev rounded-xl border border-stride-border p-4">
        <p className="font-display text-base text-stride-text-strong leading-snug italic">
          "{t.quote}"
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="w-8 h-8 rounded-full bg-stride-navy text-white flex items-center justify-center font-mono text-[10px]">
            {t.initials}
          </span>
          <div>
            <p className="text-xs font-semibold text-stride-text-strong uppercase tracking-wider">
              {t.name}
            </p>
            <p className="text-[10px] text-stride-text-muted">{t.role}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SolutionsPreview = ({ draft }: { draft: SiteContent }) => (
  <div className="grid grid-cols-1 gap-3">
    {draft.solutions.map((s, i) => (
      <div key={i} className="bg-stride-bg-elev rounded-xl border border-stride-border overflow-hidden">
        <div
          className="h-24 bg-cover bg-center bg-stride-navy relative"
          style={{ backgroundImage: s.image ? `url(${s.image})` : undefined }}
        >
          <div className="absolute inset-0 bg-stride-navy/70 flex flex-col justify-end p-3">
            <span className="text-[9px] font-mono text-stride-accent-soft">
              {s.n} · {s.category}
            </span>
            <p className="font-display text-base text-white">{s.name}</p>
          </div>
        </div>
        <div className="p-3">
          <p className="text-[11px] italic text-stride-text-muted line-clamp-2">{s.problem}</p>
          <p className="text-xs text-stride-text-strong mt-1 line-clamp-2">{s.solution}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {s.chips.map((c, ci) => (
              <span
                key={ci}
                className="px-1.5 py-0.5 bg-stride-accent/15 text-stride-accent rounded-full text-[8px] uppercase tracking-wider font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);

const BlogPreview = ({ draft, postIndex }: { draft: SiteContent; postIndex: number }) => {
  const post = draft.posts[postIndex] || draft.posts[0];
  if (!post) {
    return <p className="text-sm text-stride-text-muted text-center py-8">No posts yet.</p>;
  }
  return (
    <article className="bg-stride-bg-elev rounded-xl border border-stride-border overflow-hidden">
      <div
        className="h-40 bg-cover bg-center bg-stride-navy relative"
        style={{ backgroundImage: post.image ? `url(${post.image})` : undefined }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-stride-navy via-stride-navy/50 to-transparent flex flex-col justify-end p-4">
          <h1 className="font-display text-xl text-white tracking-tight leading-tight">
            {post.title || 'Post title'}
          </h1>
          <p className="text-[10px] text-white/70 mt-1">
            {post.displayDate} · {post.readingMinutes} min read
          </p>
        </div>
      </div>
      <div className="p-4">
        {post.excerpt && (
          <p className="font-display text-base text-stride-text-strong leading-relaxed border-l-2 border-stride-accent pl-3 mb-4">
            {post.excerpt}
          </p>
        )}
        <div className="space-y-3">
          {post.body.map((block, i) => {
            if (block.type === 'h2')
              return (
                <h2
                  key={i}
                  className="font-display text-lg text-stride-text-strong tracking-tight mt-4"
                >
                  {block.text}
                </h2>
              );
            if (block.type === 'h3')
              return (
                <h3
                  key={i}
                  className="font-display text-base text-stride-text-strong tracking-tight mt-3"
                >
                  {block.text}
                </h3>
              );
            if (block.type === 'quote')
              return (
                <blockquote
                  key={i}
                  className="border-l-2 border-stride-accent pl-3 italic font-display text-base text-stride-text-strong"
                >
                  "{block.text}"
                </blockquote>
              );
            return (
              <p key={i} className="text-xs text-stride-text-muted leading-relaxed">
                {block.text}
              </p>
            );
          })}
        </div>
      </div>
    </article>
  );
};

const ContentPreview = ({ page, draft, postIndex }: ContentPreviewProps) => {
  return (
    <div className="rounded-2xl border border-stride-border overflow-hidden bg-stride-bg flex flex-col h-[calc(100vh-12rem)] sticky top-32">
      <div className="px-4 py-2.5 border-b border-stride-border bg-stride-bg-elev flex items-center gap-2 flex-shrink-0">
        <Eye className="w-3.5 h-3.5 text-stride-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-stride-text-muted">
          Live preview
        </span>
      </div>
      <div className="overflow-y-auto flex-grow p-4">
        {page === 'home' && <HomePreview draft={draft} />}
        {page === 'about' && <AboutPreview draft={draft} />}
        {page === 'team' && <TeamPreview draft={draft} />}
        {page === 'contact' && <ContactPreview draft={draft} />}
        {page === 'testimonials' && <TestimonialsPreview draft={draft} />}
        {page === 'solutions' && <SolutionsPreview draft={draft} />}
        {page === 'blog' && <BlogPreview draft={draft} postIndex={postIndex} />}
      </div>
    </div>
  );
};

export default ContentPreview;
