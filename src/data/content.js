export const heroWords = [
  {
    text: 'Engineering',
    line1: 'I like software that survives contact with users.',
    line2: 'Full-stack, end to end.',
  },
  {
    text: 'Cloud Architecture',
    accent: true,
    line1: 'AWS-certified, twice over.',
    line2: 'I like systems that scale quietly.',
  },
  {
    text: 'Design',
    line1: "Interfaces that don't need a manual.",
    line2: 'Function first, glass second.',
  },
];

// each list ordered most-recent first (present → past)
export const work = [
  {
    role: 'Software Engineer Intern',
    org: 'National Aeronautics and Space Administration (NASA), Cargo Mission Contract',
    period: 'Apr 2026 — Present',
    current: true,
  },
  {
    role: 'Software Engineering Intern',
    org: 'Motate',
    period: 'Feb 2026 — May 2026',
    current: false,
  },
  {
    role: 'Freelance Full-Stack Developer',
    org: 'Independent',
    period: 'May 2025 — Present',
    current: true,
  },
  {
    role: 'Administrative Aide',
    org: 'SEP',
    period: 'Aug 2024 — Aug 2025',
    current: false,
  },
];

export const campus = [
  {
    role: 'Corporate Relations Officer',
    org: 'CougarCS',
    period: 'May 2026 — Present',
    current: true,
  },
  {
    role: 'Historian',
    org: 'CougarCS',
    period: 'Jan 2026 — May 2026',
    current: false,
  },
  {
    role: 'Undergraduate Research Assistant',
    org: 'UR2PhD',
    period: 'Jan 2026 — May 2026',
    current: false,
  },
  {
    role: 'Founding Technical Development Lead',
    org: 'Asians in Tech',
    period: 'Oct 2025 — Jan 2026',
    current: false,
  },
];

