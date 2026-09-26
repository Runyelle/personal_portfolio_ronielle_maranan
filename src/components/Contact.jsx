import { useReveal } from '../hooks/useReveal.js';
import TextMe from './TextMe.jsx';
import './Contact.css';

export default function Contact() {
  const [ref, revealed] = useReveal();

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

      <a className="contact-circle" href="mailto:ron.maranan01@gmail.com">
        Get in
        <br />
        touch
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
