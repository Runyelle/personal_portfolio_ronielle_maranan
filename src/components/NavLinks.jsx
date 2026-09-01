import { navLinks } from '../data/content.js';
import './NavLinks.css';

export default function NavLinks() {
  return (
    <nav className="nav-links">
      {navLinks.map((link) => (
        <a key={link.href} href={link.href}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
