"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ScanLine, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HomeHeroBandProps {
  firstName: string;
  total: number;
  sehat: number;
  penyakit: number;
}

export function HomeHeroBand({
  firstName,
  total,
  sehat,
  penyakit,
}: HomeHeroBandProps) {
  const t = useTranslations("home");

  return (
    <header className="sage-wash border-b border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <p className="overline hero-anim hero-fade">{t("workspace")}</p>
        <h1
          className="hero-anim hero-fade mt-3 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl"
          style={{ animationDelay: "0.12s" }}
        >
          {t("welcomePrefix")}
          <span>, </span>
          <span className="font-playfair">{firstName}</span>.
        </h1>
        <p
          className="hero-anim hero-fade mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground"
          style={{ animationDelay: "0.26s" }}
        >
          {t("pantau")}
        </p>

        <dl
          className="hero-anim hero-fade mt-12 grid grid-cols-3 gap-x-6 gap-y-8 sm:gap-10"
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <dt className="overline min-h-[2.5rem] sm:min-h-0">
              {t("tanamanDipantau")}
            </dt>
            <dd className="tnum mt-2 text-4xl font-extrabold leading-none md:text-5xl">
              {total}
            </dd>
          </div>
          <div>
            <dt className="overline min-h-[2.5rem] sm:min-h-0">{t("sehat")}</dt>
            <dd className="tnum mt-2 text-4xl font-extrabold leading-none text-success md:text-5xl">
              {sehat}
            </dd>
          </div>
          <div>
            <dt className="overline min-h-[2.5rem] sm:min-h-0">
              {t("terdeteksiPenyakit")}
            </dt>
            <dd className="tnum mt-2 text-4xl font-extrabold leading-none text-destructive md:text-5xl">
              {penyakit}
            </dd>
          </div>
        </dl>

        {/* proportional status bar */}
        <div
          className="hero-anim hero-fade mt-8 flex h-1.5 w-full overflow-hidden bg-muted"
          role="img"
          aria-label={`${sehat} ${t("sehat")}, ${penyakit} ${t("terdeteksiPenyakit")}`}
          style={{ animationDelay: "0.5s" }}
        >
          <span
            className="bg-[#7ed8a4]"
            style={{ width: `${(sehat / total) * 100}%` }}
          />
          <span
            className="bg-[#f09a90]"
            style={{ width: `${(penyakit / total) * 100}%` }}
          />
        </div>

        {/*  CTA */}
        <div
          className="hero-anim hero-fade mt-10 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "0.6s" }}
        >
          <Button asChild size="lg" className="btn-cta rounded-full px-7">
            <Link href="/scan">
              <ScanLine className="h-5 w-5" aria-hidden="true" />
              {t("scanTanaman")}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="gap-2 rounded-full border border-border bg-card px-7 hover:border-primary/40 hover:bg-accent/60 hover:text-primary"
          >
            <Link href="/siram">
              {t("kelolaTanaman")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
