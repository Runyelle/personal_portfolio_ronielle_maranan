import { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import './FoodBook.css';

const PER_PAGE = 6;

// each place gets its own page(s); a place never shares a page with another.
function paginate(places) {
  const pages = [];
  places.forEach((place) => {
    const parts = Math.max(1, Math.ceil(place.photos.length / PER_PAGE));
    for (let i = 0; i < place.photos.length; i += PER_PAGE) {
      pages.push({
        place: place.place,
        dateLabel: place.dateLabel,
        mapUrl: place.mapUrl,
        photos: place.photos.slice(i, i + PER_PAGE),
        part: Math.floor(i / PER_PAGE) + 1,
        parts,
      });
    }
  });
  return pages;
}

function MenuPage({ page, folio }) {
  return (
    <div className="menu-page">
      <header className="menu-page-head">
        <h3 className="menu-place display">{page.place}</h3>
        <div className="menu-meta mono">
          {page.dateLabel && <span>{page.dateLabel}</span>}
          {page.parts > 1 && (
            <span>
              · {page.part}/{page.parts}
            </span>
          )}
          {page.mapUrl && (
            <a href={page.mapUrl} target="_blank" rel="noopener noreferrer">
              map ↗
            </a>
          )}
        </div>
      </header>

      <div className="menu-photos" data-count={page.photos.length}>
        {page.photos.map((photo) => (
          <div className="menu-photo" key={photo.id}>
            <figure className="menu-photo-frame">
              <img src={photo.url} alt={photo.caption || page.place} loading="lazy" />
              {photo.caption && <figcaption>{photo.caption}</figcaption>}
            </figure>
          </div>
        ))}
      </div>

      {folio != null && <span className="menu-folio mono">{folio}</span>}
    </div>
  );
}

function Face({ face }) {
  if (!face || face.type === 'blank') {
    return <div className="menu-page menu-page--blank" aria-hidden="true" />;
  }
  if (face.type === 'title') {
    return (
      <div className="menu-page menu-page--plate">
        <span className="section-label">Off the clock</span>
        <h3 className="display">The FAUD menu</h3>
        <p className="mono">Every place I&rsquo;ve shot a plate at &mdash; newest first.</p>
      </div>
    );
  }
  if (face.type === 'end') {
    return (
      <div className="menu-page menu-page--plate">
        <h3 className="display">That&rsquo;s the menu.</h3>
        <p className="mono">More whenever I remember the photo before the first bite.</p>
      </div>
    );
  }
  return <MenuPage page={face.page} folio={face.folio} />;
}

export default function FoodBook({ places }) {
  const wide = useMediaQuery('(min-width: 760px)');
  const pages = useMemo(() => paginate(places || []), [places]);

  // wide: 3D page-curl book -----------------------------------------------------
  const { leaves, maxTurned } = useMemo(() => {
    let folio = 0;
    const seq = [
      { type: 'title' },
      ...pages.map((page) => ({ type: 'page', page, folio: ++folio })),
      { type: 'end' },
    ];
    const out = [];
    for (let i = 0; i < seq.length; i += 2) {
      out.push({ front: seq[i], back: seq[i + 1] || null });
    }
    // if the last leaf has nothing on its back, flipping it just reveals a blank
    // spread — stop one turn short so the final view still shows the "end" page
    const last = out[out.length - 1];
    const max = out.length - (last && !last.back ? 1 : 0);
    return { leaves: out, maxTurned: max };
  }, [pages]);

  const [turned, setTurned] = useState(0);
  const [idx, setIdx] = useState(0); // narrow mode

  useEffect(() => {
    setTurned(0);
    setIdx(0);
  }, [pages]);

  if (!pages.length) {
    return (
      <p className="panel-empty mono">
        Drop photos in <code>src/assets/food/</code>
      </p>
    );
  }

  if (!wide) {
    const page = pages[idx];
    return (
      <div className="food-single">
        <div className="food-single-page">
          <MenuPage page={page} folio={idx + 1} />
        </div>
        <div className="book-controls mono">
          <button
            type="button"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            aria-label="Previous place"
          >
            ‹
          </button>
          <span>
            {idx + 1} / {pages.length}
          </span>
          <button
            type="button"
            onClick={() => setIdx((i) => Math.min(pages.length - 1, i + 1))}
            disabled={idx === pages.length - 1}
            aria-label="Next place"
          >
            ›
          </button>
        </div>
      </div>
    );
  }

  const prev = () => setTurned((t) => Math.max(0, t - 1));
  const next = () => setTurned((t) => Math.min(maxTurned, t + 1));

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
    <div className="food-book-wrap">
      <div
        className={`book${turned === 0 ? ' is-closed' : ''}`}
        role="group"
        aria-label="FAUD menu — click the page edges or use the arrow keys"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div className="book-spine" aria-hidden="true" />

        {leaves.map((leaf, i) => {
          const flipped = i < turned;
          return (
            <div
              key={i}
              className={`leaf${flipped ? ' is-flipped' : ''}`}
              style={{ zIndex: flipped ? i : leaves.length - i }}
            >
              <div className="leaf-face leaf-front">
                <Face face={leaf.front} />
              </div>
              <div className="leaf-face leaf-back">
                <Face face={leaf.back} />
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className="book-edge book-edge--prev"
          onClick={prev}
          disabled={turned === 0}
          aria-label="Previous page"
        />
        <button
          type="button"
          className="book-edge book-edge--next"
          onClick={next}
          disabled={turned === maxTurned}
          aria-label="Next page"
        />
      </div>

      <div className="book-controls mono">
        <button type="button" onClick={prev} disabled={turned === 0} aria-label="Previous page">
          ‹
        </button>
        <span>
          {Math.min(turned + 1, maxTurned)} / {maxTurned}
        </span>
        <button
          type="button"
          onClick={next}
          disabled={turned === maxTurned}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}