// ordered most-recent first (top-left) → least-recent last (bottom-right)
export const projects = [
  {
    name: 'Estacado Energy Well Portfolio Article',
    tag: 'Case competition',
    details: [
      ['Frontend', 'React + TypeScript, on Vercel'],
      ['Format', 'Data-journalism article, sticky 01–05 nav'],
      ['Methods', 'Well efficiency scoring, HSE correlation, 5-yr decline forecast'],
      ['Backend', 'None — the analysis runs in the app'],
    ],
    tech: ['React', 'TypeScript', 'Vercel'],
    blurb:
      'A website presented in article form for a ConocoPhillips case competition, analyzing a well portfolio using real production, financial, and safety data. Answers judge questions on production efficiency, HSE risk, and which wells to keep, sell, or invest in.',
    url: 'https://github.com/Gurshaan159/React_presentatoin',
    repo: 'github.com/Gurshaan159/React_presentatoin',
    live: 'https://conocophillipspresentation.vercel.app/',
    images: ['Estacado Energy Well Portfolio Article'],
  },
  {
    name: 'PenguinPipe',
    tag: 'Hackathon · TIDALHACK 2026',
    details: [
      ['Backend', 'Python + FastAPI'],
      ['Frontend', 'Next.js dashboard'],
      ['ML', 'Random Forest growth prediction, ROC AUC 0.95'],
      ['Methods', 'Multi-year ILI alignment, interaction-zone detection'],
      ['AI', 'Gemini chat over the results'],
    ],
    tech: ['Python', 'FastAPI', 'Next.js', 'Random Forest', 'Gemini API'],
    blurb:
      'Pipeline inspection analysis system built at TIDALHACK 2026 that tracks corrosion growth across years of inspection data and flags high-risk zones. Uses a Random Forest model for prediction plus a Gemini-powered chat assistant for querying results.',
    url: 'https://github.com/sart-haker/tidal26',
    repo: 'github.com/sart-haker/tidal26',
    images: ['PenguinPipe1', 'PenguinPipe2'],
  },
  {
    name: 'FlyBetter.ai',
    tag: 'Hackathon · TAMUhack 2026',
    details: [
      ['Backend', 'Node.js + Express + MongoDB'],
      ['Frontend', 'Next.js + TypeScript'],
      ['AI', 'Gemini itinerary planning'],
      ['Voice', 'ElevenLabs phone-call bookings'],
    ],
    tech: ['Node.js', 'Express', 'MongoDB', 'Next.js', 'TypeScript', 'Gemini', 'ElevenLabs'],
    blurb:
      'AI travel planning platform built at TAMUhack 2026 that turns natural-language requests into full itineraries with real flight, hotel, and restaurant data. Also supports phone bookings through an ElevenLabs-powered voice assistant.',
    url: 'https://github.com/maybiiLen/TAMU-Hack-26',
    repo: 'github.com/maybiiLen/TAMU-Hack-26',
    images: ['FlyBetter1', 'FlyBetter2'],
  },
  {
    name: 'Smart Playlist App',
    tag: 'Personal project',
    details: [
      ['Frontend', 'Next.js + Tailwind CSS'],
      ['Backend', 'Node.js + Express'],
      ['Auth', 'Spotify OAuth (PKCE)'],
      ['AI', 'fal.ai Stable Audio transitions'],
      ['Storage', 'Local cache, no DB'],
    ],
    tech: ['Next.js', 'Tailwind CSS', 'Node.js', 'Express', 'Spotify API', 'fal.ai'],
    blurb:
      "Spotify-integrated app that generates AI transitions between tracks using fal.ai's Stable Audio. Includes OAuth login, a full demo video, and a Spotify-inspired dark theme UI.",
    url: 'https://github.com/Runyelle/Smart-Playlist-App',
    repo: 'github.com/Runyelle/Smart-Playlist-App',
    images: ['SmartPlaylist1', 'SmartPlaylist2'],
  },
  {
    name: 'WasteFlow',
    tag: 'Hackathon build',
    details: [
      ['Frontend', 'React/Next.js + Tailwind CSS'],
      ['Backend', 'Python + FastAPI'],
      ['Methods', 'AI waste-to-need compatibility matching'],
      ['Storage', 'Local cache, no DB'],
    ],
    tech: ['React', 'Next.js', 'Tailwind CSS', 'Python', 'FastAPI'],
    blurb:
      'Industrial symbiosis prototype that matches waste streams from one company with material needs at another, using AI-assisted compatibility analysis. Built as a hackathon demo with a FastAPI backend and a Next.js/React frontend.',
    url: 'https://github.com/Runyelle/CODERED-ASTRA',
    repo: 'github.com/Runyelle/CODERED-ASTRA',
    images: ['Wasteflow1'],
  },
  {
    name: '5 Brothers Drafting & Permitting Website',
    tag: 'Client project',
    details: [
      ['Frontend', 'React, static site on AWS S3'],
      ['Backend', 'Node + Express on EC2, emails the owner'],
    ],
    tech: ['React', 'Node.js', 'Express', 'AWS S3', 'AWS EC2'],
    blurb:
      'Full-stack website built for a Houston drafting and permitting business, live at 5brothersdrafting.com. Includes a client-facing site plus a server handling their day-to-day permitting requests.',
    url: 'https://github.com/Runyelle/5-Brothers-Website',
    repo: 'github.com/Runyelle/5-Brothers-Website',
    live: 'https://5brothersdrafting.com/',
    images: ['5 Brothers Drafting & Permitting Website'],
  },
];

// "What I'm bout." card on the Showcase's Outside Work slide.
// Each paragraph is a list of plain strings and { strong } highlights.
export const bout = [
  {
    label: 'What I do now',
    body: [
      "I'm a Software Engineer Intern, building for",
      { strong : "NASA's Cargo Mission Contract"},
      ", and I take on ",
      { strong: 'freelance full-stack' },
      ' work on the side. On campus, I handle corporate relations for ',
      { strong: 'CougarCS' },
      '.',
    ],
  },
  {
    label: "Where I'm at now",
    body: [
      "I'm in ",
      { strong: 'Houston' },
      ", studying at the University of Houston where I learned how to code and not code (Thanks Claude). When I'm not studying or working on a project, I'm probably eating food, queueing Overwatch, listening to something on Spotify, or coming up with a new idea as I watch the paint on my ceiling peel.",
    ],
  },
  {
    label: "What I'm looking for",
    body: [
      'Teams building ',
      { strong: 'full-stack products' },
      ' and ',
      { strong: 'cloud systems' },
      ' people actually use — somewhere I can collaborate, experiment, and turn code into real impact.',
    ],
  },
];

export const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
];
