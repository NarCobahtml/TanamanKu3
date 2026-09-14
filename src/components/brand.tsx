import Link from "next/link";
import { Leaf } from "lucide-react";
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
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} aria-label="TanamanKu, Beranda">
      <Leaf className={cn("h-6 w-6", dark ? "text-white" : "text-primary")} />
      <span className={cn("font-playfair text-2xl", dark ? "text-white" : "text-ink")}>
        TanamanKu
      </span>
    </Link>
  );
}

export { navItems };
