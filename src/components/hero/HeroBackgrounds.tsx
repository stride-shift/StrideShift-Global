import type { HeroTemplate } from '@/hooks/useSiteSettings';

/**
 * Pure-CSS animated hero backgrounds — no WebGL, lightweight. One per
 * non-shader, non-classic template. Each fills its parent absolutely.
 */
export function CssHeroBackground({ template }: { template: HeroTemplate }) {
  switch (template) {
    case 'mesh':
      return (
        <div className="absolute inset-0 overflow-hidden bg-stride-navy">
          <div className="absolute -top-1/3 -left-1/4 w-[55rem] h-[55rem] rounded-full bg-stride-accent/35 blur-3xl animate-mesh" />
          <div
            className="absolute top-1/4 -right-1/4 w-[48rem] h-[48rem] rounded-full bg-stride-sky/35 blur-3xl animate-mesh"
            style={{ animationDelay: '-6s' }}
          />
          <div
            className="absolute -bottom-1/3 left-1/3 w-[44rem] h-[44rem] rounded-full bg-stride-sage/30 blur-3xl animate-mesh"
            style={{ animationDelay: '-12s' }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-[26rem] h-[26rem] rounded-full bg-stride-gold/18 blur-3xl animate-mesh"
            style={{ animationDelay: '-3s' }}
          />
        </div>
      );

    case 'grid':
      return (
        <div className="absolute inset-0 overflow-hidden bg-stride-navy">
          <div
            className="absolute inset-[-2px] animate-grid-drift"
            style={{
              backgroundImage:
                'linear-gradient(rgba(120,160,230,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(120,160,230,0.18) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 50% 55% at 50% 45%, transparent 0%, rgba(8,15,30,0.85) 75%)',
            }}
          />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-stride-accent/25 blur-3xl animate-pulse-slow" />
        </div>
      );

    case 'spotlight':
      return (
        <div className="absolute inset-0 overflow-hidden bg-stride-navy-dark">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[40rem] h-[40rem] rounded-full bg-stride-accent/40 blur-3xl animate-spotlight" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '90px 90px',
              maskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 70%)',
            }}
          />
        </div>
      );

    case 'waves':
      return (
        <div className="absolute inset-0 overflow-hidden bg-stride-navy">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute left-[-25%] right-[-25%] h-[42rem] animate-wave-drift"
              style={{
                bottom: `${-18 + i * 13}rem`,
                background: `radial-gradient(ellipse 60% 100% at 50% 100%, ${
                  ['rgba(59,90,138,0.55)', 'rgba(42,57,88,0.55)', 'rgba(28,51,96,0.55)'][i]
                }, transparent 70%)`,
                animationDuration: `${16 + i * 4}s`,
                animationDelay: `${-i * 3}s`,
              }}
            />
          ))}
          <div className="absolute -top-1/4 right-0 w-[36rem] h-[36rem] rounded-full bg-stride-accent/20 blur-3xl animate-blob" />
        </div>
      );

    case 'orbit':
      return (
        <div className="absolute inset-0 overflow-hidden bg-stride-navy">
          <div className="absolute inset-0 flex items-center justify-center">
            {[
              { size: '24rem', dur: '34s' },
              { size: '38rem', dur: '48s' },
              { size: '54rem', dur: '66s' },
              { size: '72rem', dur: '88s' },
            ].map((ring, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-stride-accent-soft/15 animate-rotate"
                style={{ width: ring.size, height: ring.size, animationDuration: ring.dur }}
              >
                <span
                  className="absolute w-2.5 h-2.5 rounded-full bg-stride-accent-soft/70"
                  style={{ top: '-5px', left: '50%' }}
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[26rem] h-[26rem] rounded-full bg-stride-accent/25 blur-3xl animate-pulse-slow" />
          </div>
        </div>
      );

    case 'minimal':
    default:
      return (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-stride-navy via-stride-navy-light to-stride-navy" />
          <div className="absolute -top-24 -right-24 w-[40rem] h-[40rem] rounded-full bg-stride-accent/20 blur-3xl animate-blob" />
          <div
            className="absolute -bottom-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-stride-accent/15 blur-3xl animate-blob"
            style={{ animationDelay: '-8s' }}
          />
        </div>
      );
  }
}

export default CssHeroBackground;
