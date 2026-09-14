import Nav from '@/components/landing/nav';
import Hero from '@/components/landing/hero';
import Statement from '@/components/landing/statement';
import Features from '@/components/landing/features';
import HowItWorks from '@/components/landing/how-it-works';
import Community from '@/components/landing/community';
import CtaBand from '@/components/landing/cta-band';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="tk-page">
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Features />
        <HowItWorks />
        <Community />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
