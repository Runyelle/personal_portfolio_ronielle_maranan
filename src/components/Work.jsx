import { work, campus } from '../data/content.js';
import { useReveal } from '../hooks/useReveal.js';
import { staggerDelay } from '../hooks/stagger.js';
import './Work.css';

// each group reveals when it scrolls in; its rows follow one by one
function WorkGroup({ label, items }) {
  const [ref, revealed] = useReveal();

  return (
    <div ref={ref} className={`work-group${revealed ? ' in' : ''}`}>
      <div className="section-label">{label}</div>
      <div className="work-list">
        {items.map((item, i) => (
          <div
            key={item.role + item.org}
            className="work-row"
            style={{ '--d': `${staggerDelay(i + 1)}ms` }}
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
}

export default function Work() {
  return (
    <section id="work" className="section work">
      <WorkGroup label="Work" items={work} />
      <WorkGroup label="On-Campus Impact" items={campus} />
    </section>
  );
}
