/**
 * Single source of truth for all Stride site content.
 * Copy ported from the original Astro `src/lib/data.ts`.
 * Edit text here — components render from this file.
 */

export const site = {
  name: 'STRIDESHIFT GLOBAL',
  shortName: 'StrideShift',
  domain: 'strideshift.ai',
  url: 'https://www.strideshift.ai',
  tagline: 'From messy problem to clear action — in days, not months.',
  description:
    'StrideShift is an AI-powered think tank for teams facing complex, open-ended challenges.',
  email: 'hq@strideshift.ai',
};

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Solutions', href: '/#solutions' },
  { label: 'Ideas', href: '/blog' },
  { label: 'Team', href: '/team' },
  { label: 'Contact', href: '/contact' },
];

/* ============================================
   HOMEPAGE — HERO
   ============================================ */
export const hero = {
  eyebrow: 'StrideShift Global',
  title: 'From messy problem to clear action — in days, not months',
  // Kept distinct from the hero subhead — the same "AI-powered think tank…"
  // sentence used to appear in both places on the homepage.
  highlight:
    'Deep strategic experience, amplified by AI — working as an extension of your team.',
  description:
    "The hardest business problems don't come with instruction manuals. They're ambiguous, politically charged, and time-sensitive. Traditional consulting takes too long. Internal teams are stretched too thin. And AI experiments aren't connecting to outcomes that matter.",
  description2:
    'We bridge that gap — combining deep strategic experience with AI capability to help you see clearly and move decisively.',
  ctaLabel: 'Start a conversation',
  secondaryLabel: 'See how we work',
  cardLabel: 'What we hear most',
  cardTitle: 'Sound familiar?',
  cardIntro: "Leaders come to us when they're facing situations like these:",
  problems: [
    'Drowning in data but starving for insight',
    "Team is experimenting with AI but nothing's sticking",
    'Sales cycles lengthening, win rates dropping',
    'AI governance feels like innovation vs. control',
  ],
};

/* ============================================
   STATS — real numbers from the live site
   ============================================ */
// Figures confirmed in the 2026-06-30 team meeting: keep 60+ clients,
// "16 countries, 3 continents" (not "African countries"), thousands of
// problems solved.
export const marqueeStats = [
  { strong: '60+', label: 'Clients' },
  { strong: '16', label: 'Countries' },
  { strong: '3', label: 'Continents' },
  { strong: '23', label: 'AI products shipped' },
  { strong: 'R200M+', label: 'Decisions supported' },
  { strong: '1000s', label: 'Problems solved with AI' },
];

/* ============================================
   THINKING SYSTEMS
   ============================================ */
export const systemSection = {
  eyebrow: 'Our philosophy',
  titlePre: 'We Build ',
  titleHighlight: 'Thinking Systems',
  titlePost: ', Not Just Solutions',
  sub: 'What if your organisation could think faster, see further, and decide with more confidence?',
  cols: [
    {
      label: 'THE CURRENT STATE',
      title: 'The Invisible Architecture',
      body: 'Every business has a cognitive architecture — the invisible system of how information flows, decisions get made, and knowledge compounds over time. Most organisations let this architecture emerge by accident, shaped by legacy systems, organisational silos, and whoever happens to be loudest in the room.',
    },
    {
      label: 'THE STRIDESHIFT DESIGN',
      title: 'Intentional Intelligence',
      body: "We design cognitive architectures intentionally. For each client, we build a custom thinking system that amplifies what your people already do well and fills the gaps that slow you down. The result isn't a dependency on consultants — it's an organisation that thinks better, permanently. That's not AI replacing human intelligence; it's both working together.",
    },
  ],
  quote:
    "We don't deliver insights and walk away. We build the cognitive infrastructure that makes your organisation permanently smarter.",
};

/* ============================================
   CAPABILITIES — 3 core
   ============================================ */
export const capabilities = {
  eyebrow: 'Three core capabilities',
  title: 'How we work alongside you',
  intro:
    'Every engagement combines these three capabilities in different proportions — calibrated to your specific problem and decision timeline.',
  items: [
    {
      n: '01',
      title: "See What You're Missing",
      body: "AI-powered sensing systems that surface opportunities and risks before they're obvious. Market intelligence, tender tracking, competitive signals — structured and delivered when it matters.",
      tags: ['Market intelligence', 'Signal detection', 'Early warning'],
    },
    {
      n: '02',
      title: 'Think Through Complexity',
      body: 'Reasoning tools that help your team explore scenarios, challenge assumptions, and stress-test decisions. Not AI that thinks for you — AI that helps you think better.',
      tags: ['Scenario modelling', 'Assumption testing', 'Decision clarity'],
    },
    {
      n: '03',
      title: 'Act With Confidence',
      body: 'Decision support that connects analysis to action. Customer-specific intelligence for sales. Qualification frameworks for bids. Governance structures for AI adoption.',
      tags: ['Action frameworks', 'Governance', 'Operational integration'],
    },
  ],
};

/* ============================================
   PROBLEM SECTION
   ============================================ */
export const problem = {
  eyebrow: 'What we focus on',
  headline: "We solve problems that don't have obvious answers",
  body: [
    'Most consulting firms excel at problems with known solutions — process optimisation, cost reduction, system implementations. Those have playbooks.',
    "We focus on the other kind: strategic questions where the path forward isn't clear, where you need to think through complexity rather than execute against a template.",
    'These are problems where AI can genuinely amplify human judgment — not replace it, but make it sharper, faster, and more informed. We build the cognitive architecture around each problem, then transfer that capability to your team.',
  ],
  definitionTitle: 'What makes a problem "open-ended"?',
  definitionList: [
    { strong: "It's Ambiguous.", text: ' Reasonable people disagree on what success looks like.' },
    { strong: "It's Interconnected.", text: ' Solutions create new problems elsewhere in the system.' },
    { strong: "It's Time-Pressured.", text: " Waiting for perfect information isn't an option." },
    { strong: "It's Consequential.", text: "  The decision will shape the organisation's trajectory for years." },
  ],
};

/* ============================================
   SHOWCASE — 9 real product cards
   ============================================ */
