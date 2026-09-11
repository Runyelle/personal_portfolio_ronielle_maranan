import { useEffect, useRef, useState } from 'react';
import { menu } from '../data/content.js';
import { useReveal } from '../hooks/useReveal.js';
import './Menu.css';

// resolve every bundled image once, keyed by file name — mirrors the
// import.meta.glob lookup the Showcase uses for project screenshots
const images = Object.fromEntries(
  Object.entries(
    import.meta.glob(
      [
        '../assets/*.{jpg,jpeg,jfif,png,avif,webp,gif,heic,heif,JPG,JPEG,PNG,AVIF,WEBP,HEIC}',
        '../assets/food/*.{jpg,jpeg,jfif,png,avif,webp,gif,heic,heif,JPG,JPEG,PNG,AVIF,WEBP,HEIC}',
      ],
      { eager: true, query: '?url', import: 'default' }
    )
  ).map(([path, url]) => [path.split('/').pop(), url])
);

const PER_PAGE = 2;

function MenuDish({ item }) {
  const imgRef = useRef(null);
  const [ratio, setRatio] = useState(null); // "naturalWidth / naturalHeight"
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // size the frame to the photo's own proportions, then let object-fit
  // take over — portrait, landscape and square each render true to shape
  const measure = (img) => {
    if (img.naturalWidth && img.naturalHeight) {
      setRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
    }
    setLoaded(true);
  };

  // catch images the browser already had cached before onLoad was attached
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth) measure(img);
    else if (img.complete && !img.naturalWidth) setFailed(true);
  }, []);

  const src = images[item.src];
  const showFallback = failed || !src;

  return (
    <article className="menu-dish">
      <div
        className={`menu-dish-media${loaded ? ' is-loaded' : ''}`}
        style={ratio ? { aspectRatio: ratio } : undefined}
      >
        {!loaded && !showFallback && (
          <span className="menu-dish-skeleton" aria-hidden="true" />
        )}
        {showFallback && (
          <span className="menu-dish-fallback mono" aria-hidden="true">
            photo coming
          </span>
        )}
        {src && (
          <img
            ref={imgRef}
            src={src}
            alt={`${item.name} at ${item.place}`}
            loading="lazy"
            decoding="async"
            onLoad={(e) => measure(e.currentTarget)}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <div className="menu-dish-body">
        <h3 className="menu-dish-name display">{item.name}</h3>
        <p className="menu-dish-place mono">{item.place}</p>
        <p className="menu-dish-note">{item.note}</p>
      </div>
    </article>
  );
}

export default function Menu() {
  const [ref, revealed] = useReveal();
  const [page, setPage] = useState(0);

  // page count follows the data — 4 items / 2 per page = 2 pages
  const pageCount = Math.max(1, Math.ceil(menu.length / PER_PAGE));
  const start = page * PER_PAGE;
  const dishes = menu.slice(start, start + PER_PAGE);

  const atStart = page === 0;
  const atEnd = page >= pageCount - 1;

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(pageCount - 1, p + 1));

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      prev();
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      next();
      e.preventDefault();
    }
  };

  return (
    <section
      id="menu"
      ref={ref}
      className={`section menu reveal${revealed ? ' in' : ''}`}
    >
      <div className="section-label">Menu</div>
      <h2 className="menu-title display">Dishes worth the photo.</h2>
      <p className="menu-intro mono">A rotating few — snapped before the first bite.</p>

      <div
        className="menu-deck"
        role="group"
        aria-label="Menu — press the left and right arrow keys to page through dishes"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div className="menu-grid" key={page}>
          {dishes.map((item) => (
            <MenuDish key={item.id} item={item} />
          ))}
        </div>

        <div className="menu-controls mono">
          <button
            type="button"
            onClick={prev}
            disabled={atStart}
            aria-label="Previous page"
          >
            ‹
          </button>
          <span aria-live="polite">
            {page + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={next}
            disabled={atEnd}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
