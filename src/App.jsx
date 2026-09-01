import FlashBackground from './components/FlashBackground.jsx';
import Ambient from './components/Ambient.jsx';
import NavLinks from './components/NavLinks.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Showcase from './components/Showcase.jsx';
import Work from './components/Work.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <FlashBackground />
      <Ambient />
      <div className="grain" />
      <NavLinks />
      <Hero />
      <main>
        <About />
        <Showcase />
        <Work />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
