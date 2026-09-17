import './ReinClips.css';

// Placeholder slot for Reinhardt clips on the Showcase's Outside Work slide —
// swap the frame for the clip player once it's built (clips go in src/assets/rein/)
export default function ReinClips() {
  return (
    <article className="rein glass">
      <div className="rein-top">
        <span className="rein-label mono">Rein clips</span>
        <span className="rein-pill mono">Coming soon</span>
      </div>
      <div className="rein-frame" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z" />
        </svg>
      </div>
    </article>
  );
}
