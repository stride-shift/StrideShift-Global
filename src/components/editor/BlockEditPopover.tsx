import { X, Trash2 } from 'lucide-react';
import type { BlockAnim, CustomBlock } from '@/lib/sections';
import ImageUpload from '@/components/admin/ImageUpload';

/**
 * Edit popover for an admin-inserted block: content fields per type plus
 * typography (font / size / alignment) and entrance-animation controls.
 * Opened from the pencil button in the section chrome while in design mode.
 */

const field =
  'w-full px-2.5 py-2 rounded-md border border-stride-border bg-stride-bg text-stride-text-strong text-sm focus:outline-none focus:ring-2 focus:ring-stride-accent';
const label = 'block text-[11px] text-stride-text-muted mb-1 mt-3 first:mt-0';

// Deliberately non-generic: the dev-mode component tagger can't parse
// generic arrow components / explicit JSX type arguments.
const Seg = ({
  options,
  value,
  onPick,
}: {
  options: { v: string; l: string }[];
  value: string;
  onPick: (v: string) => void;
}) => (
  <div className="inline-flex rounded-lg border border-stride-border p-0.5 bg-stride-bg flex-wrap">
    {options.map((o) => (
      <button
        key={o.v}
        onClick={() => onPick(o.v)}
        className={`px-2.5 py-1 rounded-md text-[11px] ${
          value === o.v
            ? 'bg-stride-navy text-white'
            : 'text-stride-text-muted hover:text-stride-text-strong'
        }`}
      >
        {o.l}
      </button>
    ))}
  </div>
);

const BlockEditPopover = ({
  block,
  onChange,
  onDelete,
  onClose,
}: {
  block: CustomBlock;
  onChange: (patch: Partial<CustomBlock>) => void;
  onDelete: () => void;
  onClose: () => void;
}) => (
  <div
    className="absolute top-12 left-2 z-[60] w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-stride-border bg-stride-bg-elev shadow-2xl p-4 text-stride-text-strong"
    onPointerDown={(e) => e.stopPropagation()}
  >
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-semibold uppercase tracking-wider">Block content</p>
      <button onClick={onClose} className="p-1 rounded hover:bg-stride-bg" aria-label="Close">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>

    {block.type === 'text' && (
      <>
        <span className={label}>Heading</span>
        <input
          className={field}
          value={block.heading ?? ''}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="Section heading"
        />
        <span className={label}>Body (blank line = new paragraph)</span>
        <textarea
          className={field}
          rows={5}
          value={block.body ?? ''}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder="Write something…"
        />
        <span className={label}>Font</span>
        <Seg
          options={[
            { v: 'serif', l: 'Serif (display)' },
            { v: 'sans', l: 'Sans' },
          ]}
          value={block.font ?? 'serif'}
          onPick={(font) => onChange({ font: font as CustomBlock['font'] })}
        />
      </>
    )}

    {block.type === 'image' && (
      <>
        <span className={label}>Image</span>
        <ImageUpload
          value={block.imageUrl ?? ''}
          onChange={(imageUrl) => onChange({ imageUrl })}
          folder="blocks"
          compact
        />
        <span className={label}>Caption (optional)</span>
        <input
          className={field}
          value={block.caption ?? ''}
          onChange={(e) => onChange({ caption: e.target.value })}
        />
      </>
    )}

    {block.type === 'video' && (
      <>
        <span className={label}>Video URL (YouTube, Vimeo or .mp4)</span>
        <input
          className={field}
          value={block.videoUrl ?? ''}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=…"
        />
      </>
    )}

    {block.type === 'quote' && (
      <>
        <span className={label}>Quote</span>
        <textarea
          className={field}
          rows={3}
          value={block.quote ?? ''}
          onChange={(e) => onChange({ quote: e.target.value })}
        />
        <span className={label}>Attribution</span>
        <input
          className={field}
          value={block.attribution ?? ''}
          onChange={(e) => onChange({ attribution: e.target.value })}
          placeholder="Jane Doe, CEO — Acme"
        />
      </>
    )}

    <span className={label}>Size</span>
    <Seg
      options={[
        { v: 'sm', l: 'S' },
        { v: 'md', l: 'M' },
        { v: 'lg', l: 'L' },
        { v: 'xl', l: 'XL' },
      ]}
      value={block.size ?? 'md'}
      onPick={(size) => onChange({ size: size as CustomBlock['size'] })}
    />

    <span className={label}>Alignment</span>
    <Seg
      options={[
        { v: 'left', l: 'Left' },
        { v: 'center', l: 'Centre' },
        { v: 'right', l: 'Right' },
      ]}
      value={block.align ?? 'center'}
      onPick={(align) => onChange({ align: align as CustomBlock['align'] })}
    />

    <span className={label}>Animation (plays as the block scrolls into view)</span>
    <Seg
      options={[
        { v: 'none', l: 'None' },
        { v: 'fade', l: 'Fade' },
        { v: 'slide-left', l: 'Slide ←' },
        { v: 'slide-right', l: 'Slide →' },
        { v: 'zoom', l: 'Zoom' },
      ]}
      value={block.anim ?? 'fade'}
      onPick={(anim) => onChange({ anim: anim as BlockAnim })}
    />

    <button
      onClick={onDelete}
      className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-300/60 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      Delete this block
    </button>
  </div>
);

export default BlockEditPopover;
