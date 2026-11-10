import { cubeAngle, faceAt } from '../hooks/useTextCube.js';
import './TextCube.css';

/**
 * A 4-sided text cube that flips on its horizontal axis. Purely visual —
 * aria-hidden; the parent supplies the stable accessible name.
 * `faces` is a list of phrases, each a list of lines.
 */
export default function TextCube({ faces, step }) {
  const showing = faceAt(step, faces.length);

  return (
    <span className="text-cube" aria-hidden="true">
      <span className="text-cube-inner" style={{ '--angle': `${cubeAngle(step)}deg` }}>
        {faces.map((lines, i) => (
          <span
            key={lines.join(' ')}
            className={`text-cube-face${i === showing ? ' is-front' : ''}`}
            style={{ '--i': i }}
          >
            {lines.map((line) => (
              <span key={line} className="text-cube-line">
                {line}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}
