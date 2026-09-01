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
    name: 'LienHunter',
    blurb:
      'Full-stack lien-search platform built during a freelance internship at Motate.',
    tag: 'React · Node · Postgres',
  },
  {
    name: 'NASA Crew Provisions Dashboard',
    blurb:
      'Shelf-life tracking for ISS crew provisions, replacing a manual Excel workflow.',
    tag: 'Power BI · Data',
  },
  {
    name: 'CUI Detection Device',
    blurb:
      'IoT device sensing corrosion under insulation on pipes via moisture and heat.',
    tag: 'IoT · Hardware',
  },
  {
    name: 'Hackathon CI/CD Pipeline',
    blurb:
      'Reusable, GitHub-based CI/CD pipeline teams can drop into any hackathon project.',
    tag: 'GitHub Actions',
  },
];

export const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
];
