import { bout } from '../data/content.js';
import './Bout.css';

// "What I'm bout." — the bio card on the left of the Showcase's Outside Work slide
export default function Bout() {
  return (
    <article className="bout glass">
      <h2 className="bout-title display">What I&rsquo;m bout.</h2>

      {bout.map((section) => (
        <div key={section.label} className="bout-section">
          <h3 className="bout-label mono">{section.label}</h3>
          <p className="bout-text">
            {section.body.map((part, i) =>
              typeof part === 'string' ? part : <strong key={i}>{part.strong}</strong>
            )}
          </p>
        </div>
      ))}
    </article>
  );
}
