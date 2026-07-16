import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { getSupabase } from '@/lib/supabase';
import {
  CustomBlock,
  PageId,
  PageLayoutState,
  SectionOverride,
  SiteLayout,
  EMPTY_PAGE_LAYOUT,
} from '@/lib/sections';

/**
 * Per-page layout arrangement — section order, visibility and styling set by
 * an admin in the visual editor. Mirrors the persistence model of
 * useSiteSettings / useSiteContent: localStorage always, Supabase
 * `site_layout` table (single row) as the global source of truth.
 */

const STORAGE_KEY = 'stride-site-layout-v1';
const LAYOUT_ROW_ID = 'global';

interface SiteLayoutState {
  layout: SiteLayout;
  loading: boolean;
  saving: boolean;
  getPage: (page: PageId) => PageLayoutState;
  setOrder: (page: PageId, order: string[]) => void;
  updateSection: (page: PageId, sectionId: string, patch: Partial<SectionOverride>) => void;
  addBlock: (page: PageId, block: CustomBlock, afterId?: string) => void;
  updateBlock: (page: PageId, blockId: string, patch: Partial<CustomBlock>) => void;
  removeBlock: (page: PageId, blockId: string) => void;
  resetPage: (page: PageId) => void;
}

const SiteLayoutContext = createContext<SiteLayoutState | null>(null);

function sanitise(stored: unknown): SiteLayout {
  if (!stored || typeof stored !== 'object') return {};
  const out: SiteLayout = {};
  for (const [page, value] of Object.entries(stored as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const v = value as { order?: unknown; overrides?: unknown };
    const vb = value as { order?: unknown; overrides?: unknown; blocks?: unknown };
    out[page as PageId] = {
      order: Array.isArray(v.order)
        ? v.order.filter((x): x is string => typeof x === 'string')
        : [],
      overrides:
        v.overrides && typeof v.overrides === 'object'
          ? (v.overrides as PageLayoutState['overrides'])
          : {},
      blocks:
        vb.blocks && typeof vb.blocks === 'object'
          ? (vb.blocks as PageLayoutState['blocks'])
          : {},
    };
  }
  return out;
}

function readLocal(): SiteLayout {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return sanitise(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return {};
}

function writeLocal(l: SiteLayout) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
  } catch {
    /* ignore */
  }
}

export function SiteLayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<SiteLayout>(readLocal);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const persistTimer = useRef<number | null>(null);

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await supa
          .from('site_layout')
          .select('data')
          .eq('id', LAYOUT_ROW_ID)
          .maybeSingle();
        if (data?.data) {
          const merged = sanitise(data.data);
          setLayout(merged);
          writeLocal(merged);
        }
      } catch {
        /* table may not exist yet — localStorage still works */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** Debounced Supabase write — colour pickers fire many changes per second. */
  const schedulePersist = useCallback((next: SiteLayout) => {
    const supa = getSupabase();
    if (!supa) return;
    if (persistTimer.current) window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(async () => {
      setSaving(true);
      try {
        await supa
          .from('site_layout')
          .upsert({ id: LAYOUT_ROW_ID, data: next, updated_at: new Date().toISOString() });
      } catch {
        /* localStorage still holds the change */
      } finally {
        setSaving(false);
      }
    }, 700);
  }, []);

  const apply = useCallback(
    (updater: (prev: SiteLayout) => SiteLayout) => {
      setLayout((prev) => {
        const next = updater(prev);
        writeLocal(next);
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  const getPage = useCallback(
    (page: PageId): PageLayoutState => layout[page] ?? EMPTY_PAGE_LAYOUT,
    [layout]
  );

  const setOrder = useCallback(
    (page: PageId, order: string[]) =>
      apply((prev) => ({
        ...prev,
        [page]: { ...(prev[page] ?? EMPTY_PAGE_LAYOUT), order },
      })),
    [apply]
  );

  const updateSection = useCallback(
    (page: PageId, sectionId: string, patch: Partial<SectionOverride>) =>
      apply((prev) => {
        const current = prev[page] ?? EMPTY_PAGE_LAYOUT;
        return {
          ...prev,
          [page]: {
            ...current,
            overrides: {
              ...current.overrides,
              [sectionId]: { ...(current.overrides[sectionId] ?? {}), ...patch },
            },
          },
        };
      }),
    [apply]
  );

  const addBlock = useCallback(
    (page: PageId, block: CustomBlock, afterId?: string) =>
      apply((prev) => {
        const current = prev[page] ?? EMPTY_PAGE_LAYOUT;
        const order = [...current.order];
        const at = afterId ? order.indexOf(afterId) : -1;
        if (at >= 0) order.splice(at + 1, 0, block.id);
        else order.push(block.id);
        return {
          ...prev,
          [page]: {
            ...current,
            order,
            blocks: { ...(current.blocks ?? {}), [block.id]: block },
          },
        };
      }),
    [apply]
  );

  const updateBlock = useCallback(
    (page: PageId, blockId: string, patch: Partial<CustomBlock>) =>
      apply((prev) => {
        const current = prev[page] ?? EMPTY_PAGE_LAYOUT;
        const existing = current.blocks?.[blockId];
        if (!existing) return prev;
        return {
          ...prev,
          [page]: {
            ...current,
            blocks: { ...(current.blocks ?? {}), [blockId]: { ...existing, ...patch } },
          },
        };
      }),
    [apply]
  );

  const removeBlock = useCallback(
    (page: PageId, blockId: string) =>
      apply((prev) => {
        const current = prev[page] ?? EMPTY_PAGE_LAYOUT;
        const blocks = { ...(current.blocks ?? {}) };
        delete blocks[blockId];
        const overrides = { ...current.overrides };
        delete overrides[blockId];
        return {
          ...prev,
          [page]: {
            ...current,
            order: current.order.filter((id) => id !== blockId),
            overrides,
            blocks,
          },
        };
      }),
    [apply]
  );

  const resetPage = useCallback(
    (page: PageId) =>
      apply((prev) => {
        const next = { ...prev };
        delete next[page];
        return next;
      }),
    [apply]
  );

  return (
    <SiteLayoutContext.Provider
      value={{
        layout,
        loading,
        saving,
        getPage,
        setOrder,
        updateSection,
        addBlock,
        updateBlock,
        removeBlock,
        resetPage,
      }}
    >
      {children}
    </SiteLayoutContext.Provider>
  );
}

export function useSiteLayout() {
  const ctx = useContext(SiteLayoutContext);
  if (!ctx) throw new Error('useSiteLayout must be used inside <SiteLayoutProvider>');
  return ctx;
}
