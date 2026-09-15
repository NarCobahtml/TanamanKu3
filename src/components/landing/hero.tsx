'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const SPOTLIGHT_R = 260;

type Pos = { x: number; y: number };

function RevealLayer({
  image,
  cursorX,
  cursorY,
}: {
  image: string;
  cursorX: number;
  cursorY: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    if (!canvas || !reveal) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    if (!canvas || !reveal) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      SPOTLIGHT_R
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)');
    gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const dataUrl = canvas.toDataURL();
    reveal.style.maskImage = `url(${dataUrl})`;
    reveal.style.webkitMaskImage = `url(${dataUrl})`;
    reveal.style.maskSize = '100% 100%';
    reveal.style.webkitMaskSize = '100% 100%';
    reveal.style.maskRepeat = 'no-repeat';
    reveal.style.webkitMaskRepeat = 'no-repeat';
  }, [cursorX, cursorY]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: 'none' }} />
      <div
        ref={revealRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{ backgroundImage: `url(${image})` }}
      />
    </>
  );
}

export default function Hero() {
  const t = useTranslations('landing.hero');
  const sectionRef = useRef<HTMLElement>(null);
  const mouse = useRef<Pos>({ x: 0, y: 0 });
  const smooth = useRef<Pos>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const [cursorPos, setCursorPos] = useState<Pos>({ x: -999, y: -999 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const section = sectionRef.current;
    if (!section) return;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const tick = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
      setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };

    section.addEventListener('mousemove', onMove);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      section.removeEventListener('mousemove', onMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#123526]"
      style={{ height: '100dvh' }}
    >
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat hero-zoom"
        style={{ backgroundImage: "url('/landing-assets/leaf-natural.webp')" }}
      />
      <RevealLayer image="/landing-assets/ai-mesh.webp" cursorX={cursorPos.x} cursorY={cursorPos.y} />
      <div className="absolute inset-0 z-40 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

      <div className="absolute top-[14%] left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none">
        <h1 className="text-white leading-[1.1]">
          <span
            className="block font-playfair font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal pb-1"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            {t("baris1")}
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            {t("baris2")}
          </span>
        </h1>
      </div>

      <p
        className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] text-sm text-white/80 leading-relaxed hero-anim hero-fade z-50"
        style={{ animationDelay: '0.7s' }}
      >
        {t("sub")}
      </p>

      <div
        className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[280px] flex flex-col items-start gap-4 sm:gap-5 hero-anim hero-fade z-50"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
          {t("ctaDesc")}
        </p>
        <Link
          href="/register"
          className="bg-[#1B5E3F] hover:bg-[#123526] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#1B5E3F]/30"
        >
          {t("mulai")}
        </Link>
      </div>
    </section>
  );
}
