import { useEffect, useRef, useState } from 'react';
import { heroWords } from '../data/content.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import './Hero.css';

export default function Hero() {
  const canHover = useMediaQuery('(hover: hover)');
  // one entry per word that has been hovered: { x, y, z, show }
  const [popups, setPopups] = useState({});
  const [tapped, setTapped] = useState(null);
  const heroRef = useRef(null);
  const dismissTimers = useRef({});
  // rising counter so the most recently opened window sits on top of the rest
  const topZ = useRef(70);

  const cancelDismiss = (i) => {
    if (dismissTimers.current[i]) {
      clearTimeout(dismissTimers.current[i]);
      delete dismissTimers.current[i];
    }
  };

  useEffect(() => {
    const timers = dismissTimers.current;
    return () => Object.keys(timers).forEach((i) => clearTimeout(timers[i]));
  }, []);

  const handleEnter = (e, i) => {
    if (!canHover) return;
    cancelDismiss(i);
    const r = e.currentTarget.getBoundingClientRect();
    // coordinates are measured against <header> rather than the viewport, so
    // the windows are pinned to their word and scroll along with it
    const host = heroRef.current.getBoundingClientRect();
    // anchor on the word's top-right corner; the popup is shifted up by its
    // own height in CSS, so it hangs off that corner
    const x = Math.min(
      Math.max(r.right - host.left + 2, 20),
      host.width - 288
    );
    const y = r.top - host.top + 2;
    topZ.current += 1;
    setPopups((p) => ({ ...p, [i]: { x, y, z: topZ.current, show: true } }));
  };

  // windows stay open for a beat after the cursor leaves, and each word keeps
  // its own timer — so several can be open, and overlapping, at once
  const handleLeave = (i) => {
    if (!canHover) return;
    cancelDismiss(i);
    dismissTimers.current[i] = setTimeout(() => {
      delete dismissTimers.current[i];
      setPopups((p) => (p[i] ? { ...p, [i]: { ...p[i], show: false } } : p));
    }, 2250);
  };

  const handleTap = (index) => {
    if (canHover) return;
    setTapped((current) => (current === index ? null : index));
  };

  return (
    <header className="hero" ref={heroRef}>
      <div className="hero-window">
        <div className="hw-bar">
          <div className="hw-lights" aria-hidden="true">
            <span className="hw-light red" />
            <span className="hw-light yellow" />
            <span className="hw-light green" />
          </div>
          <div className="hw-title">Hello, I'm Ronielle.</div>
          <span className="hw-plus" aria-hidden="true">
            +
          </span>
        </div>

        <div className="hw-body">
          <div className="hero-stack">
            {heroWords.map((word, i) => (
              <div
                key={word.text}
                className={[
                  'hero-word',
                  word.accent ? 'accent' : '',
                  tapped === i ? 'tapped' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={(e) => handleEnter(e, i)}
                onMouseLeave={() => handleLeave(i)}
                onClick={() => handleTap(i)}
              >
                {word.text}
                <span className="tap-hint">
                  {word.line1} {word.line2}
                </span>
              </div>
            ))}
          </div>

          <div className="hw-footer">
            <p className="hero-desc">
              CS student at the University of Houston, currently building cloud
              software for NASA's Cargo Mission Contract with Leidos.
            </p>
            <div className="hero-scroll">Scroll ↓</div>
          </div>
        </div>
      </div>

      {heroWords.map((word, i) => {
        const popup = popups[i];
        if (!popup) return null;

        return (
          <div
            key={word.text}
            className={`speech-bubble${popup.show ? ' show' : ''}`}
            style={{ left: popup.x, top: popup.y, zIndex: popup.z }}
          >
            <div className="sb-bar">
              <div className="hw-lights" aria-hidden="true">
                <span className="hw-light red" />
                <span className="hw-light yellow" />
                <span className="hw-light green" />
              </div>
              <div className="sb-title">{word.text}</div>
            </div>

            <div className="sb-body">
              <div className="sb-line1">{word.line1}</div>
              <div className="sb-line2">{word.line2}</div>
            </div>
          </div>
        );
      })}
    </header>
  );
}