export const showcase = {
  eyebrow: 'What we build',
  title: 'Our Solutions',
  sub: 'Nine AI products, each built to solve a specific decision problem. All in production. All replacing weeks of manual work.',
  items: [
    {
      n: '01',
      slug: 'ai-advisory',
      category: 'Strategy',
      name: 'AI Advisory',
      problem: '"Leadership wants an AI strategy and I need help building it."',
      solution:
        'We work alongside you to map AI to business outcomes — and build the capabilities to deliver.',
      chips: ['Practical roadmap', 'Quick wins', 'Teams that execute'],
      image:
        'https://static.wixstatic.com/media/b9e36b_9043714e4420416cafc7a3c9cabf0aeb~mv2.png/v1/fill/w_800,h_500,al_c,q_85,enc_avif,quality_auto/b9e36b_9043714e4420416cafc7a3c9cabf0aeb.png',
    },
    {
      n: '02',
      slug: 'cyborg-habits',
      category: 'Capability',
      name: 'Cyborg Habits',
      problem: '"Our team tried AI training but nothing stuck."',
      solution: 'Cyborg Habits builds AI fluency through 10 minutes of daily practice.',
      chips: ['AI-fluent teams', 'Habits that stick', 'Daily practice'],
      image:
        'https://static.wixstatic.com/media/b9e36b_9c591b0fd91d40d8987114fe516d8ef2~mv2.png/v1/fill/w_800,h_500,al_c,q_85,enc_avif,quality_auto/b9e36b_9c591b0fd91d40d8987114fe516d8ef2.png',
    },
    {
      n: '03',
      slug: 'nautilus',
      category: 'Evidence',
      name: 'Nautilus',
      problem: "\"We're drowning in documents and can't prove compliance.\"",
      solution: 'Nautilus turns scattered evidence into structured, auditable insight.',
      chips: ['Complete cases', 'Traceable decisions', 'Calm audits'],
      image:
        'https://static.wixstatic.com/media/b9e36b_fd5a1861c04c468097dc47ee7247a244~mv2.png/v1/fill/w_800,h_500,al_c,q_85,enc_avif,quality_auto/b9e36b_fd5a1861c04c468097dc47ee7247a244.png',
    },
    {
      n: '04',
      slug: 'pov',
      category: 'Sales',
      name: 'POV (Point of View Reports)',
      problem: '"Our sales team keeps losing deals they should win."',
      solution:
        'POV turns generic pitches into customer-specific intelligence — a precision selling engine for your reps.',
      chips: ['Shorter cycles', 'Higher win rates', 'Trusted-advisor reps'],
      image:
        'https://static.wixstatic.com/media/b9e36b_fd77c9dde637476ba16c22959547d796~mv2.png/v1/fill/w_800,h_500,al_c,q_85,enc_avif,quality_auto/b9e36b_fd77c9dde637476ba16c22959547d796.png',
    },
    {
      n: '05',
      slug: 'socratize',
      category: 'Reasoning',
      name: 'Socratize',
      problem: '"We keep solving the wrong problems — or the right problems too late."',
      solution:
        'Socratize is an AI reasoning engine that challenges your framing before you commit resources.',
      chips: ['Better questions', 'Stronger logic', 'Decisions that hold'],
      image:
        'https://static.wixstatic.com/media/b9e36b_975f2e0ffb6743b1931a02142704746b~mv2.png/v1/fill/w_800,h_500,al_c,q_85,enc_avif,quality_auto/b9e36b_975f2e0ffb6743b1931a02142704746b.png',
    },
    {
      n: '06',
      slug: 'tender-render',
      category: 'Bids',
      name: 'Tender Render',
      problem: "\"We're chasing every RFP and winning too few.\"",
      solution:
        'Tender Render finds and qualifies the opportunities worth pursuing — so you bid with conviction.',
      chips: ['Fewer wasted bids', 'Higher win rates', 'Smarter pipeline'],
      image:
        'https://static.wixstatic.com/media/b9e36b_b2197752710e4e22bcf9a2aeb0208e97~mv2.png/v1/fill/w_800,h_500,al_c,q_85,enc_avif,quality_auto/b9e36b_b2197752710e4e22bcf9a2aeb0208e97.png',
    },
    {
      n: '07',
      slug: 'grants-engine',
      category: 'Funding',
      name: 'Grants Engine',
      problem:
        "\"We know there's funding out there. We just can't keep up with the search, the scoring, and the writing.\"",
      solution:
        'Grants Engine turns fragmented funder research into a managed pipeline — scoring eligibility, tracking deadlines, and drafting applications that sound like you.',
      chips: ['More applications on time', 'Higher hit rates', 'Teams freed from admin'],
      image:
        'https://static.wixstatic.com/media/92001e_75c3cde2368e48b3a9d8308d055c48bc~mv2.jpeg/v1/fill/w_800,h_500,al_c,q_85,enc_avif,quality_auto/92001e_75c3cde2368e48b3a9d8308d055c48bc.jpeg',
    },
    {
      n: '08',
      slug: 'lead-sleuth',
      category: 'Pipeline',
      name: 'Lead Sleuth',
      problem:
        "\"Our reps are burning hours on outreach that doesn't convert. We need to know which accounts are actually in motion.\"",
      solution:
        'Lead Sleuth senses the market continuously, surfaces accounts moving toward a decision, and hands your team a prioritised pipeline with the right opener for each contact.',
      chips: ['Higher meeting conversion', 'Faster first conversation', 'Sustainable pipeline'],
      image:
        'https://static.wixstatic.com/media/92001e_b22c45e2330a44a5b936ee60095c9db8~mv2.jpeg/v1/fill/w_800,h_500,al_c,q_85,enc_avif,quality_auto/92001e_b22c45e2330a44a5b936ee60095c9db8.jpeg',
    },
    {
      n: '09',
      slug: 'battle-pack',
      category: 'Enablement',
      name: 'Battle Pack',
      problem:
        '"We keep rebuilding the same decks from scratch for every deal. The pitch is only as good as the rep who made it."',
      solution:
        'Battle Pack turns account intelligence into ready-to-run sales assets — decks, objection frameworks, and competitive positioning built for the specific account in front of you.',
      chips: ['Less deck rebuilding', 'Sharper conversations', 'Consistent messaging'],
      image:
        'https://static.wixstatic.com/media/92001e_f0125e3cf494482dae92fedabbab12a3~mv2.jpeg/v1/fill/w_800,h_500,al_c,q_85,enc_avif,quality_auto/92001e_f0125e3cf494482dae92fedabbab12a3.jpeg',
    },
  ],
};

/* ============================================
   CTA
   ============================================ */
export const cta = {
  bgText: 'Connect',
  title: 'Get Started',
  headline: 'Ready to discover hidden opportunities?',
  sub: 'Join hundreds of forward-thinking companies that have already partnered with StrideShift Global to unlock growth potential.',
  buttonLabel: 'Get Started',
  buttonHref: '/contact',
};

/* ============================================
   TESTIMONIALS
   ============================================ */
