import { useRef } from 'react';
import { useReveal } from '../hooks/useReveal.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useScrollProgress } from '../hooks/useScrollProgress.js';
import './About.css';

// each paragraph is a list of segments; `accent` segments light up gold
const PARAGRAPHS = [
  [
    { text: 'I build full-stack products and cloud systems — currently for' },
    { text: "NASA's Cargo Mission Contract.", accent: true },
  ],
  [
    {
      text: 'I love to collaborate, explore, and experiment — turning code and contribution into real impact.',
    },
  ],
];

const plain = (segments) => segments.map((s) => s.text).join(' ');

export default function About() {
  const [labelRef, labelIn] = useReveal();
  const bodyRef = useRef(null);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  useScrollProgress(bodyRef, !reduceMotion);

  return (
    <section id="about" className="section about">
      <div ref={labelRef} className={`about-label${labelIn ? ' in' : ''}`}>
        About me
      </div>
      <div ref={bodyRef} className="about-body display">
        {PARAGRAPHS.map((segments, p) => (
          <p key={p}>
            <span className="sr-only">{plain(segments)}</span>
            <span aria-hidden="true">
              {segments.map((seg, s) => (
                <span key={s} className={seg.accent ? 'about-accent' : undefined}>
                  {seg.text.split(' ').map((word, w) => (
                    <span key={w} data-word className="about-word">
                      {word}{' '}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </p>
        ))}
      </div>
    </section>
  );
}
