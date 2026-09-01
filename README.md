# Ronielle Maranan — Portfolio

Glassmorphic single-page portfolio, built with React + Vite. Plain CSS (one
stylesheet per component), no CSS framework.

## Requirements

- Node.js 18+ and npm (not currently installed on this machine — install from
  <https://nodejs.org> or via `winget install OpenJS.NodeJS.LTS`)

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Structure

```
index.html                  # single HTML entry point (fonts + #root)
src/
  assets/                    # backdrop images (direct children) — flashed behind
                             # the whole page at 500ms
    food/                    # Showcase "Food" panel — drop .jpg/.png/.avif/.webp
    rein/                    # Showcase "Rein clips" panel — drop .mp4/.webm
  main.jsx                   # React entry, mounts <App>
  App.jsx                    # page composition
  styles/global.css          # design tokens, resets, shared utilities (.glass, .reveal, .section)
  data/content.js            # all copy/content (hero words, work list, nav)
  hooks/
    useReveal.js             # IntersectionObserver scroll-reveal
    useMediaQuery.js         # reactive matchMedia (hover capability, etc.)
  components/
    FlashBackground.jsx / .css # page-wide 500ms strobe through src/assets images
    Ambient.jsx   / .css     # animated background blobs
    NavLinks.jsx  / .css     # fixed top-right nav links
    Hero.jsx      / .css     # hero words + cursor-following speech bubble (tap fallback on touch)
    About.jsx     / .css     # minimalist about statement
    Showcase.jsx  / .css     # scroll-driven horizontal section: projects / food / rein clips
    Work.jsx      / .css     # work list + right-anchored glass preview
    Contact.jsx   / .css     # contact panel
    Footer.jsx    / .css     # footer
```

The original design lives in `ronielle-portfolio-glass.html` for reference.
