import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { CustomBlock } from '@/lib/sections';

/**
 * Renders one admin-inserted content block (text / image / video / quote) on
 * the public page. Typography, alignment and entrance animation come from the
 * block's own settings; background/text-colour/spacing overrides are applied
 * by the surrounding PageSections wrapper like any other section.
 */

const SIZE_HEADING: Record<string, string> = {
  sm: 'text-xl md:text-2xl',
  md: 'text-2xl md:text-3xl',
  lg: 'text-3xl md:text-5xl',
  xl: 'text-4xl md:text-6xl',
};
const SIZE_BODY: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg md:text-xl',
  xl: 'text-xl md:text-2xl',
};
const ALIGN: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const ANIM_PROPS: Record<string, { initial: object; whileInView: object }> = {
  none: { initial: {}, whileInView: {} },
  fade: { initial: { opacity: 0 }, whileInView: { opacity: 1 } },
  'slide-left': { initial: { opacity: 0, x: -48 }, whileInView: { opacity: 1, x: 0 } },
  'slide-right': { initial: { opacity: 0, x: 48 }, whileInView: { opacity: 1, x: 0 } },
  zoom: { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 } },
};

/** YouTube / Vimeo page URLs → embeddable URLs; anything else passes through. */
export function toEmbedUrl(url: string): { kind: 'iframe' | 'video'; src: string } {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/
  );
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` };
  return { kind: 'video', src: url };
}

const CustomBlockView = ({ block }: { block: CustomBlock }) => {
  const size = block.size ?? 'md';
  const align = ALIGN[block.align ?? 'center'];
  const font = block.font === 'sans' ? '' : 'font-display';
  const anim = ANIM_PROPS[block.anim ?? 'fade'] ?? ANIM_PROPS.fade;

  return (
    <section className="py-12 md:py-16 bg-stride-bg text-stride-text-strong">
      <motion.div
        className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${align}`}
        initial={anim.initial}
        whileInView={anim.whileInView}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {block.type === 'text' && (
          <>
            {block.heading && (
              <h2 className={`${font} ${SIZE_HEADING[size]} tracking-tight mb-4`}>
                {block.heading}
              </h2>
            )}
            {block.body && (
              <div
                className={`${SIZE_BODY[size]} text-stride-text-muted leading-relaxed space-y-4 ${
                  block.align === 'center' ? 'mx-auto max-w-2xl' : ''
                }`}
              >
                {block.body.split(/\n{2,}/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </>
        )}

        {block.type === 'image' && block.imageUrl && (
          <figure>
            <img
              src={block.imageUrl}
              alt={block.caption || 'Image'}
              loading="lazy"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
            {block.caption && (
              <figcaption className="mt-3 text-sm text-stride-text-muted">
                {block.caption}
              </figcaption>
            )}
          </figure>
        )}

        {block.type === 'video' && block.videoUrl && (
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-video bg-stride-ink">
            {(() => {
              const embed = toEmbedUrl(block.videoUrl);
              return embed.kind === 'iframe' ? (
                <iframe
                  src={embed.src}
                  title={block.caption || 'Video'}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={embed.src} controls playsInline className="w-full h-full object-cover" />
              );
            })()}
          </div>
        )}

        {block.type === 'quote' && (
          <blockquote className={block.align === 'left' ? '' : 'mx-auto max-w-3xl'}>
            <Quote className="w-8 h-8 text-stride-gold mb-4 inline-block" aria-hidden="true" />
            <p className={`font-display ${SIZE_HEADING[size]} tracking-tight leading-snug`}>
              {block.quote || '“Add your quote in the block settings.”'}
            </p>
            {block.attribution && (
              <footer className="mt-5 text-sm uppercase tracking-[0.2em] text-stride-text-muted font-semibold">
                — {block.attribution}
              </footer>
            )}
          </blockquote>
        )}
      </motion.div>
    </section>
  );
};

export default CustomBlockView;