export const testimonials = [
  {
    quote:
      "In today's market, you either evolve or get left behind. They gave us the AI insights we needed to not just keep up, but lead our industry.",
    name: 'CEO',
    role: 'Logistics Enterprise',
    initials: '01',
  },
  {
    quote:
      'We had 3 weeks to decide on a R200M acquisition. StrideShift helped us model 12 scenarios and pressure-test our assumptions. We found a dealbreaker.',
    name: 'CFO',
    role: 'Private Equity Portfolio Company',
    initials: '02',
  },
  {
    quote:
      "The Cyborg Habits program did what two years of workshops couldn't — our team actually uses AI now. Daily. Without being reminded.",
    name: 'Chief Digital Officer',
    role: 'Financial Services',
    initials: '03',
  },
];

/* ============================================
   ABOUT PAGE
   ============================================ */
export const aboutPage = {
  eyebrow: 'Who we are',
  title: 'About Us',
  tagline:
    'Strategic thinking partners for leaders navigating complexity — where deep expertise meets AI-powered reasoning.',
  storyTitle: "We've sat where you sit.",
  storySub:
    "StrideShift was founded by people who've spent decades in the trenches — building platforms, advising boards, and making the kinds of decisions that keep you up at night. We built the company we wished existed when we were in your shoes.",
  storyCards: [
    {
      n: '01',
      label: 'The problem we kept seeing',
      title: 'Two bad options',
      body: 'Leaders facing complex decisions were stuck between two bad options: move fast and risk getting it wrong, or wait for months of analysis whilst opportunities slipped away.',
    },
    {
      n: '02',
      label: 'What we realised',
      title: 'AI changes the equation',
      body: 'AI could fundamentally change this equation — not by replacing human judgement, but by giving leaders the power to think through complexity faster, test scenarios in hours instead of weeks, and see patterns that would otherwise stay hidden.',
    },
    {
      n: '03',
      label: 'What we built',
      title: 'Your thinking partner',
      body: "StrideShift combines deep strategic expertise with AI-powered reasoning to help you make better decisions, faster. We're not just advisors telling you what to think — we're partners helping you think more clearly about what matters most.",
    },
  ],
  comparisonEyebrow: 'The difference',
  comparisonTitle: "How we're different",
  comparison: [
    { traditional: 'Weeks of discovery before any insight', strideshift: 'Working prototypes and insights in days' },
    { traditional: 'Polished decks that sit in drawers', strideshift: 'Tools and capabilities your team keeps using' },
    { traditional: 'Creates dependency on the consultants', strideshift: 'Transfers knowledge so you can run without us' },
    { traditional: 'Theoretical frameworks', strideshift: 'Practical solutions with measurable outcomes' },
  ],
  credentialsEyebrow: 'What we bring',
  credentialsTitle: 'Our credentials',
  credentials: [
    { n: '01', title: 'Enterprise technology expertise', body: "Decades building and scaling enterprise technology — we've lived the complexity you're navigating." },
    { n: '02', title: 'Advisory at scale', body: 'Led advisory practices at global technology companies — we know what it takes to deliver results at scale.' },
    { n: '03', title: 'Behavioural science depth', body: 'Deep expertise in behavioural science — because technology adoption is a people problem, not a tech problem.' },
    { n: '04', title: 'Measurable AI impact', body: 'Built AI solutions that drive measurable business impact — not just interesting experiments.' },
  ],
  ctaTitle: "Let's make better decisions together",
  ctaSub:
    "Whether you're navigating an AI strategy, a high-stakes decision, or something in between — we're ready to think alongside you.",
};

/* ============================================
   TEAM PAGE
   ============================================ */
export const teamPage = {
  eyebrow: 'The team',
  title: 'Meet the Team',
  tagline:
    'AI specialists, strategists, and technologists bringing decades of experience in artificial intelligence, enterprise transformation, and human-centred design.',
  mission:
    "We're here to help you solve your most complex challenges.",
  members: [
    {
      initials: 'SG',
      name: 'Stephen Green',
      role: 'Enterprise AI & Customer Success',
      bio: 'Former CTO of Dimension Data, then NTT UK/Ireland. 30 years of enterprise technology experience. Expert in AI-enhanced decision systems.',
      photo:
        'https://static.wixstatic.com/media/b9e36b_8ca85961a47c4b359d18039a27be162c~mv2.jpeg/v1/fill/w_853,h_1280,al_c,q_85,enc_avif,quality_auto/WhatsApp%20Image%202025-02-14%20at%2009_18_21%20(2).jpeg',
    },
    {
      initials: 'BD',
      name: 'Barbara Dale-Jones',
      role: 'AI & Learning Systems Design',
      bio: 'Specialist in capability building. Leader in organisational development.',
      photo:
        'https://static.wixstatic.com/media/b9e36b_9644f2173e2c42a589f8dea20a0f151e~mv2.jpeg/v1/fill/w_942,h_1280,al_c,q_85,enc_avif,quality_auto/WhatsApp%20Image%202025-02-14%20at%2009_18_23.jpeg',
    },
    {
      initials: 'JG',
      name: 'Justin Germishuys',
      role: 'AI Systems Reasoning Architect',
      bio: 'Behavioural scientist and systems architect. Expert in human-AI collaboration. Designer of advanced reasoning systems.',
      photo:
        'https://static.wixstatic.com/media/b9e36b_b5bd927adaae46b4a712daa6926f90cd~mv2.jpeg/v1/fill/w_980,h_866,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Justin%202025.jpeg',
    },
    {
      initials: 'AJ',
      name: 'Alison Jacobson',
      role: 'AI-Enabled Strategy',
      bio: 'Led digital transformation for global enterprises. Pioneer in outcomes-based strategy. Expert in organisational learning and human-AI augmentation.',
      photo:
        'https://static.wixstatic.com/media/b9e36b_1dc0c8f0aab3406ba150eec8926f5e49~mv2.png/v1/fill/w_400,h_400,al_c,q_85,enc_avif,quality_auto/Alison%20b%26w.png',
    },
    {
      initials: 'SS',
      name: 'Shanne Saunders',
      role: 'AI Projects Manager',
      bio: 'Client liaison. AI project controls and reporting.',
      photo:
        'https://static.wixstatic.com/media/b9e36b_4452da4877324efa94b7b2d0c3cecd6f~mv2.jpg/v1/fill/w_358,h_358,al_c,q_80,enc_avif,quality_auto/shanne1_edited.jpg',
    },
    {
      initials: 'JB',
      name: 'Johannes Backer',
      role: 'AI Analyst Developer',
      bio: 'Changing the world one prompt at a time. Cyborg Skills coach.',
      photo:
        'https://static.wixstatic.com/media/b9e36b_6fe4f7568e0e4444b9b6147ca47e80bf~mv2.jpeg/v1/fill/w_960,h_1280,al_c,q_85,enc_avif,quality_auto/WhatsApp%20Image%202025-02-14%20at%2009_18_21.jpeg',
    },
    {
      initials: 'KS',
      name: 'Kiyasha Singh',
      role: 'Junior AI Analyst Developer & Project Manager',
      bio: 'Rapid AI prototyping & automation. Cyborg Skills coach.',
      photo:
        'https://static.wixstatic.com/media/b9e36b_c30110a0b9574d4f84b16340afa96fab~mv2.jpeg/v1/fill/w_960,h_1280,al_c,q_85,enc_avif,quality_auto/WhatsApp%20Image%202025-02-14%20at%2012_03_08.jpeg',
    },
    {
      initials: 'AI',
      name: 'Cornelia',
      role: 'AI Agent · Enterprise Intelligence — paired with Stephen Green',
      bio: "Stephen's AI counterpart. Cornelia scans markets around the clock, tracks the signals that matter, and turns raw noise into decision-ready briefs — the always-on half of an enterprise intelligence partnership.",
      photo: '/team/cornelia.svg',
    },
    {
      initials: 'AI',
      name: 'Juno Finn',
      role: 'AI Agent · Reasoning Systems — paired with Justin Germishuys',
      bio: "Justin's AI counterpart. Juno Finn stress-tests arguments, hunts hidden assumptions, and runs structured reasoning at machine speed — a devil's advocate that never gets tired.",
      photo: '/team/juno-finn.svg',
    },
  ],
  ctaTitle: 'Work alongside us',
  ctaSub:
    "Whether you're after a thinking partner, a strategic advisor, or a hands-on team to help you build — we'd love to hear what you're working on.",
};

