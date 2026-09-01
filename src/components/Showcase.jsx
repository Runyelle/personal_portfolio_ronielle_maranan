import { useEffect, useRef } from 'react';
import { projects } from '../data/content.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import './Showcase.css';

const foodPics = Object.values(
  import.meta.glob('../assets/food/*.{jpg,jpeg,png,avif,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
);

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
  const scrollDriven = wideEnough && !reduceMotion;

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
          <div className="panel">
            <div className="panel-head">
              <span className="section-label">Projects</span>
              <h2 className="panel-title display">Things I've built.</h2>
            </div>
            <div className="project-grid">
              {projects.map((p) => (
                <article key={p.name} className="project-card">
                  <h3>{p.name}</h3>
                  <p>{p.blurb}</p>
                  <span className="project-tag mono">{p.tag}</span>
                </article>
              ))}
            </div>
          </div>

          {/* Panel 2 — Food */}
          <div className="panel">
            <div className="panel-head">
              <span className="section-label">Off the clock</span>
              <h2 className="panel-title display">Faud.</h2>
            </div>
            {foodPics.length ? (
              <div className="food-grid">
                {foodPics.map((src) => (
                  <img key={src} src={src} alt="" loading="lazy" />
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
    </section>
  );
}
