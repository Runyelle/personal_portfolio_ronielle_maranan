import { useReveal } from '../hooks/useReveal.js';
import './About.css';

export default function About() {
  const [ref, revealed] = useReveal();

  return (
    <section
      id="about"
      ref={ref}
      className={`section about reveal${revealed ? ' in' : ''}`}
    >
      <div className="about-label">About me</div>
      <div className="about-body display">
        <p>
          I build full-stack products and cloud systems — currently for NASA's
          Cargo Mission Contract.
        </p>
        <p>
          I love to collaborate, explore, and experiment — turning code and
          contribution into real impact.
        </p>
      </div>
    </section>
  );
}
