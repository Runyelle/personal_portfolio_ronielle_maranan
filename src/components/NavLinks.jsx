import { navLinks } from '../data/content.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import resumePdf from '../assets/resume/Resume-8-3-2026.pdf';
import './NavLinks.css';

/** Document-relative top, walked via offsetTop so the `.reveal` transform
 *  on a not-yet-revealed section doesn't skew the measurement. */
function documentTop(el) {
  let top = 0;
  for (let node = el; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}

export default function NavLinks() {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const handleClick = (e, href) => {
    // let the browser handle new-tab / modified clicks normally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const el = document.querySelector(href);
    if (!el) return; // fall back to the default anchor jump

    e.preventDefault();

    // sections carry a large bottom padding — measure the content box so the
    // visual middle lands in the middle rather than in the padding
    const cs = getComputedStyle(el);
    const padTop = parseFloat(cs.paddingTop) || 0;
    const padBottom = parseFloat(cs.paddingBottom) || 0;
    const top = documentTop(el) + padTop;
    const height = el.offsetHeight - padTop - padBottom;

    // centre the section on the viewport, clamped to the scrollable range
    const target = top - (window.innerHeight - height) / 2;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    window.scrollTo({
      top: Math.max(0, Math.min(target, max)),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });

    // keep the URL in step without provoking a second jump
    history.replaceState(null, '', href);
  };

  return (
    <nav className="nav-links">
      {navLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={(e) => handleClick(e, link.href)}
        >
          {link.label}
        </a>
      ))}
      <a href={resumePdf} target="_blank" rel="noopener noreferrer">
        Resume
      </a>
    </nav>
  );
}
