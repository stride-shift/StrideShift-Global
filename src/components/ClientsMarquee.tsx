import { useState } from 'react';

// Stride client brands. Rendered as uniform typeset tiles so the strip always
// looks intentional. To use real logo imagery, drop files in /public/clients/
// and swap the <span> for an <img>.
const CLIENTS: { name: string; style?: string }[] = [
  { name: 'Ctrack', style: 'font-bold tracking-tight' },
  { name: 'dandemutande', style: 'lowercase font-medium tracking-tight' },
  { name: 'MasterDrive', style: 'font-extrabold tracking-tighter uppercase' },
  { name: 'maxtec', style: 'lowercase font-bold tracking-tight italic' },
  { name: 'Nedbank', style: 'font-bold uppercase' },
  { name: 'Old Mutual', style: 'font-semibold tracking-tight' },
  { name: 'Discovery', style: 'font-bold tracking-tight' },
  { name: 'Standard Bank', style: 'font-bold tracking-tight' },
  { name: 'MTN', style: 'font-extrabold tracking-tighter' },
  { name: 'Sanlam', style: 'font-semibold tracking-tight' },
  { name: 'Investec', style: 'font-semibold tracking-tight italic' },
  { name: 'Vodacom', style: 'font-bold tracking-tight uppercase' },
];

const LogoTile = ({ name, style }: { name: string; style?: string }) => (
  <div className="flex-shrink-0 mx-2.5 flex items-center justify-center w-44 h-20 rounded-xl border border-stride-border bg-stride-bg-elev">
    <span
      className={`text-lg text-stride-text-muted/85 transition-colors duration-300 ${style ?? 'font-semibold'}`}
    >
      {name}
    </span>
  </div>
);

const ClientsMarquee = () => {
  const [paused, setPaused] = useState(false);

  return (
    <section className="py-16 md:py-24 bg-stride-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14 reveal-on-scroll">
          <div className="inline-flex items-center justify-center gap-4 mb-2 text-stride-text-muted">
            <span className="h-px w-10 md:w-16 bg-stride-text-muted/40" />
            <span className="text-xs uppercase tracking-[0.22em] font-semibold">Trusted by</span>
            <span className="h-px w-10 md:w-16 bg-stride-text-muted/40" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-stride-text-strong tracking-tight">
            Our Valued Clients
          </h2>
          <p className="text-stride-text-muted mt-3 max-w-xl mx-auto">
            60+ organisations across 16 African countries and three continents.
          </p>
        </div>

        {/* Single clean marquee row of logo tiles */}
        <div
          className="relative reveal-on-scroll delay-1"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-stride-bg to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-stride-bg to-transparent z-10 pointer-events-none" />

          <div className="flex w-max">
            <div
              className={`flex items-center ${paused ? '' : 'animate-marquee-slow'}`}
              style={{ animationPlayState: paused ? 'paused' : 'running' }}
            >
              {CLIENTS.map((c) => (
                <LogoTile key={`a-${c.name}`} name={c.name} style={c.style} />
              ))}
              {CLIENTS.map((c) => (
                <LogoTile key={`b-${c.name}`} name={c.name} style={c.style} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsMarquee;
