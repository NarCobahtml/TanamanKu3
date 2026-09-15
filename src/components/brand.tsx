'use client';

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Beranda", href: "/home" },
  { name: "Scan", href: "/scan" },
  { name: "Forum", href: "/forum" },
  { name: "Siram", href: "/siram" },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/home") return pathname === "/" || pathname === "/home";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  const t = useTranslations('nav');
  return (
    <Link href="/" className={cn("flex items-center", className)} aria-label={`TanamanKu, ${t('beranda')}`}>
      {/* wordmark resmi dari file Figma (leaf hijau + teks) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dark ? '/figma-assets/logo-fix.svg' : '/figma-assets/logo-fix-ink.svg'}
        alt="TanamanKu"
        className="h-8 w-auto"
      />
    </Link>
  );
}

export { navItems };