/* ============================================
   CONTACT PAGE
   ============================================ */
export const contactPage = {
  eyebrow: 'Get in touch',
  title: "Let's talk.",
  tagline:
    "About what's keeping you up at night. Tell us the challenge you're facing — we'll listen first, then show you whether and how we can help. No pitch decks. No pressure.",
  contactLines: [
    { label: 'Email', value: 'hq@strideshift.ai' },
    { label: 'Hours', value: 'Mon – Fri, by appointment' },
  ],
};

/* ============================================
   IDEAS / BLOG
   ============================================ */
export type StridePost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  displayDate: string;
  readingMinutes: number;
  image: string;
  body: { type: 'h2' | 'p' | 'quote' | 'h3'; text: string }[];
};

export const posts: StridePost[] = [
  {
    slug: 'the-most-dangerous-assumption-in-business-right-now',
    title:
      'The Most Dangerous Assumption in Business Right Now Will Not Be Found in Your Board Pack',
    excerpt:
      'The board packs are clean. The dashboards are green. The dangerous assumption is the one nobody is asking out loud.',
    date: '2026-03-16',
    displayDate: 'Mar 16, 2026',
    readingMinutes: 3,
    image:
      'https://static.wixstatic.com/media/92001e_7c93a67dd3e645b9bfa7e5b04f78443f~mv2.png/v1/fill/w_1200,h_700,fp_0.50_0.50,q_85,enc_avif,quality_auto/thumb.png',
    body: [
      { type: 'p', text: 'The board pack tells you the story your team thinks you want to hear. The dangerous assumption — the one that quietly underpins the strategy — is rarely in the slide deck. It is in the room.' },
      { type: 'p', text: 'Every leadership team we work with has at least one assumption that nobody has named out loud. Sometimes it is about the customer. Sometimes about the market. Sometimes about the team itself. It survives because it is impolite to name.' },
      { type: 'h2', text: 'How to find it' },
      { type: 'p', text: 'Ask the team to write down, anonymously, the one thing they believe to be true about the strategy that they would not say in an exec meeting. Then read them aloud. The patterns are usually obvious within five minutes.' },
      { type: 'quote', text: 'The dangerous assumption is rarely hidden. It is just unspoken.' },
    ],
  },
  {
    slug: 'technology-isnt-your-constraint',
    title: "Technology isn't your constraint.",
    excerpt:
      "Most leaders blame the stack. The real constraint sits one layer above — in how decisions get made, owned, and revisited.",
    date: '2026-02-19',
    displayDate: 'Feb 19, 2026',
    readingMinutes: 2,
    image:
      'https://static.wixstatic.com/media/b9e36b_f03e3361982340aba1c71a215c9ba7ce~mv2.png/v1/fill/w_1200,h_700,fp_0.50_0.50,q_85,enc_avif,quality_auto/thumb.png',
    body: [
      { type: 'p', text: 'When something is not working, it is comforting to blame the system. The CRM is wrong. The data is dirty. The pipeline is broken. These things may all be true. They are almost never the actual constraint.' },
      { type: 'p', text: 'The constraint is upstream of the tools: who decides, on what evidence, by when, and who reviews the call afterwards. Get that right and average tooling delivers excellent outcomes. Get it wrong and the best stack in the world cannot save you.' },
      { type: 'h2', text: 'A simple test' },
      { type: 'p', text: 'Look at your last three strategic decisions. Could you name, for each one: who owned it, what evidence they used, and when it will be reviewed? If the answer is fuzzy for any of them, the problem is not the technology.' },
    ],
  },
  {
    slug: 'ai-driven-execution-the-emperors-new-code',
    title: "AI-Driven Execution: The Emperor's New Code",
    excerpt:
      "Everyone is shipping AI features. Almost nobody is shipping AI outcomes. The gap is execution, not capability.",
    date: '2025-02-21',
    displayDate: 'Feb 21, 2025',
    readingMinutes: 2,
    image:
      'https://static.wixstatic.com/media/b9e36b_7673ccbf2df0443b8ca9972b4329a009~mv2.png/v1/fill/w_1200,h_700,fp_0.50_0.50,q_85,enc_avif,quality_auto/thumb.png',
    body: [
      { type: 'p', text: 'Every leadership team is talking about AI execution. Very few are doing it. The conversation has run far ahead of the practice — and a lot of the practice is theatre.' },
      { type: 'p', text: "We have watched proud demos that did not survive five minutes of real use. We have watched 'AI roadmaps' that are really just lists of vendors. We have watched teams confuse buying a licence for shipping a capability." },
      { type: 'h2', text: 'What real AI execution looks like' },
      { type: 'p', text: 'It looks unglamorous. It looks like one team, one workflow, one measurable outcome, instrumented end-to-end. It looks like the same team learning from that loop and applying it to the next one. It looks boring from the outside and transformative from the inside.' },
      { type: 'quote', text: 'AI is a force multiplier. It multiplies whatever you point it at — including dysfunction.' },
    ],
  },
];

export const ideasPage = {
  eyebrow: 'Our ideas',
  title: 'Thinking out loud',
  sub: 'Writing on AI, decisions, and the way organisations actually think.',
};

/* ============================================
   SOLUTION DETAIL PAGES
   ============================================ */
