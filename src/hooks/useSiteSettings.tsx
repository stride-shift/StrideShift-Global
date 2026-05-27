import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Editable site content. The landing-page hero image (and a few other
 * surface-level fields) live here so an admin can change them without code.
 *
 * Storage:
 *  - Always mirrored to localStorage (instant, per-browser)
 *  - If Supabase is configured, the `site_settings` table is the source of
 *    truth (global). Table SQL is in .env.example.
 */

export type HeroTemplate =
  | 'fluid'
  | 'classic'
  | 'aurora'
  | 'lines'
  | 'spectrum'
  | 'mesh'
  | 'grid'
  | 'spotlight'
  | 'waves'
  | 'orbit'
  | 'minimal';

export const HERO_TEMPLATES: { id: HeroTemplate; name: string; description: string; kind: 'image' | 'shader' | 'css' }[] = [
  {
    id: 'fluid',
    name: 'Fluid (Flagship)',
    description: 'Cursor-reactive WebGL2 fluid shader in the Angle palette, kinetic word reveal, magnetic CTAs, live-counting stat strip. The default.',
    kind: 'shader',
  },
  {
    id: 'classic',
    name: 'Classic Banner',
    description: 'A full-bleed background image with the headline + CTAs overlaid. Uses your image.',
    kind: 'image',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Flowing nebula WebGL shader behind centred content. Cinematic.',
    kind: 'shader',
  },
  {
    id: 'lines',
    name: 'Lightlines',
    description: 'Animated radial light-lines WebGL shader. Energetic.',
    kind: 'shader',
  },
  {
    id: 'spectrum',
    name: 'Spectrum',
    description: 'RGB-split wave WebGL shader. Bold and eye-catching.',
    kind: 'shader',
  },
  {
    id: 'mesh',
    name: 'Gradient Mesh',
    description: 'Soft drifting gradient mesh. Premium and calm. Lightweight.',
    kind: 'css',
  },
  {
    id: 'grid',
    name: 'Blueprint',
    description: 'Drifting blueprint grid with a glow. Technical and precise.',
    kind: 'css',
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    description: 'A moving spotlight glow over deep navy. Focused and dramatic.',
    kind: 'css',
  },
  {
    id: 'waves',
    name: 'Waves',
    description: 'Layered animated wave bands. Smooth and editorial.',
    kind: 'css',
  },
  {
    id: 'orbit',
    name: 'Orbit',
    description: 'Rotating orbital rings around the content. Distinctive.',
    kind: 'css',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean elegant gradient with soft blobs. Understated.',
    kind: 'css',
  },
];

export type HeroAlign = 'left' | 'center';
export type HeroHeadlineSize = 'sm' | 'md' | 'lg' | 'xl';

export type HeroPrimaryButtonStyle = 'cream' | 'navy' | 'gold' | 'custom';
export type HeroBackgroundDirection = 'br' | 'bl' | 'tr' | 'tl' | 'b' | 'r';

export interface SiteSettings {
  heroTemplate: HeroTemplate;
  heroImageUrl: string;
  heroHeadline: string;
  heroSubhead: string;
  heroAlign: HeroAlign;
  heroHeadlineSize: HeroHeadlineSize;
  heroHeadlineColor: string;
  heroSubheadColor: string;
  heroOverlayOpacity: number;
  heroPrimaryButtonBg: string;
  heroPrimaryButtonText: string;
  heroSecondaryButtonBorder: string;
  heroBackgroundDirection: HeroBackgroundDirection;
  heroCtaLabel: string;
  heroSecondaryLabel: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  heroTemplate: 'fluid',
  heroImageUrl:
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80',
  // Kept distinct from the "From messy problem…" headline in the Sound Familiar
  // section below — the hero sets the tone, that section carries the detail.
  heroHeadline: 'Clarity for the decisions that matter most.',
  heroSubhead:
    'An AI-powered think tank for leadership teams facing complex, open-ended challenges and making high-stakes decisions.',
  heroAlign: 'left',
  heroHeadlineSize: 'lg',
  heroHeadlineColor: '#ffffff',
  heroSubheadColor: '#ffffff',
  heroOverlayOpacity: 0.85,
  heroPrimaryButtonBg: '',
  heroPrimaryButtonText: '',
  heroSecondaryButtonBorder: '',
  heroBackgroundDirection: 'br',
  heroCtaLabel: 'Start a conversation',
  heroSecondaryLabel: 'See how we work',
};

// v2 — bumped when the Angle palette + Fluid hero became the default so
// every visitor lands on the new look instead of their cached 'classic'.
// v3 — bumped when the hero copy changed to the new "AI-powered think tank
// … high-stakes decisions" sentence so existing visitors see the new default
// instead of their cached v2 subhead.
const STORAGE_KEY = 'stride-site-settings-v3';
const SETTINGS_ROW_ID = 1;

interface SiteSettingsState {
  settings: SiteSettings;
  loading: boolean;
  saving: boolean;
  updateSettings: (patch: Partial<SiteSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsState | null>(null);

function readLocal(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

function writeLocal(s: SiteSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(readLocal);
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
          .from('site_settings')
          .select('data')
          .eq('id', SETTINGS_ROW_ID)
          .maybeSingle();
        if (data?.data) {
          const merged = { ...DEFAULT_SETTINGS, ...data.data };
          setSettings(merged);
          writeLocal(merged);
        }
      } catch {
        /* fall back to localStorage */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (next: SiteSettings) => {
    const supa = getSupabase();
    if (!supa) return;
    const { error } = await supa
      .from('site_settings')
      .upsert({ id: SETTINGS_ROW_ID, data: next, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
  };

  const updateSettings = useCallback(
    async (patch: Partial<SiteSettings>) => {
      setSaving(true);
      const next = { ...settings, ...patch };
      setSettings(next);
      writeLocal(next);
      try {
        await persist(next);
      } finally {
        setSaving(false);
      }
    },
    [settings]
  );

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    writeLocal(DEFAULT_SETTINGS);
    try {
      await persist(DEFAULT_SETTINGS);
    } catch {
      /* localStorage still holds the reset */
    }
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, saving, updateSettings, resetSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used inside <SiteSettingsProvider>');
  return ctx;
}

export { isSupabaseConfigured };
