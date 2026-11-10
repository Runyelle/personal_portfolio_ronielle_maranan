import { useRef } from 'react';
import { useReveal } from '../hooks/useReveal.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useTextCube } from '../hooks/useTextCube.js';
import { useMagnet } from '../hooks/useMagnet.js';
import TextCube from './TextCube.jsx';
import TextMe from './TextMe.jsx';
import './Contact.css';

// faces of the CTA cube — it always comes to rest on the first
const CTA_FACES = [
  ['Get in', 'touch'],
  ['Hit me', 'up'],
  ['Contact', 'me'],
  ['Say', 'hello'],
];

export default function Contact() {
  const [ref, revealed] = useReveal();
  const circleRef = useRef(null);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const canHover = useMediaQuery('(hover: hover)');
  const [cubeStep, nextFace] = useTextCube(circleRef, CTA_FACES.length, reduceMotion);
  useMagnet(circleRef, canHover && !reduceMotion);

  return (
    <section
      id="contact"
      ref={ref}
      className={`section contact reveal${revealed ? ' in' : ''}`}
    >
      <div className="contact-label">Let's talk</div>
      <h2 className="contact-headline display">
        Open to new grad and internship conversations.
      </h2>

      <a
        className="contact-circle"
        href="mailto:ron.maranan01@gmail.com"
        aria-label="Get in touch"
        ref={circleRef}
        onPointerEnter={(e) => e.pointerType === 'mouse' && nextFace()}
      >
        <TextCube faces={CTA_FACES} step={cubeStep} />
      </a>

      {/* same conversation as the card on the Showcase's Outside Work slide */}
      <div className="contact-chat">
        <TextMe />
      </div>

      <div className="social-row">
        <a
          href="https://github.com/Runyelle"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a href="/api/resume" target="_blank" rel="noopener noreferrer">
          Resume
        </a>
        <a
          href="https://linkedin.com/in/ronielle-maranan"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </div>
    </section>
  );
}
