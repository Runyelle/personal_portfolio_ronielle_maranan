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
    org: 'Leidos',
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

export const projects = [
  {
    name: '5 Brothers Drafting & Permitting Website',
    blurb:
      'Full-stack website built for a Houston drafting and permitting business, live at 5brothersdrafting.com. Includes a client-facing site plus a server handling their day-to-day permitting requests.',
    url: 'https://github.com/Runyelle/5-Brothers-Website',
    repo: 'github.com/Runyelle/5-Brothers-Website',
  },
  {
    name: 'WasteFlow',
    blurb:
      'Industrial symbiosis prototype that matches waste streams from one company with material needs at another, using AI-assisted compatibility analysis. Built as a hackathon demo with a FastAPI backend and a Next.js/React frontend.',
    url: 'https://github.com/Runyelle/CODERED-ASTRA',
    repo: 'github.com/Runyelle/CODERED-ASTRA',
  },
  {
    name: 'Smart Playlist App',
    blurb:
      "Spotify-integrated app that generates AI transitions between tracks using fal.ai's Stable Audio. Includes OAuth login, a full demo video, and a Spotify-inspired dark theme UI.",
    url: 'https://github.com/Runyelle/Smart-Playlist-App',
    repo: 'github.com/Runyelle/Smart-Playlist-App',
  },
  {
    name: 'FlyBetter.ai',
    blurb:
      'AI travel planning platform built at TAMUhack 2026 that turns natural-language requests into full itineraries with real flight, hotel, and restaurant data. Also supports phone bookings through an ElevenLabs-powered voice assistant.',
    url: 'https://github.com/maybiiLen/TAMU-Hack-26',
    repo: 'github.com/maybiiLen/TAMU-Hack-26',
  },
  {
    name: 'PenguinPipe',
    blurb:
      'Pipeline inspection analysis system built at TIDALHACK 2026 that tracks corrosion growth across years of inspection data and flags high-risk zones. Uses a Random Forest model for prediction plus a Gemini-powered chat assistant for querying results.',
    url: 'https://github.com/sart-haker/tidal26',
    repo: 'github.com/sart-haker/tidal26',
  },
  {
    name: 'Estacado Energy Well Portfolio Article',
    blurb:
      'A website presented in article form for a ConocoPhillips case competition, analyzing a well portfolio using real production, financial, and safety data. Answers judge questions on production efficiency, HSE risk, and which wells to keep, sell, or invest in.',
    url: 'https://github.com/Gurshaan159/React_presentatoin',
    repo: 'github.com/Gurshaan159/React_presentatoin',
  },
];

export const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
];
