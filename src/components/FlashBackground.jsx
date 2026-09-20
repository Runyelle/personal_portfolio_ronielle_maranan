import { useEffect, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useScrollTint } from '../hooks/useScrollTint.js';
import './FlashBackground.css';

// every image in src/assets, bundled + hashed by Vite
const bgImages = Object.values(
  import.meta.glob('../assets/*.{jpg,jpeg,png,avif,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
);

const FLASH_MS = 500;

export default function FlashBackground() {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [index, setIndex] = useState(0);

  useScrollTint();

  useEffect(() => {
    if (reduceMotion || bgImages.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % bgImages.length);
    }, FLASH_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <>
      <div className="flash-bg" aria-hidden="true">
        {bgImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={i === index ? 'is-active' : undefined}
          />
        ))}
      </div>
      {/* scroll-linked gray veil — sits over the strobe, under all content */}
      <div className="scroll-tint" aria-hidden="true" />
    </>
  );
}
