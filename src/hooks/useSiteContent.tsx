import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  hero,
  capabilities,
  testimonials as defaultTestimonials,
  teamPage,
  aboutPage,
  contactPage,
  showcase,
  posts as defaultPosts,
} from '@/data/stride';

/**
 * Editable site content — every page's copy, images and lists. Persisted to the
 * Supabase `site_content` table (single row) plus localStorage, defaulting to
 * the static values in data/stride.ts. Admins edit it page-by-page in the
 * dashboard Content tab.
 */

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export interface TeamMember {
  initials: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
}

export interface StoryCard {
  n: string;
  label: string;
  title: string;
  body: string;
}

export interface Credential {
  n: string;
  title: string;
  body: string;
}

export interface ComparisonRow {
  traditional: string;
  strideshift: string;
}

export interface SolutionCard {
  slug: string;
  n: string;
  category: string;
  name: string;
  problem: string;
  solution: string;
  image: string;
  chips: string[];
  /** Per-product gallery — image URLs shown in the Gallery overlay. */
  gallery?: string[];
}

export interface BlogBlock {
  type: 'h2' | 'h3' | 'p' | 'quote';
  text: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO yyyy-mm-dd, used for sorting
  displayDate: string;
  readingMinutes: number;
  image: string;
  body: BlogBlock[];
}

export interface HomeExtraBlock {
  id: string;
  text: string;
  color: string;
  size: 'sm' | 'md' | 'lg';
  align: 'left' | 'center' | 'right';
}

/** Visual overrides for a section — empty string means "use the site default". */
export interface SectionStyle {
  titleColor: string;
  eyebrowColor: string;
  accentColor: string;
}

export const EMPTY_SECTION_STYLE: SectionStyle = {
  titleColor: '',
  eyebrowColor: '',
  accentColor: '',
};

export interface SiteContent {
  home: {
    soundFamiliarTitle: string;
    soundFamiliarHighlight: string;
    problems: string[];
    capabilitiesEyebrow: string;
    capabilitiesTitle: string;
    capabilitiesIntro: string;
    soundFamiliarTitleColor: string;
    soundFamiliarHighlightColor: string;
    soundFamiliarAccentColor: string;
    extras: HomeExtraBlock[];
  };
  about: {
    eyebrow: string;
    title: string;
    tagline: string;
    storyTitle: string;
    storySub: string;
    storyCards: StoryCard[];
    comparisonTitle: string;
    comparison: ComparisonRow[];
    credentialsTitle: string;
    credentials: Credential[];
    ctaTitle: string;
    ctaSub: string;
    style: SectionStyle;
    extras: HomeExtraBlock[];
  };
  team: {
    eyebrow: string;
    title: string;
    tagline: string;
    mission: string;
    ctaTitle: string;
    ctaSub: string;
    members: TeamMember[];
    style: SectionStyle;
    extras: HomeExtraBlock[];
  };
  contact: {
    eyebrow: string;
    title: string;
    tagline: string;
    style: SectionStyle;
    extras: HomeExtraBlock[];
  };
  testimonials: Testimonial[];
  solutions: SolutionCard[];
  /** Per-solution galleries keyed by slug — shown in the Gallery overlay on
   *  product detail pages. Edited in the admin Content tab. */
  solutionGalleries: Record<string, string[]>;
  posts: BlogPost[];
}

