import { CSSProperties, ReactNode, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import {
  GripVertical,
  Eye,
  EyeOff,
  Palette,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  PAGE_SECTIONS,
  PageId,
  SectionOverride,
  SectionPad,
  resolveOrder,
  hexToHslTriplet,
} from '@/lib/sections';
import { useSiteLayout } from '@/hooks/useSiteLayout';
import { useEditMode } from '@/hooks/useEditMode';

/**
 * Renders a page's sections in the admin-arranged order, applying visibility
 * and style overrides. In design mode (?edit=1 as admin) every section gets
 * Wix-style chrome: drag to reorder, hide/show, and a style popover.
 *
 * Colour overrides work by re-pointing the stride CSS variables on a wrapper
 * — sections that use bg-stride-bg / text-stride-text-* adapt automatically.
 */

const styleFor = (ov: SectionOverride): CSSProperties => {
  const s: Record<string, string> = {};
  if (ov.bg) {
    const t = hexToHslTriplet(ov.bg);
    if (t) {
      s['--stride-bg'] = t;
      s['--stride-bg-elev'] = t;
    }
    s.background = ov.bg;
  }
  if (ov.text) {
    const t = hexToHslTriplet(ov.text);
    if (t) {
      s['--stride-text-strong'] = t;
      s['--stride-text-muted'] = t;
    }
    s.color = ov.text;
  }
  return s as CSSProperties;
};

const padClass = (pad?: SectionPad) =>
  pad === 'compact' ? 'sec-pad-compact' : pad === 'spacious' ? 'sec-pad-spacious' : '';

/* ─────────────────────────── style popover ─────────────────────────── */

const BG_PRESETS = [
  { label: 'Cream', value: '#f6f3ec' },
  { label: 'White', value: '#ffffff' },
  { label: 'Sage', value: '#e8efe6' },
  { label: 'Sky', value: '#e3edf5' },
  { label: 'Navy', value: '#0e1b2c' },
  { label: 'Ink', value: '#0a1220' },
];

const StylePopover = ({
  override,
  onChange,
  onClose,
}: {
  override: SectionOverride;
  onChange: (patch: Partial<SectionOverride>) => void;
  onClose: () => void;
}) => (
  <div
    className="absolute top-12 left-2 z-[60] w-72 rounded-xl border border-stride-border bg-stride-bg-elev shadow-2xl p-4 text-stride-text-strong"
    onPointerDown={(e) => e.stopPropagation()}
  >
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold uppercase tracking-wider">Section style</p>
      <button onClick={onClose} className="p-1 rounded hover:bg-stride-bg" aria-label="Close">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>

    <p className="text-[11px] text-stride-text-muted mb-1.5">Background</p>
    <div className="flex flex-wrap items-center gap-1.5 mb-3">
      <button
        onClick={() => onChange({ bg: undefined })}
        className={`px-2 py-1 rounded-md text-[11px] border ${
          !override.bg ? 'border-stride-accent text-stride-accent' : 'border-stride-border'
        }`}
      >
        Default
      </button>
      {BG_PRESETS.map((p) => (
        <button
          key={p.value}
          title={p.label}
          onClick={() => onChange({ bg: p.value })}
          className={`w-6 h-6 rounded-md border ${
            override.bg === p.value ? 'ring-2 ring-stride-accent' : 'border-stride-border'
          }`}
          style={{ background: p.value }}
        />
      ))}
      <label className="w-6 h-6 rounded-md border border-dashed border-stride-border overflow-hidden cursor-pointer relative">
        <input
          type="color"
          value={override.bg || '#ffffff'}
          onChange={(e) => onChange({ bg: e.target.value })}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px]">+</span>
      </label>
    </div>

    <p className="text-[11px] text-stride-text-muted mb-1.5">Text colour</p>
    <div className="flex items-center gap-1.5 mb-3">
      <button
        onClick={() => onChange({ text: undefined })}
        className={`px-2 py-1 rounded-md text-[11px] border ${
          !override.text ? 'border-stride-accent text-stride-accent' : 'border-stride-border'
        }`}
      >
        Default
      </button>
      {['#1b2430', '#f5f1e8'].map((c) => (
        <button
          key={c}
          onClick={() => onChange({ text: c })}
          className={`w-6 h-6 rounded-md border ${
            override.text === c ? 'ring-2 ring-stride-accent' : 'border-stride-border'
          }`}
          style={{ background: c }}
        />
      ))}
      <label className="w-6 h-6 rounded-md border border-dashed border-stride-border overflow-hidden cursor-pointer relative">
        <input
          type="color"
          value={override.text || '#1b2430'}
          onChange={(e) => onChange({ text: e.target.value })}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px]">+</span>
      </label>
    </div>

    <p className="text-[11px] text-stride-text-muted mb-1.5">Vertical spacing</p>
    <div className="inline-flex rounded-lg border border-stride-border p-0.5 bg-stride-bg">
      {(['compact', 'normal', 'spacious'] as SectionPad[]).map((p) => (
        <button
          key={p}
          onClick={() => onChange({ pad: p === 'normal' ? undefined : p })}
          className={`px-2.5 py-1 rounded-md text-[11px] capitalize ${
            (override.pad ?? 'normal') === p
              ? 'bg-stride-navy text-white'
              : 'text-stride-text-muted hover:text-stride-text-strong'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  </div>
);

/* ─────────────────────────── editable wrapper ─────────────────────────── */

const EditableSection = ({
  id,
  label,
  page,
  override,
  onMove,
  children,
}: {
  id: string;
  label: string;
  page: PageId;
  override: SectionOverride;
  onMove: (dir: -1 | 1) => void;
  children: ReactNode;
}) => {
  const controls = useDragControls();
  const { updateSection } = useSiteLayout();
  const [styleOpen, setStyleOpen] = useState(false);
  const hidden = !!override.hidden;

  const btn =
    'p-1.5 rounded-md bg-white/90 text-stride-navy shadow hover:bg-white transition-colors';

  return (
    <Reorder.Item
      as="div"
      value={id}
      dragListener={false}
      dragControls={controls}
      className="relative group/sec"
    >
      {/* chrome bar */}
      <div className="absolute top-2 left-2 z-50 flex items-center gap-1">
        <button
          onPointerDown={(e) => controls.start(e)}
          className={`${btn} cursor-grab active:cursor-grabbing touch-none`}
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="px-2.5 py-1 rounded-md bg-stride-navy/90 text-white text-[11px] font-semibold shadow backdrop-blur">
          {label}
        </span>
        <button onClick={() => onMove(-1)} className={btn} title="Move up">
          <ChevronUp className="w-4 h-4" />
        </button>
        <button onClick={() => onMove(1)} className={btn} title="Move down">
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => updateSection(page, id, { hidden: !hidden })}
          className={btn}
          title={hidden ? 'Show section' : 'Hide section'}
        >
          {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setStyleOpen((v) => !v)}
          className={`${btn} ${styleOpen ? 'ring-2 ring-stride-accent' : ''}`}
          title="Section style"
        >
          <Palette className="w-4 h-4" />
        </button>
      </div>

      {styleOpen && (
        <StylePopover
          override={override}
          onChange={(patch) => updateSection(page, id, patch)}
          onClose={() => setStyleOpen(false)}
        />
      )}

      {hidden ? (
        <div className="mx-4 my-3 mt-14 rounded-xl border-2 border-dashed border-stride-border bg-stride-bg/60 py-8 text-center text-sm text-stride-text-muted">
          "{label}" is hidden — visitors won't see it. Use the eye button to bring it back.
        </div>
      ) : (
        <div
          className={`outline outline-2 -outline-offset-2 outline-transparent group-hover/sec:outline-sky-400/70 transition-[outline-color] ${padClass(override.pad)}`}
          style={styleFor(override)}
        >
          {/* content is inert while arranging so stray clicks don't navigate */}
          <div className="pointer-events-none select-none">{children}</div>
        </div>
      )}
    </Reorder.Item>
  );
};

/* ─────────────────────────── main renderer ─────────────────────────── */

const PageSections = ({
  page,
  sections,
}: {
  page: PageId;
  sections: Record<string, ReactNode>;
}) => {
  const { getPage, setOrder } = useSiteLayout();
  const { editing } = useEditMode();
  const state = getPage(page);
  const order = resolveOrder(page, state.order).filter((id) => sections[id] !== undefined);
  const defs = PAGE_SECTIONS[page];
  const labelOf = (id: string) => defs.find((d) => d.id === id)?.label ?? id;

  if (!editing) {
    return (
      <>
        {order.map((id) => {
          const ov = state.overrides[id] ?? {};
          if (ov.hidden) return null;
          const style = styleFor(ov);
          const cls = padClass(ov.pad);
          return Object.keys(style).length || cls ? (
            <div key={id} className={cls} style={style}>
              {sections[id]}
            </div>
          ) : (
            <div key={id}>{sections[id]}</div>
          );
        })}
      </>
    );
  }

  const move = (id: string, dir: -1 | 1) => {
    const idx = order.indexOf(id);
    const to = idx + dir;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    next.splice(idx, 1);
    next.splice(to, 0, id);
    setOrder(page, next);
  };

  return (
    <Reorder.Group
      as="div"
      axis="y"
      values={order}
      onReorder={(next) => setOrder(page, next as string[])}
    >
      {order.map((id) => (
        <EditableSection
          key={id}
          id={id}
          label={labelOf(id)}
          page={page}
          override={state.overrides[id] ?? {}}
          onMove={(dir) => move(id, dir)}
        >
          {sections[id]}
        </EditableSection>
      ))}
    </Reorder.Group>
  );
};

export default PageSections;
