import { work, campus } from '../data/content.js';
import { useReveal } from '../hooks/useReveal.js';
import './Work.css';

export default function Work() {
  const [ref, revealed] = useReveal();

  const renderGroup = (label, items) => (
    <div className="work-group">
      <div className="section-label">{label}</div>
      <div className="work-list">
        {items.map((item) => (
          <div key={item.role + item.org} className="work-row">
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
    </section>
  );
}
