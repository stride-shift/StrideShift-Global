import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Loader2, Paintbrush, RotateCcw, X } from 'lucide-react';
import {
  PAGE_LABELS,
  PAGE_PATHS,
  PageId,
  pageIdFromPath,
} from '@/lib/sections';
import { useSiteLayout } from '@/hooks/useSiteLayout';
import { useEditMode } from '@/hooks/useEditMode';

/**
 * Floating design-mode toolbar (bottom centre) + the admin-only "Design"
 * pencil button that opens it. Rendered by PageLayout on every public page.
 */

export const DesignFab = () => {
  const { isAdmin, editing, enterEditMode } = useEditMode();
  const page = pageIdFromPath(useLocation().pathname);
  if (!isAdmin || editing || !page) return null;
  return (
    <button
      onClick={enterEditMode}
      className="fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-stride-navy text-white text-sm font-semibold shadow-2xl hover:-translate-y-0.5 transition-all"
      title="Arrange and style this page"
    >
      <Paintbrush className="w-4 h-4" />
      Design
    </button>
  );
};

const EditorToolbar = () => {
  const { editing, exitEditMode } = useEditMode();
  const { saving, resetPage } = useSiteLayout();
  const location = useLocation();
  const navigate = useNavigate();
  const page = pageIdFromPath(location.pathname);

  if (!editing || !page) return null;

  const goTo = (p: PageId) => navigate(`${PAGE_PATHS[p]}?edit=1`);

  return (
    <>
      {/* top banner so it's obvious the page is in design mode */}
      <div className="fixed top-16 inset-x-0 z-40 flex justify-center pointer-events-none">
        <span className="mt-2 px-3 py-1 rounded-full bg-sky-500/90 text-white text-[11px] font-semibold shadow backdrop-blur">
          Design mode — drag sections to reorder · eye hides · palette styles
        </span>
      </div>

      <div className="fixed bottom-5 inset-x-0 z-50 flex justify-center px-4">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-stride-border bg-stride-bg-elev/95 backdrop-blur shadow-2xl px-3 py-2">
          <span className="inline-flex items-center gap-1.5 px-2 text-xs font-semibold text-stride-text-strong">
            <Paintbrush className="w-3.5 h-3.5 text-stride-accent" />
            {PAGE_LABELS[page]}
          </span>

          <span className="h-5 w-px bg-stride-border" />

          {(Object.keys(PAGE_PATHS) as PageId[]).map((p) => (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                p === page
                  ? 'bg-stride-navy text-white'
                  : 'text-stride-text-muted hover:text-stride-text-strong hover:bg-stride-bg'
              }`}
            >
              {PAGE_LABELS[p]}
            </button>
          ))}

          <span className="h-5 w-px bg-stride-border" />

          <span className="inline-flex items-center gap-1 text-[11px] text-stride-text-muted px-1">
            {saving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-emerald-500" /> Saved
              </>
            )}
          </span>

          <button
            onClick={() => {
              if (window.confirm(`Reset the ${PAGE_LABELS[page]} page layout to default?`)) {
                resetPage(page);
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-stride-text-muted hover:text-stride-text-strong hover:bg-stride-bg transition-colors"
            title="Reset this page's layout"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>

          <button
            onClick={exitEditMode}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stride-navy text-white text-[11px] font-semibold hover:bg-stride-navy/90 transition-colors"
          >
            <X className="w-3 h-3" />
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default EditorToolbar;
