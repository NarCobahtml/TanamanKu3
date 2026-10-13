"use client";

import { ShieldCheck, Bug, TriangleAlert } from "lucide-react";
import TkRevealClient from "@/components/shared/tk-reveal-client";
import type { ScanResultContent } from "../scan-content";

interface DiagnosisSummaryCardProps {
  photo: string | null;
  content: ScanResultContent;
  timestamp: string;
  specimenLabel: string;
  diagnosisLabel: string;
  altText: string;
}

export function DiagnosisSummaryCard({
  photo,
  content,
  timestamp,
  specimenLabel,
  diagnosisLabel,
  altText,
}: DiagnosisSummaryCardProps) {
  return (
    <TkRevealClient>
      <div className="grid overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40 md:grid-cols-[1fr_1.4fr]">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo || "/figma-assets/scanned-leaf.png"}
            alt={altText}
            className="aspect-[4/3] h-full w-full object-cover md:aspect-auto"
          />
          <p className="absolute inset-x-0 bottom-0 bg-ink/80 px-4 py-2 text-xs font-medium text-white">
            {specimenLabel} · {timestamp}
          </p>
        </div>

        <div className="flex flex-col justify-center gap-6 p-6 md:p-10">
          <div>
            <p className="overline flex items-center gap-1.5">
              {content.healthy ? (
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Bug className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {diagnosisLabel}
            </p>
            <p
              className={`mt-2 text-3xl font-extrabold tracking-tight md:text-4xl ${
                content.healthy ? "text-primary" : "text-destructive"
              }`}
            >
              {content.label}{" "}
              {!content.healthy && (
                <span className="font-playfair">({content.latin})</span>
              )}
            </p>
          </div>

          <div className="rule pt-6">
            <p className="text-base leading-relaxed text-foreground/85">
              {content.aiAnalysis}
            </p>
          </div>

          <div
            className={`flex gap-2.5 rounded-xl border px-4 py-3.5 text-sm ${
              content.healthy
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-warning/30 bg-warning/10 text-warning"
            }`}
          >
            {content.healthy ? (
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <p>{content.headline}</p>
          </div>
        </div>
      </div>
    </TkRevealClient>
  );
}
