import LightBeam from './components/LightBeam.jsx';
import Ambient from './components/Ambient.jsx';
import Brand from './components/Brand.jsx';
import NavLinks from './components/NavLinks.jsx';
import { useRef } from 'react';
import Hero from './components/Hero.jsx';
import LaunchDock from './components/LaunchDock.jsx';
import { useHeroWindow } from './hooks/useHeroWindow.js';
import About from './components/About.jsx';
import Showcase from './components/Showcase.jsx';
import Work from './components/Work.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  // the hero window, shared with the dock that launches / re-opens it
  const heroWindowRef = useRef(null);
  // open / closed state of that window (red close button ↔ dock re-open)
  const heroWindow = useHeroWindow(heroWindowRef);

  return (
    <>
      <LightBeam />
      <Ambient />
      <div className="grain" />
      <Brand />
      <NavLinks />
      <Hero
        windowRef={heroWindowRef}
        closeBtnRef={heroWindow.closeBtnRef}
        onClose={heroWindow.close}
      />
      <main>
        <About />
        <Showcase />
        <Work />
        <Contact />
      </main>
      <Footer />
      <LaunchDock
        windowRef={heroWindowRef}
        windowClosed={heroWindow.closed}
        onReopen={heroWindow.reopen}
      />
    </>
  );
}