export const DEFAULT_CONTENT: SiteContent = {
  home: {
    soundFamiliarTitle: hero.title,
    soundFamiliarHighlight: hero.highlight,
    problems: [...hero.problems],
    capabilitiesEyebrow: capabilities.eyebrow,
    capabilitiesTitle: capabilities.title,
    capabilitiesIntro: capabilities.intro,
    soundFamiliarTitleColor: '',
    soundFamiliarHighlightColor: '',
    soundFamiliarAccentColor: '',
    extras: [],
  },
  about: {
    eyebrow: aboutPage.eyebrow,
    title: aboutPage.title,
    tagline: aboutPage.tagline,
    storyTitle: aboutPage.storyTitle,
    storySub: aboutPage.storySub,
    storyCards: aboutPage.storyCards.map((c) => ({ ...c })),
    comparisonTitle: aboutPage.comparisonTitle,
    comparison: aboutPage.comparison.map((c) => ({ ...c })),
    credentialsTitle: aboutPage.credentialsTitle,
    credentials: aboutPage.credentials.map((c) => ({ ...c })),
    ctaTitle: aboutPage.ctaTitle,
    ctaSub: aboutPage.ctaSub,
    style: { ...EMPTY_SECTION_STYLE },
    extras: [],
  },
  team: {
    eyebrow: teamPage.eyebrow,
    title: teamPage.title,
    tagline: teamPage.tagline,
    mission: teamPage.mission,
    ctaTitle: teamPage.ctaTitle,
    ctaSub: teamPage.ctaSub,
    members: teamPage.members.map((m) => ({ ...m })),
    style: { ...EMPTY_SECTION_STYLE },
    extras: [],
  },
  contact: {
    eyebrow: contactPage.eyebrow,
    title: contactPage.title,
    tagline: contactPage.tagline,
    style: { ...EMPTY_SECTION_STYLE },
    extras: [],
  },
  testimonials: defaultTestimonials.map((t) => ({ ...t })),
  solutions: showcase.items.map((s) => ({
    slug: s.slug,
    n: s.n,
    category: s.category,
    name: s.name,
    problem: s.problem,
    solution: s.solution,
    image: s.image,
    chips: [...s.chips],
  })),
  solutionGalleries: {},
  posts: defaultPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    displayDate: p.displayDate,
    readingMinutes: p.readingMinutes,
    image: p.image,
    body: p.body.map((b) => ({ ...b })),
  })),
};

const STORAGE_KEY = 'stride-site-content';
const CONTENT_ROW_ID = 'global';

interface SiteContentState {
  content: SiteContent;
  loading: boolean;
  saving: boolean;
  updateContent: (patch: Partial<SiteContent>) => Promise<void>;
  resetContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentState | null>(null);

/** Deep-merge stored content over defaults so new fields always exist. */
function mergeContent(stored: any): SiteContent {
  if (!stored || typeof stored !== 'object') return DEFAULT_CONTENT;
  const mergeSection = <T extends { style?: SectionStyle; extras?: HomeExtraBlock[] }>(
    def: T,
    s: any
  ): T => ({
    ...def,
    ...(s || {}),
    style: { ...EMPTY_SECTION_STYLE, ...(s?.style || {}) },
    extras: Array.isArray(s?.extras) ? s.extras : def.extras ?? [],
  });
  return {
    home: { ...DEFAULT_CONTENT.home, ...(stored.home || {}) },
    about: mergeSection(DEFAULT_CONTENT.about, stored.about),
    team: mergeSection(DEFAULT_CONTENT.team, stored.team),
    contact: mergeSection(DEFAULT_CONTENT.contact, stored.contact),
    testimonials: Array.isArray(stored.testimonials)
      ? stored.testimonials
      : DEFAULT_CONTENT.testimonials,
    solutions: Array.isArray(stored.solutions) ? stored.solutions : DEFAULT_CONTENT.solutions,
    solutionGalleries:
      stored.solutionGalleries && typeof stored.solutionGalleries === 'object'
        ? stored.solutionGalleries
        : {},
    posts: Array.isArray(stored.posts) ? stored.posts : DEFAULT_CONTENT.posts,
  };
}

function readLocal(): SiteContent {
  if (typeof window === 'undefined') return DEFAULT_CONTENT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return mergeContent(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return DEFAULT_CONTENT;
}

function writeLocal(c: SiteContent) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(readLocal);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await supa
          .from('site_content')
          .select('data')
          .eq('id', CONTENT_ROW_ID)
          .maybeSingle();
        if (data?.data) {
          const merged = mergeContent(data.data);
          setContent(merged);
          writeLocal(merged);
        }
      } catch {
        /* fall back to localStorage */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (next: SiteContent) => {
    const supa = getSupabase();
    if (!supa) return;
    const { error } = await supa
      .from('site_content')
      .upsert({ id: CONTENT_ROW_ID, data: next, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
  };

  const updateContent = useCallback(
    async (patch: Partial<SiteContent>) => {
      setSaving(true);
      const next = { ...content, ...patch };
      setContent(next);
      writeLocal(next);
      try {
        await persist(next);
      } finally {
        setSaving(false);
      }
    },
    [content]
  );

  const resetContent = useCallback(async () => {
    setContent(DEFAULT_CONTENT);
    writeLocal(DEFAULT_CONTENT);
    try {
      await persist(DEFAULT_CONTENT);
    } catch {
      /* localStorage still holds the reset */
    }
  }, []);

  return (
    <SiteContentContext.Provider value={{ content, loading, saving, updateContent, resetContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used inside <SiteContentProvider>');
  return ctx;
}

export { isSupabaseConfigured };
