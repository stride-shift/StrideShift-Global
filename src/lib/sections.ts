/**
 * Section registry for the visual page editor.
 *
 * Every public page is composed of named sections. The registry defines the
 * default order and human labels; `useSiteLayout` stores per-page overrides
 * (order, visibility, colours, spacing) that admins arrange in edit mode.
 */

export type PageId = 'home' | 'about' | 'team' | 'contact' | 'blog';

export interface SectionDef {
  id: string;
  label: string;
}

export const PAGE_SECTIONS: Record<PageId, SectionDef[]> = {
  home: [
    { id: 'hero', label: 'Hero' },
    { id: 'focus', label: 'What we focus on' },
    { id: 'sound-familiar', label: 'Sound familiar?' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'solutions', label: 'Solutions showcase' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'clients', label: 'Clients marquee' },
    { id: 'ideas', label: 'Ideas preview' },
  ],
  about: [
    { id: 'hero', label: 'Hero' },
    { id: 'story', label: 'Our story' },
    { id: 'comparison', label: 'How we compare' },
    { id: 'credentials', label: 'Credentials' },
    { id: 'cta', label: 'Call to action' },
  ],
  team: [
    { id: 'hero', label: 'Hero & pillars' },
    { id: 'members', label: 'Team members' },
    { id: 'cta', label: 'Call to action' },
  ],
  contact: [
    { id: 'hero', label: 'Hero' },
    { id: 'form', label: 'Contact form' },
  ],
  blog: [
    { id: 'hero', label: 'Hero' },
    { id: 'posts', label: 'Posts' },
  ],
};

export const PAGE_LABELS: Record<PageId, string> = {
  home: 'Home',
  about: 'About',
  team: 'Team',
  contact: 'Contact',
  blog: 'Ideas / Blog',
};

export const PAGE_PATHS: Record<PageId, string> = {
  home: '/',
  about: '/about',
  team: '/team',
  contact: '/contact',
  blog: '/blog',
};

export type SectionPad = 'compact' | 'normal' | 'spacious';

/** Per-section visual overrides. Empty string / undefined = site default. */
export interface SectionOverride {
  hidden?: boolean;
  /** Hex background colour, e.g. "#0e1b2c". */
  bg?: string;
  /** Hex text colour. */
  text?: string;
  pad?: SectionPad;
}

/* ---------- custom blocks (admin-inserted content, Wix-style) ---------- */

export type BlockType = 'text' | 'image' | 'video' | 'quote';
export type BlockAnim = 'none' | 'fade' | 'slide-left' | 'slide-right' | 'zoom';

/** An admin-added content block. Lives in the page's `order` alongside the
 *  built-in sections, so it drags/hides/styles with the same chrome. */
export interface CustomBlock {
  id: string; // "blk-…"
  type: BlockType;
  /* text */
  heading?: string;
  body?: string;
  font?: 'serif' | 'sans';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
  /* image */
  imageUrl?: string;
  caption?: string;
  /* video (YouTube / Vimeo URL, or a direct .mp4) */
  videoUrl?: string;
  /* quote */
  quote?: string;
  attribution?: string;
  /* shared */
  anim?: BlockAnim;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  text: 'Text block',
  image: 'Image block',
  video: 'Video block',
  quote: 'Quote block',
};

export function newBlockId(): string {
  return `blk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface PageLayoutState {
  /** Section + block ids in display order. Empty = registry default order. */
  order: string[];
  overrides: Record<string, SectionOverride>;
  /** Admin-inserted blocks, keyed by block id. */
  blocks?: Record<string, CustomBlock>;
}

export type SiteLayout = Partial<Record<PageId, PageLayoutState>>;

export const EMPTY_PAGE_LAYOUT: PageLayoutState = { order: [], overrides: {}, blocks: {} };

export function pageIdFromPath(pathname: string): PageId | null {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const entry = (Object.entries(PAGE_PATHS) as [PageId, string][]).find(
    ([, path]) => path === clean
  );
  return entry ? entry[0] : null;
}

/**
 * Merge a stored order with the registry: keep the stored arrangement for
 * known ids, drop unknown ids, and slot never-seen registry sections back in
 * at their default position (so new site sections appear automatically).
 */
export function resolveOrder(
  page: PageId,
  stored: string[] | undefined,
  /** Ids of custom blocks on this page — kept in place instead of dropped. */
  blockIds: string[] = []
): string[] {
  const defs = PAGE_SECTIONS[page].map((s) => s.id);
  if (!stored || stored.length === 0) return [...defs, ...blockIds];
  const known = stored.filter((id) => defs.includes(id) || blockIds.includes(id));
  const result = [...known];
  defs.forEach((id, defIdx) => {
    if (!result.includes(id)) result.splice(Math.min(defIdx, result.length), 0, id);
  });
  // Blocks that somehow fell out of the stored order come back at the end.
  blockIds.forEach((id) => {
    if (!result.includes(id)) result.push(id);
  });
  return result;
}

/** "#1a2b3c" → "210 40% 17%" (HSL triplet used by the stride CSS variables). */
export function hexToHslTriplet(hex: string): string | null {
  const m = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(m)) return null;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
