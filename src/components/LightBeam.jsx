import { useScrollTint } from '../hooks/useScrollTint.js';
import './LightBeam.css';

/**
 * Fixed backdrop: a fan of vertical light streaks rising from the bottom
 * centre of the viewport. It grows outward and upward with scroll via
 * `--beam-s`, which useScrollTint publishes alongside `--gray-t`.
 * Pure CSS gradients — no images.
 */
export default function LightBeam() {
  useScrollTint();

  return (
    <>
      <div className="light-beam" aria-hidden="true">
        <div className="lb-fan">
          <div className="lb-core" />
          <div className="lb-streaks lb-streaks--wide" />
          <div className="lb-streaks lb-streaks--mid" />
          <div className="lb-streaks lb-streaks--fine" />
        </div>
      </div>
      {/* scroll-linked gray veil — sits over the beam, under all content */}
      <div className="scroll-tint" aria-hidden="true" />
    </>
  );
}
