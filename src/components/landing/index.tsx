import Nav from './nav';
import Hero from './hero';
import Features from './features';
import HowItWorks from './how-it-works';
import Statement from './statement';
import Community from './community';
import CtaBand from './cta-band';
import Footer from './footer';

/** Landing page utuh - dirakit dari section Figma. */
export default function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Statement />
      <Community />
      <CtaBand />
      <Footer />
    </div>
  );
}
