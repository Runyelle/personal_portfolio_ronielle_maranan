import { useState } from 'react';
import { work, campus } from '../data/content.js';
import { useReveal } from '../hooks/useReveal.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import './Work.css';

export default function Work() {
  const [ref, revealed] = useReveal();
  const canHover = useMediaQuery('(hover: hover)');
  const [preview, setPreview] = useState({ item: null, show: false });
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleEnter = (e, item) => {
    if (!canHover) return;
    const r = e.currentTarget.getBoundingClientRect();
    const PREVIEW_W = 234;
    // sit just past the row's right edge, in the gutter;
    // tuck back only if it would run off-screen
    let x = r.right + 20;
    x = Math.min(x, window.innerWidth - PREVIEW_W - 16);
    x = Math.max(x, 16);
    const y = r.top + r.height / 2;
    setPos({ x, y });
    setPreview({ item, show: true });
  };

  const handleLeave = () => {
    if (!canHover) return;
    setPreview((p) => ({ ...p, show: false }));
  };

  const renderGroup = (label, items) => (
    <div className="work-group">
      <div className="section-label">{label}</div>
      <div className="work-list">
        {items.map((item) => (
          <div
            key={item.role + item.org}
            className="work-row"
            onMouseEnter={(e) => handleEnter(e, item)}
            onMouseLeave={handleLeave}
          >
            <div className="work-main">
              <span className="work-role">{item.role}</span>
              <span className="work-org">{item.org}</span>
            </div>
            <span className={`work-period${item.current ? ' current' : ''}`}>
              {item.period}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section
      id="work"
      ref={ref}
      className={`section work reveal${revealed ? ' in' : ''}`}
    >
      {renderGroup('Work', work)}
      {renderGroup('On-Campus Impact', campus)}

      <div
        className={`work-preview${preview.show ? ' show' : ''}`}
        style={{ left: pos.x, top: pos.y }}
      >
        <div className="work-preview-role">{preview.item?.role}</div>
        <div className="work-preview-org mono">{preview.item?.org}</div>
        <div className="work-preview-period mono">
          {preview.item?.period}
          {preview.item && ` · ${preview.item.current ? 'Ongoing' : 'Completed'}`}
        </div>
      </div>
    </section>
  );
}
