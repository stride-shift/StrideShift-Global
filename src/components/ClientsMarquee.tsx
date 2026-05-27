import { useState } from 'react';
import SectionEyebrow from '@/components/SectionEyebrow';

/**
 * Our trusted customers — actual client logos served from /public/clients/.
 * All tiles use a white plate so dark-on-transparent and dark-on-coloured
 * logos sit on the same neutral panel and read uniformly. Logos with their
 * own coloured background (Nedbank's green, BriteHouse's black) get a
 * `fitContain` option so the brand colour is preserved without bleeding to
 * the tile edges.
 */
interface ClientBrand {
  name: string;
  src: string;
}

const CLIENTS: ClientBrand[] = [
  { name: 'BriteHouse', src: '/clients/britehouse.png' },
  { name: 'Ctrack', src: '/clients/ctrack.png' },
  { name: 'Dandemutande', src: '/clients/dandemutande.png' },
  { name: 'GSK', src: '/clients/gsk.png' },
  { name: 'Masterdrive', src: '/clients/masterdrive.png' },
  { name: 'Maxtec', src: '/clients/maxtec.png' },
  { name: 'Myriad Capital', src: '/clients/myriad-capital.png' },
  { name: 'Nedbank', src: '/clients/nedbank.webp' },
  { name: 'NTT', src: '/clients/ntt.png' },
  { name: 'Oppenheimer Memorial Trust', src: '/clients/oppenheimer-memorial-trust.jpg' },
  { name: 'Pragma', src: '/clients/pragma.png' },
  { name: 'Standard Bank', src: '/clients/standard-bank.png' },
  { name: 'Sybrin', src: '/clients/sybrin.png' },
  { name: 'Wits Plus', src: '/clients/witsplus.png' },
  { name: 'x-sell-orate', src: '/clients/xsellorate.png' },
];

const LogoTile = ({ client }: { client: ClientBrand }) => (
  <div className="flex-shrink-0 mx-3 flex items-center justify-center w-48 h-24 rounded-xl border border-stride-border bg-white shadow-sm overflow-hidden p-4 group">
    <img
      src={client.src}
      alt={`${client.name} logo`}
      loading="lazy"
      className="max-h-16 max-w-[160px] w-auto h-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
    />
  </div>
);

const ClientsMarquee = () => {
  const [paused, setPaused] = useState(false);

  return (
    <section className="py-16 md:py-24 bg-stride-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14 reveal-on-scroll">
          <SectionEyebrow>Trusted by</SectionEyebrow>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-stride-text-strong tracking-tight">
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
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-stride-bg to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-stride-bg to-transparent z-10 pointer-events-none" />

          <div className="flex w-max">
            <div
              className={`flex items-center ${paused ? '' : 'animate-marquee-slow'}`}
              style={{ animationPlayState: paused ? 'paused' : 'running' }}
            >
              {CLIENTS.map((c) => (
                <LogoTile key={`a-${c.name}`} client={c} />
              ))}
              {CLIENTS.map((c) => (
                <LogoTile key={`b-${c.name}`} client={c} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsMarquee;
