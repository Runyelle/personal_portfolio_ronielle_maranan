import { useState } from 'react';
import { heroWords } from '../data/content.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import './Hero.css';

export default function Hero() {
  const canHover = useMediaQuery('(hover: hover)');
  const [bubble, setBubble] = useState({ line1: '', line2: '', show: false });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [tapped, setTapped] = useState(null);

  const handleEnter = (e, word) => {
    if (!canHover) return;
    const r = e.currentTarget.getBoundingClientRect();
    // anchor near the right margin of the word (not the very edge),
    // roughly level with its upper third
    const x = Math.min(
      Math.max(r.left + r.width * 0.8, 20),
      window.innerWidth - 250
    );
    const y = r.top + r.height * 0.28;
    setPos({ x, y });
    setBubble({ line1: word.line1, line2: word.line2, show: true });
  };

  const handleLeave = () => {
    if (!canHover) return;
    setBubble((b) => ({ ...b, show: false }));
  };

  const handleTap = (index) => {
    if (canHover) return;
    setTapped((current) => (current === index ? null : index));
  };

  return (
    <header className="hero">
      <div className="hero-tag glass">Hello, I'm Ronielle.</div>

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
            onMouseEnter={(e) => handleEnter(e, word)}
            onMouseLeave={handleLeave}
            onClick={() => handleTap(i)}
          >
            {word.text}
            <span className="tap-hint">
              {word.line1} {word.line2}
            </span>
          </div>
        ))}
      </div>

      <p className="hero-desc">
        CS student at the University of Houston, currently building cloud software
        for NASA's Cargo Mission Contract via Leidos.
      </p>
      <div className="hero-scroll">Scroll ↓</div>

      <div
        className={`speech-bubble${bubble.show ? ' show' : ''}`}
        style={{ left: pos.x, top: pos.y }}
      >
        <div className="sb-line1">{bubble.line1}</div>
        <div className="sb-line2">{bubble.line2}</div>
      </div>
    </header>
  );
}
