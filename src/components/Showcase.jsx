import { useEffect, useRef, useState } from 'react';
import { projects } from '../data/content.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import './Showcase.css';

// map every project screenshot by its file name (no extension)
const projectImages = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/project/*.{jpg,jpeg,png,avif,webp}', {
      eager: true,
      query: '?url',
      import: 'default',
    })
  ).map(([path, url]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), url])
);

const projectsWithShots = projects.map((p) => ({
  ...p,
  shots: (p.images || [])
    .map((name) => projectImages[name])
    .filter(Boolean),
}));

const PREVIEW_W = 360;
const FADE_INTERVAL = 2200; // ms each image is held before cross-fading

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// local files under src/assets/food/ are the fallback when /api/food-images
// isn't available (e.g. plain `vite` dev with no serverless functions running)
const localFoodPics = Object.values(
  import.meta.glob('../assets/food/*.{jpg,jpeg,png,avif,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
).map((url) => ({ id: url, url, caption: null, takenAt: null }));

// Drive's imageMediaMetadata.time is EXIF-style ("2015:04:12 20:29:33");
// swap the date colons for dashes so Date() can parse it.
function formatTakenAt(value) {
  if (!value) return null;
  const iso = value.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const reinClips = Object.values(
  import.meta.glob('../assets/rein/*.{mp4,webm}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
);

export default function Showcase() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const wideEnough = useMediaQuery('(min-width: 820px)');
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const canHover = useMediaQuery('(hover: hover)');
  const scrollDriven = wideEnough && !reduceMotion;

  // cursor-anchored screenshot preview
  const [hover, setHover] = useState(null); // { name, shots }
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState(0);

  const [foodPics, setFoodPics] = useState(localFoodPics);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/food-images')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.images?.length) {
          setFoodPics(
            data.images.map((img) => ({
              id: img.id,
              url: img.url,
              caption: img.caption,
              takenAt: formatTakenAt(img.takenAt),
            }))
          );
        }
      })
      .catch(() => {}); // keep the local fallback
    return () => {
      cancelled = true;
    };
  }, []);

  const place = (e) => {
    let x = e.clientX + 24;
    if (x + PREVIEW_W > window.innerWidth - 12) {
      x = e.clientX - 24 - PREVIEW_W;
    }
    const y = Math.min(Math.max(e.clientY, 150), window.innerHeight - 150);
    setPos({ x, y });
  };

  const handleEnter = (e, p) => {
    if (!canHover || !p.shots.length) return;
    setFrame(0);
    setHover({ name: p.name, shots: p.shots });
    place(e);
  };

  const handleMove = (e) => {
    if (hover) place(e);
  };

  const handleLeave = () => setHover(null);

  useEffect(() => {
    if (!hover || hover.shots.length < 2) return;
    const id = setInterval(
      () => setFrame((f) => (f + 1) % hover.shots.length),
      FADE_INTERVAL
    );
    return () => clearInterval(id);
  }, [hover]);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    if (!scrollDriven) {
      track.style.transform = '';
      return;
    }

    let raf = 0;

    const update = () => {
      raf = 0;
      const range = section.offsetHeight - window.innerHeight;
      const progress =
        range > 0
          ? Math.min(Math.max(-section.getBoundingClientRect().top / range, 0), 1)
          : 0;
      const distance = track.scrollWidth - window.innerWidth;
      track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollDriven]);

  return (
    <section
      id="showcase"
      ref={sectionRef}
      className={`showcase${scrollDriven ? ' is-scroll-driven' : ''}`}
    >
      <div className="showcase-sticky">
        <div className="showcase-track" ref={trackRef}>
          {/* Panel 1 — Projects */}
          <div className="panel panel-projects">
            <div className="panel-head">
              <span className="section-label">Projects</span>
              <h2 className="panel-title display">Things I've built.</h2>
            </div>
            <div className="project-grid">
              {projectsWithShots.map((p) => (
                <article
                  key={p.name}
                  className="project-card"
                  onMouseEnter={(e) => handleEnter(e, p)}
                  onMouseMove={handleMove}
                  onMouseLeave={handleLeave}
                >
                  <h3>{p.name}</h3>
                  <p>{p.blurb}</p>
                  <div className="project-links">
                    <a
                      className="project-icon"
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${p.name} on GitHub`}
                    >
                      <GithubIcon />
                    </a>
                    {p.live && (
                      <a
                        className="project-icon"
                        href={p.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${p.name} live site`}
                      >
                        <LinkIcon />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Panel 2 — Food */}
          <div className="panel">
            <div className="panel-head">
              <span className="section-label">Off the clock</span>
              <h2 className="panel-title display">FAUD.</h2>
            </div>
            {foodPics.length ? (
              <div className="food-grid">
                {foodPics.map((pic) => (
                  <figure className="food-tile" key={pic.id} tabIndex={pic.caption || pic.takenAt ? 0 : -1}>
                    <img src={pic.url} alt={pic.caption || ''} loading="lazy" />
                    {(pic.caption || pic.takenAt) && (
                      <figcaption className="food-caption">
                        {pic.caption && <span>{pic.caption}</span>}
                        {pic.takenAt && <span className="food-date mono">{pic.takenAt}</span>}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            ) : (
              <p className="panel-empty mono">
                Drop photos in <code>src/assets/food/</code>
              </p>
            )}
          </div>

          {/* Panel 3 — Rein clips */}
          <div className="panel">
            <div className="panel-head">
              <span className="section-label">Also</span>
              <h2 className="panel-title display">Epic Rein clips.</h2>
            </div>
            {reinClips.length ? (
              <div className="clip-grid">
                {reinClips.map((src) => (
                  <video
                    key={src}
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ))}
              </div>
            ) : (
              <p className="panel-empty mono">
                Drop clips (.mp4 / .webm) in <code>src/assets/rein/</code>
              </p>
            )}
          </div>
        </div>

        <div className="showcase-hint mono">scroll →</div>
      </div>

      <div
        className={`project-preview${hover ? ' show' : ''}`}
        style={{ left: pos.x, top: pos.y, width: PREVIEW_W }}
        aria-hidden="true"
      >
        {hover?.shots.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={i === frame ? 'on' : ''}
          />
        ))}
      </div>
    </section>
  );
}
