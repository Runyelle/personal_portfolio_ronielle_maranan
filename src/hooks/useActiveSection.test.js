import { describe, expect, it } from 'vitest';
import { pickActiveSection } from './useActiveSection.js';

// mirrors the real page order: hero, about, [showcase gap], work, contact
const sections = [
  { id: 'about', top: 1000, bottom: 1800 },
  // showcase occupies 1800–5000 and is not in the nav
  { id: 'work', top: 5000, bottom: 6000 },
  { id: 'contact', top: 6000, bottom: 6600 },
];

describe('pickActiveSection', () => {
  it('returns null over the hero (above every section)', () => {
    expect(pickActiveSection(sections, 400)).toBeNull();
  });

  it('returns the section containing the probe', () => {
    expect(pickActiveSection(sections, 1200)).toBe('about');
    expect(pickActiveSection(sections, 5500)).toBe('work');
    expect(pickActiveSection(sections, 6300)).toBe('contact');
  });

  it('treats top as inclusive and bottom as exclusive', () => {
    expect(pickActiveSection(sections, 1000)).toBe('about');
    expect(pickActiveSection(sections, 6000)).toBe('contact');
  });

  it('returns null inside the pinned Showcase gap', () => {
    expect(pickActiveSection(sections, 3000)).toBeNull();
  });

  it('returns null below every section (footer)', () => {
    expect(pickActiveSection(sections, 7000)).toBeNull();
  });

  it('picks the last section when scrolled to the bottom', () => {
    expect(pickActiveSection(sections, 7000, true)).toBe('contact');
  });

  it('returns null with no sections', () => {
    expect(pickActiveSection([], 100)).toBeNull();
    expect(pickActiveSection([], 100, true)).toBeNull();
  });
});
