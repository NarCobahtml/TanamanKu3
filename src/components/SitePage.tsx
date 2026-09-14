import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * App shell: sticky navbar, page canvas, footer only on app pages.
 * Full-bleed canvas — hero bands own their own container; body content
 * wraps itself in max-w-7xl px-4 sm:px-6.
 */
export default function SitePage({
  children,
  narrow,
}: {
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className={'mx-auto w-full flex-1 ' + (narrow ? 'max-w-3xl px-4 py-10 sm:px-6' : '')}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