export type Solution = {
  slug: string;
  name: string;
  category: string;
  /** YouTube embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID). Leave blank to show the branded placeholder. */
  videoUrl?: string;
  /** One-line tagline shown above the video. */
  videoTagline?: string;
  hero: { eyebrow?: string; title: string; lede?: string; image?: string };
  intro?: { title?: string; body?: string };
  who?: { title: string; intro?: string; items: string[]; image?: string };
  process?: { n: string; title: string; body: string }[];
  how?: { title?: string; tagline?: string; lead?: string; h4?: string; items?: string[] };
  changes?: { before: string; after: string };
  does?: { title?: string; lead?: string; features?: { title: string; body: string }[]; closing?: string };
  outcome?: { title?: string; cards?: { title: string; body: string }[] };
  deliverables?: string[];
  problem?: { title?: string; body: string[]; image?: string };
  replacesGet?: {
    replacesTitle?: string;
    replaces: string[];
    getTitle?: string;
    get: string[];
  };
  howBody?: { title?: string; body: string };
  metrics?: { title?: string; items: string[] };
  packaging?: { title?: string; body: string; cta?: string };
  why?: { title?: string; body?: string };
  final?: { title?: string; body?: string };
  cta?: { title?: string; sub?: string };
};

export const solutions: Solution[] = [
  {
    slug: 'ai-advisory',
    name: 'AI Advisory',
    category: 'Strategy',
    hero: {
      eyebrow: 'AI Advisory',
      title: 'Strategy that actually works.',
      lede: "Your board is asking about AI. Your competitors are making moves. Your team has ideas but no clear path forward. You need a strategy — and you need it to actually work, not just look good in a deck.",
      image: 'https://static.wixstatic.com/media/b9e36b_5fe3743988a949ee9a8ff3b0b096eae3~mv2.png',
    },
    intro: {
      title: 'Stop guessing where AI fits. Start knowing.',
      body: 'We help leadership teams cut through the AI hype and build strategies that deliver real business outcomes — with working prototypes to prove it.',
    },
    who: {
      title: 'Who this is for',
      intro: "You're a good fit for AI Advisory if:",
      items: [
        'Leadership is asking "what\'s our AI strategy?" and you need a credible answer.',
        "You've seen AI demos but can't connect them to your actual business problems.",
        'Your team has pockets of AI experimentation but no coherent direction.',
        "You're facing a major strategic decision and want AI-powered analysis to inform it.",
        "You've been burned by consultants before and want partners who deliver, not just advise.",
      ],
      image: 'https://static.wixstatic.com/media/92001e_6d65706f6d8c42e4b29f83d72eac2c39~mv2.png',
    },
    process: [
      { n: '01', title: 'Week 1 — Find the real opportunities', body: 'We dig into your business to identify where AI can actually move the needle — not generic use cases, but specific opportunities tied to your strategy and pain points.' },
      { n: '02', title: 'Weeks 2–3 — Build and test', body: "We create working prototypes for the highest-impact opportunities. You'll see AI solving your actual problems, not hypothetical demos. We iterate based on what we learn." },
      { n: '03', title: 'Week 4+ — Scale what works', body: 'We help you take proven concepts to full implementation — building internal capabilities so you can sustain momentum without us.' },
    ],
    deliverables: [
      'A clear AI roadmap tied to your business priorities, not generic frameworks.',
      'Working prototypes that prove value before you invest heavily.',
      'Internal capability building so your team can keep going without us.',
      'Executive-ready materials to communicate the strategy to your board and leadership.',
      'Ongoing advisory access as you implement and questions arise.',
    ],
    why: { title: 'Not AI theorists. Practitioners.', body: "We've built and scaled enterprise technology. We've sat in your seat, made these decisions, and know what it takes to move from strategy to execution. Our approach combines deep business acumen with cutting-edge AI capability — delivered at the speed your business demands." },
    cta: { title: 'Ready to build a real AI strategy?', sub: "Tell us where you are and where you want to get to. We'll show you whether and how we can help — no pitch decks, no pressure." },
  },
  {
    slug: 'cyborg-habits',
    name: 'Cyborg Habits',
    category: 'Capability',
    hero: {
      eyebrow: 'Cyborg Habits',
      title: 'Cyborg Habits: AI training that actually sticks.',
      lede: 'Cyborg Habits builds AI fluency through daily practice — 10 minutes a day for 3 weeks. Not theory. Not demos. Real habits that transform how your team thinks and works.',
      image: 'https://static.wixstatic.com/media/b9e36b_55c1adbe317242c7ab3cdf990f472355~mv2.png',
    },
    intro: { title: 'Training that fades. Habits that stick.', body: "You've sent your team to AI training. They learned prompts, got excited, and then... went back to doing things the old way. The workshop didn't stick. The tools are there, but nobody's using them." },
    who: {
      title: 'Who This Is For',
      intro: 'Cyborg Habits is right for you if:',
      items: [
        "Your team has access to AI tools but isn't really using them",
        "Previous training was interesting but didn't change behaviour",
        'You want people to think differently, not just learn new tools',
        'You need adoption to happen without heavy-handed mandates',
        'Your team is too busy for another multi-day workshop',
      ],
      image: 'https://static.wixstatic.com/media/92001e_d919a413af2742a7b7af31e528c7b7ad~mv2.jpg',
    },
    how: {
      title: 'How It Works',
      tagline: '10 minutes a day. 15 days. 7 habits.',
      lead: 'Each day, your team tackles a micro-challenge anchored in real work — drafting a strategy memo, testing a customer scenario, refining a budget forecast. The exercises are designed around habit formation science, not just information transfer.',
      h4: 'The 7 Habits of Highly Effective Cyborgs:',
      items: [
        'Framing the right questions',
        'Spotting hidden assumptions',
        'Reasoning through complexity',
        'Generating creative alternatives',
        'Automating the routine',
        'Validating with evidence',
        'Deciding with confidence',
      ],
    },
    changes: {
      before: '"I know AI could help but I\'m not sure how to use it for my actual work."',
      after: "\"I automatically think 'how could AI help here?' — and I know how to make it happen.\"",
    },
    final: { title: 'Real Habits. Real Results.', body: "The programme costs a fraction of traditional training, takes less time, and delivers results that actually persist. Because it's built on how habits really form — through small, consistent actions tied to real work." },
    cta: { title: 'Want AI habits that actually stick?', sub: "Tell us about your team and where AI adoption has stalled. We'll show you whether Cyborg Habits is the right fit." },
  },
  {
    slug: 'nautilus',
    name: 'Nautilus',
    category: 'Evidence',
    hero: {
      eyebrow: 'Nautilus',
      title: 'Evidence scattered. Confidence lost.',
      lede: 'You\'re drowning in documents. Evidence is scattered across emails, folders, and systems. When an auditor asks "can you prove compliance for requirement 4.2?", you spend hours hunting. Every case feels like starting from scratch. We have the solution: introducing Nautilus.',
      image: 'https://static.wixstatic.com/media/b9e36b_fd5a1861c04c468097dc47ee7247a244~mv2.png',
    },
    intro: { title: "Stop hunting for evidence. Start knowing it's there.", body: 'Nautilus turns scattered documents into structured, traceable, auditable insight. Every requirement linked to its proof. Every decision grounded in evidence.' },
    who: {
      title: 'Who This Is For',
      intro: 'Nautilus solves a problem for you if:',
      items: [
        'You manage large volumes of applications, contracts, or compliance evidence',
        'Proving compliance takes too long and involves too much manual work',
        "Audits create anxiety because you're never sure everything is in order",
        'Your team wastes time hunting for documents that should be easy to find',
        "Decisions are challenged because the reasoning isn't traceable",
      ],
      image: 'https://static.wixstatic.com/media/b9e36b_54c821741e7c40c2a94657068fe128c4~mv2.png',
    },
    process: [
      { n: '01', title: 'Collect & Organise', body: 'Gather all required documents, data points, and references into one intelligent workspace.' },
      { n: '02', title: 'Match & Link', body: 'Connect each requirement or claim to its supporting evidence. See gaps instantly.' },
      { n: '03', title: 'Review & Verify', body: 'Automated consistency and completeness checks flag issues before submission.' },
      { n: '04', title: 'Report & Defend', body: 'Generate clear evidence packs for stakeholders, auditors, or regulators. Every decision traceable.' },
    ],
    outcome: {
      title: 'The Outcome',
      cards: [
        { title: 'Fewer manual errors', body: 'Gaps and inconsistencies caught automatically' },
        { title: 'Faster reviews', body: 'Stop hunting for documents' },
        { title: 'Audit confidence', body: 'Every item linked to its evidence' },
        { title: 'Defensible decisions', body: 'Complete audit trail for how each conclusion was reached' },
      ],
    },
    cta: { title: 'Ready to make compliance defensible?', sub: "Tell us about the documents you're drowning in. We'll show you how Nautilus turns them into auditable insight." },
  },
  {
    slug: 'pov',
    name: 'POV',
    category: 'Sales',
    hero: {
      eyebrow: 'POV — Point of View Reports',
      title: 'Generic Pitches Are Costing You Deals',
      lede: "Your sales team knows the product, but they're walking into meetings with generic decks. They can't articulate why this customer specifically should care. Deals stall. Competitors with weaker products win because they understood the buyer better. Introducing your competitive advantage: POV.",
      image: 'https://static.wixstatic.com/media/b9e36b_fd77c9dde637476ba16c22959547d796~mv2.png',
    },
    intro: { title: 'Stop pitching products. Start solving problems.', body: 'POV generates customer-specific intelligence for every meeting — mapping what your customer is trying to achieve to what you can deliver. Your team walks in with sharper questions, faster alignment, and a clear value narrative.' },
    who: {
      title: 'Who This Is For',
      intro: 'POV is built for you if:',
      items: [
        'Your sales cycle is too long and deals stall at the wrong stages',
        'Reps struggle to articulate differentiated value for each customer',
        "You're losing to competitors who seem to 'get' the customer better",
        "Your win rate doesn't reflect the quality of your product",
        "Customer research takes too long and doesn't translate to better conversations",
      ],
      image: 'https://static.wixstatic.com/media/b9e36b_9b71e5f9a80c4c90b02b441c03598500~mv2.png',
    },
    does: {
      title: 'What POV Does',
      lead: 'Before each meeting, POV generates a customer-specific intelligence report:',
      features: [
        { title: 'Jobs to be done', body: 'What is this customer actually trying to achieve?' },
        { title: 'Pain points', body: "What's getting in their way?" },
        { title: 'Capability match', body: 'Which of your capabilities directly address their needs?' },
        { title: 'White space', body: "Where are the opportunities they haven't thought of yet?" },
        { title: 'Conversation guide', body: 'Questions to ask, points to make, objections to anticipate' },
      ],
      closing: 'Each report is a precision instrument — AI-driven clarity that turns generic pitches into customer-specific value propositions.',
    },
    outcome: {
      title: 'The Outcome',
      cards: [
        { title: 'Shorter sales cycles', body: 'Alignment happens faster when you speak their language' },
        { title: 'Higher win rates', body: 'Compete on insight, not just features' },
        { title: 'Bigger deals', body: "Find opportunities the customer didn't know they had" },
        { title: 'Trusted advisor positioning', body: 'Reps who sound like partners, not vendors' },
      ],
    },
    cta: { title: 'Ready to compete on insight?', sub: "Tell us about your sales motion and where deals are stalling. We'll show you whether POV is the right fit." },
  },
  {
    slug: 'socratize',
    name: 'Socratize',
    category: 'Reasoning',
    hero: {
      eyebrow: 'Socratize',
      title: "Don't solve the wrong problem precisely.",
      lede: 'Socratize is an AI reasoning engine that challenges how you frame problems before you commit. It interrogates assumptions, reveals blind spots, and ensures your decisions stand up to scrutiny.',
      image: 'https://static.wixstatic.com/media/b9e36b_54c821741e7c40c2a94657068fe128c4~mv2.png',
    },
    intro: { title: 'Are You Solving the Right Problem?', body: "You're about to commit significant resources to solving a problem. But is it the right problem? Are your assumptions solid? Your team agrees with the plan — but is that alignment or groupthink?" },
    who: {
      title: 'Who This Is For',
      intro: 'Socratize helps if:',
      items: [
        "You're facing a high-stakes decision with incomplete information",
        "Your team is too aligned — you worry there's no one playing devil's advocate",
        'Past initiatives failed because you realised too late you were solving the wrong problem',
        'You need to present a recommendation that will face tough questions',
        'Complex stakeholder dynamics make it hard to get honest pushback',
      ],
      image: 'https://static.wixstatic.com/media/b9e36b_215378a67d0f489981e215a51cfb846c~mv2.png',
    },
    does: {
      title: 'What Socratize Does',
      features: [
        { title: 'Problem Reframing', body: "Surfaces alternative ways to define the problem. What if the real issue isn't what you think it is?" },
        { title: 'Assumption Testing', body: "Identifies hidden assumptions in your analysis. Which ones would break your conclusion if they're wrong?" },
        { title: 'Multi-Perspective Analysis', body: 'Examines the situation from different stakeholder viewpoints, disciplines, and time horizons.' },
        { title: "Devil's Advocate", body: "Builds the strongest case against your proposal. If you can't defend against it, you're not ready." },
        { title: 'Decision Framework', body: 'Produces structured chains of reasoning you can use to communicate and defend your conclusions.' },
      ],
    },
    outcome: {
      title: 'The Outcome',
      cards: [
        { title: 'Better framed problems', body: 'Solve the right thing the first time' },
        { title: 'Stronger logic', body: 'Decisions that hold up under scrutiny' },
        { title: 'Reduced risk', body: 'Hidden assumptions exposed before they become expensive lessons' },
        { title: 'Credible recommendations', body: 'Walk into the boardroom ready for hard questions' },
      ],
    },
    cta: { title: 'Want decisions that hold up?', sub: "Tell us about the call you're about to make. We'll show you whether Socratize is the right pressure test." },
  },
  {
    slug: 'tender-render',
    name: 'Tender Render',
    category: 'Bids',
    hero: {
      eyebrow: 'Tender Render',
      title: 'Your Bid Team Is Burning Out',
      lede: "Your bid team is overwhelmed. Every RFP feels like a fire drill. You're responding to opportunities you probably won't win, while missing ones that fit perfectly. Your win rate is stuck, and your best people are burning out.",
      image: 'https://static.wixstatic.com/media/b9e36b_b2197752710e4e22bcf9a2aeb0208e97~mv2.png',
    },
    intro: { title: 'Stop chasing every tender. Start winning the right ones.', body: 'Tender Render finds, qualifies, and prioritises opportunities that match your strengths. Fewer wasted bids. Higher win rates. A pipeline that works as intelligently as you do.' },
    who: {
      title: 'Who This Is For',
      intro: 'Tender Render is for you if:',
      items: [
        "You're responding to too many tenders and winning too few",
        'Bid/no-bid decisions are based on gut feel rather than data',
        'You find out about good opportunities too late',
        'Your bid team is reactive instead of strategic',
        "Proposal quality suffers because there's never enough time",
      ],
      image: 'https://static.wixstatic.com/media/b9e36b_c6f4a17e38334e32afba08d85386e662~mv2.png',
    },
    process: [
      { n: '01', title: 'Smart Opportunity Scanning', body: 'Continuously monitors opportunity sources and identifies relevant tenders early — before your competitors see them.' },
      { n: '02', title: 'Fit Analysis', body: 'Matches each opportunity against your capabilities, track record, and strategic priorities. Scores and ranks so you focus on winners.' },
      { n: '03', title: 'Competitive Intelligence', body: "Analyses who you're up against and what it will take to win. No more blind bidding." },
      { n: '04', title: 'Response Acceleration', body: 'Generates proposal frameworks customised to each opportunity. Your team starts further ahead.' },
    ],
    outcome: {
      title: 'The Outcome',
      cards: [
        { title: 'Higher win rates', body: 'Compete where you have real advantage' },
        { title: 'Less wasted effort', body: 'Stop pursuing bad-fit opportunities' },
        { title: 'Earlier visibility', body: 'More time to build winning proposals' },
        { title: 'Strategic pipeline', body: 'Bid office becomes a competitive advantage' },
        { title: 'Better proposals', body: 'More time per opportunity means higher quality' },
      ],
    },
    cta: { title: 'Want a bid pipeline that actually wins?', sub: "Tell us about your tender flow and where the team is burning out. We'll show you whether Tender Render is the right fit." },
  },
  {
    slug: 'grants-engine',
    name: 'Grants Engine',
    category: 'Funding',
    hero: {
      eyebrow: 'Grants Engine',
      title: 'Funding intelligence for stronger grant pipelines.',
      lede: 'Find the right funders faster. Focus on the applications you have a credible chance of winning. Reduce the admin drag that makes grant work feel like second-shift work.',
      image: 'https://static.wixstatic.com/media/92001e_75c3cde2368e48b3a9d8308d055c48bc~mv2.jpeg',
    },
    intro: {
      title: 'A funding pipeline, not another season of grant chasing.',
      body: "Grants Engine is an AI funding intelligence system built for organisations that rely on grant funding but struggle with fragmented research, missed deadlines, and inconsistent submission quality. It scans funder landscapes, scores eligibility against your real programme profile, tracks deadlines, and generates application-ready material — so your best people can do the thinking, not the chasing.",
    },
    problem: {
      title: 'The problem it solves',
      body: [
        "Most grant teams live inside a broken loop: scattered spreadsheets of potential funders, a calendar that only remembers the deadlines you already missed, and proposal writing that starts from a blank page every time even though you've made the same case before. The result is fewer applications submitted, uneven quality across submissions, and a leadership team that spends more time on funding admin than on the work the funding is meant to enable.",
      ],
      image: 'https://static.wixstatic.com/media/b9e36b_215378a67d0f489981e215a51cfb846c~mv2.png',
    },
    replacesGet: {
      replacesTitle: 'What it replaces',
      replaces: [
        'Manual grant research across fragmented public and private sources',
        'Late or missed application cycles',
        'Repeated rewriting of the same proposal sections',
        'Guesswork about which opportunities are genuinely worth pursuing',
      ],
      getTitle: 'What you get',
      get: [
        'A matched funder universe with relevance and eligibility scoring',
        'A live deadline calendar and application workflow tracker',
        'Compliance notes and documentation requirements mapped per funder',
        'Draft application sections, cover notes, and outreach letters',
        'A repeatable funding pipeline — not another season of one-off grant chasing',
      ],
    },
    howBody: {
      title: 'How it works',
      body: "Grants Engine ingests funder data from across public and private opportunity sources and models eligibility against your organisation's actual profile — geography, programme focus, compliance posture, track record. A vectorised memory layer holds your prior applications, programme narratives, and funder preferences, so every new submission starts from what you've already built. Agents draft sections, cover notes and responses in your voice, and a structured output layer produces calendars, opportunity scores, and application documents ready for review.",
    },
    metrics: {
      title: 'What we measure',
      items: [
        'Match score accuracy',
        'Submission volume per cycle',
        'Deadline adherence',
        'Application turnaround time',
        'Success rate by funder type and programme category',
      ],
    },
    packaging: {
      title: 'Packaging',
      body: 'Grants Engine is offered in Starter, Growth, and Scale tiers — capped at two, ten, and thirty active grants respectively. It runs as a standalone product or bundled inside a Target Intel engagement. NGO pricing available.',
      cta: 'Run a Grants Sprint',
    },
    cta: { title: 'Want a grant pipeline that actually closes?', sub: "Tell us about your funder universe and the bottleneck. We'll show you whether Grants Engine fits." },
  },
  {
    slug: 'lead-sleuth',
    name: 'Lead Sleuth',
    category: 'Pipeline',
    hero: {
      eyebrow: 'Lead Sleuth',
      title: 'Psychographic lead intelligence for revenue teams.',
      lede: "Stop running lists. Start reading the market. Lead Sleuth is an always-on sensing system that identifies the accounts actively moving toward a decision, maps the stakeholders shaping it, and produces outreach that reflects what is actually happening inside the account.",
      image: 'https://static.wixstatic.com/media/92001e_b22c45e2330a44a5b936ee60095c9db8~mv2.jpeg',
    },
    intro: {
      title: 'Built for revenue teams who can see the ICP but not the motion.',
      body: "It is built for revenue teams who know their ideal customer profile but can't see who inside that profile is in motion today — and who are tired of the shotgun outreach that comes from not knowing.",
    },
    problem: {
      title: 'The problem it solves',
      body: [
        'Most prospecting is archaeology. Reps dig through static lists, research each account by hand, write cold notes that land with the subtlety of a cold note, and call it pipeline. Meanwhile the real signals — a funding round, a leadership change, a tender they just lost, a platform they just enabled — sit in plain sight in the open web, uncaptured. Lead Sleuth closes that gap. It does the sensing and the synthesis, so your reps spend their hours on the conversations that are actually available to be had.',
      ],
      image: 'https://static.wixstatic.com/media/b9e36b_215378a67d0f489981e215a51cfb846c~mv2.png',
    },
    replacesGet: {
      replacesTitle: 'What it replaces',
      replaces: [
        "List-based prospecting that goes stale the day it's built",
        "Manual account research that can't scale past the top of the list",
        "Cold outreach with no basis in what's happening inside the account",
        'Fragmented CRM data that describes yesterday, not today',
      ],
      getTitle: 'What you get',
      get: [
        'A continuously refreshed account universe tuned to your ICP',
        'Intent-weighted prioritisation so reps know where to spend the next hour',
        'A stakeholder graph showing who matters on each decision',
        "Trigger-based outreach sequences that land because they're timed to what just changed",
        'Next-best-action recommendations per account, refreshed as the account moves',
      ],
    },
    howBody: {
      title: 'How it works',
      body: 'Lead Sleuth pulls signals from across the open web, company data sources, your CRM, news feeds, and behavioural indicators. A signal detection layer identifies intent patterns, anomalies, and strategic triggers. An entity resolution engine stitches it all into a live account graph, with a vectorised memory layer holding the history of each account relationship. Agents reason over the whole picture to produce prioritisation, messaging, sequences, and CRM updates your team will actually use.',
    },
    metrics: {
      title: 'What we measure',
      items: [
        'Signal precision',
        'Account relevance score',
        'Engagement rate',
        'Pipeline velocity',
        'Meeting conversion rate',
      ],
    },
    packaging: {
      title: 'Packaging',
      body: 'Lead Sleuth is offered in Starter, Growth, and Scale tiers, priced per named account — because the unit of value is the account, not the seat. Delivered as a four-week sprint to set up and tune, then run as a standing service. Commonly bundled with POV and Battle Pack Generator for a full find-and-close stack.',
      cta: 'Run a 4-week Lead Sleuth Sprint',
    },
    cta: { title: 'Want pipeline that moves itself?', sub: "Tell us about your ICP and what your reps are stuck on. We'll show you whether Lead Sleuth is the right fit." },
  },
  {
    slug: 'battle-pack',
    name: 'Battle Pack',
    category: 'Enablement',
    hero: {
      eyebrow: 'Battle Pack Generator',
      title: 'AI sales execution, built on account intelligence.',
      lede: "Battle Pack Generator transforms account insight into persuasive, account-specific sales assets. Not templates with the logo swapped out. Real, account-grounded decks, objection frameworks, and competitive angles — produced fast enough to keep pace with the deal.",
      image: 'https://static.wixstatic.com/media/92001e_f0125e3cf494482dae92fedabbab12a3~mv2.jpeg',
    },
    intro: {
      title: 'Built on POV intelligence — every pack anchored in a live point of view.',
      body: 'It runs on top of POV intelligence, which means every pack is anchored in a current, account-specific point of view: what this customer values, what pressure they are under, and what they are likely to push back on.',
    },
    problem: {
      title: 'The problem it solves',
      body: [
        "Sales teams do the same work twice. Research an account. Build a deck. Field the objections. Rebuild the deck. Repeat on the next deal with a new logo. The best reps get there by instinct; everyone else gets there by overtime — or doesn't get there at all. The commercial message drifts. Messaging varies by who is in the room. Objections land harder than they should. And the account never quite gets the version of the pitch that was actually written for them.",
      ],
      image: 'https://static.wixstatic.com/media/b9e36b_215378a67d0f489981e215a51cfb846c~mv2.png',
    },
    replacesGet: {
      replacesTitle: 'What it replaces',
      replaces: [
        'Decks rebuilt from scratch for every deal',
        'Inconsistent messaging across reps, regions, and products',
        'Objection handling that gets weaker the longer the conversation runs',
        'Commercial narratives that sound generic because they are',
      ],
      getTitle: 'What you get',
      get: [
        'Account-specific sales decks, ready for the next meeting',
        'Objection handling frameworks grounded in what this account actually cares about',
        'Competitive positioning and differentiation angles specific to the deal',
        'Executive-ready narratives and talking points for the C-suite conversation',
        'A repeatable conversion layer that sits on top of your account intelligence',
      ],
    },
    howBody: {
      title: 'How it works',
      body: 'Battle Pack Generator takes POV and account intelligence as its core input and runs narrative generation across discovery, pitch, objection handling, and commercial argument. Competitive comparison logic surfaces where you win and where you need to manoeuvre. A template-based output layer produces the actual deliverables — decks, talking points, one-pagers — in the formats your team already uses. As the account context evolves, the pack updates with it.',
    },
    metrics: {
      title: 'What we measure',
      items: [
        'Content production time',
        'Rep adoption and usage rate',
        'Sales cycle length',
        'Objection handling effectiveness',
        'Conversion rate on supported deals',
      ],
    },
    packaging: {
      title: 'Packaging',
      body: 'Battle Pack Generator is typically sold alongside POV, priced per named account across Starter, Growth, and Scale tiers. An Enhancement Sprint is available for teams that want a set of flagship accounts built out in depth before rolling the capability across the wider sales team.',
      cta: 'Generate a Battle Pack',
    },
    cta: { title: 'Want every rep to walk in over-prepared?', sub: "Tell us where your reps lose the room. We'll show you whether Battle Pack is the right fit." },
  },
];

export const findSolution = (slug: string): Solution | undefined =>
  solutions.find((s) => s.slug === slug);

export const findPost = (slug: string): StridePost | undefined =>
  posts.find((p) => p.slug === slug);
